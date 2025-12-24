import uuid
from django.db import models
from django.conf import settings
# Ensure this import is correct. If you are using TenantLoanProduct, change this import.
from adminpanel.models import LoanProduct 

class LoanApplication(models.Model):
    # ------------------------------------------------------------------
    # PHASE STATUSES (Matches your 8-Phase Flow)
    # ------------------------------------------------------------------
    STATUS_CHOICES = [
        ('NEW', 'New Application'),
        ('KNOCKOUT_PENDING', 'Knock-out Checks'),       # Phase 3
        ('DOC_UPLOAD', 'Document Upload'),              # Phase 4
        ('UNDERWRITING', 'Underwriting In-Progress'),   # Phase 5
        ('HOLD', 'On Hold'),
        ('SANCTIONED', 'Sanctioned'),                   # Phase 6
        ('PRE_DISBURSEMENT', 'Pre-Disbursement Checks'),# Phase 7
        ('DISBURSED', 'Disbursed'),                     # Phase 8
        ('REJECTED', 'Rejected'),
        ('CLOSED', 'Closed'),
    ]

    # ------------------------------------------------------------------
    # A. SYSTEM & ONBOARDING (8 Fields)
    # ------------------------------------------------------------------
    application_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    branch = models.ForeignKey('tenants.Branch', on_delete=models.SET_NULL, null=True, blank=True)
    customer = models.ForeignKey('crm.Customer', on_delete=models.CASCADE)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_no = models.CharField(max_length=15)  # OTP Verified in Frontend
    email = models.EmailField()                  # Link Verified in Frontend
    dob = models.DateField(help_text="Used for Age Knock-out Check")
    pan_number = models.CharField(max_length=10)
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[('M','Male'), ('F','Female'), ('O','Other')])

    # ------------------------------------------------------------------
    # B. PROFILE & ADDRESS (10 Fields)
    # ------------------------------------------------------------------
    INCOME_TYPES = (('Salaried', 'Salaried'), ('Self-Employed', 'Self-Employed'))
    income_type = models.CharField(max_length=20, choices=INCOME_TYPES, default='Salaried')

    res_address_line1 = models.CharField(max_length=255)
    res_address_line2 = models.CharField(max_length=255, blank=True)
    res_city = models.CharField(max_length=100)
    res_state = models.CharField(max_length=100)
    res_pincode = models.CharField(max_length=6)

    office_address_line1 = models.CharField(max_length=255, blank=True)
    office_city = models.CharField(max_length=100, blank=True)
    office_pincode = models.CharField(max_length=6, blank=True)

    # ------------------------------------------------------------------
    # C. FINANCIALS & PRODUCT (Conditional Logic)
    # ------------------------------------------------------------------
    product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT, null=True, blank=True)
    
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # FIXED: Added default=12 to prevent migration errors
    requested_tenure = models.IntegerField(default=12, help_text="Tenure in Months")
    
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, default=0) 
    employer_name = models.CharField(max_length=200, blank=True, null=True)
    business_name = models.CharField(max_length=200, blank=True, null=True)
    employment_type = models.CharField(max_length=50, blank=True)

    # ------------------------------------------------------------------
    # D. BANK & DISBURSAL (5 Fields)
    # ------------------------------------------------------------------
    bank_account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    account_type = models.CharField(max_length=20, default='Savings')
    mandate_type = models.CharField(max_length=20, default='eNACH')
    disbursement_consent = models.BooleanField(default=False)

    # ------------------------------------------------------------------
    # E. UNDERWRITING METRICS
    # ------------------------------------------------------------------
    is_geo_limit_passed = models.BooleanField(default=False)
    is_cibil_passed = models.BooleanField(default=False)
    
    foir_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    net_cash_flow = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    is_video_kyc_verified = models.BooleanField(default=False)
    is_penny_drop_verified = models.BooleanField(default=False)
    is_enach_active = models.BooleanField(default=False)
    is_agreement_signed = models.BooleanField(default=False)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='NEW')
    remarks = models.TextField(null=True, blank=True) 
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'loan_applications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.application_id} - {self.first_name} {self.last_name}"


class KYCDetail(models.Model):
    KYC_TYPES = (
        ('AADHAAR', 'Aadhaar'),
        ('PAN', 'PAN'),
        ('VOTER_ID', 'Voter ID'),
        ('PASSPORT', 'Passport'),
        ('SELF_DECLARATION_VIDEO', 'Self Declaration Video'),
        ('SALARY_SLIP', 'Salary Slip'),
        ('BANK_STATEMENT', 'Bank Statement'),
        ('ITR', 'ITR'),
    )

    loan_application = models.ForeignKey(LoanApplication, on_delete=models.CASCADE, related_name='kyc_details')
    kyc_type = models.CharField(max_length=50, choices=KYC_TYPES)
    document_number = models.CharField(max_length=200, blank=True, null=True) 
    document_file = models.FileField(upload_to='kyc/%Y/%m/%d/', null=True, blank=True)
    
    status = models.CharField(max_length=20, default='PENDING')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'kyc_details'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.loan_application.application_id} - {self.kyc_type}"


class CreditAssessment(models.Model):
    application = models.OneToOneField(LoanApplication, on_delete=models.CASCADE, related_name='credit_assessment')
    cibil_score = models.IntegerField(null=True, blank=True)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='UNDER_REVIEW')
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    approved_roi = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    assessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_assessments'
        ordering = ['-assessed_at']