from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.conf import settings
from .redis_utils import TokenManager
import logging

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    
    def authenticate(self, request):
        access_token = request.COOKIES.get(
            settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        )
        
        if not access_token:
            return None
        
        if TokenManager.is_access_blacklisted(access_token):
            logger.warning("Попытка использовать заблокированный access-токен")
            raise AuthenticationFailed('Токен заблокирован')
        
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception as e:
            raise AuthenticationFailed(str(e))