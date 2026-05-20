from yookassa import Configuration, Payment
import uuid
from django.conf import settings
from .models import TicketStatus

Configuration.account_id = settings.YOOKASSA_SHOP_ID 
Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

def create_payment(amount, description, return_url):
    idempotence_key = str(uuid.uuid4())
    
    payment = Payment.create({
        "amount": {
            "value": str(amount),
            "currency": "RUB"
        },
        "payment_method_data": {
            "type": "bank_card"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url
        },
        "description": description,
        "capture": True
    }, idempotence_key)
    
    print(f"YooKassa payment created:")
    print(f"  ID: {payment.id}")
    print(f"  Return URL: {return_url}")
    print(f"  Confirmation URL: {payment.confirmation.confirmation_url}")
    
    return payment.confirmation.confirmation_url, payment.id

def check_payment(payment_id):
    try:
        payment = Payment.find_one(payment_id)
        print(f"payment_id: {payment_id}")
        print(f"status: {payment.status}")
        return payment.status == "succeeded"
    except Exception as e:
        print(f"Ошибка при проверке платежа: {e}")
        return False

def refund_payment(payment_id):
    try:
        payment = Payment.find_one(payment_id)
        if payment.status == "succeeded":
            refund = payment.refund({
                "amount": {
                    "value": payment.amount.value,
                    "currency": payment.amount.currency
                }
            })
            return refund.status == "succeeded"
    except Exception as e:
        print(f"Ошибка при возврате: {e}")
    return False


def refund_ticket(ticket):
   # Возврат денег за ОДИН билет
    if not ticket.payment:
        return False, "Билет не связан с платежом"
    
    try:
        refund = Payment.refund({
            "amount": {
                "value": str(ticket.price_paid),
                "currency": "RUB"
            },
            "payment_id": ticket.payment.payment_id
        })
        
        if refund.status == "succeeded":
            returned_status = TicketStatus.objects.get(name='возврат')
            ticket.status = returned_status
            ticket.save()
            return True, f"Возвращено {ticket.price_paid} руб."
        return False, "Ошибка возврата"
    except Exception as e:
        return False, str(e)