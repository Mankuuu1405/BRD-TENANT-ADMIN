from django.contrib import admin
from .models import LoanApplication, KYCDetail, CreditAssessment

class KYCDetailInline(admin.TabularInline):
    model = KYCDetail
    extra = 0
    readonly_fields = ['uploaded_at']

class CreditAssessmentInline(admin.StackedInline):
    model = CreditAssessment
    extra = 0

@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    # FIXED: Uses 'requested_amount' instead of 'amount'
    list_display = [
        'application_id', 
        'first_name', 
        'last_name', 
        'product', 
        'requested_amount', 
        'status', 
        'created_at'
    ]
    list_filter = ['status', 'income_type', 'product']
    search_fields = ['application_id', 'first_name', 'last_name', 'pan_number', 'mobile_no']
    readonly_fields = ['application_id', 'created_at', 'updated_at', 'created_by']
    
    inlines = [KYCDetailInline, CreditAssessmentInline]

@admin.register(KYCDetail)
class KYCDetailAdmin(admin.ModelAdmin):
    list_display = ['loan_application', 'kyc_type', 'status', 'uploaded_at']
    list_filter = ['status', 'kyc_type']
    search_fields = ['loan_application__application_id', 'document_number']

@admin.register(CreditAssessment)
class CreditAssessmentAdmin(admin.ModelAdmin):
    # FIXED: Uses 'cibil_score' and 'approved_amount'
    list_display = [
        'application', 
        'cibil_score', 
        'risk_score', 
        'status', 
        'approved_amount'
    ]
    list_filter = ['status']
    search_fields = ['application__application_id']