from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Play, Actor, Session, Seat, Panorama, PanoramaLink, Sector, TheaterHall, Genre, ActionLog, TicketStatus, Profile, SessionActor
from django.db import IntegrityError
from .models import Profile

# cериализатор для модели Actor, превращает объект актера в JSON
class ActorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Actor
        fields = ['actor_id', 'actor_fio']

class GenreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Genre
        fields = ['genre_id', 'name', 'description']

class PlaySerializer(serializers.ModelSerializer):
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    
    class Meta:
        model = Play
        fields = ['play_id', 'title', 'duration', 'description', 
                  'price', 'poster_url', 'genre', 'genre_name']
    
# class SeatSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Seat
#         fields = ['seat_id', 'row_number', 'seat_number']

class PanoramaLinkSerializer(serializers.ModelSerializer):

    from_title = serializers.CharField(source='from_panorama.title', read_only=True)
    to_title = serializers.CharField(source='to_panorama.title', read_only=True)
    
    class Meta:
        model = PanoramaLink
        fields = ['link_id', 'from_panorama', 'from_title', 'to_panorama', 'to_title', 'direction', 'hint']
        read_only_fields = ['link_id']

class PanoramaSerializer(serializers.ModelSerializer):
    seat_id = serializers.IntegerField(required=True) 

    class Meta:
        model = Panorama
        fields = ['panorama_id', 'seat_id', 'title',]
        read_only_fields = ['panorama_id']

class SessionActorSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.actor_fio', read_only=True)

    class Meta:
        model = SessionActor
        fields = ['actor_id', 'actor_name', 'actor_role_name']

class SessionSerializer(serializers.ModelSerializer):
    play_title = serializers.CharField(source='play.title', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    actors = SessionActorSerializer(many=True, read_only=True, source='session_actors')
    calculated_price = serializers.SerializerMethodField()
    coefficients = serializers.SerializerMethodField()  # ← НОВОЕ ПОЛЕ
    
    class Meta:
        model = Session
        fields = ['session_id', 'play', 'play_title', 'hall', 'hall_name', 
                  'date', 'time', 'calculated_price', 'coefficients', 'actors']
    
    def get_calculated_price(self, obj):
        if obj.calculated_price is not None:
            return float(obj.calculated_price)
        from .price_service import PriceCalculator
        return float(PriceCalculator.calculate_session_price(obj))
    
    def get_coefficients(self, obj):
        """
        Возвращает коэффициенты, применённые к сеансу
        """
        from .price_service import PriceCalculator
        
        # Получаем коэффициенты
        weekday_coeff = PriceCalculator.get_weekday_coefficient(obj.date)
        time_coeff = PriceCalculator.get_time_coefficient(obj.time)
        holiday_coeff = PriceCalculator.get_holiday_coefficient(obj.date)
        
        # Находим название дня недели
        weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        weekday_name = weekdays[obj.date.weekday()]
        
        # Название времени суток
        hour = obj.time.hour
        if 6 <= hour <= 11:
            time_name = 'Утро (06:00-11:59)'
        elif 12 <= hour <= 17:
            time_name = 'День (12:00-17:59)'
        elif 18 <= hour <= 21:
            time_name = 'Вечер (18:00-21:59)'
        else:
            time_name = 'Ночь (22:00-05:59)'
        
        # Проверяем, есть ли праздник
        from .models import Holiday
        holiday = Holiday.objects.filter(
            month=obj.date.month,
            day=obj.date.day,
            is_active=True
        ).first()
        
        result = {
            'base_price': float(obj.play.price),
            'applied_coefficients': [
                {
                    'name': 'День недели',
                    'value': float(weekday_coeff),
                    'detail': weekday_name
                },
                {
                    'name': 'Время суток',
                    'value': float(time_coeff),
                    'detail': time_name
                }
            ],
            'final_price': float(self.get_calculated_price(obj))
        }
        
        # Добавляем праздник, если есть
        if holiday:
            result['applied_coefficients'].append({
                'name': 'Праздник',
                'value': float(holiday.coefficient),
                'detail': holiday.name
            })
        
        # Формула расчёта
        result['formula'] = f"{obj.play.price} × {weekday_coeff} × {time_coeff}"
        if holiday:
            result['formula'] += f" × {holiday.coefficient}"
        result['formula'] += f" = {result['final_price']}"
        
        return result
    
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone')
        extra_kwargs = {
            'username': {
                'validators': [],
            },
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})

        return data
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value
    
    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        validated_data.pop('password2')

        user = User.objects.create_user(**validated_data)

        Profile.objects.create(user=user, phone=phone)
        
        return user
    
class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheaterHall
        fields = ['hall_id', 'name', 'description', 'total_seats']
        read_only_fields = ['hall_id']

class SeatSerializer(serializers.ModelSerializer):
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    
    class Meta:
        model = Seat
        fields = ['seat_id', 'sector_name', 'sector_name', 'row_number', 'seat_number']
        read_only_fields = ['seat_id']


class BulkSeatSerializer(serializers.Serializer):

    sector_id = serializers.IntegerField()
    rows_from = serializers.IntegerField()
    rows_to = serializers.IntegerField()
    seats_from = serializers.IntegerField()
    seats_to = serializers.IntegerField()
    
    def validate(self, data):
        if data['rows_from'] > data['rows_to']:
            raise serializers.ValidationError(
                "Номер начала ряда должен быть меньше или равен номеру конца"
            )
        if data['seats_from'] > data['seats_to']:
            raise serializers.ValidationError(
                "Номер начала места должен быть меньше или равен номеру конца"
            )
        return data

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ['sector_id', 'name', 'description', 'hall', 'panorama_url']
        read_only_fields = ['sector_id']

class TicketStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketStatus
        fields = ['status_id', 'name']

class ActionLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ActionLog
        fields = ['log_id', 'user', 'username', 'action_type', 'description', 'action_date']
        read_only_fields = ['log_id', 'action_date']

class BulkBuySerializer(serializers.Serializer):

    session_id = serializers.IntegerField()
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=20
    )
    phone = serializers.CharField(required=False, max_length=20)  # ← добавляем
    
    def validate(self, data):
        if data.get('user_id') and data.get('phone'):
            raise serializers.ValidationError(
                "Укажите только один способ идентификации: user_id или phone"
            )
        return data
    
class BulkBasketSerializer(serializers.Serializer):

    session_id = serializers.IntegerField()
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=20  # максимум 20 мест за раз
    )
    
    def validate_seat_ids(self, value):
        # проверка уникальности мест
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Места не должны повторяться")
        return value
    


class SessionWithActorsSerializer(serializers.ModelSerializer):
    session_actors = SessionActorSerializer(many=True, read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    play_title = serializers.CharField(source='play.title', read_only=True)
    
    class Meta:
        model = Session
        fields = ['session_id', 'play_title', 'hall_name', 'date', 'time', 'session_actors']
