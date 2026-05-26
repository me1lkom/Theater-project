# load_training_data.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'theater_backend.settings')
django.setup()

import random
from datetime import datetime, timedelta, date
from api.price_service import PriceCalculator
from api.models import Play, TheaterHall, Session, Ticket, TicketStatus, Seat


def generate_data():
    hall = TheaterHall.objects.first()
    plays = list(Play.objects.all())
    all_seats = list(Seat.objects.filter(hall=hall))
    total_seats = 300
    status_sold, _ = TicketStatus.objects.get_or_create(name='продан')
    
    holidays = [
        date(2025, 1, 1), date(2025, 1, 2), date(2025, 1, 3),
        date(2025, 1, 4), date(2025, 1, 5), date(2025, 1, 6),
        date(2025, 1, 7), date(2025, 1, 8),
        date(2025, 2, 23), date(2025, 3, 8),
        date(2025, 5, 1), date(2025, 5, 9),
        date(2025, 6, 12), date(2025, 11, 4),
        date(2025, 12, 31)
    ]
    
    print("🎭 Генерация данных за 2025 год...")
    print("   Театр работает КАЖДЫЙ ДЕНЬ")
    Session.objects.all().delete()
    print("   Старые данные удалены")
    
    current_date = date(2025, 1, 1)
    count = 0
    play_index = 0
    
    while current_date <= date(2025, 12, 31):
        weekday = current_date.weekday()
        
        times = ['10:00', '14:00', '18:00']
        
        for time_str in times:
            time_obj = datetime.strptime(time_str, '%H:%M').time()
            hour = int(time_str.split(':')[0])
            
            play = plays[play_index % len(plays)]
            play_index += 1
            
            is_holiday = current_date in holidays
            
            # СНАЧАЛА создаем и сохраняем сеанс
            session = Session.objects.create(
                play=play,
                hall=hall,
                date=current_date,
                time=time_obj,
            )
            
            # Теперь считаем цену (у сеанса уже есть ID)
            calculated_price = PriceCalculator.calculate_session_price(session)
            calculated_price = float(calculated_price) 
            
            # В 50% случаев custom_price
            if random.random() < 0.5:
                multiplier = random.choice([
                    0.3, 0.4, 0.5,
                    0.6, 0.7, 0.8,
                    1.3, 1.5, 1.8,
                    2.0, 2.5, 3.0
                ])
                custom_price = round(calculated_price * multiplier, 2)
                session.custom_price = custom_price
                session.save(update_fields=['custom_price'])
            else:
                custom_price = None
            
            final_price = custom_price if custom_price else calculated_price
            
            # ===== РАСЧЕТ ПРОДАЖ =====
            
            # 1. Базовая заполняемость от дня недели
            if weekday >= 5:
                base_fill = random.uniform(0.65, 0.85)
            elif weekday == 4:
                base_fill = random.uniform(0.50, 0.70)
            else:
                base_fill = random.uniform(0.30, 0.55)
            
            # 2. Влияние времени
            if hour >= 18:
                base_fill *= 1.2
            elif hour >= 14:
                base_fill *= 1.0
            else:
                base_fill *= 0.7
            
            # 3. Влияние праздников
            if is_holiday:
                base_fill *= 1.4
            
            # 4. Влияние цены
            price_ratio = final_price / calculated_price if calculated_price > 0 else 1.0
            
            if price_ratio >= 3.0:
                base_fill *= 0.15
            elif price_ratio >= 2.0:
                base_fill *= 0.30
            elif price_ratio >= 1.5:
                base_fill *= 0.50
            elif price_ratio >= 1.2:
                base_fill *= 0.70
            elif price_ratio <= 0.4:
                base_fill *= 1.60
            elif price_ratio <= 0.6:
                base_fill *= 1.40
            elif price_ratio <= 0.7:
                base_fill *= 1.25
            elif price_ratio <= 0.85:
                base_fill *= 1.10
            
            # 5. Итог
            base_fill = max(0.02, min(1.0, base_fill))
            sold = int(total_seats * base_fill * random.uniform(0.98, 1.02))
            sold = max(5, min(total_seats, sold))
            
            # Создаем билеты
            seats = random.sample(all_seats, sold)
            Ticket.objects.bulk_create([
                Ticket(
                    user=None,
                    session=session,
                    seat=seat,
                    status=status_sold,
                    price_paid=round(final_price * random.choice([1.0, 1.12, 1.14, 1.16]), 2),
                    purchase_date=datetime.now()
                )
                for seat in seats
            ])
            
            count += 1
        
        current_date += timedelta(days=1)
        
        if current_date.day == 1:
            print(f"   {current_date.strftime('%B')}: {count} сеансов")
    
    # Статистика...
    print(f"\n✅ Готово! Всего {count} сеансов")
    # ... (остальная статистика без изменений)


if __name__ == '__main__':
    generate_data()