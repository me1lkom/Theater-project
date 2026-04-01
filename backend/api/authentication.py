from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.conf import settings
from .redis_utils import RedisTokenStorage
import logging

logger = logging.getLogger(__name__)


class RedisJWTAuthentication(JWTAuthentication):
    """
    JWT аутентификация с проверкой черного списка в Redis
    """
    
    def authenticate(self, request):
        # Получаем токен из cookie
        token = request.COOKIES.get(
            settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        )
        
        if not token:
            return None
        
        try:
            # ✅ Проверяем, не в черном ли списке access токен
            if RedisTokenStorage.is_access_blacklisted(token):
                logger.warning(f"Попытка использования заблокированного access токена")
                raise AuthenticationFailed('Token is blacklisted')
            
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            
            return (user, validated_token)
            
        except Exception as e:
            logger.error(f"Ошибка аутентификации: {e}")
            raise AuthenticationFailed(str(e))