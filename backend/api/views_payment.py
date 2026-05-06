from rest_framework.decorators import api_view
from rest_framework.response import Response
from .payment import create_payment, check_payment
from .models import Basket, Ticket, TicketStatus
from django.shortcuts import redirect
from django.utils import timezone

@api_view(['POST'])
def create_payment_api(request):
    """Создает платеж и возвращает URL для оплаты"""
    user = request.user
    basket_items = Basket.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    )
    
    amount = sum(item.session.play.price for item in basket_items)
    description = f"Билеты для {user.username}"
    return_url = "http://localhost:8001/profile"
    
    payment_url, payment_id = create_payment(amount, description, return_url)
    
    # Сохраняем payment_id в сессии
    request.session['payment_id'] = payment_id
    request.session['basket_ids'] = list(basket_items.values_list('basket_id', flat=True))
    
    return Response({'payment_url': payment_url})

@api_view(['GET'])
def payment_success(request):
    """Обработка успешной оплаты"""
    payment_id = request.session.get('payment_id')
    basket_ids = request.session.get('basket_ids')
    
    if check_payment(payment_id):
        # Оплата прошла → создаем билеты
        for basket_id in basket_ids:
            basket = Basket.objects.get(basket_id=basket_id)
            sold_status = TicketStatus.objects.get(name='продан')
            
            Ticket.objects.create(
                user=request.user,
                session=basket.session,
                seat=basket.seat,
                status=sold_status,
                price_paid=basket.price_at_time,
                purchase_date=timezone.now()
            )
            
            basket.delete()
        
        return Response({'success': True, 'message': 'Билеты куплены'})
    
    return Response({'success': False, 'message': 'Ошибка оплаты'})