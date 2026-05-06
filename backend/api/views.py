from rest_framework import generics
from .models import Play, Session, Seat, Panorama, Ticket, Basket, TicketStatus, ActionLog, Profile, TheaterHall, Sector, PanoramaLink, Genre, AIPrediction, Actor
from .serializers import PlaySerializer, SessionSerializer, SeatSerializer, PanoramaSerializer, RegisterSerializer, SectorSerializer, BulkSeatSerializer, ActionLogSerializer, PanoramaLinkSerializer, TicketStatusSerializer, GenreSerializer, BulkBuySerializer, BulkBasketSerializer, SessionWithActorsSerializer, ActorSerializer, SessionActor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from .ml_model import predictor
from django.db.models import Sum, Count
from .redis_blacklist import RedisTokenBlacklist
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, date
import os
import subprocess
import shutil
from django.http import StreamingHttpResponse
from .price_service import PriceCalculator
from django.db import transaction


class PlayListView(generics.ListAPIView):

    # возвращает список всех спектаклей
    # URL: /api/plays/
    # метод: GET

    queryset = Play.objects.all()  # все спектакли из БД (SELECT * FROM plays)
    serializer_class = PlaySerializer

  # превразение в JSON через сериализатор

class PlayDetailView(generics.RetrieveAPIView):

    # возвращает детальную информацию об одном спектакле
    # URL: /api/plays/1/
    # метод: GET

    queryset = Play.objects.all()
    serializer_class = PlaySerializer

class SessionListView(generics.ListAPIView):

    # возвращает список всех будующих сеансов
    # URL: /api/sessions/
    # метод: GET

    def get_queryset(self): # Показываем только будущие сеансы
        return Session.objects.filter(
            date__gte=timezone.now().date()
        ).order_by('date', 'time')
    
    serializer_class = SessionSerializer

class SessionDetailView(generics.RetrieveAPIView):

    # возвращает информацию об одном сеансе
    # URL: /api/sessions/1/
    # метод: GET

    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class SeatListView(generics.ListAPIView):

    # возвращает все места в зале
    # URL: /api/seats/
    # метод: GET

    queryset = Seat.objects.all()
    serializer_class = SeatSerializer

class PanoramaView(generics.RetrieveAPIView):
 
    # возвращает панораму для конкретного места
    # URL: /api/panorama/?seat_id=1
    # метод: GET

    serializer_class = PanoramaSerializer
    
    def get_queryset(self):

        # этот метод выполняется при запросе
        # self.request - данные запроса от пользователя

        queryset = Panorama.objects.all()
        seat_id = self.request.query_params.get('seat_id')  # получение данных (seat_id) из URL
        
        if seat_id is not None:
            queryset = queryset.filter(seat_id=seat_id) # фильтрация панорамы по месту
        
        return queryset

class TicketStatusListView(generics.ListAPIView):

    # Возвращает список всех статусов билетов
    # GET /api/ticket-statuses/

    queryset = TicketStatus.objects.all()
    serializer_class = TicketStatusSerializer


class GenreView(generics.ListAPIView):

    # Возвращает список всех жанров
    # GET /api/genres/

    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def buy_ticket(request):
#     data = request.data
    
#     session_id = data.get('session_id')
#     seat_id = data.get('seat_id')
#     user_id = data.get('user_id')
    
#     if not user_id:
#         user_id = request.user.id
#     else:
#         if user_id != request.user.id:
#             if not is_cashier(request.user):
#                 return Response(
#                     {'error': 'Только кассир может покупать билеты для других'},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#     # проверка что все нужные данные прислали
#     if not all([session_id, seat_id, user_id]):
#         return Response(
#             {'error': 'Не указаны все необходимые данные'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # проверка существует ли такой сеанс
#     try:
#         session = Session.objects.get(pk=session_id)
#     except Session.DoesNotExist:
#         return Response(
#             {'error': 'Сеанс не найден'},
#             status=status.HTTP_404_NOT_FOUND
#         )
    
#     session_datetime = timezone.datetime.combine(session.date, session.time)
#     session_datetime = timezone.make_aware(session_datetime)
    
#     if session_datetime < timezone.now():
#         return Response(
#             {'error': 'Нельзя забронировать место на прошедший сеанс'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     if session_datetime - timedelta(minutes=5) < timezone.now():
#         return Response(
#             {'error': 'Продажа билетов на этот сеанс закрыта за 5 минут до начала'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # проверка существует ли такое место
#     try:
#         seat = Seat.objects.get(pk=seat_id)
#     except Seat.DoesNotExist:
#         return Response(
#             {'error': 'Место не найдено'},
#             status=status.HTTP_404_NOT_FOUND
#         )
    
#     existing_basket = Basket.objects.filter(
#         session=session,
#         seat=seat,
#         expires_at__gt=timezone.now()
#     ).first()
    
#     if existing_basket:
#         if existing_basket.user_id == user_id:
#             # Своя бронь — удаляем и продолжаем покупку
#             existing_basket.delete()
#         else:
#             # Чужая бронь — ошибка
#             return Response(
#                 {'error': 'Это место уже забронировано другим пользователем'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

    
#     active_ticket = Ticket.objects.filter(
#         session=session, 
#         seat=seat
#     ).exclude(
#         status__name='возврат'
#     ).first()
    
#     if active_ticket:
#         return Response(
#             {'error': 'Это место уже занято'},
#             status=400
#         )
    
#     # Удаляем старый возвращенный билет (если есть)
#     Ticket.objects.filter(
#         session=session,
#         seat=seat,
#         status__name='возврат'
#     ).delete()
    
#     # Создаем новый билет
#     try:
#         sold_status = TicketStatus.objects.get(name='продан')
#     except TicketStatus.DoesNotExist:
#         return Response(
#             {'error': 'Статус "продан" не найден'},
#             status=500
#         )
    
#     ticket = Ticket.objects.create(
#         session=session,
#         seat=seat,
#         user_id=user_id,
#         status=sold_status,
#         price_paid=session.play.price,
#         purchase_date=timezone.now()
#     )
    
#     return Response({
#         'success': True,
#         'ticket_id': ticket.ticket_id,
#         'message': 'Билет успешно куплен'
#     }, status=201)


