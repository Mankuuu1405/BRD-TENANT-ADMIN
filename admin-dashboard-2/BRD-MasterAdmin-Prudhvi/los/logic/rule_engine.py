from decimal import Decimal

class RuleEngine:
    def __init__(self, application):
        self.app = application
        self.product_config = application.product.configuration if application.product else {}
        self.constraints = self.product_config.get('constraints', {})
        self.interest_config = self.product_config.get('interest_config', {})

    def execute_knockout_checks(self):
        results = { "is_eligible": True, "rejection_reason": None, "flags": {} }

        # Age Check
        if self.app.dob:
            age = (self.app.created_at.date() - self.app.dob).days // 365
            min_age = self.constraints.get('min_age', 21)
            max_age = self.constraints.get('max_age', 60)
            if not (min_age <= age <= max_age):
                results['is_eligible'] = False
                results['rejection_reason'] = f"Age {age} Invalid"

        self.app.is_geo_limit_passed = True # Mocking Geo Pass
        self.app.save()
        return results

    def calculate_underwriting_metrics(self):
        # Mock Logic for Phase 5
        self.app.net_cash_flow = self.app.monthly_income * Decimal('0.40')
        self.app.foir_percentage = Decimal('45.00')
        self.app.save()
        return {
            "net_cash_flow": self.app.net_cash_flow,
            "foir": self.app.foir_percentage,
            "system_decision": "APPROVE"
        }