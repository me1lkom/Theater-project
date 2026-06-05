# redis_utils.py (ФИНАЛЬНАЯ ВЕРСИЯ)
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import hashlib
import logging

logger = logging.getLogger(__name__)


class TokenManager:

    ACCESS_BLACKLIST_PREFIX = 'blacklist:access:'
    REFRESH_BLACKLIST_PREFIX = 'blacklist:refresh:'
    
    @classmethod
    def _hash_token(cls, token):

        # Хеширование токена для создания ключа Redis

        return hashlib.sha256(token.encode()).hexdigest()
    
    @classmethod
    def _get_ttl(cls, token, token_type='access'):

        # Получить оставшееся время жизни токена в секундах.

        try:
            if token_type == 'access':
                t = AccessToken(token)
            else:
                t = RefreshToken(token)
            
            exp = t.payload.get('exp')
            ttl = exp - timezone.now().timestamp()
            return max(0, int(ttl))
        except Exception as e:
            logger.error(f"Ошибка получения TTL: {e}")
            return 0
    
    @classmethod
    def _get_key(cls, token, token_type='access'):

        token_hash = cls._hash_token(token)
        if token_type == 'access':
            return f"{cls.ACCESS_BLACKLIST_PREFIX}{token_hash}"
        else:
            return f"{cls.REFRESH_BLACKLIST_PREFIX}{token_hash}"
    
    @classmethod
    def blacklist(cls, token, token_type='access'):

        # Добавить токен в черный список.
        
        try:
            ttl = cls._get_ttl(token, token_type)
            
            if ttl <= 0:
                logger.warning(f"{token_type}-токен уже истек, не блокируем")
                return False
            
            key = cls._get_key(token, token_type)
            cache.set(key, '1', timeout=ttl)
            
            logger.info(f"{token_type.capitalize()}-токен заблокирован на {ttl}с")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка блокировки токена: {e}")
            return False
    
    @classmethod
    def is_access_blacklisted(cls, access_token):

        try:
            key = cls._get_key(access_token, 'access')
            return cache.get(key) is not None
        except Exception as e:
            logger.error(f"Ошибка проверки blacklist: {e}")
            return False
    
    @classmethod
    def is_refresh_blacklisted(cls, refresh_token):

        try:
            key = cls._get_key(refresh_token, 'refresh')
            return cache.get(key) is not None
        except Exception as e:
            logger.error(f"Ошибка проверки blacklist: {e}")
            return False