@api_view(['GET'])
def session_with_actors(request, session_id):
    session = Session.objects.get(pk=session_id)

    # Возавращает акторов с ролями по сеансам
    # GET api/actors-roles/1/

    serializer = SessionWithActorsSerializer(session)
    return Response(serializer.data)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_actors(request, actor_id=None):
    
    # GET    /api/actors/manage/           - список всех актеров
    # GET    /api/actors/manage/{id}/      - детали актера
    # POST   /api/actors/manage/           - создать актера
    # PUT    /api/actors/manage/{id}/      - обновить актера
    # DELETE /api/actors/manage/{id}/      - удалить актера

    if request.method in ['POST', 'PUT', 'DELETE']:
        if not is_admin_or_manager(request.user):
            return Response(
                {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
                status=status.HTTP_403_FORBIDDEN
            )

    if request.method == 'GET':
        if actor_id:
            try:
                actor = Actor.objects.get(pk=actor_id)
                serializer = ActorSerializer(actor)
                return Response(serializer.data)
            except Actor.DoesNotExist:
                return Response(
                    {'error': 'Актер не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            actors = Actor.objects.all().order_by('actor_id')
            serializer = ActorSerializer(actors, many=True)
            return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = ActorSerializer(data=request.data)
        if serializer.is_valid():
            actor = serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_ACTOR',
                description=f'Создан актер: {actor.actor_fio}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method in ['PUT', 'PATCH']:
        try:
            actor = Actor.objects.get(pk=actor_id)
        except Actor.DoesNotExist:
            return Response(
                {'error': 'Актер не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ActorSerializer(actor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_ACTOR',
                description=f'Обновлен актер: {actor.actor_fio}'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        try:
            actor = Actor.objects.get(pk=actor_id)
        except Actor.DoesNotExist:
            return Response(
                {'error': 'Актер не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if SessionActor.objects.filter(actor=actor).exists():
            return Response(
                {'error': f'Нельзя удалить актера {actor.actor_fio}, так как он участвует в сеансах'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        actor_name = actor.actor_fio
        actor.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_ACTOR',
            description=f'Удален актер: {actor_name}'
        )
        
        return Response({'success': True})


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_genres(request, genre_id=None):

    
    # GET           /api/genres/manage/           - список всех жанров
    # GET           /api/genres/manage/{id}/      - детали жанра
    # POST          /api/genres/manage/           - создать жанр
    # PUT/PATCH     /api/genres/manage/{id}/      - обновить жанр
    # DELETE        /api/genres/manage/{id}/      - удалить жанр

    if request.method in ['POST', 'PUT', 'DELETE']:
        if not is_admin_or_manager(request.user):
            return Response(
                {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    if request.method == 'GET':
        if genre_id:
            try:
                genre = Genre.objects.get(pk=genre_id)
                serializer = GenreSerializer(genre)
                return Response(serializer.data)
            except Genre.DoesNotExist:
                return Response(
                    {'error': 'Жанр не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            genres = Genre.objects.all().order_by('name')
            serializer = GenreSerializer(genres, many=True)
            return Response(serializer.data)

    if request.method == 'POST':
        serializer = GenreSerializer(data=request.data)
        if serializer.is_valid():
            genre = serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_GENRE',
                description=f'Создан жанр: {genre.name}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method in ['PUT', 'PATCH']:
        try:
            genre = Genre.objects.get(pk=genre_id)
        except Genre.DoesNotExist:
            return Response(
                {'error': 'Жанр не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = GenreSerializer(genre, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_GENRE',
                description=f'Обновлен жанр: {genre.name}'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        try:
            genre = Genre.objects.get(pk=genre_id)
        except Genre.DoesNotExist:
            return Response(
                {'error': 'Жанр не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        if genre.plays.exists():
            return Response(
                {'error': f'Нельзя удалить жанр "{genre.name}", так как он используется в спектаклях'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        genre_name = genre.name
        genre.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_GENRE',
            description=f'Удален жанр: {genre_name}'
        )
        
        return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_tickets_bulk(request):

    # Покупка нескольких билетов одной операцией
    # Обычный пользователь: покупает только для себя
    # Кассир: может купить для любого пользователя (указав user_id или phone)
    # POST /api/tickets/buy/bulk/

    current_user = request.user
    
    serializer = BulkBuySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    session_id = serializer.validated_data['session_id']
    seat_ids = serializer.validated_data['seat_ids']
    target_user_id = serializer.validated_data.get('user_id')
    phone = serializer.validated_data.get('phone')  # ← добавляем телефон
    
    buyer_user_id = None
    buyer_info = None

    if phone:
        if not is_admin_or_cashier(current_user):
            return Response(
                {'error': 'Только кассир или администратор могут покупать билеты по телефону'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = Profile.objects.get(phone=phone)
            buyer_user_id = profile.user.id
            buyer_info = f"для пользователя {profile.user.username} (телефон: {phone})"
        except Profile.DoesNotExist:
            return Response(
                {'error': f'Пользователь с телефоном {phone} не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

    elif target_user_id:
        if not is_admin_or_cashier(current_user):
            return Response(
                {'error': 'Только кассир или администратор могут покупать билеты для других пользователей'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            target_user = User.objects.get(pk=target_user_id)
            buyer_user_id = target_user_id
            buyer_info = f"для пользователя {target_user.username} (ID: {target_user_id})"
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

    else:
        buyer_user_id = current_user.id
        buyer_info = "для себя"

    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response(
            {'error': 'Сеанс не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    seats = Seat.objects.filter(pk__in=seat_ids)
    if seats.count() != len(seat_ids):
        return Response(
            {'error': 'Одно или несколько мест не найдены'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    busy_seats = []
    available_seats = []
    
    for seat in seats:
        # Проверяем билеты
        existing_ticket = Ticket.objects.filter(
            session=session,
            seat=seat
        ).exclude(status__name='возврат').first()
        
        if existing_ticket:
            busy_seats.append({
                'seat_id': seat.seat_id,
                'row': seat.row_number,
                'seat_number': seat.seat_number
            })
        else:
            available_seats.append(seat)
    
    if busy_seats:
        return Response({
            'error': 'Некоторые места уже заняты',
            'busy_seats': busy_seats
        }, status=status.HTTP_400_BAD_REQUEST)

    busy_baskets = []
    for seat in available_seats[:]:
        existing_basket = Basket.objects.filter(
            session=session,
            seat=seat,
            expires_at__gt=timezone.now()
        ).first()
        
        if existing_basket:
            if existing_basket.user_id != buyer_user_id:
                busy_baskets.append({
                    'seat_id': seat.seat_id,
                    'row': seat.row_number,
                    'seat_number': seat.seat_number
                })
                available_seats.remove(seat)
    
    if busy_baskets:
        return Response({
            'error': 'Некоторые места забронированы другими пользователями',
            'busy_seats': busy_baskets
        }, status=status.HTTP_400_BAD_REQUEST)

    Basket.objects.filter(
        session=session,
        seat__in=available_seats,
        user_id=buyer_user_id
    ).delete()
    
    try:
        sold_status = TicketStatus.objects.get(name='продан')
    except TicketStatus.DoesNotExist:
        return Response(
            {'error': 'Статус "продан" не найден в системе'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    ticket_price = PriceCalculator.calculate_ticket_price(session, seat)
    tickets = []
    for seat in available_seats:
        ticket = Ticket.objects.create(
            session=session,
            seat=seat,
            user_id=buyer_user_id,
            status=sold_status,
            price_paid=ticket_price,
            purchase_date=timezone.now()
        )
        tickets.append(ticket)
    
    ActionLog.objects.create(
        user_id=current_user.id,
        action_type='BUY_TICKETS_BULK',
        description=f'Куплено {len(tickets)} билетов {buyer_info} на спектакль {session.play.title}'
    )
    
    return Response({
        'success': True,
        'message': f'Успешно куплено {len(tickets)} билетов {buyer_info}',
        'tickets': [
            {
                'ticket_id': t.ticket_id,
                'seat_id': t.seat.seat_id,
                'row': t.seat.row_number,
                'seat_number': t.seat.seat_number,
                'price': str(t.price_paid)
            }
            for t in tickets
        ]
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tickets(request):

    # возвращает список билетов текущего пользователя
    # GET /api/tickets/my/

    user = request.user
    
    # получаем все билеты пользователя, исключая возвращенные
    tickets = Ticket.objects.filter(
        user=user
    ).exclude(
        status__name='возврат'
    ).select_related(
        'session', 
        'session__play', 
        'seat', 
        'seat__sector',
        'status'
    ).order_by('-purchase_date')
    
    result = []
    for ticket in tickets:
        result.append({
            'ticket_id': ticket.ticket_id,
            'play_title': ticket.session.play.title,
            'play_duration': ticket.session.play.duration,
            'date': ticket.session.date,
            'time': ticket.session.time,
            'hall': ticket.session.hall.name,
            'sector': ticket.seat.sector.name if ticket.seat.sector else None,
            'row': ticket.seat.row_number,
            'seat': ticket.seat.seat_number,
            'price': str(ticket.price_paid),
            'status': ticket.status.name,
            'purchase_date': ticket.purchase_date,
            'session_id': ticket.session.session_id
        })
    
    return Response(result)

@api_view(['GET'])
def available_seats(request, pk):

    # Возвращает список свободных мест с ценами
    # GET /api/sessions/{pk}/available-seats/

    try:
        session = Session.objects.get(pk=pk)
    except Session.DoesNotExist:
        return Response(
            {'error': 'Сеанс не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    session_datetime = timezone.datetime.combine(session.date, session.time)
    session_datetime = timezone.make_aware(session_datetime)
    
    if session_datetime - timedelta(minutes=5) < timezone.now():
        return Response(
            {'error': 'Продажа билетов на этот сеанс закрыта за 5 минут до начала'},
            status=status.HTTP_400_BAD_REQUEST
        )

    all_seats = Seat.objects.filter(hall=session.hall)
    
    # занятые из билетов
    busy_from_tickets = Ticket.objects.filter(session=session).exclude(status__name='возврат').values_list('seat_id', flat=True)
    
    # занятые из активных броней
    busy_from_basket = Basket.objects.filter(session=session,expires_at__gt=timezone.now()).values_list('seat_id', flat=True)
    
    # объединяем
    busy_seat_ids = set(busy_from_tickets) | set(busy_from_basket)
    
    available_seats = all_seats.exclude(seat_id__in=busy_seat_ids)
    available_seats_data = []
    for seat in available_seats:
        price = PriceCalculator.calculate_ticket_price(session, seat)
        available_seats_data.append({
            'seat_id': seat.seat_id,
            'row_number': seat.row_number,
            'seat_number': seat.seat_number,
            'sector': seat.sector.name,
            'price': float(price),
        })

    return Response({
        'session_id': session.session_id,
        'play_title': session.play.title,
        'date': session.date,
        'time': session.time,
        'available_count': len(available_seats_data),
        'seats': available_seats_data,
    })

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_to_basket(request):
#     data = request.data

#     session_id = data.get('session_id')
#     seat_id = data.get('seat_id')
#     user_id = request.user.id

#     if not all([session_id, seat_id, user_id]):
#         return Response(
#             {'error': 'Не указаны все необходимые данные'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     try:
#         session = Session.objects.get(pk=session_id)
#     except Session.DoesNotExist:
#         return Response(
#             {'error': 'Сеанс не найден'},
#             status=status.HTTP_404_NOT_FOUND
#         )

#     try:
#         seat = Seat.objects.get(pk=seat_id)
#     except Seat.DoesNotExist:
#         return Response(
#             {'error': 'Место не найдено'},
#             status=status.HTTP_404_NOT_FOUND
#         )

#     session_datetime = timezone.datetime.combine(session.date, session.time)
#     session_datetime = timezone.make_aware(session_datetime)
    
#     if session_datetime < timezone.now():
#         return Response(
#             {'error': 'Нельзя забронировать место на прошедший сеанс'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     if session_datetime - timedelta(minutes=5) < timezone.now():
#         return Response(
#             {'error': 'Продажа билетов на этот сеанс закрыта за 5 минут до начала'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     existing_ticket = Ticket.objects.filter(
#         session=session, 
#         seat=seat
#     ).exclude(
#         status__name='возврат'
#     ).first()
    
#     if existing_ticket:
#         return Response(
#             {'error': 'Это место уже занято'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     Basket.objects.filter(
#         session_id=session_id,
#         seat_id=seat_id,
#         expires_at__lt=timezone.now()
#     ).delete()
    
#     existing_basket = Basket.objects.filter(
#         session_id=session_id,
#         seat_id=seat_id,
#         expires_at__gt=timezone.now()
#     ).first()

#     if existing_basket:
#         if existing_basket.user_id == user_id:
#             return Response(
#                 {'error': 'Это место уже в вашей корзине'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         else:
#             return Response(
#                 {'error': 'Это место уже забронировано другим пользователем'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#     expires_at = timezone.now() + timedelta(minutes=15)

#     basket = Basket.objects.create(
#         user_id=user_id,
#         session=session,
#         seat=seat,
#         expires_at=expires_at
#     )

#     return Response({
#         'success': True,
#         'basket_id': basket.basket_id,
#         'expires_at': basket.expires_at,
#         'message': f"Место забронировано до {basket.expires_at}"
#     }, status=status.HTTP_201_CREATED)

def get_active_baskets(user):
    # Сначала удаляем просроченные
    Basket.objects.filter(
        user=user,
        expires_at__lt=timezone.now()
    ).delete()
    
    return Basket.objects.filter(user=user, expires_at__gt=timezone.now())

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_basket_bulk(request):

    # Добавление нескольких мест в корзину одной операцией
    # POST /api/basket/add/bulk/

    user_id = request.user.id
    get_active_baskets(request.user) 

    serializer = BulkBasketSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    session_id = serializer.validated_data['session_id']
    seat_ids = serializer.validated_data['seat_ids']

    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response(
            {'error': 'Сеанс не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    seats = Seat.objects.filter(pk__in=seat_ids)
    if seats.count() != len(seat_ids):
        return Response(
            {'error': 'Одно или несколько мест не найдены'},
            status=status.HTTP_404_NOT_FOUND
        )

    sold_seats = []
    available_seats = []
    
    for seat in seats:
        existing_ticket = Ticket.objects.filter(
            session=session,
            seat=seat
        ).exclude(status__name='возврат').first()
        
        if existing_ticket:
            sold_seats.append({
                'seat_id': seat.seat_id,
                'row': seat.row_number,
                'seat_number': seat.seat_number
            })
        else:
            available_seats.append(seat)
    
    if sold_seats:
        return Response({
            'error': 'Некоторые места уже проданы',
            'sold_seats': sold_seats
        }, status=status.HTTP_400_BAD_REQUEST)

    busy_baskets = []
    free_seats = []
    
    for seat in available_seats:
        existing_basket = Basket.objects.filter(
            session=session,
            seat=seat,
            expires_at__gt=timezone.now()
        ).first()
        
        if existing_basket:
            if existing_basket.user_id != user_id:
                busy_baskets.append({
                    'seat_id': seat.seat_id,
                    'row': seat.row_number,
                    'seat_number': seat.seat_number
                })
            else:
                free_seats.append(seat)
        else:
            free_seats.append(seat)
    
    if busy_baskets:
        return Response({
            'error': 'Некоторые места уже забронированы другими пользователями',
            'busy_seats': busy_baskets
        }, status=status.HTTP_400_BAD_REQUEST)

    expires_at = timezone.now() + timedelta(minutes=15)
    baskets = []
    
    for seat in free_seats:
        basket = Basket.objects.create(
            user_id=user_id,
            session=session,
            seat=seat,
            expires_at=expires_at
        )
        baskets.append(basket)

    ActionLog.objects.create(
        user_id=user_id,
        action_type='ADD_TO_BASKET_BULK',
        description=f'Добавлено {len(baskets)} мест в корзину на спектакль {session.play.title}'
    )
    
    return Response({
        'success': True,
        'message': f'Добавлено {len(baskets)} мест в корзину',
        'expires_at': expires_at,
        'baskets': [
            {
                'basket_id': b.basket_id,
                'seat_id': b.seat.seat_id,
                'row': b.seat.row_number,
                'seat_number': b.seat.seat_number
            }
            for b in baskets
        ]
    }, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def remove_from_basket(request, basket_id):

    try:
        basket = Basket.objects.get(pk=basket_id)
    except Basket.DoesNotExist:
        return Response(
            {'error': 'Бронь не найдена'},
            status=status.HTTP_404_NOT_FOUND
        )

    if basket.user_id != request.user.id:
        return Response(
            {'error': 'Это не ваша корзина'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    basket.delete()
    
    return Response({
        'success': True,
        'message': 'Бронь удалена'
    }, status=status.HTTP_200_OK)

# проверяет и удаляет просроченные брони
@api_view(['GET'])
def check_expired_baskets(request):

    expired_baskets = Basket.objects.filter(
        expires_at__lt=timezone.now() # __lt - less than
    )
    
    count = expired_baskets.count()

    expired_baskets.delete()

    return Response({
        'success': True,
        'removed_count': count,
        'message': f'Удалено {count} просроченных броней'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_basket(request):

    # Возвращает все активные брони текущего пользователя
    # GET /api/basket/my/

    user = request.user
    
    baskets = Basket.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    ).select_related('session', 'seat', 'session__play')
    
    result = []
    for basket in baskets:
        result.append({
            'basket_id': basket.basket_id,
            'session_id': basket.session.session_id,
            'play_title': basket.session.play.title,
            'date': basket.session.date,
            'time': basket.session.time,
            'hall': basket.session.hall.name,
            'row': basket.seat.row_number,
            'seat': basket.seat.seat_number,
            'price': str(basket.session.play.price),
            'expires_at': basket.expires_at,
            'expires_in_seconds': (basket.expires_at - timezone.now()).total_seconds()
        })
    
    return Response({
        'count': len(result),
        'baskets': result
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])

    # Возврат билета
    # POST api/tickets/return/<int:ticket_id>/'

def return_ticket(request, ticket_id):
    data = request.data
    user_id = request.user.id
    reason = data.get('reason','Причина не указана')

    if not user_id:
        return Response(
            {'error':'Не указан id пользователя'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        ticket = Ticket.objects.select_related('session', 'session__play').get(pk=ticket_id)
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Билет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    if ticket.status.name == 'возврат':
        return Response(
            {'error': 'Можно вернуть только проданный билет'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if ticket.status.name != 'продан':
        return Response(
            {'error':'Билет уже был возвращен ранее'},
            status=status.HTTP_400_BAD_REQUEST
        )

    session_datetime = timezone.datetime.combine(
        ticket.session.date,
        ticket.session.time
    )

    session_datetime = timezone.make_aware(session_datetime) # добавляет информацию о часовом поясе

    deadline = session_datetime - timedelta(days=3)

    if timezone.now() > deadline:
        return Response(
            {'error': 'Возврат возможен не позднее чем за 3 дня до спектакля'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if ticket.user_id != user_id:
        try:
            user = User.objects.get(pk=user_id)
            is_cashier = user.role_set.filter(name='кассир').exists()
        
            if not is_cashier:
                return Response(
                    {'error': 'Вы можете вернуть только свои билеты'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
    try:
        returned_status = TicketStatus.objects.get(name='возврат')
    except TicketStatus.DoesNotExist:
        return Response(
            {'error': 'Статус "возврат" не найден в системе'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    ticket.status = returned_status
    ticket.save()

    ActionLog.objects.create(
        user_id=user_id,
        action_type='RETURN_TICKET',
        description=f'Возврат билета {ticket_id} на спектакль {ticket.session.play.title}. Причина: {reason}'
    )

    return Response({
        'success': True,
        'ticket_id': ticket.ticket_id,
        'message': 'Билет успешно возвращен',
        'refund_amount': str(ticket.price_paid)
    }, status=status.HTTP_200_OK)

# перенести в redic
# redic развернуть в docker
# posgres в docker
# ифслутв d docker
# @api_view(['POST'])
# @permission_classes([AllowAny])  # разрешаем доступ без токена
# def register(request):
#     serializer = RegisterSerializer(data=request.data)

#     if serializer.is_valid():
#         user = serializer.save()

#         refresh = RefreshToken.for_user(user)

#         return Response({
#             'success': True,
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'first_name': user.first_name,
#                 'last_name': user.last_name
#             },
#             'access_token': str(refresh.access_token),
#             'refresh_token': str(refresh)
#         }, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# from .redis_blacklist import RedisTokenBlacklist

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout(request):

#     try:
#         refresh_token = request.data.get('refresh')
#         if not refresh_token:
#             return Response(
#                 {'error': 'Не указан refresh токен'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if RedisTokenBlacklist.add_refresh(refresh_token):
#             auth_header = request.headers.get('Authorization')
#             if auth_header:
#                 access_token = auth_header.split(' ')[1]
#                 RedisTokenBlacklist.add_access(access_token)
            
#             return Response({
#                 'success': True,
#                 'message': 'Выход выполнен успешно'
#             })
#         else:
#             return Response(
#                 {'error': 'Не удалось добавить токен в черный список'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
            
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def me(request):

#     # возвращает информацию о текущем пользователе
#     # GET /api/auth/me/

#     user = request.user
    
#     try:
#         profile = user.profile
#         role_name = profile.role.name if profile.role else None
#         phone = profile.phone
#     except Profile.DoesNotExist:
#         role_name = None
#         phone = ''
    
#     return Response({
#         'id': user.id,
#         'username': user.username,
#         'email': user.email,
#         'first_name': user.first_name,
#         'last_name': user.last_name,
#         'phone': phone,
#         'role': role_name
#     })

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    # Изменение профиля
    # PUT /api/auth/profile/
    # PATCH /api/auth/profile/
    # PUT - полное обновление, PATCH - частичное обновление
    user = request.user
    
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return Response(
            {'error': 'Профиль не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data:
        profile.phone = data['phone']
    
    user.save()
    profile.save()
    
    return Response({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': profile.phone,
            'role': profile.role.name if profile.role else None
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tickets(request):
    user = request.user
    
    tickets = Ticket.objects.filter(
        user=user
    ).select_related(
        'session', 'session__play', 'seat', 'status'
    ).order_by('-purchase_date')
    
    result = []
    for ticket in tickets:
        result.append({
            'ticket_id': ticket.ticket_id,
            'play_title': ticket.session.play.title,
            'date': ticket.session.date,
            'time': ticket.session.time,
            'row': ticket.seat.row_number,
            'seat': ticket.seat.seat_number,
            'price': str(ticket.price_paid),
            'status': ticket.status.name,
            'purchase_date': ticket.purchase_date
        })
    
    return Response(result)

# @api_view(['POST', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def manage_play(request, play_id=None):
#     if not is_admin_or_manager(request.user):
#         return Response(
#             {'error': 'Недостаточно прав'},
#             status=status.HTTP_403_FORBIDDEN
#         )
    
#     if request.method == 'POST':
#         data = request.data
        
#         play = Play.objects.create(
#             title=data['title'],
#             duration=data['duration'],
#             description=data.get('description', ''),
#             price=data['price'],
#             poster_url=data.get('poster_url', '')
#         )
        
#         return Response({
#             'success': True,
#             'play_id': play.play_id
#         }, status=status.HTTP_201_CREATED)
    
#     elif request.method in ['PUT', 'PATCH']:
#         try:
#             play = Play.objects.get(pk=play_id)
#         except Play.DoesNotExist:
#             return Response(
#                 {'error': 'Спектакль не найден'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         data = request.data
        
#         if 'title' in data:
#             play.title = data['title']
#         if 'duration' in data:
#             play.duration = data['duration']
#         if 'description' in data:
#             play.description = data['description']
#         if 'price' in data:
#             play.price = data['price']
#         if 'poster_url' in data:
#             play.poster_url = data['poster_url']
#         play.save()
        
#         return Response({'success': True})
    
#     elif request.method == 'DELETE':
#         try:
#             play = Play.objects.get(pk=play_id)
#         except Play.DoesNotExist:
#             return Response(
#                 {'error': 'Спектакль не найден'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         play.delete()
#         return Response({'success': True})

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_sessions(request, session_id=None):

    # Управление сеансами
    # GET    /api/sessions/manage/ - список всех сеансов
    # GET    /api/sessions/manage/{id}/ - детали сеанса
    # POST   /api/sessions/manage/ - создать сеанс
    # PUT    /api/sessions/manage/{id}/ - изменить сеанс
    # DELETE /api/sessions/manage/{id}/ - удалить сеанс

    if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
        if not is_admin_or_manager(request.user):
            return Response(
                {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
                status=status.HTTP_403_FORBIDDEN
            )

    if request.method == 'GET':
        if session_id:
            # Получение одного сеанса
            try:
                session = Session.objects.get(pk=session_id)
                serializer = SessionSerializer(session)
                return Response(serializer.data)
            except Session.DoesNotExist:
                return Response(
                    {'error': 'Сеанс не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            sessions = Session.objects.all().order_by('date', 'time')
            serializer = SessionSerializer(sessions, many=True)
            return Response(serializer.data)

    if request.method == 'POST':
        data = request.data

        play_id = data.get('play_id')
        date_str = data.get('date')
        time_str = data.get('time')
        actors_data = data.get('actors', [])

        if not all([play_id, date_str, time_str]):
            return Response(
                {'error': 'Не указаны все необходимые данные (play_id, date, time)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            play = Play.objects.get(pk=play_id)
        except Play.DoesNotExist:
            return Response(
                {'error': 'Спектакль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            session_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            session_time = datetime.strptime(time_str, '%H:%M:%S').time()
        except ValueError:
            return Response(
                {'error': 'Неверный формат даты или времени. Используйте YYYY-MM-DD и HH:MM:SS'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session_datetime = timezone.datetime.combine(session_date, session_time)
        session_datetime = timezone.make_aware(session_datetime)
        
        if session_datetime < timezone.now():
            return Response(
                {'error': 'Нельзя создать сеанс в прошлом'},
                status=status.HTTP_400_BAD_REQUEST
            )

        hall = TheaterHall.objects.first()
        if not hall:
            return Response(
                {'error': 'Зал не настроен. Сначала создайте зал в админке.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Session.objects.filter(hall=hall, date=session_date, time=session_time).exists():
            return Response(
                {'error': f'В зале "{hall.name}" уже есть сеанс на {session_date} {session_time}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            session = Session.objects.create(
                play=play,
                hall=hall,
                date=session_date,
                time=session_time
            )

            session.calculated_price = PriceCalculator.calculate_session_price(session)
            session.save()

            for actor_data in actors_data:
                actor_id = actor_data.get('actor_id')
                role = actor_data.get('role')
                if actor_id and role:
                    SessionActor.objects.create(
                        session=session,
                        actor_id=actor_id,
                        actor_role_name=role
                    )        

        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='CREATE_SESSION',
            description=f'Создан сеанс: {play.title} на {session.date} {session.time} (цена: {session.calculated_price})'
        )
        
        serializer = SessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    if request.method in ['PUT', 'PATCH']:
        try:
            session = Session.objects.get(pk=session_id)
        except Session.DoesNotExist:
            return Response(
                {'error': 'Сеанс не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data

        if session.tickets.exists():
            if 'date' in data or 'time' in data:
                return Response(
                    {'error': 'Нельзя изменить дату или время сеанса, на который уже есть билеты'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        need_recalculate = False 

        if 'date' in data:
            try:
                new_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                if new_date < timezone.now().date():
                    return Response(
                        {'error': 'Нельзя перенести сеанс в прошлое'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                session.date = new_date
                need_recalculate = True
            except ValueError:
                return Response(
                    {'error': 'Неверный формат даты. Используйте YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if 'time' in data:
            try:
                new_time = datetime.strptime(data['time'], '%H:%M:%S').time()
                session.time = new_time
                need_recalculate = True
            except ValueError:
                return Response(
                    {'error': 'Неверный формат времени. Используйте HH:MM:SS'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if 'play_id' in data:
            try:
                new_play = Play.objects.get(pk=data['play_id'])
                session.play = new_play
                need_recalculate = True
            except Play.DoesNotExist:
                return Response(
                    {'error': 'Спектакль не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

        if need_recalculate:
            session.calculated_price = PriceCalculator.calculate_session_price(session)
        
        session.save()

        if 'actors' in data:
            session.session_actors.all().delete()
            for actor_data in data['actors']:
                actor_id = actor_data.get('actor_id')
                role = actor_data.get('role')
                if actor_id and role:
                    SessionActor.objects.create(
                        session=session,
                        actor_id=actor_id,
                        actor_role_name=role
                    )

        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='UPDATE_SESSION',
            description=f'Изменен сеанс: {session.play.title} на {session.date} {session.time}'
        )
        
        serializer = SessionSerializer(session)
        return Response(serializer.data)

    if request.method == 'DELETE':
        try:
            session = Session.objects.get(pk=session_id)
        except Session.DoesNotExist:
            return Response(
                {'error': 'Сеанс не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.tickets.exists():
            return Response(
                {'error': 'Нельзя удалить сеанс с проданными билетами'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_SESSION',
            description=f'Удален сеанс (ID: {session_id})'
        )
        
        return Response({'success': True, 'message': 'Сеанс успешно удалён'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def past_sessions(request):

    # Возвращает ближайшие прошедшие сеансы
    # GET /api/sessions/past/?limit=5&play_id=1
    
    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )

    limit = request.query_params.get('limit', 5)
    play_id = request.query_params.get('play_id')

    try:
        limit = int(limit)
        if limit > 10:
            limit = 10
        if limit < 1:
            limit = 5
    except ValueError:
        limit = 5

    now = timezone.now()

    sessions = Session.objects.filter(
        date__lt=now.date()
    ) | Session.objects.filter(
        date=now.date(),
        time__lt=now.time()
    )
    
    # сортировка от более поздних к более ранним
    sessions = sessions.order_by('-date', '-time')
    
    if play_id:
        try:
            play_id = int(play_id)
            sessions = sessions.filter(play_id=play_id)
        except ValueError:
            pass

    sessions = sessions[:limit]

    result = []
    for session in sessions:
        sold_tickets = Ticket.objects.filter(
            session=session,
            status__name='продан'
        ).count()

        total_seats = Seat.objects.filter(hall=session.hall).count()
        occupancy = round(sold_tickets / total_seats * 100, 1) if total_seats > 0 else 0
        
        result.append({
            'session_id': session.session_id,
            'play': {
                'id': session.play.play_id,
                'title': session.play.title,
                'duration': session.play.duration,
                'price': float(session.play.price)
            },
            'date': session.date,
            'time': session.time,
            'statistics': {
                'sold_tickets': sold_tickets,
                'total_seats': total_seats,
                'occupancy': occupancy
            }
        })
    
    return Response({
        'count': len(result),
        'limit': limit,
        'results': result
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def action_log(request):
    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.query_params.get('user_id')
    action_type = request.query_params.get('action_type')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    limit = request.query_params.get('limit')

    logs = ActionLog.objects.all().order_by('-action_date')
    
    if user_id:
        logs = logs.filter(user_id=user_id)
    if action_type:
        logs = logs.filter(action_type=action_type)
    if date_from:
        logs = logs.filter(action_date__gte=date_from)
    if date_to:
        logs = logs.filter(action_date__lte=date_to)
    if limit:
        limit = int(limit)
        logs = logs[:limit]
    
    result = []
    for log in logs:
        result.append({
            'log_id': log.log_id,
            'user': log.user.username if log.user else 'Система',
            'action_type': log.action_type,
            'description': log.description,
            'action_date': log.action_date
        })
    
    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_hall(request):
    try:
        hall = TheaterHall.objects.first()
        if not hall:
            return Response(
                {'error': 'Зал не настроен'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        seats_count = Seat.objects.filter(hall=hall).count()
        
        return Response({
            'hall_id': hall.hall_id,
            'name': hall.name,
            'description': hall.description,
            'total_seats': seats_count
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_hall(request):
    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        hall = TheaterHall.objects.first()
        if not hall:
            return Response(
                {'error': 'Зал не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        
        if 'name' in data:
            hall.name = data['name']
        if 'description' in data:
            hall.description = data['description']
        
        hall.save()

        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='UPDATE_HALL',
            description=f'Обновлена информация о зале'
        )
        
        return Response({
            'success': True,
            'message': 'Информация о зале обновлена',
            'hall': {
                'name': hall.name,
                'description': hall.description
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_sectors(request, sector_id=None):
    
    # GET    - список всех секторов (любой авторизованный)
    # GET /api/sectors/{id}/ - конкретный сектор
    # POST /api/sectors/ - создание сектора (только админ/руководитель)
    # PUT /api/sectors/{id}/ - изменение сектора (только админ/руководитель)
    # DELETE /api/sectors/{id}/ - удаление сектора (только админ/руководитель)

    if request.method == 'GET':
        if sector_id:
            try:
                sector = Sector.objects.get(pk=sector_id)
                serializer = SectorSerializer(sector)
                return Response(serializer.data)
            except Sector.DoesNotExist:
                return Response(
                    {'error': 'Сектор не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            sectors = Sector.objects.all()
            serializer = SectorSerializer(sectors, many=True)
            return Response(serializer.data)

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'POST':
        hall = TheaterHall.objects.first()
        if not hall:
            return Response(
                {'error': 'Зал не настроен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = request.data
        data['hall'] = hall.hall_id
        
        serializer = SectorSerializer(data=data)
        if serializer.is_valid():
            sector = serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_SECTOR',
                description=f'Создан сектор: {sector.name}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method in ['PUT', 'PATCH']:
        try:
            sector = Sector.objects.get(pk=sector_id)
        except Sector.DoesNotExist:
            return Response(
                {'error': 'Сектор не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SectorSerializer(sector, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_SECTOR',
                description=f'Обновлен сектор: {sector.name}'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        try:
            sector = Sector.objects.get(pk=sector_id)
        except Sector.DoesNotExist:
            return Response(
                {'error': 'Сектор не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if Seat.objects.filter(sector=sector).exists(): 
            return Response(
                {'error': 'Нельзя удалить сектор с местами'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sector_name = sector.name
        sector.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_SECTOR',
            description=f'Удален сектор: {sector_name}'
        )
        
        return Response({'success': True})

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_plays(request, play_id=None):

    # GET /api/plays/manage/ - список всех спектаклей (для всех авторизованных)
    # GET /api/plays/manage/{id}/ - конкретный спектакль (для всех авторизованных)
    # POST /api/plays/manage/ - создание спектакля (только админ/руководитель)
    # PUT/PATCH /api/plays/manage/{id}/ - изменение спектакля (только админ/руководитель)
    # DELETE /api/plays/manage/{id}/ - удаление спектакля (только админ/руководитель)

    # if request.method == 'GET':
    #     if play_id:
    #         try:
    #             play = Play.objects.get(pk=play_id)
    #             serializer = PlaySerializer(play)
    #             return Response(serializer.data)
    #         except Play.DoesNotExist:
    #             return Response(
    #                 {'error': 'Спектакль не найден'},
    #                 status=status.HTTP_404_NOT_FOUND
    #             )
    #     else:
    #         plays = Play.objects.all()
    #         serializer = PlaySerializer(plays, many=True)
    #         return Response(serializer.data)

    # if not is_admin_or_manager(request.user):
    #     return Response(
    #         {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
    #         status=status.HTTP_403_FORBIDDEN
    #     )

    if request.method == 'POST':
        serializer = PlaySerializer(data=request.data)
        if serializer.is_valid():
            play = serializer.save()

            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_PLAY',
                description=f'Создан новый спектакль: {play.title}'
            )
            
            return Response(
                {
                    'success': True,
                    'message': 'Спектакль успешно создан',
                    'play': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method in ['PUT', 'PATCH']:
        if not play_id:
            return Response(
                {'error': 'Не указан ID спектакля'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            play = Play.objects.get(pk=play_id)
        except Play.DoesNotExist:
            return Response(
                {'error': 'Спектакль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PlaySerializer(play, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_PLAY',
                description=f'Изменен спектакль: {play.title}'
            )
            
            return Response({
                'success': True,
                'message': 'Спектакль успешно обновлен',
                'play': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if not play_id:
            return Response(
                {'error': 'Не указан ID спектакля'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            play = Play.objects.get(pk=play_id)
        except Play.DoesNotExist:
            return Response(
                {'error': 'Спектакль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if play.sessions.exists():
            return Response(
                {'error': 'Нельзя удалить спектакль, на который есть сеансы'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        play_title = play.title
        play.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_PLAY',
            description=f'Удален спектакль: {play_title}'
        )
        
        return Response({
            'success': True,
            'message': 'Спектакль успешно удален'
        })

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_seats(request, sector_id=None):

    # GET /api/seats/manage/?sector_id=1 - все места в секторе (для всех авторизованных)
    # POST /api/seats/manage/bulk/ - массовое создание мест (только админ/руководитель)
    # DELETE /api/seats/manage/clear/?sector_id=1 - удалить все места в секторе (только админ/руководитель)

    if request.method == 'GET':
        sector_id = request.query_params.get('sector_id')
        if not sector_id:
            return Response(
                {'error': 'Не указан ID сектора'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sector = Sector.objects.get(pk=sector_id)
        except Sector.DoesNotExist:
            return Response(
                {'error': 'Сектор не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        seats = Seat.objects.filter(sector=sector).order_by('row_number', 'seat_number')
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)
    
    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'POST':
        if not request.path.endswith('bulk/'):
            return Response(
                {'error': 'Используйте /api/seats/manage/bulk/ для массового создания'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = BulkSeatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data

        try:
            sector = Sector.objects.get(pk=data['sector_id'])
        except Sector.DoesNotExist:
            return Response(
                {'error': 'Сектор не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        created_count = 0
        skipped_count = 0
        
        for row in range(data['rows_from'], data['rows_to'] + 1):
            for seat_num in range(data['seats_from'], data['seats_to'] + 1):
                seat, created = Seat.objects.get_or_create(
                    sector=sector,
                    hall=sector.hall,
                    row_number=row,
                    seat_number=seat_num,
                    defaults={}
                )

                if created:
                    created_count += 1
                else:
                    skipped_count += 1

        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='CREATE_SEATS',
            description=f'Создано {created_count} мест в секторе {sector.name} (пропущено {skipped_count} существующих)'
        )
        
        return Response({
            'success': True,
            'message': f'Создано {created_count} новых мест',
            'skipped': skipped_count,
            'total': created_count + skipped_count
        })

    if request.method == 'DELETE':
        if not request.path.endswith('clear/'):
            return Response(
                {'error': 'Используйте /api/seats/manage/clear/?sector_id=1 для удаления мест'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sector_id = request.query_params.get('sector_id')
        if not sector_id:
            return Response(
                {'error': 'Не указан ID сектора'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sector = Sector.objects.get(pk=sector_id)
        except Sector.DoesNotExist:
            return Response(
                {'error': 'Сектор не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        seats_with_tickets = Seat.objects.filter(
            sector=sector,
            tickets__isnull=False
        ).exists()
        
        if seats_with_tickets:
            return Response(
                {'error': 'Нельзя удалить места, на которые уже есть билеты'},
                status=status.HTTP_400_BAD_REQUEST
            )

        count = Seat.objects.filter(sector=sector).count()
        
        Seat.objects.filter(sector=sector).delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_SEATS',
            description=f'Удалено {count} мест из сектора {sector.name}'
        )
        
        return Response({
            'success': True,
            'message': f'Удалено {count} мест'
        })

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_seat_detail(request, seat_id):

    # GET /api/seats/manage/detail/{id}/ - получить одно место
    # PUT/PATCH /api/seats/manage/detail/{id}/ - изменить место
    # DELETE /api/seats/manage/detail/{id}/ - удалить место

    try:
        seat = Seat.objects.get(pk=seat_id)
    except Seat.DoesNotExist:
        return Response(
            {'error': 'Место не найдено'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # GET - доступен всем авторизованным
    if request.method == 'GET':
        serializer = SeatSerializer(seat)
        return Response(serializer.data)

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        seat = Seat.objects.get(pk=seat_id)
    except Seat.DoesNotExist:
        return Response(
            {'error': 'Место не найдено'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method in ['PUT', 'PATCH']:
        serializer = SeatSerializer(seat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_SEAT',
                description=f'Изменено место: ряд {seat.row_number}, место {seat.seat_number}'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if seat.tickets.exists():
            return Response(
                {'error': 'Нельзя удалить место, на которое есть билеты'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        seat.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_SEAT',
            description=f'Удалено место'
        )
        
        return Response({'success': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def action_log_list(request):

    # поддерживает фильтрацию:
    # ?user_id=1 - по пользователю
    # ?action_type=BUY_TICKET - по типу действия
    # ?date_from=2026-03-01 - с даты
    # ?date_to=2026-03-31 - по дату
    # ?limit=50 - ограничить количество записей

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
            status=status.HTTP_403_FORBIDDEN
        )
    logs = ActionLog.objects.all().select_related('user')

    user_id = request.query_params.get('user_id')
    if user_id:
        logs = logs.filter(user_id=user_id)
    
    action_type = request.query_params.get('action_type')
    if action_type:
        logs = logs.filter(action_type=action_type)
    
    date_from = request.query_params.get('date_from')
    if date_from:
        logs = logs.filter(action_date__date__gte=date_from) # __gte - greater than or equal
    
    date_to = request.query_params.get('date_to')
    if date_to:
        logs = logs.filter(action_date__date__lte=date_to) # __lte - less than or equal

    limit = request.query_params.get('limit', 100)
    try:
        limit = int(limit)
        if limit > 500:
            limit = 500 
    except ValueError:
        limit = 100
    
    logs = logs[:limit]
    
    serializer = ActionLogSerializer(logs, many=True)
    
    return Response({
        'count': logs.count(),
        'limit': limit,
        'results': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def action_types(request):
    if not is_admin_or_manager(request.user):
        return Response({'error': 'Недостаточно прав'}, status=403)
        
    types = set(ActionLog.objects.exclude(
        action_type__isnull=True
    ).exclude(
        action_type=''
    ).values_list('action_type', flat=True))
    
    clean_types = set()
    for t in types:
        if t:
            clean_types.add(t.strip().upper())
    
    return Response(sorted(list(clean_types)))

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_panoramas(request, panorama_id=None):

    # GET /api/panoramas/manage/ - список всех панорам
    # GET /api/panoramas/manage/?sector_id=1 - панорамы сектора
    # POST /api/panoramas/manage/ - создать панораму (админ/руководитель)
    # PUT /api/panoramas/manage/{id}/ - изменить панораму
    # DELETE /api/panoramas/manage/{id}/ - удалить панораму

    if request.method == 'GET':
        if panorama_id:
            try:
                panorama = Panorama.objects.get(pk=panorama_id)
                serializer = PanoramaSerializer(panorama)
                return Response(serializer.data)
            except Panorama.DoesNotExist:
                return Response(
                    {'error': 'Панорама не найдена'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            panoramas = Panorama.objects.all()
            sector_id = request.query_params.get('sector_id')
            if sector_id:
                # Исправлено: фильтруем по сектору через место
                panoramas = panoramas.filter(seat__sector_id=sector_id)
            
            serializer = PanoramaSerializer(panoramas, many=True)
            return Response(serializer.data)
    
    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'POST':
        serializer = PanoramaSerializer(data=request.data)
        if serializer.is_valid():
            panorama = serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_PANORAMA',
                description=f'Создана панорама: {panorama.title} для места {panorama.seat}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method in ['PUT', 'PATCH']:
        try:
            panorama = Panorama.objects.get(pk=panorama_id)
        except Panorama.DoesNotExist:
            return Response(
                {'error': 'Панорама не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PanoramaSerializer(panorama, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='UPDATE_PANORAMA',
                description=f'Изменена панорама: {panorama.title}'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        try:
            panorama = Panorama.objects.get(pk=panorama_id)
        except Panorama.DoesNotExist:
            return Response(
                {'error': 'Панорама не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        panorama_title = panorama.title
        panorama.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_PANORAMA',
            description=f'Удалена панорама: {panorama_title}'
        )
        
        return Response({'success': True})

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_panorama_links(request, link_id=None):

    # GET /api/panorama-links/?panorama_id=1 - связи для панорамы
    # POST /api/panorama-links/ - создать связь
    # DELETE /api/panorama-links/{id}/ - удалить связь

    if request.method == 'GET':
        if link_id:
            try:
                link = PanoramaLink.objects.get(pk=link_id)
                serializer = PanoramaLinkSerializer(link)
                return Response(serializer.data)
            except PanoramaLink.DoesNotExist:
                return Response(
                    {'error': 'Связь не найдена'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            links = PanoramaLink.objects.all()
            panorama_id = request.query_params.get('panorama_id')
            if panorama_id:
                links = links.filter(from_panorama_id=panorama_id)
            
            serializer = PanoramaLinkSerializer(links, many=True)
            return Response(serializer.data)

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'POST':
        serializer = PanoramaLinkSerializer(data=request.data)
        if serializer.is_valid():
            link = serializer.save()
            
            ActionLog.objects.create(
                user_id=request.user.id,
                action_type='CREATE_PANORAMA_LINK',
                description=f'Создана связь: из {link.from_panorama.title} в {link.to_panorama.title}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        try:
            link = PanoramaLink.objects.get(pk=link_id)
        except PanoramaLink.DoesNotExist:
            return Response(
                {'error': 'Связь не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        link.delete()
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DELETE_PANORAMA_LINK',
            description=f'Удалена связь панорам'
        )
        
        return Response({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_panorama_by_seat(request):

    # GET /api/panorama/?seat_id=1

    seat_id = request.query_params.get('seat_id')
    
    if not seat_id:
        return Response(
            {'error': 'Не указан ID места'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        panorama = Panorama.objects.get(seat_id=seat_id)
    except Panorama.DoesNotExist:
        return Response(
            {'error': 'Для этого места нет панорамы'},
            status=status.HTTP_404_NOT_FOUND
        )

    links = PanoramaLink.objects.filter(from_panorama=panorama)
    
    return Response({
        'panorama_id': panorama.panorama_id,
        'title': panorama.title,
        'image_url': panorama.image_url,
        'seat': {
            'seat_id': panorama.seat.seat_id,
            'row': panorama.seat.row_number,
            'seat_number': panorama.seat.seat_number
        },
        'links': [
            {
                'to_panorama_id': link.to_panorama.panorama_id,
                'to_title': link.to_panorama.title,
                'direction': link.direction,
                'hint': link.hint
            }
            for link in links
        ]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_default_panorama(request):

    default_panorama = Panorama.objects.first()
    
    if not default_panorama:
        return Response(
            {'error': 'Панорамы не загружены'},
            status=status.HTTP_404_NOT_FOUND
        )

    links = PanoramaLink.objects.filter(from_panorama=default_panorama)
    
    return Response({
        'panorama_id': default_panorama.panorama_id,
        'title': default_panorama.title,
        'image_url': default_panorama.image_url,
        'seat': {
            'seat_id': default_panorama.seat.seat_id,
            'row': default_panorama.seat.row_number,
            'seat_number': default_panorama.seat.seat_number
        },
        'links': [
            {
                'to_panorama_id': link.to_panorama.panorama_id,
                'to_title': link.to_panorama.title,
                'direction': link.direction,
                'hint': link.hint
            }
            for link in links
        ]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_panorama_by_id(request, panorama_id):

    # GET /api/panorama/{panorama_id}/

    try:
        panorama = Panorama.objects.get(pk=panorama_id)
    except Panorama.DoesNotExist:
        return Response(
            {'error': 'Панорама не найдена'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    links = PanoramaLink.objects.filter(from_panorama=panorama)
    
    return Response({
        'panorama_id': panorama.panorama_id,
        'title': panorama.title,
        'image_url': panorama.image_url,
        'seat': {
            'seat_id': panorama.seat.seat_id,
            'row': panorama.seat.row_number,
            'seat_number': panorama.seat.seat_number
        },
        'links': [
            {
                'to_panorama_id': link.to_panorama.panorama_id,
                'to_title': link.to_panorama.title,
                'direction': link.direction,
                'hint': link.hint
            }
            for link in links
        ]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_ml_model(request):

    # Обучает модель Random Forest на исторических данных
    # POST /api/ml/train/

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав. Требуется роль администратора или руководителя'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    sessions_with_sales = Session.objects.filter(tickets__isnull=False).distinct()
    
    session_data = []
    historical_sales = {}
    
    for session in sessions_with_sales:
        sold_count = Ticket.objects.filter(
            session=session,
            status__name='продан'
        ).count()
        
        if sold_count > 0:
            session_data.append(session)
            historical_sales[session.session_id] = sold_count
    
    if len(session_data) < 5:
        return Response({
            'error': f'Недостаточно данных для обучения. Нужно минимум 5 сеансов с продажами, найдено: {len(session_data)}'
        }, status=status.HTTP_400_BAD_REQUEST)

    success, result = predictor.train(session_data, historical_sales)
    
    if not success:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
    ActionLog.objects.create(
        user_id=request.user.id,
        action_type='TRAIN_MODEL',
        description=f'Обучена модель'
    )

    return Response({
        'success': True,
        'message': 'Модель Random Forest успешно обучена',
        'metrics': {
            'mae': result['mae'],
            'rmse': result['rmse'],
            'r2': result.get('r2'),
            'mape': result.get('mape'),
            'train_samples': result['train_samples'],
            'test_samples': result['test_samples'],
            'total_samples': result['total_samples']
        },
        'feature_importance': result['feature_importance']
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def demand_predict(request):

    # Создает или обновляет прогноз для указанного сеанса
    # POST /api/ml/demand-predict/?session_id=1

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    session_id = request.query_params.get('session_id')
    if not session_id:
        return Response({'error': 'Не указан session_id'}, status=400)
    
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Сеанс не найден'}, status=404)
    
    if not predictor.is_valid():
        return Response({
            'error': 'Модель не обучена. Сначала выполните POST /api/ml/train/'
        }, status=400)

    predicted = predictor.predict_for_session(session)
    
    if predicted is None:
        return Response({'error': 'Ошибка при прогнозировании'}, status=500)
    
    total_seats = Seat.objects.count() or 300
    predicted = min(predicted, total_seats)
    
    prediction, created = AIPrediction.objects.update_or_create(
        session=session,
        defaults={
            'predicted_tickets': predicted,
            'prediction_date': timezone.now().date()
        }
    )

    ActionLog.objects.create(
        user_id=request.user.id,
        action_type='SESSION_PREDICT',
        description=f'Сделан прогноз на сеанс {session_id}'
    )
    
    return Response({
        
        'success': True,
        'created': created,
        'session_id': session.session_id,
        'play_id': session.play_id,
        'play': session.play.title,
        'date': session.date,
        'time': session.time,
        'prediction': {
            'predicted_tickets': prediction.predicted_tickets,
            'prediction_date': prediction.prediction_date
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_predictions(request):

    # Получает прогнозы из БД с фильтрацией
    # GET /api/ml/predictions/
    
    # Параметры фильтрации:
    # - session_id: ID сеанса
    # - play_id: ID спектакля
    # - date_from: дата начала (YYYY-MM-DD)
    # - date_to: дата конца (YYYY-MM-DD)
    # - limit: количество записей (по умолчанию 10)

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not predictor.is_trained:
        return Response({
            'count': 0,
            'message': 'Модель не обучена. Сначала выполните POST /api/ml/train/',
            'predictions': []
        })

    predictions = AIPrediction.objects.select_related('session__play').all()
    
    session_id = request.query_params.get('session_id')
    if session_id:
        predictions = predictions.filter(session_id=session_id)

    play_id = request.query_params.get('play_id')
    if play_id:
        predictions = predictions.filter(session__play_id=play_id)

    date_from = request.query_params.get('date_from')
    if date_from:
        predictions = predictions.filter(session__date__gte=date_from)
    
    date_to = request.query_params.get('date_to')
    if date_to:
        predictions = predictions.filter(session__date__lte=date_to)

    order_by = request.query_params.get('order_by', '-prediction_id')
    predictions = predictions.order_by(order_by)
    
    limit = request.query_params.get('limit', 5)
    try:
        limit = int(limit)
        if limit > 15:
            limit = 10
    except ValueError:
        limit = 10
    
    predictions = predictions[:limit]

    result = []
    for pred in predictions:
        result.append({
            'prediction_id': pred.prediction_id,
            'session': {
                'id': pred.session.session_id,
                'date': pred.session.date,
                'time': pred.session.time
            },
            'play': {
                'id': pred.session.play.play_id,
                'title': pred.session.play.title,
                'price': float(pred.session.play.price)
            },
            'prediction': {
                'predicted_tickets': pred.predicted_tickets,
                'prediction_date': pred.prediction_date
            }
        })
    
    return Response({
        'count': len(result),
        'limit': limit,
        'results': result
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tickets(request):

    # GET /api/tickets/my/
    # Возвращает билеты текущего пользователя

    user = request.user
    
    tickets = Ticket.objects.filter(
        user=user
    ).select_related(
        'session', 'session__play', 'seat', 'status'
    ).order_by('-purchase_date')
    
    result = []
    for ticket in tickets:
        result.append({
            'ticket_id': ticket.ticket_id,
            'play_title': ticket.session.play.title,
            'date': ticket.session.date,
            'time': ticket.session.time,
            'hall': ticket.session.hall.name,
            'row': ticket.seat.row_number,
            'seat': ticket.seat.seat_number,
            'price': str(ticket.price_paid),
            'status': ticket.status.name,
            'purchase_date': ticket.purchase_date,
            'is_online': ticket.user_id == user.id  # куплен ли онлайн
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_tickets(request):

    # GET /api/tickets/all/
    # Возвращает все билеты (только для кассира/админа)
    
    if not is_cashier(request.user) and not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав. Требуется роль кассира или администратора'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    tickets = Ticket.objects.select_related(
        'user', 'session', 'session__play', 'seat', 'status'
    ).order_by('-purchase_date')
    
    user_id = request.query_params.get('user_id')
    if user_id:
        tickets = tickets.filter(user_id=user_id)
    
    status_name = request.query_params.get('status')
    if status_name:
        tickets = tickets.filter(status__name=status_name)
    
    date_from = request.query_params.get('date_from')
    if date_from:
        tickets = tickets.filter(purchase_date__date__gte=date_from)
    
    date_to = request.query_params.get('date_to')
    if date_to:
        tickets = tickets.filter(purchase_date__date__lte=date_to)
    
    play_id = request.query_params.get('play_id')
    if play_id:
        tickets = tickets.filter(session__play_id=play_id)
    
    limit = request.query_params.get('limit', 100)
    try:
        limit = int(limit)
        if limit > 500:
            limit = 500
    except:
        limit = 100
    
    tickets = tickets[:limit]
    
    result = []
    for ticket in tickets:
        result.append({
            'ticket_id': ticket.ticket_id,
            'user': {
                'id': ticket.user.id if ticket.user else None,
                'username': ticket.user.username if ticket.user else 'Кассир (наличные)',
                'email': ticket.user.email if ticket.user else None
            },
            'play_title': ticket.session.play.title,
            'date': ticket.session.date,
            'time': ticket.session.time,
            'hall': ticket.session.hall.name,
            'row': ticket.seat.row_number,
            'seat': ticket.seat.seat_number,
            'price': str(ticket.price_paid),
            'status': ticket.status.name,
            'purchase_date': ticket.purchase_date,
            'is_online': ticket.user_id is not None
        })
    
    return Response({
        'count': len(result),
        'limit': limit,
        'results': result
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def model_info(request):

    # Возвращает информацию о текущей модели
    # GET /api/ml/info/

    if not is_admin_or_manager(request.user):
        return Response(
            {'error': 'Недостаточно прав'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response(predictor.get_model_info())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_sql_backup(request):

    if not is_admin_or_manager(request.user):
        return Response({'error': 'Недостаточно прав'}, status=403)
    
    try:
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings.get('HOST', 'db')
        db_port = db_settings.get('PORT', '5432')

        pg_dump_path = shutil.which('pg_dump')
        if not pg_dump_path:
            return Response({'error': 'pg_dump не найден в системе'}, status=500)
        
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password
        
        cmd = [
            pg_dump_path,
            '-U', db_user,
            '-h', db_host,
            '-p', str(db_port),
            db_name
        ]
        
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)

        import time
        time.sleep(0.5)
        if proc.poll() is not None and proc.returncode != 0:
            error = proc.stderr.read().decode('utf-8', errors='ignore')
            return Response({'error': f'Ошибка pg_dump: {error}'}, status=500)
        
        def generate():
            for line in proc.stdout:
                yield line
        
        timestamp = datetime.now().strftime('%Y.%m.%d_%H.%M')
        filename = f'theater_dump_{timestamp}.sql'
        
        response = StreamingHttpResponse(generate(), content_type='application/sql')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        ActionLog.objects.create(
            user_id=request.user.id,
            action_type='DOWNLOAD_BACKUP',
            description=f'Скачена резервного копированиям'
        )

        return response

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ticket_price(request):

    # Получить цену билета
    # GET /api/price/?session_id={id}&seat_id={id}

    session_id = request.query_params.get('session_id')
    seat_id = request.query_params.get('seat_id')
    
    # Проверка обязательных параметров
    if not session_id or not seat_id:
        return Response(
            {'error': 'Не указаны обязательные параметры: session_id и seat_id'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверка существования сеанса
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response(
            {'error': 'Сеанс не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверка существования места
    try:
        seat = Seat.objects.get(pk=seat_id)
    except Seat.DoesNotExist:
        return Response(
            {'error': 'Место не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Расчёт цены
    try:
        from .price_service import PriceCalculator
        price = PriceCalculator.calculate_ticket_price(session, seat)
    except Exception as e:
        return Response(
            {'error': f'Ошибка расчёта цены: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Формирование ответа
    response_data = {
        'session_id': session.session_id,
        'seat_id': seat.seat_id,
        'seat': {
            'row': seat.row_number,
            'number': seat.seat_number,
            'sector': seat.sector.name,
            'sector_coefficient': float(seat.sector.price_coefficient)
        },
        'play': {
            'id': session.play.play_id,
            'title': session.play.title,
            'base_price': float(session.play.price)
        },
        'session': {
            'date': session.date,
            'time': session.time,
            'calculated_price': float(session.calculated_price) if session.calculated_price else None
        },
        'price': float(price)
    }
    
    # Добавляем коэффициенты (опционально)
    from .price_service import PriceCalculator as PC
    response_data['coefficients'] = {
        'weekday': float(PC.get_weekday_coefficient(session.date)),
        'time': float(PC.get_time_coefficient(session.time)),
        'holiday': float(PC.get_holiday_coefficient(session.date)),
        'sector': float(seat.sector.price_coefficient)
    }
    
    # Формула расчёта
    coeffs = response_data['coefficients']
    formula = f"{session.play.price} × {coeffs['weekday']} (день) × {coeffs['time']} (время)"
    if coeffs['holiday'] != 1.0:
        formula += f" × {coeffs['holiday']} (праздник)"
    formula += f" × {coeffs['sector']} (сектор) = {float(price):.2f}"
    response_data['formula'] = formula
    
    return Response(response_data)

def get_total_seats():
    return Seat.objects.count()

def is_admin(user):
    try:
        return user.profile.role.name == 'admin'
    except:
        return False

def is_manager(user):
    try:
        return user.profile.role.name == 'manager'
    except:
        return False

def is_cashier(user):
    try:
        return user.profile.role.name == 'cashier'
    except:
        return False
    
def is_admin_or_manager(user):  
    try:
        role = user.profile.role.name
        return role in ['admin', 'manager']
    except:
        return False

def is_admin_or_cashier(user):
    try:
        role = user.profile.role.name
        return role in ['admin', 'cashier']
    except:
        return False
