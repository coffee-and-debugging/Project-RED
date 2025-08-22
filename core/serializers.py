from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Hospital, BloodRequest, Donation, BloodTest, ChatRoom, Message, Notification
import requests
from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                 'blood_group', 'allergies', 'age', 'gender', 'address', 'phone_number')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        # Geocode address to get coordinates
        address = validated_data.get('address')
        if address:
            lat, lng = self.geocode_address(address)
            validated_data['location_lat'] = lat
            validated_data['location_long'] = lng
        
        user = User.objects.create_user(**validated_data)
        return user
    
    def geocode_address(self, address):
        # Use Google Maps API to geocode the address
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

class BloodTestSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donation.donor.get_full_name', read_only=True)
    
    class Meta:
        model = BloodTest
        fields = '__all__'
        read_only_fields = ('health_risk_prediction',)

class ChatRoomSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    
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