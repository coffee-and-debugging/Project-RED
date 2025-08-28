from django.core.management.base import BaseCommand
from core.models import Donation, Hospital

class Command(BaseCommand):
    help = 'Fix hospital assignments for donations'

    def handle(self, *args, **options):
        # Find Hello Hospital
        try:
            hello_hospital = Hospital.objects.get(name="Hello Hospital")
            self.stdout.write(f"Found Hello Hospital: ID={hello_hospital.id}")
        except Hospital.DoesNotExist:
            self.stdout.write("Hello Hospital not found")
            return
        
        # Find donations that should be assigned to Hello Hospital
        # First, check donations with no hospital
        donations_no_hospital = Donation.objects.filter(hospital__isnull=True, status='scheduled')
        self.stdout.write(f"Found {donations_no_hospital.count()} scheduled donations without hospital assignment")
        
        for donation in donations_no_hospital:
            self.stdout.write(f"Fixing donation {donation.id} - assigning to Hello Hospital")
            donation.hospital = hello_hospital
            donation.ai_recommended_hospital = True
            donation.save()
            self.stdout.write(f"  Assigned to Hello Hospital, AI Recommended: {donation.ai_recommended_hospital}")
        
        # Check donations with other hospitals but should be with Hello Hospital
        donations_other_hospital = Donation.objects.exclude(hospital=hello_hospital).filter(status='scheduled')
        self.stdout.write(f"Found {donations_other_hospital.count()} scheduled donations with other hospitals")
        
        for donation in donations_other_hospital:
            self.stdout.write(f"Checking donation {donation.id} with hospital {donation.hospital.name}")
            # You might want to add specific logic here to determine if should be reassigned