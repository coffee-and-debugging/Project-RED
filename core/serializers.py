from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User, DonorHospitalAssignment, Hospital, BloodRequest, Donation, BloodTest, ChatRoom, Message, Notification, HospitalUser, News, DonationStats
import requests
from django.conf import settings
import json
import base64
from math import radians, sin, cos, sqrt, atan2

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                 'blood_group', 'allergies', 'age', 'gender', 'address', 'phone_number')
        extra_kwargs = {
            'password': {'write_only': True},
            'blood_group': {'required': False},
            'age': {'required': False},
            'gender': {'required': False},
            'address': {'required': False},
            'phone_number': {'required': False},
        }
    
    def create(self, validated_data):
        address = validated_data.get('address')
        if address:
            lat, lng = self.geocode_address(address)
            validated_data['location_lat'] = lat
            validated_data['location_long'] = lng
        
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def geocode_address(self, address):
        try:
            api_key = settings.GOOGLE_MAPS_API_KEY
            url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
            response = requests.get(url)
            data = response.json()
            
            if data['status'] == 'OK':
                location = data['results'][0]['geometry']['location']
                return location['lat'], location['lng']
        except:
            pass
        return None, None

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to login with provided credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return data

class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'blood_group', 'age', 'gender', 'address', 'phone_number',
            'is_donor', 'is_recipient', 'location_lat', 'location_long',
            'allergies', 'profile_picture', 'profile_picture_url',
            'created_at'
        ]
        read_only_fields = ['profile_picture_url']
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                # This generates absolute URL like: http://127.0.0.1:8000/media/profile_pictures/filename.jpg
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None
     
    
    
class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    profile_picture_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'blood_group', 'age',
            'gender', 'address', 'phone_number', 'allergies', 'profile_picture', 'profile_picture_url'
        ]
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs
    
class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class HospitalRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = Hospital
        fields = ('name', 'address', 'phone_number', 'location_lat', 'location_long', 
                 'username', 'email', 'password', 'confirm_password')
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": ["Passwords don't match"]})
        
        if Hospital.objects.filter(name__iexact=data['name']).exists():
            raise serializers.ValidationError({"name": ["A hospital with this name already exists"]})
        
        if 'username' not in data or not data['username']:
            username = data['name'].lower().replace(' ', '_').replace('-', '_')
            username = ''.join(c for c in username if c.isalnum() or c == '_')
            username = username[:30]
            data['username'] = username
        
        # Check if username already exists
        if HospitalUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": ["This username is already taken"]})
        
        # Check if email already exists
        if HospitalUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": ["This email is already registered"]})
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        username = validated_data.pop('username')
        email = validated_data.pop('email')  # Extract email
        
        hospital = Hospital.objects.create(**validated_data)
        
        hospital_user = HospitalUser.objects.create(
            hospital=hospital,
            username=username,
            email=email  # Set email
        )
        hospital_user.set_password(password)
        
        return hospital
    
    
class HospitalLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError({"non_field_errors": ["Username and password are required"]})
        
        try:
            hospital_user = HospitalUser.objects.get(username=username, is_active=True)
            if not hospital_user.check_password(password):
                raise serializers.ValidationError({"non_field_errors": ["Invalid password"]})
            
            data['hospital_user'] = hospital_user
        except HospitalUser.DoesNotExist:
            raise serializers.ValidationError({"non_field_errors": ["Hospital account not found"]})
        
        return data

class HospitalUserSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer(read_only=True)
    
    class Meta:
        model = HospitalUser
        fields = ('id', 'username', 'hospital', 'created_at')

class BloodRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_blood_group = serializers.CharField(source='patient.blood_group', read_only=True)
    
    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ('patient', 'status')
        

class BloodTestSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donation.donor.get_full_name', read_only=True)
    donor_age = serializers.IntegerField(source='donation.donor.age', read_only=True)
    donor_gender = serializers.CharField(source='donation.donor.gender', read_only=True)
    donor_blood_group = serializers.CharField(source='donation.donor.blood_group', read_only=True)
    hospital_name = serializers.CharField(source='tested_by.name', read_only=True)
    
    class Meta:
        model = BloodTest
        fields = '__all__'
        # Remove read_only for prediction fields so they can be returned
        read_only_fields = ('id', 'created_at', 'updated_at')
               

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='blood_request.patient.get_full_name', read_only=True)
    patient_blood_group = serializers.CharField(source='blood_request.blood_group', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    donation_date = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)
    blood_test = BloodTestSerializer(read_only=True)  # Include full blood test data
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('donor', 'hospital', 'status')

        
class BloodTestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodTest
        fields = ('sugar_level', 'uric_acid_level', 'wbc_count', 'rbc_count', 
                 'hemoglobin', 'platelet_count', 'life_saved')

class ChatRoomSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    donation_blood_group = serializers.CharField(source='donation.blood_request.blood_group', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        
        
class DonorHospitalAssignmentSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    donor_blood_group = serializers.CharField(source='donor.blood_group', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    donation_id = serializers.UUIDField(source='donation.id', read_only=True)
    
    class Meta:
        model = DonorHospitalAssignment
        fields = '__all__'
        read_only_fields = ('assigned_at', 'completed_at')
        

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """
        Validate that the email exists in the system
        """
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email address")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": ["Passwords don't match"]})
        return data
    
    
class HospitalPasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """
        Validate that the email exists in the hospital user system
        """
        if not HospitalUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No hospital account found with this email address")
        return value

class HospitalPasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": ["Passwords don't match"]})
        return data


class NewsSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['id', 'title', 'summary', 'content', 'category', 'image_url',
                  'is_featured', 'is_active', 'author', 'created_at', 'updated_at', 'time_ago']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days > 1 else ''} ago"
        else:
            return obj.created_at.strftime("%B %d, %Y")


class DonationStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationStats
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for aggregated dashboard statistics"""
    total_donations = serializers.IntegerField()
    total_requests = serializers.IntegerField()
    lives_saved = serializers.IntegerField()
    active_donors = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    completed_donations = serializers.IntegerField()
    blood_group_stats = serializers.DictField()