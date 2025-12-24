from rest_framework import serializers
from .models import LoanApplication, KYCDetail, CreditAssessment

class KYCDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDetail
        fields = '__all__'

class CreditAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditAssessment
        fields = '__all__'

class LoanApplicationSerializer(serializers.ModelSerializer):
    # Read-only fields for UI display
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    # Nested Serializers
    kyc_details = KYCDetailSerializer(many=True, read_only=True)
    credit_assessment = CreditAssessmentSerializer(read_only=True)

    class Meta:
        model = LoanApplication
        fields = '__all__'
        read_only_fields = [
            'application_id', 'created_at', 'updated_at', 'created_by', 'tenant', 
            'foir_percentage', 'net_cash_flow', 'is_geo_limit_passed'
        ]