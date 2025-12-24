from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import JSONField  # Use JSONField for flexible storage
import uuid 

User = get_user_model()

# ---------------------------
# 1. Charge Master
# ---------------------------
class ChargeMaster(models.Model):
    CHARGE_TYPES = (
        ('processing', 'Processing Fee'),
        ('penalty', 'Penalty'),
        ('other', 'Other Charges'),
    )

    name = models.CharField(max_length=200)
    charge_type = models.CharField(max_length=20, choices=CHARGE_TYPES)
    is_percentage = models.BooleanField(default=False)
    value = models.DecimalField(max_digits=10, decimal_places=2)   # NOTE: field name = value
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_charge_master"

    def __str__(self):
        return f"{self.name} ({self.charge_type})"


# ---------------------------
# 2. Document Types
# ---------------------------
class DocumentType(models.Model):
    CATEGORY_TYPES = (
        ('kyc', 'KYC Document'),
        ('income', 'Income Document'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='other')
    description = models.TextField(null=True, blank=True)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_document_types"

    def __str__(self):
        return self.name


# ---------------------------
# 3. Loan Products
# ---------------------------
class LoanProduct(models.Model):
    LOAN_TYPES = (
        ('personal', 'Personal Loan'),
        ('car', 'Car Loan'),
        ('home', 'Home Loan'),
        ('business', 'Business Loan'),
    )

    name = models.CharField(max_length=200)
    loan_type = models.CharField(max_length=50, choices=LOAN_TYPES)
    description = models.TextField(null=True, blank=True)

    min_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    min_tenure_months = models.IntegerField(default=1)
    max_tenure_months = models.IntegerField(default=60)

    charges = models.ManyToManyField("ChargeMaster", blank=True)
    required_documents = models.ManyToManyField("DocumentType", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_loan_products"

    def __str__(self):
        return self.name


# ---------------------------
# 4. Notification Templates
# ---------------------------
class NotificationTemplate(models.Model):
    TEMPLATE_TYPES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('system', 'System Notification'),
    )

    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    subject = models.CharField(max_length=300, null=True, blank=True)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_notification_templates"

    def __str__(self):
        return f"{self.name} ({self.template_type})"


# ---------------------------
# 5. Role Master (Updated)
# ---------------------------
class RoleMaster(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(null=True, blank=True)
    
    # ✅ NEW FIELD: Permissions store karne ke liye
    permissions = models.JSONField(default=dict, blank=True) 

    parent_role = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sub_roles",
    )

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_role_master"

    def __str__(self):
        return self.name
    
class Subscription(models.Model):

    uuid = models.UUIDField(primary_key=False, default=uuid.uuid4, editable=False, unique=True)

    subscription_name = models.CharField(max_length=255)
    subscription_amount = models.DecimalField(max_digits=10, decimal_places=2)
    no_of_borrowers = models.IntegerField()

    # Type choices
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    YEARLY = "Yearly"

    TYPE_CHOICES = [
        (MONTHLY, "Monthly"),
        (QUARTERLY, "Quarterly"),
        (YEARLY, "Yearly"),
    ]

    type_of = models.CharField(max_length=20, choices=TYPE_CHOICES)

    # Status field (Active/Pause/Cancel)
    ACTIVE = "Active"
    PAUSE = "Pause"
    CANCEL = "Cancel"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (PAUSE, "Pause"),
        (CANCEL, "Cancel"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=ACTIVE
    )

    created_user = models.CharField(max_length=255, null=True, blank=True)
    modified_user = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    isDeleted = models.BooleanField(default=False)

    def __str__(self):
        return self.subscription_name

    
class Coupon(models.Model):
    uuid = models.UUIDField(primary_key=False, default=uuid.uuid4, editable=False, unique=True)

    coupon_code = models.CharField(max_length=100, unique=True)
    coupon_value = models.DecimalField(max_digits=10, decimal_places=2)

    date_from = models.DateField()
    date_to = models.DateField()

    # Many-to-many with Subscription
    subscription_id = models.ManyToManyField("Subscription", blank=True)

    created_user = models.CharField(max_length=255, null=True, blank=True)
    modified_user = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    isDeleted = models.BooleanField(default=False)

    class Meta:
        db_table = "admin_coupons"

    def __str__(self):
        return self.coupon_code


class Subscriber(models.Model):
    subscription_id = models.CharField(max_length=200)
    tenant_id = models.CharField(max_length=200)

    created_user = models.CharField(max_length=200, null=True, blank=True)
    modified_user = models.CharField(max_length=200, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    isDeleted = models.BooleanField(default=False)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return self.subscription_id
    

class EmploymentType(models.Model):
    emp_name = models.CharField(max_length=255)

    created_user = models.CharField(max_length=255, null=True, blank=True)
    modified_user = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    isDeleted = models.BooleanField(default=False)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return self.emp_name
    
class OccupationType(models.Model):
    occ_name = models.CharField(max_length=255)

    created_user = models.CharField(max_length=255, null=True, blank=True)
    modified_user = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    isDeleted = models.BooleanField(default=False)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return self.occ_name    



class Setting(models.Model):
    DATA_TYPES = (
        ("STRING", "String"),
        ("BOOLEAN", "Boolean"),
        ("NUMBER", "Number"),
    )

    CATEGORIES = (
        ("loan", "Loan Configuration"),
        ("system", "System & Security"),
        ("notify", "Notifications & Email"),
    )

    key = models.CharField(max_length=200, unique=True)
    value = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default="STRING")
    is_encrypted = models.BooleanField(default=False)

    def __str__(self):
        return self.key



class Dashboard(models.Model):
    """
    Model to store the entire dashboard data in one place.
    """
    # KPIs
    total_tenants = models.IntegerField(default=0)
    tenants_trend = models.CharField(max_length=20, blank=True)
    active_users = models.IntegerField(default=0)
    users_trend = models.CharField(max_length=20, blank=True)
    total_loans = models.IntegerField(default=0)
    loans_trend = models.CharField(max_length=20, blank=True)
    disbursed_amount = models.CharField(max_length=50, blank=True)  # e.g., "₹2,847 Cr"
    amount_trend = models.CharField(max_length=20, blank=True)

    # Charts
    monthly_disbursement = JSONField(default=list, blank=True)
    loan_status_distribution = JSONField(default=list, blank=True)
    recent_activity = JSONField(default=list, blank=True)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Dashboard"
        verbose_name_plural = "Dashboards"

    def __str__(self):
        return f"Dashboard Snapshot {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
