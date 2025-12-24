from rest_framework import viewsets, status
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny



from .models import (
    ChargeMaster,
    DocumentType,
    LoanProduct,
    NotificationTemplate,
    RoleMaster,
    Subscription,
    Coupon,
    Subscriber,
    EmploymentType,
    OccupationType,
    Setting,
    Dashboard,
)

from .serializers import (
    ChargeMasterSerializer,
    DocumentTypeSerializer,
    LoanProductSerializer,
    NotificationTemplateSerializer,
    RoleMasterSerializer,
    SubscriptionSerializer,
    CouponSerializer,
    SubscriberSerializer,
    EmploymentTypeSerializer,
    OccupationTypeSerializer,
    SettingSerializer,
    TenantSubscriptionSerializer
)

class ChargeMasterViewSet(viewsets.ModelViewSet):
    queryset = ChargeMaster.objects.all()
    serializer_class = ChargeMasterSerializer
    permission_classes = [IsAuthenticated]

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAuthenticated]

class LoanProductViewSet(viewsets.ModelViewSet):
    queryset = LoanProduct.objects.all()
    serializer_class = LoanProductSerializer
    permission_classes = [IsAuthenticated]

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]

class RoleMasterViewSet(viewsets.ModelViewSet):
    queryset = RoleMaster.objects.all()
    serializer_class = RoleMasterSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get', 'post'], url_path='permissions')
    def handle_permissions(self, request, pk=None):
        role = self.get_object()

        if request.method == 'GET':
            return Response(role.permissions or {})

        elif request.method == 'POST':
            new_perms = request.data.get('permissions', {})
            role.permissions = new_perms
            role.save()
            return Response(role.permissions, status=status.HTTP_200_OK)
        
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.filter(isDeleted=False)
    serializer_class = SubscriptionSerializer
    lookup_field = "uuid"  

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.filter(isDeleted=False)
    serializer_class = CouponSerializer
    lookup_field = "uuid"   # IMPORTANT


class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.filter(isDeleted=False)
    serializer_class = SubscriberSerializer
    lookup_field = "uuid"

    def destroy(self, request, *args, **kwargs):
        """Soft Delete Instead of Hard Delete"""
        instance = self.get_object()
        instance.isDeleted = True
        instance.modified_user = request.user.username or "System"
        instance.save()
        return Response(
            {"message": "Subscriber soft-deleted successfully"},
            status=status.HTTP_200_OK
        )

    def perform_create(self, serializer):
        """Save created_user automatically"""
        serializer.save(
            created_user=self.request.user.username or "System"
        )

    def perform_update(self, serializer):
        """Save modified_user automatically"""
        serializer.save(
            modified_user=self.request.user.username or "System"
        )

    
class EmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = EmploymentType.objects.filter(isDeleted=False)
    serializer_class = EmploymentTypeSerializer
    lookup_field = "uuid"

    # Safe username method
    def get_username(self):
        user = self.request.user
        return (
            getattr(user, "username", None)
            or getattr(user, "email", None)
            or getattr(user, "phone", None)
            or "System"
        )

    def perform_create(self, serializer):
        serializer.save(created_user=self.get_username())

    def perform_update(self, serializer):
        serializer.save(modified_user=self.get_username())

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.isDeleted = True
        instance.modified_user = self.get_username()
        instance.save()
        return Response({"message": "Employment type soft-deleted successfully"}, status=200)


class OccupationTypeViewSet(viewsets.ModelViewSet):
    queryset = OccupationType.objects.filter(isDeleted=False)
    serializer_class = OccupationTypeSerializer
    lookup_field = "uuid"

    def get_username(self):
        user = self.request.user
        return (
            getattr(user, "username", None)
            or getattr(user, "email", None)
            or getattr(user, "phone", None)
            or "System"
        )

    def perform_create(self, serializer):
        serializer.save(created_user=self.get_username())

    def perform_update(self, serializer):
        serializer.save(modified_user=self.get_username())

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.isDeleted = True
        instance.modified_user = self.get_username()
        instance.save()
        return Response({"message": "Occupation type soft-deleted successfully"}, status=200)
       

class SettingsView(APIView):

    def get(self, request):
        settings = Setting.objects.all()
        serializer = SettingSerializer(settings, many=True)

        grouped = {"loan": [], "system": [], "notify": []}
        for s in serializer.data:
            grouped[s["category"]].append(s)

        return Response(grouped)

    def put(self, request):
        payload = request.data
        for key, val in payload.items():
            try:
                obj = Setting.objects.get(key=key)
                obj.value = val
                obj.save()
            except Setting.DoesNotExist:
                continue
        
        return Response({"success": True}, status=status.HTTP_200_OK)


class TenantSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant

        if not tenant.subscription:
            return Response({"detail": "Subscription not assigned to tenant"}, status=404)

        serializer = TenantSubscriptionSerializer(tenant.subscription)
        return Response(serializer.data, status=200)

    def post(self, request):
        action = request.data.get("action")
        tenant = request.user.tenant

        subscription = tenant.subscription
        if not subscription:
            return Response({"detail": "Subscription not assigned"}, status=404)

        if action not in ["pause", "cancel", "resume"]:
            return Response({"detail": "Invalid action"}, status=400)

        
        # ------------------
        # HANDLE ACTIONS
        # ------------------
        if action == "cancel":
            subscription.isDeleted = True
            subscription.status = Subscription.CANCEL
            subscription.modified_user = f"cancelled_by:{request.user.email}"
            message = "Subscription cancelled successfully"

        elif action == "resume":
            subscription.isDeleted = False
            subscription.status = Subscription.ACTIVE
            subscription.modified_user = f"resumed_by:{request.user.email}"
            message = "Subscription resumed successfully"

        elif action == "pause":
            subscription.status = Subscription.PAUSE
            subscription.modified_user = f"paused_by:{request.user.email}"
            message = "Subscription paused successfully"

        subscription.save()


        return Response({
            "message": message,
            "status": "Cancelled" if subscription.isDeleted else "Active",
        }, status=200)





class DashboardFullView(APIView):
    """
    Returns full dashboard data from the database.
    Creates a default record if none exists.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Try to get the latest dashboard record
        dashboard, created = Dashboard.objects.get_or_create(
            id=1,  # Ensure a single dashboard record
            defaults={
                "total_tenants": 0,
                "tenants_trend": "+0%",
                "active_users": 0,
                "users_trend": "+0%",
                "total_loans": 0,
                "loans_trend": "+0%",
                "disbursed_amount": "₹0",
                "amount_trend": "+0%",
                "monthly_disbursement": [],
                "loan_status_distribution": [],
                "recent_activity": [],
            }
        )

        data = {
            "kpis": {
                "totalTenants": dashboard.total_tenants,
                "tenantsTrend": dashboard.tenants_trend,
                "activeUsers": dashboard.active_users,
                "usersTrend": dashboard.users_trend,
                "totalLoans": dashboard.total_loans,
                "loansTrend": dashboard.loans_trend,
                "disbursedAmount": dashboard.disbursed_amount,
                "amountTrend": dashboard.amount_trend,
            },
            "charts": {
                "monthlyDisbursement": dashboard.monthly_disbursement,
                "loanStatusDistribution": dashboard.loan_status_distribution,
                "recentActivity": dashboard.recent_activity
            }
        }

        return Response(data)
