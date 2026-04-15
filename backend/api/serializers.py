from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Play, Actor, Session, Seat, Panorama, PanoramaLink, Sector, TheaterHall, Genre, ActionLog, TicketStatus, Profile, SessionActor

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
        fields = ['panorama_id', 'seat_id', 'title', 'image_url']
        read_only_fields = ['panorama_id']


class SessionSerializer(serializers.ModelSerializer):   
    play_title = serializers.CharField(source='play.title', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    
    class Meta:
        model = Session
        fields = ['session_id', 'play', 'play_title', 'hall', 'hall_name', 'date', 'time']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password], 
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )

    phone = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=20,
        help_text="Номер телефона"
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name', 'phone']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        phone = validated_data.pop('phone')
        user = User.objects.create_user(**validated_data)
        
        profile, created = Profile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.save()

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
    user_id = serializers.IntegerField(
        required=False,  # необязательный для обычных пользователей
        help_text="ID пользователя, для которого покупаются билеты (только для кассира)"
    )
    
    def validate_seat_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Места не должны повторяться")
        return value
    
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
    
class SessionActorSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.actor_fio', read_only=True)
    
    class Meta:
        model = SessionActor
        fields = ['actor_id', 'actor_name', 'actor_role_name']

class SessionWithActorsSerializer(serializers.ModelSerializer):
    session_actors = SessionActorSerializer(many=True, read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    play_title = serializers.CharField(source='play.title', read_only=True)
    
    class Meta:
        model = Session
        fields = ['session_id', 'play_title', 'hall_name', 'date', 'time', 'session_actors']
