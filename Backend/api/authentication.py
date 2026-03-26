from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserAccount
from rest_framework import exceptions

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            # SimpleJWT defaults to 'user_id' claim
            user_id = validated_token.get('user_id')
            if not user_id:
                return None
                
            user = UserAccount.objects.get(id=user_id)
            if not user.is_active:
                raise exceptions.AuthenticationFailed('Usuario inactivo', code='user_inactive')
            return user
        except (UserAccount.DoesNotExist, Exception) as e:
            # We return None so other authentication methods can be tried (if any)
            # or it will fail with 401
            return None
