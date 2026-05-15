import time
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Payment
from api.payment import check_payment
from api.views_payment import process_payment

class Command(BaseCommand):
    help = 'Проверяет статус pending платежей'

    def handle(self, *args, **kwargs):
        while True:
            self.check_pending_payments()
            time.sleep(30)  # каждые 30 секунд
    
    def check_pending_payments(self):
        # платежи старше 15 секунд, чтобы не конфликтовать с фронтом(5 сек)
        cutoff = timezone.now() - timedelta(seconds=15)
        pending_payments = Payment.objects.filter(
            status='pending',
            created_at__lte=cutoff
        )
        
        for payment in pending_payments:
            is_paid = check_payment(payment.payment_id)
            if is_paid:
                process_payment(payment)
                print(f"Бэкенд: обработан платёж {payment.payment_id}")