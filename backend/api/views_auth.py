# views_auth.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from .serializers import RegisterSerializer
from .redis_utils import TokenManager
from .models import Profile
import logging

logger = logging.getLogger(__name__)


def set_auth_cookies(response, access_token, refresh_token=None):
    # Установка cookies с токенами
    cookie_settings = {
        'httponly': True,
        'samesite': 'Lax',
        'path': '/',
        'secure': not settings.DEBUG,
    }
    
    response.set_cookie(
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
        access_token,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **cookie_settings
    )
    
    if refresh_token:
        response.set_cookie(
            settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
            refresh_token,
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            **cookie_settings
        )


def delete_auth_cookies(response):
    # Удаление cookies с токенами"""
    response.delete_cookie(
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
        path='/'
    )
    response.delete_cookie(
        settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
        path='/'
    )


def get_user_data(user):
    # Формирование данных пользователя
    try:
        profile = user.profile
        role = profile.role.name if profile.role else None
        phone = profile.phone
    except Profile.DoesNotExist:
        role = None
        phone = ''
    
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': phone,
        'role': role
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):

    # Вход в систему
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
    
    Profile.objects.get_or_create(user=user)
    
    old_refresh = request.COOKIES.get('refresh_token')
    if old_refresh:
        TokenManager.blacklist(old_refresh, 'refresh')

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    logger.info(f"Пользователь {user.username} вошел в систему")
    
    response = Response({
        'success': True,
        'user': get_user_data(user)
    })
    
    set_auth_cookies(response, access_token, refresh_token)
    
    return response


@api_view(['POST'])
def refresh_token(request):

    # Обновление токенов
    # POST /api/auth/refresh/

    refresh_token_str = request.COOKIES.get('refresh_token')
    
    if not refresh_token_str:
        return Response(
            {'error': 'Refresh-токен не найден'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    

    if TokenManager.is_refresh_blacklisted(refresh_token_str):
        logger.warning("Попытка использовать заблокированный refresh-токен")
        return Response(
            {'error': 'Refresh-токен недействителен'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        old_refresh = RefreshToken(refresh_token_str)
        user_id = old_refresh.payload.get('user_id')

        TokenManager.blacklist(refresh_token_str, 'refresh')
        
        user = User.objects.get(id=user_id)
        new_refresh = RefreshToken.for_user(user)
        
        new_access = str(new_refresh.access_token)
        new_refresh_str = str(new_refresh)
        
        logger.info(
            f"Токены обновлены для user_id={user_id}. "
            f"Refresh продлен на {settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']}"
        )
        
        response = Response({
            'success': True,
            'message': 'Токены успешно обновлены',
            'user': get_user_data(user)
        })
        
        set_auth_cookies(response, new_access, new_refresh_str)
        
        return response
        
    except TokenError as e:
        logger.error(f"Refresh-токен истек или невалиден: {e}")
        return Response(
            {'error': 'Refresh-токен истек. Требуется повторный вход.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except User.DoesNotExist:
        logger.error(f"Пользователь с id={user_id} не найден")
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Ошибка обновления токена: {e}")
        return Response(
            {'error': 'Недействительный refresh-токен'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):

    # Выход из системы
    # POST /api/auth/logout/

    access_token = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
    )
    if access_token:
        TokenManager.blacklist(access_token, 'access')
    
    refresh_token_str = request.COOKIES.get(
        settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
    )
    if refresh_token_str:
        TokenManager.blacklist(refresh_token_str, 'refresh')
    
    logger.info(f"Пользователь {request.user.username} вышел из системы")
    
    response = Response({
        'success': True,
        'message': 'Выход выполнен'
    })
    
    delete_auth_cookies(response)
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):

    # Регистрация нового пользователя
    # POST /api/auth/register/

    phone = request.data.get('phone', '')
    
    if phone and Profile.objects.filter(phone=phone).exists():
        return Response({
            'phone': ['Пользователь с таким номером телефона уже существует']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        logger.error(f"Ошибка валидации при регистрации: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token_str = str(refresh)
            
            logger.info(f"Пользователь {user.username} успешно зарегистрирован")
            
            response = Response({
                'success': True,
                'user': get_user_data(user)
            }, status=status.HTTP_201_CREATED)
            
            set_auth_cookies(response, access_token, refresh_token_str)
            
            return response
            
    except Exception as e:
        logger.error(f"Ошибка при регистрации: {e}")
        return Response({
            'error': 'Ошибка при регистрации пользователя'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):

    # Получение данных текущего пользователя
    # GET /api/auth/me/

    return Response(get_user_data(request.user))