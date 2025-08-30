from django.core.management.base import BaseCommand
from core.models import Donation, DonorHospitalAssignment

class Command(BaseCommand):
    help = 'Migrate existing hospital assignments to the new table'

    def handle(self, *args, **options):
        # Get all donations with hospitals assigned
        donations_with_hospitals = Donation.objects.filter(hospital__isnull=False)
        
        self.stdout.write(f"Found {donations_with_hospitals.count()} donations with hospitals")
        
        created_count = 0
        for donation in donations_with_hospitals:
            # Check if assignment already exists
            if not DonorHospitalAssignment.objects.filter(donation=donation, hospital=donation.hospital).exists():
                DonorHospitalAssignment.objects.create(
                    donor=donation.donor,
                    hospital=donation.hospital,
                    donation=donation,
                    status=donation.status,
                    ai_recommended=donation.ai_recommended_hospital
                )
                created_count += 1
        
        self.stdout.write(f"Created {created_count} new hospital assignments")