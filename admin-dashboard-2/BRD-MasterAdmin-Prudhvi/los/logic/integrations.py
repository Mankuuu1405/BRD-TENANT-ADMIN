import random

class SmartVerificationService:
    @staticmethod
    def perform_penny_drop(account, ifsc):
        return {"verified": True, "name": "TEST USER"}

    @staticmethod
    def generate_sanction_letter_pdf(app):
        return {"file_name": f"Sanction_{app.application_id}.pdf"}