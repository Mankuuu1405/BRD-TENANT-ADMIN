from django.contrib import admin
from .models import (
    ChargeMaster,
    DocumentType,
    LoanProduct,
    NotificationTemplate,
    RoleMaster,
    Subscription,
    Setting,
    Dashboard,
)

# ---------------------- Charge Master ----------------------
@admin.register(ChargeMaster)
class ChargeMasterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "charge_type", "value", "is_percentage", "created_at")
    search_fields = ("name",)
    list_filter = ("charge_type", "is_percentage")
    ordering = ("-created_at",)


# ---------------------- Document Type ----------------------
@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "category", "is_required", "created_at")
    search_fields = ("name", "code")
    list_filter = ("category", "is_required")
    ordering = ("name",)


# ---------------------- Loan Product ----------------------
@admin.register(LoanProduct)
class LoanProductAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "loan_type",
        "min_amount", "max_amount",
        "interest_rate", "processing_fee",
        "created_at"
    )
    search_fields = ("name",)
    list_filter = ("loan_type",)
    ordering = ("name",)


# ---------------------- Notification Template ----------------------
@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "template_type", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("template_type", "is_active")
    ordering = ("-created_at",)


# ---------------------- Role Master ----------------------
@admin.register(RoleMaster)
class RoleMasterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_by", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    ordering = ("name",)


# ---------------------- Subscription ----------------------
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "uuid",
        "subscription_name",
        "subscription_amount",
        "no_of_borrowers",
        "type_of",
        "created_at",
        "modified_at",
        "isDeleted",
    )
    search_fields = ("subscription_name",)
    list_filter = ("type_of", "isDeleted")
    ordering = ("-created_at",)


# ---------------------- System Settings ----------------------
@admin.register(Setting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "value", "category", "data_type", "is_encrypted")
    list_filter = ("category", "data_type", "is_encrypted")
    search_fields = ("key", "value")
    ordering = ("category", "key")


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ('id', 'total_tenants', 'active_users', 'total_loans', 'disbursed_amount', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ("KPIs", {
            "fields": (
                'total_tenants', 'tenants_trend',
                'active_users', 'users_trend',
                'total_loans', 'loans_trend',
                'disbursed_amount', 'amount_trend',
            )
        }),
        ("Charts", {
            "fields": (
                'monthly_disbursement',
                'loan_status_distribution',
                'recent_activity',
            )
        }),
        ("Timestamps", {
            "fields": ('created_at', 'updated_at')
        }),
    )