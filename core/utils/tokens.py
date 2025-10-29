from django.contrib.auth.tokens import PasswordResetTokenGenerator
import hashlib

class HospitalUserTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, hospital_user, timestamp):
        # Use the same logic as the default token generator but for HospitalUser
        login_timestamp = '' if hospital_user.created_at is None else hospital_user.created_at.replace(microsecond=0, tzinfo=None)
        return (
            str(hospital_user.pk) + 
            str(timestamp) + 
            str(login_timestamp) + 
            str(hospital_user.is_active)
        )

hospital_user_token_generator = HospitalUserTokenGenerator()