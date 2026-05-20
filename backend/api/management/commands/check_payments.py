import time
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Payment
from api.payment import check_payment, refund_payment
from api.views_payment import process_payment


class Command(BaseCommand):
    help = 'Проверяет статус pending платежей'

    def handle(self, *args, **kwargs):
        self.stdout.write("Сервис проверки платежей")
        
        while True:
            try:
                self.check_pending_payments()
            except Exception as e:
                self.stdout.write(f"Ошибка: {e}")
            time.sleep(30) 
    
    def check_pending_payments(self):
        # платежи старше 30 секунд, чтобы не конфликтовать с фронтом
        cutoff = timezone.now() - timedelta(seconds=30)
        pending_payments = Payment.objects.filter(
            status='pending',
            created_at__lte=cutoff
        )
        
        for payment in pending_payments:
            self.stdout.write(f"Проверка платёжа {payment.payment_id}")
            
            # получение статуса из ЮKassa
            is_paid = check_payment(payment.payment_id)

            if is_paid:
                success, result = process_payment(payment)
                if success:
                    self.stdout.write(f"Платёж {payment.payment_id} обработан, создано {result} билетов")
                else:
                    self.stdout.write(f"Ошибка обработки {payment.payment_id}: {result}")
                continue


            age = timezone.now() - payment.created_at
            if age > timedelta(minutes=15):
                self.stdout.write(f"Платёж {payment.payment_id} завис на {age}. Отменяем")
                payment.status = 'expired'
                payment.error_message = 'Истек срок ожидания оплаты'
                payment.save()
                refund_payment(payment.payment_id)
            else:
                self.stdout.write(f"Платёж {payment.payment_id} ещё не оплачен (висит {age})")