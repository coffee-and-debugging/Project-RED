import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_red.settings')
django.setup()

from core.models import User, Hospital, BloodRequest, Donation
from django.contrib.auth.hashers import make_password

# Create test users with proper coordinates
users_data = [
    {
        'username': 'donor1',
        'email': 'donor1@example.com',
        'password': 'password123',
        'first_name': 'John',
        'last_name': 'Donor',
        'blood_group': 'A+',
        'age': 28,
        'gender': 'M',
        'address': '123 Main St, New York, NY',
        'phone_number': '+1234567890',
        'location_lat': 40.7128,  # Very close to test location
        'location_long': -74.0060,
    },
    {
        'username': 'donor2',
        'email': 'donor2@example.com',
        'password': 'password123',
        'first_name': 'Jane',
        'last_name': 'Donor',
        'blood_group': 'B+',
        'age': 32,
        'gender': 'F',
        'address': '456 Park Ave, New York, NY',
        'phone_number': '+1987654321',
        'location_lat': 40.7180,  # Close to test location
        'location_long': -74.0000,
    },
    {
        'username': 'patient1',
        'email': 'patient1@example.com',
        'password': 'password123',
        'first_name': 'Mike',
        'last_name': 'Patient',
        'blood_group': 'A+',
        'age': 45,
        'gender': 'M',
        'address': '789 Broadway, New York, NY',
        'phone_number': '+1122334455',
        'location_lat': 40.7200,  # Close to test location
        'location_long': -74.0050,
    }
]

for user_data in users_data:
    password = user_data.pop('password')
    user = User(**user_data)
    user.set_password(password)
    user.save()
    print(f'Created user: {user.username}')

# Create test hospitals
hospitals_data = [
    {
        'name': 'City General Hospital',
        'address': '123 Hospital Rd, New York, NY',
        'phone_number': '+12223334444',
        'location_lat': 40.7200,
        'location_long': -74.0050,
    },
    {
        'name': 'Community Medical Center',
        'address': '456 Health Ave, New York, NY',
        'phone_number': '+15556667777',
        'location_lat': 40.7150,
        'location_long': -74.0080,
    }
]

for hospital_data in hospitals_data:
    hospital = Hospital(**hospital_data)
    hospital.save()
    print(f'Created hospital: {hospital.name}')

# Create a blood request
patient = User.objects.get(username='patient1')
blood_request = BloodRequest.objects.create(
    patient=patient,
    blood_group='A+',
    units_required=1,
    urgency='High',
    reason='Test blood request',
    location_lat=40.7128,
    location_long=-74.0060,
    status='pending'
)
print(f'Created blood request: {blood_request.id}')

# Create a donation
donor = User.objects.get(username='donor1')
hospital = Hospital.objects.first()
donation = Donation.objects.create(
    donor=donor,
    blood_request=blood_request,
    hospital=hospital,
    status='scheduled'
)
print(f'Created donation: {donation.id}')

print('Test data created successfully!')