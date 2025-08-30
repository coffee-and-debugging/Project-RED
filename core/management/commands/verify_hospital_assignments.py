from django.core.management.base import BaseCommand
from core.models import Donation, Hospital

class Command(BaseCommand):
    help = 'Verify hospital assignments for donations'

    def handle(self, *args, **options):
        # Check all donations with hospitals
        donations_with_hospitals = Donation.objects.filter(hospital__isnull=False)
        
        self.stdout.write(f"Total donations with hospitals: {donations_with_hospitals.count()}")
        
        for donation in donations_with_hospitals:
            self.stdout.write(
                f"Donation {donation.id}: "
                f"Donor={donation.donor.username}, "
                f"Hospital={donation.hospital.name}, "
                f"Status={donation.status}, "
                f"AI Recommended={donation.ai_recommended_hospital}"
            )
        
        # Check donations without hospitals that should have them
        donations_without_hospitals = Donation.objects.filter(
            hospital__isnull=True, 
            status__in=['scheduled', 'completed']
        )
        
        self.stdout.write(f"\nDonations without hospitals (that should have them): {donations_without_hospitals.count()}")
        
        for donation in donations_without_hospitals:
            self.stdout.write(
                f"Donation {donation.id}: "
                f"Donor={donation.donor.username}, "
                f"Status={donation.status}"
            )