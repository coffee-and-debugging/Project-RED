from django.core.management.base import BaseCommand
from core.models import Notification, User

class Command(BaseCommand):
    help = 'Check notifications for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to check notifications for')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            self.stdout.write(f"Checking notifications for user: {user.username}")
            
            notifications = Notification.objects.filter(user=user).order_by('-created_at')
            self.stdout.write(f"Found {notifications.count()} notifications")
            
            for notification in notifications:
                self.stdout.write(
                    f"Notification {notification.id}:\n"
                    f"  Type: {notification.notification_type}\n"
                    f"  Title: {notification.title}\n"
                    f"  Message: {notification.message}\n"
                    f"  Created: {notification.created_at}\n"
                    f"  Read: {notification.is_read}\n"
                )
                
        except User.DoesNotExist:
            self.stdout.write(f"User {username} not found")