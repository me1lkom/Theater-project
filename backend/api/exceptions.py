from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404, JsonResponse
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import DatabaseError, IntegrityError
from rest_framework.exceptions import (
    AuthenticationFailed, NotAuthenticated, ParseError,
    PermissionDenied as DRFPermissionDenied, ValidationError as DRFValidationError,
    NotFound as DRFNotFound, MethodNotAllowed as DRFMethodNotAllowed,
    Throttled as DRFThrottled
)
import logging
import traceback

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)

    view = context.get('view')
    request = context.get('request')

    print(f"ERROR: {exc} in {view.__class__.__name__ if view else 'Unknown'}")  

    if response is not None:
        return customize_drf_response(response, exc, request)
    
    # Обрабатываем Django исключения
    if isinstance(exc, Http404):
        return handle_404(exc, request)
    
    if isinstance(exc, PermissionDenied):
        return handle_403(exc, request)
    
    if isinstance(exc, ValidationError):
        return handle_validation_error(exc, request)
    
    if isinstance(exc, IntegrityError):
        return handle_integrity_error(exc, request)
    
    if isinstance(exc, DatabaseError):
        return handle_database_error(exc, request)
    
    return handle_500(exc, request)


def customize_drf_response(response, exc, request):

    data = {
        'error': True,
        'type': exc.__class__.__name__,
        'status_code': response.status_code,
        'path': request.path if request else None,
    }

    if isinstance(exc, AuthenticationFailed):
        data['detail'] = 'Ошибка аутентификации. Токен недействителен или истек.'
        data['code'] = 'authentication_failed'
        
    elif isinstance(exc, NotAuthenticated):
        data['detail'] = 'Требуется авторизация. Пожалуйста, войдите в систему.'
        data['code'] = 'not_authenticated'
        
    elif isinstance(exc, DRFPermissionDenied):
        data['detail'] = 'У вас недостаточно прав для выполнения этого действия.'
        data['code'] = 'permission_denied'
        
    elif isinstance(exc, DRFNotFound):
        data['detail'] = 'Запрашиваемый ресурс не найден.'
        data['code'] = 'not_found'
        
    elif isinstance(exc, DRFMethodNotAllowed):
        data['detail'] = f'Метод {request.method if request else ""} не разрешен для этого ресурса.'
        data['code'] = 'method_not_allowed'
        data['allowed_methods'] = response.data.get('detail', '')
        
    elif isinstance(exc, ParseError):
        data['detail'] = 'Ошибка разбора запроса. Проверьте формат данных.'
        data['code'] = 'parse_error'
        
    elif isinstance(exc, DRFValidationError):
        data['detail'] = 'Ошибка валидации данных.'
        data['code'] = 'validation_error'
        data['errors'] = response.data
        
    elif isinstance(exc, DRFThrottled):
        data['detail'] = f'Слишком много запросов. Попробуйте через {exc.wait} секунд.'
        data['code'] = 'throttled'
        data['wait_seconds'] = exc.wait
        
    else:
        data['detail'] = str(exc) if str(exc) else 'Произошла ошибка.'
        data['code'] = 'api_error'
        
        if hasattr(response, 'data') and response.data:
            data['original_error'] = response.data
    
    return Response(data, status=response.status_code)


def handle_404(exc, request):

    return Response({
        'error': True,
        'type': 'NotFound',
        'status_code': 404,
        'detail': 'Запрашиваемый ресурс не найден.',
        'code': 'not_found',
        'path': request.path if request else None,
        'message': str(exc) if str(exc) else 'Страница не найдена'
    }, status=status.HTTP_404_NOT_FOUND)


def handle_403(exc, request):

    return Response({
        'error': True,
        'type': 'PermissionDenied',
        'status_code': 403,
        'detail': 'Доступ запрещен. У вас недостаточно прав.',
        'code': 'permission_denied',
        'path': request.path if request else None,
        'message': str(exc) if str(exc) else 'Доступ запрещен'
    }, status=status.HTTP_403_FORBIDDEN)


def handle_validation_error(exc, request):

    error_data = {
        'error': True,
        'type': 'ValidationError',
        'status_code': 400,
        'detail': 'Ошибка валидации данных.',
        'code': 'validation_error',
        'path': request.path if request else None,
    }
    
    if hasattr(exc, 'message_dict'):
        error_data['errors'] = exc.message_dict
    elif hasattr(exc, 'messages'):
        error_data['errors'] = exc.messages
    else:
        error_data['message'] = str(exc)
    
    return Response(error_data, status=status.HTTP_400_BAD_REQUEST)


def handle_integrity_error(exc, request):
    error_msg = str(exc)

    if 'unique constraint' in error_msg.lower():
        detail = 'Нарушение уникальности. Такая запись уже существует.'
        code = 'unique_violation'
    elif 'foreign key constraint' in error_msg.lower():
        detail = 'Нарушение внешнего ключа. Связанная запись не существует.'
        code = 'foreign_key_violation'
    elif 'not null constraint' in error_msg.lower():
        detail = 'Обязательное поле не может быть пустым.'
        code = 'not_null_violation'
    else:
        detail = 'Ошибка целостности данных в базе данных.'
        code = 'integrity_error'
    
    return Response({
        'error': True,
        'type': 'IntegrityError',
        'status_code': 400,
        'detail': detail,
        'code': code,
        'path': request.path if request else None,
    }, status=status.HTTP_400_BAD_REQUEST)


def handle_database_error(exc, request):

    return Response({
        'error': True,
        'type': 'DatabaseError',
        'status_code': 500,
        'detail': 'Ошибка при работе с базой данных.',
        'code': 'database_error',
        'path': request.path if request else None,
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def handle_500(exc, request):

    from django.conf import settings
    
    response_data = {
        'error': True,
        'type': 'ServerError',
        'status_code': 500,
        'detail': 'Внутренняя ошибка сервера. Мы уже работаем над её исправлением.',
        'code': 'internal_server_error',
        'path': request.path if request else None,
    }
    
    if settings.DEBUG:
        response_data['debug_info'] = {
            'exception': str(exc),
            'traceback': traceback.format_exc().split('\n')
        }
    
    return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def handler404(request, exception):

    return JsonResponse({
        'error': True,
        'type': 'NotFound',
        'status_code': 404,
        'detail': 'Запрашиваемая страница не найдена.',
        'code': 'not_found',
        'path': request.path
    }, status=404)


def handler500(request):

    return JsonResponse({
        'error': True,
        'type': 'ServerError',
        'status_code': 500,
        'detail': 'Внутренняя ошибка сервера.',
        'code': 'internal_server_error',
        'path': request.path
    }, status=500)


def handler403(request, exception):

    return JsonResponse({
        'error': True,
        'type': 'PermissionDenied',
        'status_code': 403,
        'detail': 'Доступ запрещен.',
        'code': 'permission_denied',
        'path': request.path
    }, status=403)


def handler400(request, exception):

    return JsonResponse({
        'error': True,
        'type': 'BadRequest',
        'status_code': 400,
        'detail': 'Неверный запрос.',
        'code': 'bad_request',
        'path': request.path
    }, status=400)