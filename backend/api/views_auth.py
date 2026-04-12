from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer
from .redis_utils import RedisTokenStorage
import logging
from django.contrib.auth.models import User
from django.core.cache import cache
from .models import Profile

logger = logging.getLogger(__name__)


def set_cookie(response, key, value, max_age):
    cookie_settings = {
        'httponly': True,
        'samesite': 'Lax',
        'path': '/',
        'max_age': max_age,
    }
    
    if not settings.DEBUG:
        cookie_settings['secure'] = True
    
    response.set_cookie(key, value, **cookie_settings)


def delete_cookie(response, key):
    response.delete_cookie(key, path='/')


@api_view(['POST'])
@permission_classes([AllowAny])
def login_cookie(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Не указаны username или password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response(
            {'error': 'Неверные учетные данные'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # ✅ Получаем или создаем профиль
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=user)
        logger.warning(f"Создан профиль для {user.username} при логине")
    
    RedisTokenStorage.revoke_all_user_tokens(user.id)

    # Создание токенов
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    logger.info(f"Логин пользователя {user.username}, сохраняем refresh токен в Redis")
    save_result = RedisTokenStorage.save_refresh_token(user.id, refresh_token)
    logger.info(f"Результат сохранения: {save_result}")

    response = Response({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': profile.phone,
        }
    })
    
    set_cookie(
        response,
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
        access_token,
        int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
    )
    
    set_cookie(
        response,
        settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
        refresh_token,
        int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    )
    
    return response


@api_view(['POST'])
def refresh_cookie(request):
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh токен не найден'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        old_refresh = RefreshToken(refresh_token)
        user_id = old_refresh.payload.get('user_id')
        
        if not RedisTokenStorage.check_refresh_token(user_id, refresh_token):
            logger.warning(f"Попытка использовать отозванный refresh токен для user_id={user_id}")
            return Response(
                {'error': 'Refresh токен недействителен'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Отзываем старый refresh
        RedisTokenStorage.revoke_refresh_token(user_id, refresh_token)
        
        # Создаем новые токены
        user = User.objects.get(id=user_id)
        new_refresh = RefreshToken.for_user(user)
        new_access = str(new_refresh.access_token)
        new_refresh_token = str(new_refresh)
        
        RedisTokenStorage.save_refresh_token(user_id, new_refresh_token)
        
        logger.info(f"Токены обновлены для user_id={user_id}")
        
        response = Response({'success': True})
        
        set_cookie(
            response,
            settings.SIMPLE_JWT['AUTH_COOKIE'],
            new_access,
            int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
        )
        
        set_cookie(
            response,
            settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            new_refresh_token,
            int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Ошибка обновления токена: {e}")
        return Response(
            {'error': 'Недействительный refresh токен'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_cookie(request):
    user = request.user
    refresh_token = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
    )
    
    if refresh_token:
        logger.info(f"Выход пользователя {user.username}, отзываем refresh токен")
        RedisTokenStorage.revoke_refresh_token(user.id, refresh_token)
    
    access_token = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
    )
    if access_token:
        RedisTokenStorage.blacklist_access_token(access_token)
    
    response = Response({
        'success': True,
        'message': 'Выход выполнен'
    })
    
    delete_cookie(response, settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'))
    delete_cookie(response, settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register_cookie(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # ✅ Получаем профиль (он уже создан в сериализаторе)
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)
        
        RedisTokenStorage.revoke_all_user_tokens(user.id)
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        logger.info(f"Регистрация пользователя {user.username}, сохраняем refresh токен")
        RedisTokenStorage.save_refresh_token(user.id, refresh_token)
        
        response = Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': profile.phone,
            }
        }, status=status.HTTP_201_CREATED)
        
        set_cookie(
            response,
            settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
            access_token,
            int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
        )
        
        set_cookie(
            response,
            settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
            refresh_token,
            int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
        )
        
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_cookie(request):
    user = request.user
    
    try:
        profile = user.profile
        role = profile.role.name if profile.role else None
        phone = profile.phone
    except Profile.DoesNotExist:
        role = None
        phone = ''
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': phone,
        'role': role
    })