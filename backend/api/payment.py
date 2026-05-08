from yookassa import Configuration, Payment
import uuid

# Настройка API ключей для ТЕСТОВОГО режима
Configuration.account_id = "1350612"        # из личного кабинета
Configuration.secret_key = "test_9V4lq0V1TzLRNVPeNAgH4gAGniX2alLYjsloC34tzM0"    # из личного кабинета

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
            "return_url": return_url  # Просто используем переданный URL
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