from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User, Hospital, BloodRequest, Donation, BloodTest, ChatRoom, Message, Notification, HospitalUser
import requests
from django.conf import settings
import json
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
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'blood_group', 'allergies', 'age', 'gender', 'address', 
                 'phone_number', 'location_lat', 'location_long', 'is_donor', 'is_recipient')

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class HospitalRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, max_length=150)
    
    class Meta:
        model = Hospital
        fields = ('name', 'address', 'phone_number', 'location_lat', 'location_long', 
                 'username', 'password', 'confirm_password')
    
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
        
        if HospitalUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": ["This username is already taken"]})
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        username = validated_data.pop('username')
        
        hospital = Hospital.objects.create(**validated_data)
        
        hospital_user = HospitalUser.objects.create(
            hospital=hospital,
            username=username
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

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='blood_request.patient.get_full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('donor', 'hospital', 'status')

    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        return super().create(validated_data)

class BloodTestSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donation.donor.get_full_name', read_only=True)
    hospital_name = serializers.CharField(source='tested_by.name', read_only=True)
    
    class Meta:
        model = BloodTest
        fields = '__all__'
        read_only_fields = ('health_risk_prediction',)

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