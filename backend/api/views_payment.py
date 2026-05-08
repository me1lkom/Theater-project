from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Basket, Ticket, TicketStatus, Payment
from django.shortcuts import redirect
from django.utils import timezone
from django.db import transaction
from .payment import create_payment, check_payment, refund_payment
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_api(request):
    user = request.user
    
    basket_items = Basket.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    ).select_related('session__play', 'seat', 'seat__sector')
    
    if not basket_items.exists():
        return Response({'error': 'Корзина пуста'}, status=400)

    total_amount = sum(
        float(item.price_at_time) if item.price_at_time else float(item.session.play.price)
        for item in basket_items
    )
    
    basket_ids = list(basket_items.values_list('basket_id', flat=True))
    description = f"Билеты для {user.username}"
    
    payment = Payment.objects.create(
        user=user,
        amount=total_amount,
        status='pending',
        baskets_data=basket_ids
    )
    
    return_url = "http://127.0.0.1:8000/api/payment-success/"
    
    try:
        payment_url, yookassa_payment_id = create_payment(total_amount, description, return_url)
        payment.payment_id = yookassa_payment_id
        payment.save()
        
        print(f"Created payment: DB={payment.id}, YooKassa={yookassa_payment_id}")
        
        return Response({
            'payment_url': payment_url,
            'payment_id': yookassa_payment_id
        })
        
    except Exception as e:
        payment.delete()
        logger.error(f"Ошибка создания платежа: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_success(request):

    user = request.user
    payment = Payment.objects.filter(
        user=user,
        status='pending',
        created_at__gte=timezone.now() - timezone.timedelta(minutes=30)
    ).order_by('-created_at').first()
    
    if not payment:
        return Response({
            'success': False,
            'error': 'payment_not_found',
            'message': 'Платеж не найден'
        }, status=404)
    
    print(f"Processing payment: DB={payment.id}, YooKassa={payment.payment_id}")
    
    if not check_payment(payment.payment_id):
        payment.status = 'failed'
        payment.save()
        return Response({
            'success': False,
            'error': 'payment_failed',
            'message': 'Оплата не прошла'
        }, status=400)
    
    basket_ids = payment.baskets_data
    baskets = Basket.objects.filter(
        basket_id__in=basket_ids,
        user=payment.user,
        expires_at__gt=timezone.now()
    ).select_related('session', 'seat')
    
    if not baskets.exists():
        payment.status = 'expired'
        payment.save()
        refund_payment(payment.payment_id)
        return Response({
            'success': False,
            'error': 'basket_empty',
            'message': 'Корзина пуста или истекла'
        }, status=400)
    
    try:
        sold_status = TicketStatus.objects.get(name='продан')
    except TicketStatus.DoesNotExist:
        refund_payment(payment.payment_id)
        payment.status = 'refunded'
        payment.error_message = 'Статус билета не найден'
        payment.save()
        return Response({
            'success': False,
            'error': 'system_error',
            'message': 'Системная ошибка'
        }, status=500)
    
    try:
        with transaction.atomic():
            created_tickets = []
            
            for basket in baskets:
                existing_ticket = Ticket.objects.filter(
                    session=basket.session,
                    seat=basket.seat
                ).exclude(status__name='возврат').first()
                
                if existing_ticket:
                    raise Exception(
                        f"Место {basket.seat.seat_number} (ряд {basket.seat.row}) уже продано"
                    )
                
                ticket = Ticket.objects.create(
                    user=payment.user,
                    session=basket.session,
                    seat=basket.seat,
                    status=sold_status,
                    price_paid=basket.price_at_time if basket.price_at_time else basket.session.play.price,
                    purchase_date=timezone.now()
                )
                created_tickets.append(ticket)
                basket.delete()
            
            payment.status = 'succeeded'
            payment.save()
            
            print(f"Created {len(created_tickets)} tickets")
            
            return redirect('http://localhost:8001/profile')
            
    except Exception as e:
        logger.error(f"Error creating tickets: {e}")
        
        refund_payment(payment.payment_id)
        payment.status = 'refunded'
        payment.error_message = str(e)
        payment.save()
        
        return Response({
            'success': False,
            'error': 'ticket_creation_failed',
            'message': f'Ошибка создания билетов. Деньги возвращены. {str(e)}'
        }, status=500)