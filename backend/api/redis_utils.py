"""
Утилиты для работы с Redis: хранение и проверка refresh токенов
"""
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import hashlib
import logging

logger = logging.getLogger(__name__)


class RedisTokenStorage:

    # Префиксы для ключей
    REFRESH_PREFIX = 'refresh:'
    ACCESS_BLACKLIST_PREFIX = 'blacklist:access:'
    
    @classmethod
    def _get_refresh_key(cls, user_id, jti=None):

        if jti:
            return f"{cls.REFRESH_PREFIX}user:{user_id}:token:{jti}"
        return f"{cls.REFRESH_PREFIX}user:{user_id}"
    
    @classmethod
    def _get_hash_key(cls, token):

        return hashlib.sha256(token.encode()).hexdigest()
    
    @classmethod
    def save_refresh_token(cls, user_id, refresh_token):

        try:
            token = RefreshToken(refresh_token)
            jti = token.payload.get('jti')
            exp = token.payload.get('exp')
            
            # Вычисляем TTL
            current_time = timezone.now().timestamp()
            ttl = exp - current_time
            
            if ttl <= 0:
                logger.warning(f"Refresh токен уже истек для user_id={user_id}")
                return False
            
            # Ключ для конкретного токена
            key = cls._get_refresh_key(user_id, jti)
            
            # сохранние с временем жизни токена
            token_hash = cls._hash_token(refresh_token)
            cache.set(key, token_hash, timeout=int(ttl))
            
            # сохранние списка всех токенов пользователя
            user_tokens_key = cls._get_refresh_key(user_id)
            user_tokens = cache.get(user_tokens_key, [])
            
            if not isinstance(user_tokens, list):
                user_tokens = []
            
            if jti not in user_tokens:
                user_tokens.append(jti)
                cache.set(user_tokens_key, user_tokens, timeout=int(ttl))
            
            logger.info(f"Refresh токен сохранен для user_id={user_id}, jti={jti}, ttl={ttl}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка сохранения refresh токена: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    @classmethod
    def check_refresh_token(cls, user_id, refresh_token):
        try:
            token = RefreshToken(refresh_token)
            jti = token.payload.get('jti')
            key = cls._get_refresh_key(user_id, jti)
            
            saved_hash = cache.get(key)
            if saved_hash is None:
                return False
            
            return saved_hash == cls._hash_token(refresh_token)

        except Exception as e:
            logger.error(f"Ошибка проверки refresh токена: {e}")
            return False
    
    @classmethod
    def revoke_refresh_token(cls, user_id, refresh_token):

        try:
            token = RefreshToken(refresh_token)
            jti = token.payload.get('jti')
            
            # удаление конкретного токен
            key = cls._get_refresh_key(user_id, jti)
            cache.delete(key)
            
            # удаление из списка токенов пользователя
            user_tokens_key = cls._get_refresh_key(user_id)
            user_tokens = cache.get(user_tokens_key, [])

            if not isinstance(user_tokens, list):
                user_tokens = []
            
            if jti in user_tokens:
                user_tokens.remove(jti)
                if user_tokens:
                    cache.set(user_tokens_key, user_tokens)
                else:
                    cache.delete(user_tokens_key)
            
            logger.info(f"Refresh токен отозван для user_id={user_id}, jti={jti}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка отзыва refresh токена: {e}")
            return False
    
    @classmethod
    def revoke_all_user_tokens(cls, user_id):
        try:
            user_tokens_key = cls._get_refresh_key(user_id)
            user_tokens = cache.get(user_tokens_key, [])
            
            # Проверяем, что user_tokens — это список
            if not isinstance(user_tokens, list):
                user_tokens = []
            
            for jti in user_tokens:
                key = cls._get_refresh_key(user_id, jti)
                cache.delete(key)
            
            cache.delete(user_tokens_key)
            
            logger.info(f"Все refresh токены отозваны для user_id={user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка отзыва всех токенов: {e}")
            return False
    
    @classmethod
    def blacklist_access_token(cls, access_token):

        try:
            token = AccessToken(access_token)
            jti = token.payload.get('jti')
            exp = token.payload.get('exp')
            
            current_time = timezone.now().timestamp()
            ttl = exp - current_time
            
            if ttl <= 0:
                logger.warning(f"Access токен уже истек, jti={jti}")
                return False
            
            key = f"{cls.ACCESS_BLACKLIST_PREFIX}{jti}"
            cache.set(key, 'blacklisted', timeout=int(ttl))
            
            logger.info(f"Access токен добавлен в черный список: {jti}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка добавления access токена в черный список: {e}")
            return False
    
    @classmethod
    def is_access_blacklisted(cls, access_token):

        try:
            token = AccessToken(access_token)
            jti = token.payload.get('jti')
            key = f"{cls.ACCESS_BLACKLIST_PREFIX}{jti}"
            
            return cache.get(key) is not None
            
        except Exception as e:
            logger.error(f"Ошибка проверки access токена: {e}")
            return False