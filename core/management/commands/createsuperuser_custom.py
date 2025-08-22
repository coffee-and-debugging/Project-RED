from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import User

class Command(BaseCommand):
    help = 'Create a superuser with custom fields'

    def handle(self, *args, **options):
        User = get_user_model()
        
        username = input('Username: ')
        email = input('Email: ')
        password = input('Password: ')
        
        # Get custom fields with defaults
        blood_group = input('Blood Group (default: O+): ') or 'O+'
        age = int(input('Age (default: 30): ') or 30)
        gender = input('Gender (M/F/O, default: O): ') or 'O'
        address = input('Address (default: Admin Address): ') or 'Admin Address'
        phone_number = input('Phone Number (default: +0000000000): ') or '+0000000000'
        
        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                blood_group=blood_group,
                age=age,
                gender=gender,
                address=address,
                phone_number=phone_number
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser: {username}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )