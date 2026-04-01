from django.core.cache import cache
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RedisTokenBlacklist:

    # Префиксы для разных типов токенов
    REFRESH_PREFIX = 'blacklist:refresh:'
    ACCESS_PREFIX = 'blacklist:access:'
    
    @classmethod
    def _get_key(cls, token, prefix):

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return f"{prefix}{token_hash}"
    
    @classmethod
    def add_refresh(cls, refresh_token, ttl=None):

        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            
            # Если ttl не указан, берем из токена
            if ttl is None:
                ttl = token.lifetime.total_seconds()
            
            key = cls._get_key(refresh_token, cls.REFRESH_PREFIX)
            cache.set(key, {
                'type': 'refresh',
                'added_at': datetime.now().isoformat(),
                'user_id': token.payload.get('user_id')
            }, timeout=int(ttl))
            
            logger.info(f"Refresh токен добавлен в blacklist (user_id={token.payload.get('user_id')})")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при добавлении refresh токена в blacklist: {e}")
            return False
    
    @classmethod
    def add_access(cls, access_token, ttl=None):

        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(access_token)
            
            if ttl is None:
                ttl = token.lifetime.total_seconds()
            
            key = cls._get_key(access_token, cls.ACCESS_PREFIX)
            cache.set(key, {
                'type': 'access',
                'added_at': datetime.now().isoformat(),
                'user_id': token.payload.get('user_id')
            }, timeout=int(ttl))
            
            logger.info(f"Access токен добавлен в blacklist (user_id={token.payload.get('user_id')})")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при добавлении access токена в blacklist: {e}")
            return False
    
    @classmethod
    def is_blacklisted(cls, token):

        # Проверяем как refresh
        key = cls._get_key(token, cls.REFRESH_PREFIX)
        if cache.get(key):
            return True
        
        # Проверяем как access
        key = cls._get_key(token, cls.ACCESS_PREFIX)
        if cache.get(key):
            return True
        
        return False
    
    @classmethod
    def remove(cls, token):

        key = cls._get_key(token, cls.REFRESH_PREFIX)
        cache.delete(key)
        
        key = cls._get_key(token, cls.ACCESS_PREFIX)
        cache.delete(key)
        
        return True
    
    @classmethod
    def clear_user_tokens(cls, user_id):

        # В Redis сложно найти все ключи по user_id
        # Для этого нужно хранить user_id в отдельном индексе
        # Или просто очистить всё (осторожно!)
        logger.warning(f"Очистка всех токенов пользователя {user_id} не поддерживается")
        return False