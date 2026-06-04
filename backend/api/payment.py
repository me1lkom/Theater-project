from yookassa import Configuration, Payment, Refund
import uuid
from django.conf import settings
from api.models import TicketStatus, Basket

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
    
    return payment.confirmation.confirmation_url, payment.id


def check_payment(payment_id):
    try:
        payment = Payment.find_one(payment_id)
        return payment.status == "succeeded"
    except Exception as e:
        print(f"Ошибка при проверке платежа: {e}")
        return False


def refund_payment(payment_id):
    try:
        payment = Payment.find_one(payment_id)
        if payment.status == "succeeded":
            refund = Refund.create({
                "payment_id": payment_id,
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
    if not ticket.payment:
        return False, "Билет не связан с платежом"
    
    try:
        amount = str(ticket.price_paid)
        refund = Refund.create({
            "payment_id": ticket.payment.payment_id,
            "amount": {
                "value": amount,
                "currency": "RUB"
            }
        })
    
        
        if refund.status == "succeeded":
            returned_status = TicketStatus.objects.get(name='возврат')
            ticket.status = returned_status
            ticket.save()

            Basket.objects.filter(
                session=ticket.session,
                seat=ticket.seat
            ).delete()
            
            return True, f"Возвращено {ticket.price_paid} руб."
        else:
            return False, "Ошибка возврата"
            
    except Exception as e:
        return False, str(e)