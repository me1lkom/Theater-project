import logging
import traceback
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)


class ExceptionMiddleware:
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as exc:
            return self.process_exception(request, exc)
    
    def process_exception(self, request, exception):

        logger.error(
            f"Unhandled exception in middleware: {exception}",
            exc_info=True,
            extra={
                'request_path': request.path,
                'request_method': request.method,
            }
        )
        
        response_data = {
            'error': True,
            'type': exception.__class__.__name__,
            'status_code': 500,
            'detail': 'Внутренняя ошибка сервера.',
            'code': 'internal_server_error',
            'path': request.path,
        }
        
        if settings.DEBUG:
            response_data['debug_info'] = {
                'exception': str(exception),
                'traceback': traceback.format_exc().split('\n')
            }
        
        return JsonResponse(response_data, status=500)