from rest_framework import authentication
from rest_framework_simplejwt.exceptions import InvalidToken

class HospitalUserAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Import here to avoid circular imports
            from .models import HospitalUser
            hospital_user = HospitalUser.objects.get(id=user_id, is_active=True)
            
            # Ensure the user has the required authentication attributes
            if not hasattr(hospital_user, 'is_authenticated'):
                hospital_user.is_authenticated = True
            if not hasattr(hospital_user, 'is_anonymous'):
                hospital_user.is_anonymous = False
                
            return (hospital_user, None)
            
        except (HospitalUser.DoesNotExist, InvalidToken, Exception):
            return None