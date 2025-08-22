from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, UserViewSet, HospitalViewSet, BloodRequestViewSet,
    DonationViewSet, BloodTestViewSet, ChatRoomViewSet, NotificationViewSet,
    complete_donation, CustomTokenObtainPairView
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

urlpatterns = [
    path('', include(router.urls)),
    path('complete-donation/<uuid:donation_id>/', complete_donation, name='complete-donation'),
    # JWT endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]