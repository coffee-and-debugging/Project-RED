from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token
from django.db.models import Q
from django.utils import timezone
from .models import User, Hospital, BloodRequest, Donation, BloodTest, ChatRoom, Message, Notification, HospitalUser
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer, 
    HospitalSerializer, BloodRequestSerializer, DonationSerializer, 
    BloodTestSerializer, BloodTestUpdateSerializer, ChatRoomSerializer, 
    MessageSerializer, NotificationSerializer, HospitalRegistrationSerializer,
    HospitalLoginSerializer, HospitalUserSerializer
)
import requests
from django.conf import settings
import json
from math import radians, sin, cos, sqrt, atan2
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import authentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .authentication import HospitalUserAuthentication
from .permissions import IsHospitalUserAuthenticated



def get_hospital_user_tokens(hospital_user):
    refresh = RefreshToken()
    refresh['user_id'] = hospital_user.id
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def csrf(self, request):
        return Response({'csrfToken': get_token(request)})
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        return Response({'message': 'Logout successful'})

class HospitalAuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        try:
            serializer = HospitalRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                hospital = serializer.save()
                return Response({
                    'message': 'Hospital registered successfully',
                    'hospital': HospitalSerializer(hospital).data,
                    'username': hospital.auth_account.username
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'non_field_errors': [f'Registration failed: {str(e)}']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = HospitalLoginSerializer(data=request.data)
        if serializer.is_valid():
            hospital_user = serializer.validated_data['hospital_user']
            
            tokens = get_hospital_user_tokens(hospital_user)
            
            return Response({
                'hospital_user': HospitalUserSerializer(hospital_user).data,
                'refresh': tokens['refresh'],
                'access': tokens['access'],
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        return Response({'message': 'Logout successful'})
    
    @action(detail=False, methods=['get'])
    def test(self, request):
        return Response({'message': 'Hospital auth endpoint is working!'})

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        if instance != request.user and not request.user.is_staff:
            return Response({'error': 'You can only update your own profile'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def nearby_donors(self, request):
        user_lat = request.query_params.get('lat')
        user_lng = request.query_params.get('lng')
        blood_group = request.query_params.get('blood_group')
        max_distance = request.query_params.get('max_distance', 50)
        
        if not user_lat or not user_lng:
            return Response({'error': 'Latitude and longitude parameters are required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_lat = float(user_lat)
            user_lng = float(user_lng)
            max_distance = float(max_distance)
        except ValueError:
            return Response({'error': 'Invalid coordinate values'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        donors = User.objects.filter(is_donor=True, location_lat__isnull=False, location_long__isnull=False)
        if blood_group:
            donors = donors.filter(blood_group=blood_group)
        
        donors = donors.exclude(id=request.user.id)
        
        nearby_donors = []
        for donor in donors:
            distance = self.calculate_distance(
                user_lat, user_lng, donor.location_lat, donor.location_long
            )
            if distance <= max_distance:
                donor_data = UserSerializer(donor).data
                donor_data['distance'] = round(distance, 2)
                nearby_donors.append(donor_data)
        
        return Response(nearby_donors)
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371
        lat1_rad = radians(lat1)
        lng1_rad = radians(lng1)
        lat2_rad = radians(lat2)
        lng2_rad = radians(lng2)
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def nearby_hospitals(self, request):
        user_lat = request.query_params.get('lat')
        user_lng = request.query_params.get('lng')
        max_distance = request.query_params.get('max_distance', 50)
        
        if not user_lat or not user_lng:
            return Response({'error': 'Latitude and longitude parameters are required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_lat = float(user_lat)
            user_lng = float(user_lng)
            max_distance = float(max_distance)
        except ValueError:
            return Response({'error': 'Invalid coordinate values'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        hospitals = Hospital.objects.all()
        nearby_hospitals = []
        
        for hospital in hospitals:
            distance = self.calculate_distance(
                user_lat, user_lng, hospital.location_lat, hospital.location_long
            )
            if distance <= max_distance:
                hospital_data = HospitalSerializer(hospital).data
                hospital_data['distance'] = round(distance, 2)
                nearby_hospitals.append(hospital_data)
        
        nearby_hospitals.sort(key=lambda x: x['distance'])
        return Response(nearby_hospitals)
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371
        lat1_rad = radians(lat1)
        lng1_rad = radians(lng1)
        lat2_rad = radians(lat2)
        lng2_rad = radians(lng2)
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.all()
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return BloodRequest.objects.all()
        return BloodRequest.objects.filter(
            Q(patient=self.request.user) | 
            Q(donations__donor=self.request.user)
        ).distinct()
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        blood_request = serializer.save(patient=self.request.user)
        donors = User.objects.filter(
            is_donor=True,
            blood_group=blood_request.blood_group,
            location_lat__isnull=False,
            location_long__isnull=False
        ).exclude(id=self.request.user.id)
        
        notification_count = 0
        for donor in donors:
            if donor.location_lat and donor.location_long:
                distance = self.calculate_distance(
                    blood_request.location_lat, blood_request.location_long,
                    donor.location_lat, donor.location_long
                )
                if distance <= 50:
                    Notification.objects.create(
                        user=donor,
                        notification_type='blood_request',
                        title='Blood Request Nearby',
                        message=f'A patient nearby needs {blood_request.blood_group} blood. Can you help?',
                        related_id=blood_request.id
                    )
                    notification_count += 1
        print(f"Created {notification_count} notifications for blood request {blood_request.id}")
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371
        lat1_rad = radians(lat1)
        lng1_rad = radians(lng1)
        lat2_rad = radians(lat2)
        lng2_rad = radians(lng2)
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

    @action(detail=True, methods=['get'])
    def find_best_donors(self, request, pk=None):
        blood_request = self.get_object()
        potential_donors = User.objects.filter(
            is_donor=True,
            blood_group=blood_request.blood_group,
            location_lat__isnull=False,
            location_long__isnull=False
        ).exclude(id=blood_request.patient.id)
        
        donors_with_distance = []
        for donor in potential_donors:
            distance = self.calculate_distance(
                blood_request.location_lat, blood_request.location_long,
                donor.location_lat, donor.location_long
            )
            if distance <= 100:
                donor_data = UserSerializer(donor).data
                donor_data['distance'] = round(distance, 2)
                donors_with_distance.append(donor_data)
        
        donors_with_distance.sort(key=lambda x: x['distance'])
        return Response(donors_with_distance)

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Donation.objects.all()
        return Donation.objects.filter(
            Q(donor=self.request.user) | 
            Q(blood_request__patient=self.request.user)
        )
        
    def perform_create(self, serializer):
        blood_request = serializer.validated_data['blood_request']
        blood_request.status = 'donating'
        blood_request.save()
        
        location_lat = self.request.data.get('location_lat')
        location_long = self.request.data.get('location_long')
        
        if location_lat and location_long:
            donor = self.request.user
            donor.location_lat = float(location_lat)
            donor.location_long = float(location_long)
            donor.save()
        
        serializer.save(donor=self.request.user, status='scheduled')
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        try:
            donation = self.get_object()
            
            if donation.donor != request.user:
                return Response({'error': 'You can only accept your own donations'}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            if donation.status != 'pending':
                return Response({'error': 'Donation has already been processed'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            donor_lat = request.data.get('donor_lat')
            donor_lng = request.data.get('donor_lng')
            
            if not donor_lat or not donor_lng:
                return Response({'error': 'Real-time location coordinates are required'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            donation.donor.location_lat = float(donor_lat)
            donation.donor.location_lng = float(donor_lng)
            donation.donor.save()
            
            best_hospital = self.find_best_hospital_with_ai(
                float(donor_lat), float(donor_lng),
                donation.blood_request.location_lat, donation.blood_request.location_long
            )
            
            if not best_hospital:
                best_hospital = self.find_best_hospital(
                    float(donor_lat), float(donor_lng),
                    donation.blood_request.location_lat, donation.blood_request.location_long
                )
            
            donation.status = 'scheduled'
            if best_hospital:
                donation.hospital = best_hospital
                donation.ai_recommended_hospital = True
            donation.save()
            
            chat_room, created = ChatRoom.objects.get_or_create(
                donor=donation.donor,
                patient=donation.blood_request.patient,
                donation=donation,
                defaults={'is_active': True}
            )
            
            # Send notification to patient
            Notification.objects.create(
                user=donation.blood_request.patient,
                notification_type='donation_accepted',
                title='Donation Accepted',
                message=f'{donation.donor.get_full_name()} has accepted your blood request. Click to chat with them.',
                related_id=chat_room.id
            )
            
            # Send notification to donor
            Notification.objects.create(
                user=donation.donor,
                notification_type='donation_accepted',
                title='Chat Room Created',
                message=f'You can now chat with {donation.blood_request.patient.get_full_name()} about the donation',
                related_id=chat_room.id
            )
            
            # Send hospital assignment notification
            if best_hospital:
                Notification.objects.create(
                    user=donation.donor,
                    notification_type='hospital_assigned',
                    title='Hospital Assigned',
                    message=f'Your donation has been scheduled at {best_hospital.name}. Please visit for blood test.',
                    related_id=donation.id
                )
            
            return Response({
                'message': 'Donation accepted successfully', 
                'hospital': HospitalSerializer(best_hospital).data if best_hospital else None,
                'chat_room_id': chat_room.id
            })
            
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def find_best_hospital(self, donor_lat, donor_lng, patient_lat, patient_lng):
        hospitals = Hospital.objects.all()
        best_hospital = None
        min_total_distance = float('inf')
        
        for hospital in hospitals:
            donor_distance = self.calculate_distance(donor_lat, donor_lng, hospital.location_lat, hospital.location_long)
            patient_distance = self.calculate_distance(patient_lat, patient_lng, hospital.location_lat, hospital.location_long)
            total_distance = donor_distance + patient_distance
            
            if total_distance < min_total_distance:
                min_total_distance = total_distance
                best_hospital = hospital
        
        return best_hospital

    def find_best_hospital_with_ai(self, donor_lat, donor_lng, patient_lat, patient_lng):
        try:
            hospitals = Hospital.objects.all()
            if not hospitals:
                return None
            
            hospital_data = []
            for hospital in hospitals:
                donor_distance = self.calculate_distance(donor_lat, donor_lng, hospital.location_lat, hospital.location_long)
                patient_distance = self.calculate_distance(patient_lat, patient_lng, hospital.location_lat, hospital.location_long)
                
                hospital_data.append({
                    'id': str(hospital.id),
                    'name': hospital.name,
                    'address': hospital.address,
                    'donor_distance': round(donor_distance, 2),
                    'patient_distance': round(patient_distance, 2),
                    'total_distance': round(donor_distance + patient_distance, 2)
                })
            
            hospital_data.sort(key=lambda x: x['total_distance'])
            
            api_key = settings.OPENAI_API_KEY
            if not api_key:
                return Hospital.objects.get(id=hospital_data[0]['id'])
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            prompt = f"""
            Analyze these hospitals and select the best one for a blood donation scenario:
            
            Donor Location: {donor_lat}, {donor_lng}
            Patient Location: {patient_lat}, {patient_lng}
            
            Available Hospitals:
            {json.dumps(hospital_data, indent=2)}
            
            Consider factors like:
            1. Total travel distance (donor + patient)
            2. Balance between donor and patient convenience
            3. Hospital capacity and facilities
            4. Traffic conditions (assume current time)
            
            Return ONLY the hospital ID of the best choice.
            """
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 50,
                'temperature': 0.1
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                data=json.dumps(data),
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                hospital_id = result['choices'][0]['message']['content'].strip()
                try:
                    return Hospital.objects.get(id=hospital_id)
                except (Hospital.DoesNotExist, ValueError):
                    return Hospital.objects.get(id=hospital_data[0]['id'])
            else:
                return Hospital.objects.get(id=hospital_data[0]['id'])
                
        except Exception as e:
            print(f"AI hospital selection failed: {str(e)}")
            return self.find_best_hospital(donor_lat, donor_lng, patient_lat, patient_lng)
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371
        lat1_rad = radians(lat1)
        lng1_rad = radians(lng1)
        lat2_rad = radians(lat2)
        lng2_rad = radians(lng2)
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

class BloodTestViewSet(viewsets.ModelViewSet):
    queryset = BloodTest.objects.all()
    serializer_class = BloodTestSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        blood_test = serializer.save()
        health_risk = self.predict_health_risk(blood_test)
        blood_test.health_risk_prediction = health_risk
        blood_test.save()
        
        Notification.objects.create(
            user=blood_test.donation.donor,
            notification_type='health_alert',
            title='Blood Test Results',
            message=f'Your blood test results are ready. {health_risk}',
            related_id=blood_test.id
        )
    
    def predict_health_risk(self, blood_test):
        try:
            api_key = settings.OPENAI_API_KEY
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            prompt = f"""
            Analyze these blood test results and provide a health risk assessment:
            - Sugar Level: {blood_test.sugar_level} mg/dL (Normal: 70-100 mg/dL)
            - Uric Acid Level: {blood_test.uric_acid_level} mg/dL (Normal: 3.4-7.0 mg/dL for men, 2.4-6.0 mg/dL for women)
            - WBC Count: {blood_test.wbc_count} cells/mcL (Normal: 4,500-11,000 cells/mcL)
            - RBC Count: {blood_test.rbc_count} million cells/mcL (Normal: 4.7-6.1 million cells/mcL for men, 4.2-5.4 million cells/mcL for women)
            - Hemoglobin: {blood_test.hemoglobin} g/dL (Normal: 13.5-17.5 g/dL for men, 12.0-15.5 g/dL for women)
            - Platelet Count: {blood_test.platelet_count} platelets/mcL (Normal: 150,000-450,000 platelets/mcL)
            
            Provide a concise assessment of any potential health risks or abnormalities.
            """
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 200
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                data=json.dumps(data)
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            else:
                return "Could not analyze blood test results at this time. Please consult a doctor."
                
        except Exception as e:
            return f"Error analyzing blood test: {str(e)}"

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            Q(donor=self.request.user) | Q(patient=self.request.user)
        )
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat_room = self.get_object()
        if chat_room.donor != request.user and chat_room.patient != request.user:
            return Response({'error': 'You are not part of this chat room'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        messages = Message.objects.filter(chat_room=chat_room).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat_room = self.get_object()
        if chat_room.donor != request.user and chat_room.patient != request.user:
            return Response({'error': 'You are not part of this chat room'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Message content is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(
            chat_room=chat_room,
            sender=request.user,
            content=content
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})



# Update the HospitalDashboardViewSet class
class HospitalDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsHospitalUserAuthenticated]  # Use custom permission
    authentication_classes = [HospitalUserAuthentication]
    
    def get_queryset(self):
        hospital_user = self.request.user
        hospital = hospital_user.hospital
        
        return Donation.objects.filter(
            hospital=hospital, 
            status='scheduled',
            ai_recommended_hospital=True
        )
    
    @action(detail=False, methods=['get'])
    def donors(self, request):
        donations = self.get_queryset()
        donors_data = []
        
        for donation in donations:
            donor_data = UserSerializer(donation.donor).data
            donor_data['donation_id'] = donation.id
            donor_data['blood_request_id'] = donation.blood_request.id
            donor_data['donor_name'] = donation.donor.get_full_name()
            donor_data['blood_group'] = donation.blood_request.blood_group
            donors_data.append(donor_data)
        
        return Response(donors_data)
    
    @action(detail=True, methods=['post'])
    def submit_blood_test(self, request, pk=None):
        try:
            hospital_user = self.request.user
            hospital = hospital_user.hospital
            
            donation = Donation.objects.get(id=pk, hospital=hospital)
            
            if hasattr(donation, 'blood_test'):
                return Response({'error': 'Blood test already submitted for this donation'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            serializer = BloodTestSerializer(data=request.data)
            if serializer.is_valid():
                blood_test = serializer.save(
                    donation=donation,
                    tested_by=hospital
                )
                
                # Close the chat room
                if hasattr(donation, 'chat_room'):
                    chat_room = donation.chat_room
                    chat_room.is_active = False
                    chat_room.save()
                
                # Update donation status
                donation.status = 'completed'
                donation.donation_date = timezone.now()
                donation.save()
                
                # Generate health risk prediction using AI
                health_risk = self.predict_health_risk(blood_test)
                blood_test.health_risk_prediction = health_risk
                blood_test.save()
                
                # Send notification to donor
                Notification.objects.create(
                    user=donation.donor,
                    notification_type='health_alert',
                    title='Blood Test Results Available',
                    message=f'Your blood test results are ready. {health_risk}',
                    related_id=blood_test.id
                )
                
                # Check if life was saved
                if blood_test.life_saved:
                    Notification.objects.create(
                        user=donation.donor,
                        notification_type='life_saved',
                        title='Life Saved! 🎉',
                        message='Your blood donation has saved a life! Thank you for your heroic contribution.',
                        related_id=donation.id
                    )
                
                return Response(BloodTestSerializer(blood_test).data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not assigned to your hospital'}, 
                           status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['put'])
    def update_blood_test(self, request, pk=None):
        try:
            hospital_user = self.request.user
            hospital = hospital_user.hospital
            
            donation = Donation.objects.get(id=pk, hospital=hospital)
            
            if not hasattr(donation, 'blood_test'):
                return Response({'error': 'No blood test found for this donation'}, 
                               status=status.HTTP_404_NOT_FOUND)
            
            blood_test = donation.blood_test
            serializer = BloodTestUpdateSerializer(blood_test, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_blood_test = serializer.save()
                
                # Check if life_saved status changed to True
                if 'life_saved' in serializer.validated_data and serializer.validated_data['life_saved']:
                    # Send life saved notification if not already sent
                    if not Notification.objects.filter(
                        user=donation.donor,
                        notification_type='life_saved',
                        related_id=donation.id
                    ).exists():
                        Notification.objects.create(
                            user=donation.donor,
                            notification_type='life_saved',
                            title='Life Saved! 🎉',
                            message='Your blood donation has saved a life! Thank you for your heroic contribution.',
                            related_id=donation.id
                        )
                
                return Response(BloodTestSerializer(updated_blood_test).data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not assigned to your hospital'}, 
                           status=status.HTTP_404_NOT_FOUND)
    
    def predict_health_risk(self, blood_test):
        try:
            api_key = settings.OPENAI_API_KEY
            if not api_key:
                return "Could not analyze blood test results at this time. Please consult a doctor."
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            prompt = f"""
            Analyze these blood test results and provide a health risk assessment:
            - Sugar Level: {blood_test.sugar_level} mg/dL (Normal: 70-100 mg/dL)
            - Uric Acid Level: {blood_test.uric_acid_level} mg/dL (Normal: 3.4-7.0 mg/dL for men, 2.4-6.0 mg/dL for women)
            - WBC Count: {blood_test.wbc_count} cells/mcL (Normal: 4,500-11,000 cells/mcL)
            - RBC Count: {blood_test.rbc_count} million cells/mcL (Normal: 4.7-6.1 million cells/mcL for men, 4.2-5.4 million cells/mcL for women)
            - Hemoglobin: {blood_test.hemoglobin} g/dL (Normal: 13.5-17.5 g/dL for men, 12.0-15.5 g/dL for women)
            - Platelet Count: {blood_test.platelet_count} platelets/mcL (Normal: 150,000-450,000 platelets/mcL)
            
            Provide a concise assessment of any potential health risks or abnormalities.
            Focus on actionable insights and recommendations.
            """
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 300,
                'temperature': 0.3
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                data=json.dumps(data),
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            else:
                return "Could not analyze blood test results at this time. Please consult a doctor."
                
        except Exception as e:
            return f"Error analyzing blood test: {str(e)}"
        
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_donation(request, donation_id):
    try:
        donation = Donation.objects.get(id=donation_id)
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not request.user.is_staff:
        return Response({'error': 'Only hospital staff can complete donations'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    donation.status = 'completed'
    donation.donation_date = timezone.now()
    donation.save()
    
    blood_request = donation.blood_request
    completed_donations = Donation.objects.filter(
        blood_request=blood_request, 
        status='completed'
    ).count()
    
    if completed_donations >= blood_request.units_required:
        blood_request.status = 'completed'
        blood_request.save()
        
        Notification.objects.create(
            user=donation.donor,
            notification_type='life_saved',
            title='Life Saved!',
            message=f'Your blood donation has saved a life! Thank you for your contribution.',
            related_id=donation.id
        )
        
        ChatRoom.objects.get_or_create(
            donor=donation.donor,
            patient=blood_request.patient,
            donation=donation,
            defaults={'is_active': True}
        )
    
    return Response({'message': 'Donation marked as completed'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_blood_requests(request):
    donor = request.user
    
    if not donor.is_donor:
        return Response({'error': 'Only donors can access this endpoint'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if not donor.location_lat or not donor.location_long:
        return Response({'error': 'Please update your location first'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    blood_requests = BloodRequest.objects.filter(
        blood_group=donor.blood_group,
        status='pending'
    )
    
    available_requests = []
    for blood_request in blood_requests:
        if blood_request.location_lat and blood_request.location_long:
            distance = calculate_distance(
                donor.location_lat, donor.location_long,
                blood_request.location_lat, blood_request.location_long
            )
            
            if distance <= 20:
                request_data = BloodRequestSerializer(blood_request).data
                request_data['distance'] = round(distance, 2)
                available_requests.append(request_data)
    
    available_requests.sort(key=lambda x: x['distance'])
    
    return Response(available_requests)

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371
    lat1_rad = radians(lat1)
    lng1_rad = radians(lng1)
    lat2_rad = radians(lat2)
    lng2_rad = radians(lng2)
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_blood_requests(request):
    donor = request.user
    
    all_requests = BloodRequest.objects.all()
    matching_requests = BloodRequest.objects.filter(blood_group=donor.blood_group)
    
    return Response({
        'donor_blood_group': donor.blood_group,
        'donor_location': {
            'lat': donor.location_lat,
            'lng': donor.location_long
        },
        'total_requests': all_requests.count(),
        'matching_blood_requests': matching_requests.count(),
        'requests': BloodRequestSerializer(all_requests, many=True).data
    })  

@api_view(['GET'])
@permission_classes([AllowAny])
def hospital_coordinates(request):
    hospitals = Hospital.objects.all().values('id', 'name', 'address', 'location_lat', 'location_long')
    return Response(list(hospitals))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chatroom_for_donation(request, donation_id):
    try:
        donation = get_object_or_404(Donation, id=donation_id)
        
        if request.user not in [donation.donor, donation.blood_request.patient]:
            return Response({'error': 'You are not authorized to create a chat room for this donation'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(donation, 'chat_room'):
            return Response({'error': 'Chat room already exists for this donation'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        chat_room = ChatRoom.objects.create(
            donor=donation.donor,
            patient=donation.blood_request.patient,
            donation=donation,
            is_active=True
        )
        
        Message.objects.create(
            chat_room=chat_room,
            sender=request.user,
            content=f"Chat room created for blood donation. Donor: {donation.donor.get_full_name()}, Patient: {donation.blood_request.patient.get_full_name()}"
        )
        
        serializer = ChatRoomSerializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)