# api/views_payment.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Basket, Payment
from .payment import create_payment
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_api(request):
    user = request.user
    
    # Получаем активные элементы корзины
    basket_items = Basket.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    ).select_related('session__play', 'seat', 'seat__sector')
    
    if not basket_items.exists():
        return Response({'error': 'Корзина пуста'}, status=400)
    
    # Рассчитываем сумму
    total_amount = 0
    basket_ids = []
    items_prices = []
    
    for item in basket_items:
        price = float(item.price_at_time) if item.price_at_time else float(item.session.play.price)
        total_amount += price
        basket_ids.append(item.basket_id)
        items_prices.append({
            'basket_id': item.basket_id,
            'price': price
        })
    
    description = f"Билеты для {user.username}"
    return_url = "http://localhost:8001/order"
    
    try:
        payment_url, yookassa_payment_id = create_payment(total_amount, description, return_url)
        
        payment = Payment.objects.create(
            payment_id=yookassa_payment_id,
            user=user,
            amount=total_amount,
            status='pending',
            baskets_data=basket_ids
        )
        
        print(f"Платёж создан: DB={payment.id}, YooKassa={yookassa_payment_id}")
        
        return Response({
            'payment_url': payment_url,
            'payment_id': yookassa_payment_id
        })
        
    except Exception as e:
        logger.error(f"Ошибка создания платежа: {e}")
        return Response({'error': str(e)}, status=500)
    
# api/views_payment.py (продолжение)
from .models import Ticket, TicketStatus
from .payment import check_payment, refund_payment
from django.db import transaction


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request):

    payment_id = request.query_params.get('payment_id')
    
    if not payment_id:
        return Response({'error': 'payment_id required'}, status=400)

    try:
        payment = Payment.objects.get(payment_id=payment_id, user=request.user)
    except Payment.DoesNotExist:
        return Response({
            'status': 'not_found',
            'message': 'Платёж не найден'
        }, status=404)

    if payment.status != 'pending':
        return Response({
            'status': payment.status,
            'message': 'Платёж уже обработан'
        })

    try:
        is_paid = check_payment(payment.payment_id)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Ошибка проверки: {str(e)}'
        }, status=500)
    
    if not is_paid:
        return Response({
            'status': 'pending',
            'message': 'Ожидание оплаты...'
        })
    
    success, result = process_payment(payment)
    
    if success:
        return Response({
            'status': 'succeeded',
            'message': 'Оплата прошла успешно!',
            'tickets_count': result
        })
    else:
        return Response({
            'status': 'failed',
            'message': result
        }, status=500)


def process_payment(payment):

    try:
        sold_status = TicketStatus.objects.get(name='продан')
    except TicketStatus.DoesNotExist:
        refund_payment(payment.payment_id)
        payment.status = 'refunded'
        payment.save()
        return False, 'Статус билета не найден'
    
    # Получаем корзины из сохранённых данных
    baskets = Basket.objects.filter(
        basket_id__in=payment.baskets_data,
        user=payment.user,
        expires_at__gt=timezone.now()
    ).select_related('session', 'seat', 'seat__sector')
    
    if not baskets.exists():
        refund_payment(payment.payment_id)
        payment.status = 'expired'
        payment.save()
        return False, 'Корзина пуста или истекла'
    
    # Создаём словарь цен для быстрого доступа
    # prices_map = {item['basket_id']: item['price'] for item in payment.items_prices}
    
    try:
        with transaction.atomic():
            created_tickets = []
            
            for basket in baskets:
                # Проверяем, не продано ли место
                if Ticket.objects.filter(
                    session=basket.session,
                    seat=basket.seat
                ).exclude(status__name='возврат').exists():
                    raise Exception(f"Место {basket.seat.seat_number} уже продано")
                
                # Берём цену из сохранённых данных
                price = basket.price_at_time
                if not price:
                    price = float(basket.price_at_time) if basket.price_at_time else float(basket.session.play.price)
                
                ticket = Ticket.objects.create(
                    user=payment.user,
                    session=basket.session,
                    seat=basket.seat,
                    status=sold_status,
                    price_paid=price,
                    purchase_date=timezone.now()
                )
                created_tickets.append(ticket)
                basket.delete()
            
            payment.status = 'succeeded'
            payment.save()
            
            print(f"Создано {len(created_tickets)} билетов для пользователя {payment.user.username}")
            return True, len(created_tickets)
            
    except Exception as e:
        logger.error(f"Ошибка создания билетов: {e}")
        refund_payment(payment.payment_id)
        payment.status = 'refunded'
        payment.error_message = str(e)
        payment.save()
        return False, str(e)