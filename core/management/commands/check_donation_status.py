from django.core.management.base import BaseCommand
from core.models import Donation, Hospital
import traceback

class Command(BaseCommand):
    help = 'Check donation status and fix any issues'

    def handle(self, *args, **options):
        # Check all donations
        donations = Donation.objects.all()
        
        self.stdout.write(f"Total donations: {donations.count()}")
        
        for donation in donations:
            self.stdout.write(
                f"Donation {donation.id}: "
                f"Donor={donation.donor.username}, "
                f"Hospital={donation.hospital.name if donation.hospital else 'None'}, "
                f"Status={donation.status}, "
                f"AI Recommended={donation.ai_recommended_hospital}"
            )
        
        # Check Hello Hospital specifically
        try:
            hello_hospital = Hospital.objects.get(name="Hello Hospital")
            self.stdout.write(f"\nHello Hospital found: ID={hello_hospital.id}")
            
            # Check donations for Hello Hospital
            hospital_donations = Donation.objects.filter(hospital=hello_hospital)
            self.stdout.write(f"Donations for Hello Hospital: {hospital_donations.count()}")
            
            for donation in hospital_donations:
                self.stdout.write(
                    f"  Donation {donation.id}: "
                    f"Status={donation.status}, "
                    f"AI Recommended={donation.ai_recommended_hospital}, "
                    f"Donor={donation.donor.username}"
                )
                
        except Hospital.DoesNotExist:
            self.stdout.write("Hello Hospital not found in database")