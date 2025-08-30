# core/management/commands/test_openai.py
from django.core.management.base import BaseCommand
from core.utils.ai_prediction import HealthPredictor

class Command(BaseCommand):
    help = 'Test OpenAI integration for disease prediction'

    def handle(self, *args, **options):
        predictor = HealthPredictor()
        
        test_data = {
            'donor_name': 'Test User',
            'donor_age': 35,
            'donor_gender': 'M',
            'sugar_level': 95,
            'hemoglobin': 14.5,
            'uric_acid_level': 5.2,
            'wbc_count': 7500,
            'rbc_count': 5.2,
            'platelet_count': 250000
        }
        
        result = predictor.predict_health_risks(test_data)
        
        self.stdout.write("OpenAI Test Results:")
        self.stdout.write(f"Summary: {result['summary']}")
        self.stdout.write(f"Confidence: {result['confidence']}%")
        self.stdout.write(f"Notification: {result['notification_message']}")
        self.stdout.write(f"Full prediction sample: {result['full_prediction'][:200]}...")