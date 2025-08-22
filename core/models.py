from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    BLOOD_GROUPS = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    allergies = models.TextField(blank=True, null=True)
    age = models.PositiveIntegerField(validators=[MinValueValidator(18), MaxValueValidator(65)])
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    is_donor = models.BooleanField(default=True)
    is_recipient = models.BooleanField(default=True)
    location_lat = models.FloatField(blank=True, null=True)
    location_long = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} - {self.blood_group}"

class Hospital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    location_lat = models.FloatField()
    location_long = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
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
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='donations')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='donations')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    donation_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Donation by {self.donor.username} for {self.blood_request.patient.username}"

class BloodTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='blood_test')
    sugar_level = models.FloatField()
    uric_acid_level = models.FloatField()
    wbc_count = models.FloatField()
    rbc_count = models.FloatField()
    hemoglobin = models.FloatField()
    platelet_count = models.FloatField()
    tested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_tests')
    health_risk_prediction = models.TextField(blank=True, null=True)
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
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_id = models.UUIDField(blank=True, null=True)  # ID of related object (request, donation, etc.)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.user.username}"