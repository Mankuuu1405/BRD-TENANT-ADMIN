"""
Django settings for brd_platform project.
Test / dev settings only — change SECRET_KEY for production.
"""
from pathlib import Path
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",

    # Local apps
    "tenants",
    "users",
    "crm",
    "integrations",
    "lms",
    "los",
    "reporting",
    "documents",
    "frontend_mock",
    "communications",
    "compliance",
    "adminpanel",
    
]


INSTALLED_APPS += ["axes"]



MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS must be here
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",

    # Tenant middleware (your custom)
    "brd_platform.middleware.TenantMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

MIDDLEWARE += ["axes.middleware.AxesMiddleware"]


AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1  # hours

AXES_EXCLUDE_URLS = [
    r'^/api/token/$',
    r'^/api/token/refresh/$',
]



ROOT_URLCONF = "brd_platform.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "brd_platform.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "users.User"

# ✅ ADDED THIS SECTION TO FIX AXES WARNING
AUTHENTICATION_BACKENDS = [
    # AxesStandaloneBackend should be the first backend
    'axes.backends.AxesStandaloneBackend',  
    'django.contrib.auth.backends.ModelBackend',
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
      "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "5/min",
    },
}

# ------------------------------------
# CORS SETTINGS (NEW + FIXED)
# ------------------------------------

CORS_ALLOWED_ORIGINS = [
    "http://65.0.30.83:3001",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://localhost:5174",
]

# Add missing Vite origin
CORS_ALLOWED_ORIGINS += [
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",

]

# Allow cookies / tokens
CORS_ALLOW_CREDENTIALS = True

# CSRF fix for Vite
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
}