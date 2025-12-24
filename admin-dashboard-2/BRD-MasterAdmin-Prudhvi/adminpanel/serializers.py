from rest_framework import serializers
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
    Setting
)

# ---------------------------
# Charge Master Serializer
# ---------------------------
class ChargeMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargeMaster
        fields = '__all__'


# ---------------------------
# Document Type Serializer
# ---------------------------
class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'


# ---------------------------
# Loan Product Serializer
# ---------------------------
class LoanProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanProduct
        fields = '__all__'


# ---------------------------
# Notification Template Serializer
# ---------------------------
class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'


# ---------------------------
# Role Master Serializer
# ---------------------------
class RoleMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleMaster
        # ✅ 'permissions' field add kiya
        fields = ['id', 'name', 'description', 'permissions', 'parent_role', 'created_by', 'created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            "id",                # PRIMARY KEY (important!)
            "uuid",
            "subscription_name",
            "subscription_amount",
            "no_of_borrowers",
            "type_of",
            "created_user",
            "modified_user",
            "created_at",
            "modified_at",
            "isDeleted",
        ]

class CouponSerializer(serializers.ModelSerializer):
    # M2M → list of subscription primary keys (IDs)
    subscription_id = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Subscription.objects.all()
    )

    class Meta:
        model = Coupon
        fields = "__all__"

    def create(self, validated_data):
        subscriptions = validated_data.pop("subscription_id", [])
        coupon = Coupon.objects.create(**validated_data)
        coupon.subscription_id.set(subscriptions)
        return coupon

    def update(self, instance, validated_data):
        subscriptions = validated_data.pop("subscription_id", None)
        coupon = super().update(instance, validated_data)

        if subscriptions is not None:
            coupon.subscription_id.set(subscriptions)

        return coupon
    




class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = '__all__'

class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = "__all__"


class OccupationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OccupationType
        fields = "__all__"

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ["key", "value", "category", "data_type", "is_encrypted"]

from rest_framework import serializers
from .models import Subscription

class TenantSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            "uuid",
            "subscription_name",
            "subscription_amount",
            "no_of_borrowers",
            "type_of",
            "status",
            "created_user",
            "modified_user",
            "created_at",
            "modified_at",
            "isDeleted",
        ]
        read_only_fields = fields
