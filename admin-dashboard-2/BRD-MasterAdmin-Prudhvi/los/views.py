from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import LoanApplication, KYCDetail, CreditAssessment
from .serializers import LoanApplicationSerializer, KYCDetailSerializer, CreditAssessmentSerializer
# Ensure these files exist (see Step 2 below)
from .logic.rule_engine import RuleEngine 
from .logic.integrations import SmartVerificationService
# from .permissions import IsTenantMember # Uncomment if you are using tenant permissions

class LoanApplicationViewSet(viewsets.ModelViewSet):
    queryset = LoanApplication.objects.all().select_related('tenant', 'branch', 'customer', 'product')
    serializer_class = LoanApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'tenant', 'branch', 'product', 'income_type']
    search_fields = ['application_id', 'first_name', 'last_name', 'mobile_no', 'pan_number']
    
    # Matches your model field name 'requested_amount'
    ordering_fields = ['created_at', 'requested_amount', 'status']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # ------------------------------------------------------------
    # ACTION: Verify Video KYC (Phase 7)
    # ------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='verify-video')
    def verify_video(self, request, pk=None):
        app = self.get_object()
        decision = request.data.get('decision') 
        remarks = request.data.get('remarks', '')

        if decision == 'approve':
            app.is_video_kyc_verified = True
            
            # Update Document Status if exists
            video_doc = app.kyc_details.filter(kyc_type='SELF_DECLARATION_VIDEO').first()
            if video_doc:
                video_doc.status = 'VERIFIED'
                video_doc.save()
            
            app.save()
            return Response({'status': 'Video KYC Verified', 'verification': True})
        else:
            app.is_video_kyc_verified = False
            app.remarks = f"Video Rejection: {remarks}"
            app.status = 'HOLD'
            app.save()
            return Response({'status': 'Video KYC Rejected', 'verification': False})

    # ------------------------------------------------------------
    # ACTION: Run Underwriting Engine (Phase 5)
    # ------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='run-underwriting')
    def run_underwriting(self, request, pk=None):
        """
        Triggers the Rule Engine to calculate FOIR, Cash Flow, and Eligibility.
        """
        app = self.get_object()
        
        # 1. Run Rule Engine
        engine = RuleEngine(app)
        
        # Step A: Knock-out Checks
        knockout_result = engine.execute_knockout_checks()
        if not knockout_result['is_eligible']:
            app.status = 'REJECTED'
            app.remarks = knockout_result['rejection_reason']
            app.save()
            return Response(knockout_result, status=status.HTTP_200_OK)

        # Step B: Financial Underwriting
        metrics = engine.calculate_underwriting_metrics()
        
        # Update Application Status
        app.status = 'UNDERWRITING'
        app.save()

        return Response({
            "status": "Underwriting Complete",
            "knockout": knockout_result,
            "metrics": metrics
        })

    # ------------------------------------------------------------
    # ACTION: Generate Sanction Letter (Phase 6)
    # ------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='generate-sanction')
    def generate_sanction(self, request, pk=None):
        app = self.get_object()
        
        if app.status != 'UNDERWRITING' and app.status != 'SANCTIONED':
             return Response({'detail': 'Application not ready for Sanction'}, status=400)

        # Generate the Doc
        doc_data = SmartVerificationService.generate_sanction_letter_pdf(app)
        
        app.status = 'SANCTIONED'
        app.save()
        
        return Response({
            "message": "Sanction Letter Generated Successfully",
            "download_link": f"/api/v1/documents/download/{doc_data['file_name']}"
        })

    # ------------------------------------------------------------
    # ACTION: Final Disbursement (Phase 8)
    # ------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='disburse-loan')
    def disburse_loan(self, request, pk=None):
        app = self.get_object()
        
        # 1. Penny Drop Check
        bank_check = SmartVerificationService.perform_penny_drop(app.bank_account_number, app.ifsc_code)
        if not bank_check['verified']:
             return Response({'detail': 'Bank Account Verification Failed', 'error': bank_check}, status=400)
        
        app.is_penny_drop_verified = True
        
        # 2. Check Video KYC (Critical for PL)
        if str(app.product) == 'Personal Loan' and not app.is_video_kyc_verified:
            return Response({'detail': 'Cannot Disburse: Video KYC Pending'}, status=400)

        app.status = 'DISBURSED'
        app.save()

        return Response({
            "status": "Success", 
            "message": "Funds Disbursed to Borrower Account",
            "transaction_id": "TXN_99887766"
        })

    # ------------------------------------------------------------
    # ACTION: General Status Change
    # ------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='change-status')
    def change_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        remarks = request.data.get('remarks')

        if not new_status:
            return Response({'detail': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status == 'DISBURSED' and str(app.product) == 'Personal Loan' and not app.is_video_kyc_verified:
             return Response({'detail': 'Cannot disburse Personal Loan without Video Verification'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = new_status
        if remarks:
            app.remarks = remarks
        app.save()
        return Response(self.get_serializer(app).data)


class KYCDetailViewSet(viewsets.ModelViewSet):
    queryset = KYCDetail.objects.all().select_related('loan_application')
    serializer_class = KYCDetailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['loan_application', 'kyc_type']

class CreditAssessmentViewSet(viewsets.ModelViewSet):
    queryset = CreditAssessment.objects.all().select_related('application')
    serializer_class = CreditAssessmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='update-score')
    def update_score(self, request, pk=None):
        ca = self.get_object()
        cibil_score = request.data.get('cibil_score') or request.data.get('score')
        risk_score = request.data.get('risk_score')
        approved_amount = request.data.get('approved_amount')
        remarks = request.data.get('remarks', '')

        if cibil_score:
            ca.cibil_score = int(cibil_score)
        if risk_score:
            ca.risk_score = float(risk_score)
        if approved_amount:
            ca.approved_amount = float(approved_amount)
            
        ca.remarks = remarks
        ca.save()
        return Response(self.get_serializer(ca).data)