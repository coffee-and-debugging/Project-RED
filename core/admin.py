from django.contrib import admin
from .models import User, Hospital, BloodRequest, Donation, BloodTest, ChatRoom, Message, Notification

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'blood_group', 'age', 'gender', 'is_donor', 'is_recipient')
    list_filter = ('blood_group', 'gender', 'is_donor', 'is_recipient')
    search_fields = ('username', 'email', 'first_name', 'last_name')

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone_number')
    search_fields = ('name', 'address')

@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'blood_group', 'units_required', 'urgency', 'status')
    list_filter = ('blood_group', 'urgency', 'status')
    search_fields = ('patient__username', 'patient__email')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'blood_request', 'hospital', 'status', 'donation_date')
    list_filter = ('status', 'donation_date')
    search_fields = ('donor__username', 'blood_request__patient__username')

@admin.register(BloodTest)
class BloodTestAdmin(admin.ModelAdmin):
    list_display = ('donation', 'sugar_level', 'hemoglobin', 'tested_by')
    search_fields = ('donation__donor__username', 'tested_by__username')

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('donor', 'patient', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('donor__username', 'patient__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('chat_room', 'sender', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('chat_room__donor__username', 'chat_room__patient__username', 'sender__username')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title')