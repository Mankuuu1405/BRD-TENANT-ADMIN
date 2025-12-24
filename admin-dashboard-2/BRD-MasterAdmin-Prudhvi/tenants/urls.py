from django.urls import path, include
from rest_framework.routers import DefaultRouter


# ---------- IMPORT VIEWSETS ----------
from .views import (
    TenantViewSet,
    BranchViewSet,
    TenantSignupView,
    FinancialYearViewSet,
    ReportingPeriodViewSet,
    HolidayViewSet,
    TenantRuleConfigViewSet,
    CategoryViewSet,
    TenantCreateByMasterView,
    # New Masters Imports
    InterestConfigViewSet,
    ChargeConfigViewSet,
    RepaymentConfigViewSet,
    RiskRuleViewSet,
    ScoreCardViewSet,
    TenantLoanProductViewSet
)

# ---------- ROUTER ----------
router = DefaultRouter()

# ----------------------------------------------------------
# IMPORTANT: KEEP RULES FIRST — otherwise '' TenantViewSet overrides it
# ----------------------------------------------------------
router.register(r'rules-config', TenantRuleConfigViewSet, basename='rules-config')

# Calendar Routes
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'calendar/financial-years', FinancialYearViewSet, basename='financial-years')
router.register(r'calendar/reporting-periods', ReportingPeriodViewSet, basename='reporting-periods')
router.register(r'calendar/holidays', HolidayViewSet, basename='holidays')

# Branch routes
router.register(r'branches', BranchViewSet, basename='branches')

# ----------------------------------------------------------
# NEW: MASTERS & PRODUCTS ROUTES
# ----------------------------------------------------------
router.register(r'interest-configs', InterestConfigViewSet, basename='interest-configs')
router.register(r'charge-configs', ChargeConfigViewSet, basename='charge-configs')
router.register(r'repayment-configs', RepaymentConfigViewSet, basename='repayment-configs')
router.register(r'risk-rules', RiskRuleViewSet, basename='risk-rules')
router.register(r'scorecards', ScoreCardViewSet, basename='scorecards')
router.register(r'products', TenantLoanProductViewSet, basename='products')

# ----------------------------------------------------------
# KEEP THIS LAST — otherwise it catches ALL routes
# ----------------------------------------------------------
router.register(r'', TenantViewSet, basename='tenants')


# ---------- URL PATTERNS ----------
urlpatterns = [
    path("add/", TenantCreateByMasterView.as_view(), name="add-organization"),
    path("signup/", TenantSignupView.as_view(), name="tenant-signup"),

    # All router URLs
    path("", include(router.urls)),

    # Onboarding
    path("onboarding/", include("tenants.client_onboarding.urls")),
]