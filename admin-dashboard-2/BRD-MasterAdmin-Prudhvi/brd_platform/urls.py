from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import home
from users.views import CustomTokenObtainPairView, MasterAdminLoginView, TenantLoginView
# from adminpanel.views import SettingsView

urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),

    # Authentication
    # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/master/", MasterAdminLoginView.as_view()),
    path("api/token/tenant/", TenantLoginView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # App URLs
    path("api/v1/tenants/", include("tenants.urls")),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/crm/", include("crm.urls")),
    path("api/v1/integrations/", include("integrations.urls")),
    # path("settings/", SettingsView.as_view(), name="settings"),

    
    # 👇 These are the admin, comms, and LOS modules
    path("api/v1/adminpanel/", include("adminpanel.urls")),
    path("api/v1/communications/", include("communications.urls")),
    
    # ✅ UNCOMMENTED THIS LINE to enable Loan Application routes
    path("api/v1/los/", include("los.urls")), 
    
    # path("api/v1/lms/", include("lms.urls")), # Keep LMS commented until ready
    path("api/v1/", include("reporting.urls")), 
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)