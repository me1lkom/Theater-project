#!/usr/bin/env python
import os
import sys
import pandas as pd
from datetime import datetime

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'theater_backend.settings')
import django
django.setup()

from api.models import (
    Play, Session, Seat, Ticket, TicketStatus, TheaterHall
)
from django.utils import timezone
from django.contrib.auth.models import User


def load_training_data(csv_file):
    print(f"Загрузка данных из {csv_file}...")

    df = pd.read_csv(csv_file)

    hall = TheaterHall.objects.first()
    if not hall:
        print("Создаем зал 'Основной зал'...")
        hall = TheaterHall.objects.create(
            name='Основной зал',
            description='Главная сцена театра'
        )
    print(f"✓ Зал: {hall.name}")

    sold_status, created = TicketStatus.objects.get_or_create(
        name='продан'
    )
    print(f" Статус: {sold_status.name}")
    
    # получение или создание системного пользователя
    system_user, _ = User.objects.get_or_create(
        username='system',
        defaults={
            'password': 'unused',
            'email': 'system@theater.local'
        }
    ) 
    
    # проверка на количество мест
    max_tickets = df['tickets_sold'].max()
    total_seats = Seat.objects.filter(hall=hall).count()
    
    print(f"Максимальное количество билетов на сеанс: {max_tickets}")
    print(f"Всего мест в зале: {total_seats}")
    
    if total_seats < max_tickets:
        print(f"\n ОШИБКА: Не хватает мест для загрузки данных!")
        print(f"   Нужно: {max_tickets} мест")
        print(f"   Есть: {total_seats} мест")
        print(f"   Не хватает: {max_tickets - total_seats} мест")
        print("\nСначала создайте достаточно мест через админку:")
        print("   http://localhost:8000/admin/api/seat/add/")
        sys.exit(1)
    
    print(f"Мест достаточно")
    
    # загрузка данных
    created_sessions = 0
    created_tickets = 0
    skipped_tickets = 0
    
    for idx, row in df.iterrows():
        print(f"\nОбработка {idx + 1}/{len(df)}: {row['play_title']} на {row['date']}")
        
        # создание или получение спектакля
        play, created = Play.objects.get_or_create(
            title=row['play_title'],
            defaults={
                'duration': row['duration'],
                'description': f'Спектакль {row["play_title"]}',
                'price': row['price']
            }
        )
        
        if not created:
            play.price = row['price']
            play.duration = row['duration']
            play.save()

        session_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
        session_time = datetime.strptime(row['time'], '%H:%M:%S').time()
        
        session, created = Session.objects.get_or_create(
            play=play,
            hall=hall,
            date=session_date,
            time=session_time
        )
        
        if created:
            created_sessions += 1

        tickets_sold = int(row['tickets_sold'])

        existing_tickets_count = Ticket.objects.filter(session=session).count()
        
        if existing_tickets_count < tickets_sold:
            need_to_create = tickets_sold - existing_tickets_count

            taken_seats = Ticket.objects.filter(
                session=session
            ).values_list('seat_id', flat=True)

            free_seats = Seat.objects.filter(
                hall=hall
            ).exclude(
                seat_id__in=taken_seats
            )[:need_to_create]
            
            if free_seats.count() < need_to_create:
                print(f"  Внимание: не хватает свободных мест для {need_to_create} билетов")
                print(f"  Создано только {free_seats.count()} билетов")
                skipped_tickets += need_to_create - free_seats.count()
            
            for seat in free_seats:
                Ticket.objects.create(
                    user=system_user,
                    session=session,
                    seat=seat,
                    status=sold_status,
                    price_paid=row['price'],
                    purchase_date=timezone.now()
                )
                created_tickets += 1
        
        print(f"  ✓ {play.title}: {tickets_sold} билетов (создано {existing_tickets_count} новых)")
    

    print(" ЗАГРУЗКА ЗАВЕРШЕНА!")
    print(f"   Всего сеансов: {Session.objects.count()}")
    print(f"   Всего билетов: {Ticket.objects.count()}")
    print(f"   Создано сеансов: {created_sessions}")
    print(f"   Создано билетов: {created_tickets}")
    if skipped_tickets > 0:
        print(f"  Пропущено билетов (не хватило мест): {skipped_tickets}")


if __name__ == '__main__':
    # проверка что файл существует
    csv_file = 'training_data.csv'
    if not os.path.exists(csv_file):
        print(f"Ошибка: файл {csv_file} не найден!")
        print("Создайте файл training_data.csv в корне проекта")
        sys.exit(1)
    
    try:
        import pandas
    except ImportError:
        print("Устанавливаем pandas...")
        os.system('pip install pandas')
        import pandas
    
    load_training_data(csv_file)