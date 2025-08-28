from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import debug_blood_requests

from .views import (
    AuthViewSet, UserViewSet, HospitalViewSet, BloodRequestViewSet,
    DonationViewSet, BloodTestViewSet, ChatRoomViewSet, NotificationViewSet,
    complete_donation, available_blood_requests, CustomTokenObtainPairView,
    create_chatroom_for_donation, HospitalAuthViewSet, HospitalDashboardViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'blood-requests', BloodRequestViewSet, basename='bloodrequest')
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'blood-tests', BloodTestViewSet, basename='bloodtest')
router.register(r'chat-rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'hospital-auth', HospitalAuthViewSet, basename='hospital-auth')
router.register(r'hospital-dashboard', HospitalDashboardViewSet, basename='hospital-dashboard')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/complete-donation/<uuid:donation_id>/', complete_donation, name='complete-donation'),
    path('api/available-blood-requests/', available_blood_requests, name='available-blood-requests'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/debug-blood-requests/', debug_blood_requests, name='debug-blood-requests'),
    path('api/create-chatroom-for-donation/<uuid:donation_id>/', create_chatroom_for_donation, name='create-chatroom-for-donation'),
]