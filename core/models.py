from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.hashers import make_password, check_password
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        extra_fields.setdefault('blood_group', 'O+')
        extra_fields.setdefault('age', 30)
        extra_fields.setdefault('gender', 'O')
        extra_fields.setdefault('address', 'Admin Address')
        extra_fields.setdefault('phone_number', '+0000000000')
        
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    age = models.PositiveIntegerField(validators=[MinValueValidator(18), MaxValueValidator(65)], blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_donor = models.BooleanField(default=True)
    is_recipient = models.BooleanField(default=True)
    location_lat = models.FloatField(blank=True, null=True)
    location_long = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = CustomUserManager()
    
    def __str__(self):
        return f"{self.username} - {self.blood_group}"

class Hospital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    location_lat = models.FloatField()
    location_long = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class HospitalUser(models.Model):
    """Hospital authentication model"""
    hospital = models.OneToOneField(Hospital, on_delete=models.CASCADE, related_name='auth_account')
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Add authentication attributes
    is_authenticated = True
    is_anonymous = False
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save()
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return f"Hospital Auth: {self.hospital.name}"
    
    # Add these methods for Django authentication compatibility
    def get_username(self):
        return self.username
    
    @property
    def is_staff(self):
        return False
    
    @property
    def is_superuser(self):
        return False
    
    def has_perm(self, perm, obj=None):
        return False
    
    def has_module_perms(self, app_label):
        return False

class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('donating', 'Donating'), ('accepted', 'Accepted'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    blood_group = models.CharField(max_length=3, choices=User.BLOOD_GROUPS)
    units_required = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=100)
    reason = models.TextField(blank=True, null=True)
    location_lat = models.FloatField()
    location_long = models.FloatField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Request from {self.patient.username} for {self.blood_group}"

class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('scheduled', 'Scheduled'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='donations')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='donations', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    donation_date = models.DateTimeField(blank=True, null=True)
    ai_recommended_hospital = models.BooleanField(default=False)  # Track if hospital was AI recommended
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Donation by {self.donor.username} for {self.blood_request.patient.username}"

class BloodTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='blood_test')
    sugar_level = models.FloatField(blank=True, null=True)  # Make optional
    uric_acid_level = models.FloatField(blank=True, null=True)  # Make optional
    wbc_count = models.FloatField(blank=True, null=True)  # Make optional
    rbc_count = models.FloatField(blank=True, null=True)  # Make optional
    hemoglobin = models.FloatField(blank=True, null=True)  # Make optional
    platelet_count = models.FloatField(blank=True, null=True)  # Make optional
    tested_by = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='blood_tests')
    health_risk_prediction = models.TextField(blank=True, null=True)
    life_saved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Blood test for {self.donation.donor.username}"

class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donor_chats')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_chats')
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='chat_room')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Chat between {self.donor.username} and {self.patient.username}"

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('blood_request', 'Blood Request'),
        ('donation_accepted', 'Donation Accepted'),
        ('donation_completed', 'Donation Completed'),
        ('life_saved', 'Life Saved'),
        ('health_alert', 'Health Alert'),
        ('hospital_assigned', 'Hospital Assigned'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_id = models.UUIDField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.user.username}"