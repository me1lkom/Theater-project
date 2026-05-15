# api/views_payment.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Basket, Payment, Session, Seat, Ticket, TicketStatus
from .payment import create_payment, check_payment, refund_payment
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
    tickets_data = []
    items_prices = []
    
    for item in basket_items:
        price = float(item.price_at_time) if item.price_at_time else float(item.session.play.price)
        total_amount += price
    
        tickets_data.append({
        'session_id': item.session.session_id,
        'price': price,
        'seat_id': item.seat.seat_id,
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
            tickets_data=tickets_data 
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
    
    created_tickets = []
    
    try:
        with transaction.atomic():
            for ticket_data in payment.tickets_data:
 
                session = Session.objects.get(pk=ticket_data['session_id'])
                seat = Seat.objects.get(pk=ticket_data['seat_id'])
                
                # Проверяем, не продано ли место
                if Ticket.objects.filter(
                    session=session,
                    seat=seat
                ).exclude(status__name='возврат').exists():
                    raise Exception(f"Место {ticket_data['seat_number']} уже продано")
                
                ticket = Ticket.objects.create(
                    user=payment.user,
                    session=session,
                    seat=seat,
                    status=sold_status,
                    price_paid=ticket_data['price'],
                    purchase_date=timezone.now(),
                    payment=payment
                )
                created_tickets.append(ticket)
        
        payment.status = 'succeeded'
        payment.save()
        
        return True, len(created_tickets)
        
    except Exception as e:
        refund_payment(payment.payment_id)
        payment.status = 'refunded'
        payment.error_message = str(e)
        payment.save()
        return False, str(e)