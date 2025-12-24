from rest_framework import serializers
from .models import (
    Tenant, Branch, FinancialYear, ReportingPeriod, Holiday, Category, TenantRuleConfig,
    InterestConfig, ChargeConfig, RepaymentConfig, RiskRule, ScoreCard, TenantLoanProduct
)
import uuid
from django.contrib.auth import get_user_model
from django.db import transaction
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


# -------------------- Branch Serializer --------------------
class BranchSerializer(serializers.ModelSerializer):
    tenant = serializers.SlugRelatedField(
        queryset=Tenant.objects.all(),
        slug_field="tenant_id"
    )

    class Meta:
        model = Branch
        fields = "__all__"


# -------------------- Tenant Serializer --------------------
class TenantSerializer(serializers.ModelSerializer):
    branches = BranchSerializer(many=True, read_only=True)

    class Meta:
        model = Tenant
        fields = (
            "tenant_id", "name", "slug", "tenant_type", "email", "phone",
            "address", "city", "state", "pincode", "is_active", "created_at",
            "branches"
        )
        read_only_fields = ("tenant_id", "slug", "created_at")


# -------------------- Tenant Signup Serializer --------------------
class TenantSignupSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    mobile_no = serializers.CharField(max_length=20)
    address = serializers.CharField(allow_blank=True)
    contact_person = serializers.CharField()
    loan_product = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )
    password = serializers.CharField(write_only=True)

    gst_in = serializers.CharField(allow_blank=True, required=False)
    pan = serializers.CharField(allow_blank=True, required=False)
    cin = serializers.CharField(allow_blank=True, required=False)

    # ---------------- VALIDATIONS ----------------
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_business_name(self, value):
        if Tenant.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Business name already exists")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    # ---------------- CREATE ----------------
    @transaction.atomic
    def create(self, validated_data):
        tenant = Tenant.objects.create(
            name=validated_data["business_name"],
            tenant_type="NBFC",
            email=validated_data["email"],
            phone=validated_data["mobile_no"],
            address=validated_data["address"],
            # loan_products=validated_data["loan_product"]  # if JSONField added
        )

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            tenant=tenant,
            role="TENANT_ADMIN"
        )

        return user


# ---------------------- CALENDAR SERIALIZERS ----------------------
class FinancialYearSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = FinancialYear
        fields = ['id', 'name', 'start', 'end', 'is_active', 'tenant']


class ReportingPeriodSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ReportingPeriod
        fields = ['id', 'name', 'start', 'end', 'tenant']


class HolidaySerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Holiday
        fields = ['id', 'title', 'date', 'tenant']


# -----------------------------------------------------------
# NEW CATEGORY SERIALIZER
# -----------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_key_display', read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "tenant",
            "category_key",
            "category_display",
            "title",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['tenant']


# -----------------------------------------------------------
# TENANT RULE CONFIG SERIALIZER
# -----------------------------------------------------------
class TenantRuleConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantRuleConfig
        fields = "__all__"
        extra_kwargs = {
            "tenant": {"read_only": True}
        }


# -------------------- Tenant Create (Master Admin Only) --------------------
class TenantCreateByMasterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    tenant_type = serializers.ChoiceField(
        choices=[('BANK','Bank'),('NBFC','NBFC'),('P2P','P2P'),('FINTECH','FinTech')]
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    pincode = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

    # ---------- VALIDATIONS ----------
    def validate_email(self, value):
        if Tenant.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Tenant with this email already exists")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate_name(self, value):
        if Tenant.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Tenant with this name already exists")
        return value

    def validate_phone(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone must contain only digits")
        if value and len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")
        return value

    # ---------- CREATE ----------
    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        if not (user.is_superuser or getattr(user, "role", "") == "MASTER_ADMIN"):
            raise serializers.ValidationError("Permission denied")

        tenant = Tenant.objects.create(**validated_data)
        raw_password = User.objects.make_random_password(length=10)

        User.objects.create_user(
            email=tenant.email,
            password=raw_password,
            tenant=tenant,
            role="TENANT_ADMIN",
            is_active=True
        )

        return {
            "message": "Tenant created successfully",
            "tenant_id": str(tenant.tenant_id),
            "email": tenant.email,
            "password": raw_password
        }


# =========================================================
# NEW: MASTERS & CONFIGURATION SERIALIZERS
# =========================================================

class InterestConfigSerializer(serializers.ModelSerializer):
    class Meta: 
        model = InterestConfig
        fields = '__all__'
        read_only_fields = ['tenant']

class ChargeConfigSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ChargeConfig
        fields = '__all__'
        read_only_fields = ['tenant']

class RepaymentConfigSerializer(serializers.ModelSerializer):
    class Meta: 
        model = RepaymentConfig
        fields = '__all__'
        read_only_fields = ['tenant']

class RiskRuleSerializer(serializers.ModelSerializer):
    class Meta: 
        model = RiskRule
        fields = '__all__'
        read_only_fields = ['tenant']

class ScoreCardSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ScoreCard
        fields = '__all__'
        read_only_fields = ['tenant']

class TenantLoanProductSerializer(serializers.ModelSerializer):
    # Nested representation for Read operations (so frontend gets names/values)
    interest_details = InterestConfigSerializer(source='interest_config', read_only=True)
    repayment_config_details = RepaymentConfigSerializer(source='repayment_config', read_only=True)
    risk_details = RiskRuleSerializer(source='risk_rule', read_only=True)
    scorecard_details = ScoreCardSerializer(source='scorecard', read_only=True)
    
    # ✅ FULL DETAILS FOR FEES
    charges_details = ChargeConfigSerializer(source='charges', many=True, read_only=True)
    
    class Meta: 
        model = TenantLoanProduct
        fields = '__all__'
        read_only_fields = ['tenant']