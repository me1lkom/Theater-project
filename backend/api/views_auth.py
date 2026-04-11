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

    # Вход в систему — устанавливает httpOnly cookie и сохраняет refresh токен в Redis
    # POST /api/auth/login/
    
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
    
    RedisTokenStorage.revoke_all_user_tokens(user.id)

    # созжание токенов
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # сохранение refresh токен в Redis
    logger.info(f"Логин пользователя {user.username}, сохраняем refresh токен в Redis")
    save_result = RedisTokenStorage.save_refresh_token(user.id, refresh_token)
    logger.info(f"Результат сохранения: {save_result}")

    profile = user.profile

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
    
    # установка cookie
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
        return Response({'error': 'Refresh токен не найден'}, status=400)
    
    try:
        refresh = RefreshToken(refresh_token)
        user_id = refresh.payload.get('user_id')
        
        if not RedisTokenStorage.check_refresh_token(user_id, refresh_token):
            return Response({'error': 'Refresh токен недействителен'}, status=401)
        
        # Только новый access
        new_access = str(refresh.access_token)
        
        response = Response({'success': True})
        set_cookie(response, 'access_token', new_access, 900)
        # refresh cookie НЕ меняем
        
        return response
        
    except Exception:
        return Response({'error': 'Недействительный refresh токен'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_cookie(request):

    # Выход из системы — отзывает refresh токен в Redis и удаляет cookie
    # POST /api/auth/logout/

    user = request.user
    refresh_token = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
    )
    
    if refresh_token:
        # отзыв refresh токен в Redis
        logger.info(f"Выход пользователя {user.username}, отзываем refresh токен")
        RedisTokenStorage.revoke_refresh_token(user.id, refresh_token)
    
    # добавление текущего access токен в черный список
    access_token = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
    )
    if access_token:
        RedisTokenStorage.blacklist_access_token(access_token)
    
    response = Response({
        'success': True,
        'message': 'Выход выполнен'
    })
    
    # удаление cookie
    delete_cookie(response, settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'))
    delete_cookie(response, settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register_cookie(request):

    # Регистрация нового пользователя — сразу логинит
    # POST /api/auth/register/

    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        

        RedisTokenStorage.revoke_all_user_tokens(user.id)
        # создание токенов
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        profile = user.profile
        
        # сохранение refresh токена в Redis
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
                'phone' : profile.phone,

            }
        }, status=status.HTTP_201_CREATED)
        
        # установка cookie
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

    # Получить информацию о текущем пользователе
    # GET /api/auth/me/

    user = request.user
    
    try:
        profile = user.profile
        role = profile.role.name if profile.role else None
        phone = profile.phone
    except:
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