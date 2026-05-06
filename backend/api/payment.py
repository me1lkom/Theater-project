from yookassa import Configuration, Payment
import uuid

# Настройка API ключей
Configuration.account_id = "1350612"  # из личного кабинета
Configuration.secret_key = "test_9V4lq0V1TzLRNVPeNAgH4gAGniX2alLYjsloC34tzM0"  # из личного кабинета

def create_payment(amount, description, return_url):
    """Создает платеж и возвращает URL для оплаты"""
    
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
    """Проверяет статус платежа"""
    payment = Payment.find_one(payment_id)
    return payment.status == "succeeded"