from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChargeMasterViewSet,
    DocumentTypeViewSet,
    LoanProductViewSet,
    NotificationTemplateViewSet,
    RoleMasterViewSet,
    SubscriptionViewSet,
    CouponViewSet,
    SubscriberViewSet, 
      EmploymentTypeViewSet,
    OccupationTypeViewSet,
    SettingsView,   # 
    TenantSubscriptionView,
    DashboardFullView,

)

router = DefaultRouter()
router.register(r'charges', ChargeMasterViewSet)
router.register(r'document-types', DocumentTypeViewSet)
router.register(r'loan-products', LoanProductViewSet)
router.register(r'notification-templates', NotificationTemplateViewSet)
router.register(r'role-master', RoleMasterViewSet)
router.register(r"subscriptions", SubscriptionViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'subscribers', SubscriberViewSet)  # <-- NEW ROUTE
router.register(r'employment-types', EmploymentTypeViewSet)
router.register(r'occupation-types', OccupationTypeViewSet)



urlpatterns = [
    path("subscriptions/my/", TenantSubscriptionView.as_view()),
    path("subscriptions/action/", TenantSubscriptionView.as_view()),

   # Dashboard endpoint
    path("dashboard/full/", DashboardFullView.as_view(), name="dashboard-full"),

    path('', include(router.urls)),
    path("lead-management/", include("adminpanel.lead_management.urls")),
    path("settings/", SettingsView.as_view(), name="settings"),  # 👈 Add here



]
