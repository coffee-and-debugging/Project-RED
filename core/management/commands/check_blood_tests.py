# Create a command to check blood tests
# core/management/commands/check_blood_tests.py
from django.core.management.base import BaseCommand
from core.models import BloodTest

class Command(BaseCommand):
    help = 'Check blood tests and their health predictions'

    def handle(self, *args, **options):
        blood_tests = BloodTest.objects.all()
        self.stdout.write(f"Found {blood_tests.count()} blood tests")
        
        for blood_test in blood_tests:
            self.stdout.write(
                f"Blood Test {blood_test.id}:\n"
                f"  Donor: {blood_test.donation.donor.username}\n"
                f"  Hospital: {blood_test.tested_by.name}\n"
                f"  Health Prediction: {blood_test.health_risk_prediction[:100]}...\n"
                f"  Created: {blood_test.created_at}\n"
            )