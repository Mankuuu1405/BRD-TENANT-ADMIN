from rest_framework import serializers
from .models import User, AuditLog, LoginActivity
from tenants.models import Tenant
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class TwoFASerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)

class UserSerializer(serializers.ModelSerializer):
    # Handles tenant association via ID string (e.g., "TNT-123")
    tenant = serializers.SlugRelatedField(
        slug_field='tenant_id',
        queryset=Tenant.objects.all(),
        required=False,
        allow_null=True
    )

    password = serializers.CharField(write_only=True, required=False)
    
    # Read-only fields for frontend display
    tenant_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "phone", 
            "role", "role_id", # ✅ Role ID added
            "tenant", "tenant_name", "branch", "branch_name", "avatar",
            "employee_id", "approval_limit", "is_2fa_enabled",
            "is_active", "is_staff", "is_superuser",
            # ✅ Supervisor fields added explicitly
            "supervisor_name", "supervisor_email", "supervisor_mobile",
            "created_at", "updated_at", "password"
        )
        read_only_fields = ("created_at", "updated_at")
        
        # Make supervisor/role fields optional to prevent 400 Bad Request on Staff creation
        extra_kwargs = {
            'role_id': {'required': False, 'allow_null': True},
            'supervisor_name': {'required': False, 'allow_blank': True},
            'supervisor_email': {'required': False, 'allow_blank': True},
            'supervisor_mobile': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True}
        }

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_tenant_name(self, obj):
        return obj.tenant.name if obj.tenant else None

    def get_branch_name(self, obj):
        return obj.branch.name if obj.branch else None

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        # Handle avatar upload specifically if sent as multipart
        request = self.context.get('request')
        avatar = request.FILES.get('avatar') if request else None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if avatar:
            instance.avatar = avatar

        instance.save()
        return instance

# --- Other Serializers ---

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name']

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role="MASTER_ADMIN",
            is_active=True
        )

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "phone", "avatar", "role")
        read_only_fields = ("id", "role", "avatar")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class LoginActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = LoginActivity
        fields = "__all__"

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        if user.role != "MASTER_ADMIN":
            LoginActivity.objects.create(
                user=user,
                ip_address=request.META.get("REMOTE_ADDR"),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                successful=False
            )
            raise serializers.ValidationError("Access restricted to Master Admins only.")
        if user.is_2fa_enabled:
            data["requires_2fa"] = True
            data.pop("access", None)
            data.pop("refresh", None)
            return data
        LoginActivity.objects.create(
            user=user,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            successful=True
        )
        return data

class MasterAdminTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["tenant_id"] = user.tenant_id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request")
        if not user.is_active:
            raise serializers.ValidationError("Account disabled")
        if user.role != "MASTER_ADMIN":
            LoginActivity.objects.create(
                user=user,
                ip_address=request.META.get("REMOTE_ADDR"),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                successful=False
            )
            raise serializers.ValidationError("Master Admin access only")
        LoginActivity.objects.create(
            user=user,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            successful=True
        )
        return data

class TenantTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["tenant_id"] = user.tenant_id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request")
        if not user.is_active:
            raise serializers.ValidationError("Account disabled")
        if user.role == "MASTER_ADMIN":
            raise serializers.ValidationError("Master Admin must login via Master Panel")
        LoginActivity.objects.create(
            user=user,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            successful=True
        )
        return data