from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50,verbose_name='Название роли')
    description = models.TextField(blank=True,verbose_name='Описание')

    # дополнительное описание
    class Meta:
        verbose_name = 'Роль'
        verbose_name_plural = 'Роли'

    # для правильного отображения
    def __str__(self):
        return self.name

class Actor(models.Model):
    actor_id = models.AutoField(primary_key=True)
    actor_fio = models.CharField(max_length=255,verbose_name='ФИО актера')

    class Meta:
        verbose_name = 'Актер'
        verbose_name_plural = 'Актеры'

    def __str__(self):
        return self.actor_fio

class Genre(models.Model):
    genre_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, verbose_name="Название жанра")
    description = models.TextField(blank=True, verbose_name="Описание")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"

class Play(models.Model):
    play_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200, verbose_name='Название спектакля')
    duration = models.IntegerField(verbose_name='Длительность (минуты)')

    description = models.TextField(
        verbose_name="Описание", 
        default='',
        blank=True 
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Базовая цена'
    )

    poster_url = models.CharField(
        max_length=500,
        blank=True,  # может быть пустым при создании
        null = True, # в базе данных может быть NULL
        verbose_name='URL постера'
    )

    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plays',
        verbose_name='Жанр'
    )

    class Meta:
        verbose_name = 'Спекталь'
        verbose_name_plural = 'Спектакли'
        ordering = ['title']

    def __str__(self):
        return self.title
    

class SessionActor(models.Model):
    session_actor_id = models.AutoField(primary_key=True)
    
    session = models.ForeignKey(
        'Session',
        on_delete=models.CASCADE,
        related_name='session_actors',
        verbose_name='Сеанс'
    )
    
    actor = models.ForeignKey(
        'Actor',
        on_delete=models.CASCADE,
        related_name='session_actors',
        verbose_name='Актер'
    )
    
    actor_role_name = models.CharField(
        max_length=200,
        verbose_name='Название роли'
    )
    
    class Meta:
        verbose_name = 'Актер в сеансе'
        verbose_name_plural = 'Актеры в сеансах'
        unique_together = ['session', 'actor', 'actor_role_name']
    
    def __str__(self):
        return f'{self.actor.actor_fio} - {self.actor_role_name} (сеанс {self.session_id})'

# на будушее. Пока нет
class TheaterHall(models.Model):
    hall_id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=100,
        default='Основной зал',
        verbose_name='Название зала'
    )

    description = models.TextField(
        blank=True,
        verbose_name='Описание зала'
    )


    class Meta:
        verbose_name='Зал'
        verbose_name_plural='Залы'

    def __str__(self):
        return self.name
    

class Sector(models.Model):
    sector_id = models.AutoField(primary_key=True)
    hall = models.ForeignKey(
        TheaterHall,
        on_delete=models.CASCADE,
        related_name='sectors',
        verbose_name='Зал'
    )

    name = models.CharField(max_length=100, verbose_name='Название сектора')
    description = models.TextField(blank=True, verbose_name='Описание')
    panorama_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='URL 3D-панорамы'
    )
    
    class Meta:
        verbose_name = 'Сектор'
        verbose_name_plural = 'Секторы'
        unique_together = ['hall', 'name']
    
    def __str__(self):
        return f"{self.hall.name} - {self.name}"

class Seat(models.Model):
    seat_id = models.AutoField(primary_key=True)

    hall = models.ForeignKey(
        TheaterHall,
        on_delete=models.CASCADE,
        related_name='seats',
        verbose_name='Зал'
    )

    sector = models.ForeignKey(
        Sector,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='seats',
        verbose_name='Сектор'
    )

    row_number = models.IntegerField(verbose_name='Номер ряда')
    seat_number = models.IntegerField(verbose_name='Номер места')

    class Meta:
        verbose_name = 'Место'
        verbose_name_plural = 'Места'
        unique_together = ['hall','sector', 'row_number', 'seat_number']
        ordering = ['sector', 'row_number', 'seat_number']

    def __str__(self):
        return f"Ряд {self.row_number} Место {self.seat_number}"   

class Panorama(models.Model):
    panorama_id = models.AutoField(primary_key=True)
    
    seat = models.ForeignKey(
        'Seat',
        on_delete=models.CASCADE,
        related_name='panoramas',
        verbose_name='Место съемки'
    )

    title = models.CharField(
        max_length=200, 
        verbose_name='Название'
    )

    image_url = models.CharField(
        max_length=500, 
        verbose_name='URL изображения'
    )
    
    class Meta:
        verbose_name = 'Панорама' 
        verbose_name_plural = 'Панорамы' 
        ordering = ['seat__row_number', 'seat__seat_number']
    
    def __str__(self):
        return f"{self.title} (Ряд {self.seat.row_number}, Место {self.seat.seat_number})"

# cвязи между панорамами (откуда и куда можно перейти)
class PanoramaLink(models.Model):
    link_id = models.AutoField(primary_key=True)

    from_panorama = models.ForeignKey(
        Panorama,
        on_delete=models.CASCADE,
        related_name='links_from',  # все исходящие связи
        verbose_name='Откуда'
    )
    
    # куда можно перейти
    to_panorama = models.ForeignKey(
        Panorama,
        on_delete=models.CASCADE,
        related_name='links_to',  # все входящие связи
        verbose_name='Куда'
    )
    
    # где показать стрелку
    DIRECTION_CHOICES = [
        ('left', 'Слева'),
        ('right', 'Справа'),
        ('forward', 'Вперед'),
        ('back', 'Назад'),
        ('up', 'Вверх'),
        ('down', 'Вниз'),
    ]
    
    direction = models.CharField(
        max_length=20,
        choices=DIRECTION_CHOICES, # выпадающий список в админке
        verbose_name='Направление'
    )
    
    hint = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Подсказка'
    )
    
    class Meta:
        verbose_name = 'Связь панорам'
        verbose_name_plural = 'Связи панорам'
        unique_together = ['from_panorama', 'to_panorama']
    
    def __str__(self):
        return f"{self.from_panorama.title} -> {self.to_panorama.title} ({self.direction})"

class Session(models.Model):
    session_id = models.AutoField(primary_key=True)

    play = models.ForeignKey(
        Play,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name='Спектакль'
    )

    hall = models.ForeignKey(
        TheaterHall,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name='Зал'
    )

    date = models.DateField(verbose_name='Дата')
    time = models.TimeField(verbose_name='Время')

    class Meta:
        verbose_name = 'Сеанс'
        verbose_name_plural = 'Сеансы'
        ordering = ['date','time']
        unique_together = ['hall', 'date', 'time']

    def __str__(self):
        return f"{self.play.title} - {self.date}{self.time}"

# свободен, продан, возвращен, забронирован
class TicketStatus(models.Model): 
    status_id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name='Название статуса'
    )

    class Meta:
        verbose_name = 'Статус билета'
        verbose_name_plural = 'Статус билетов'

    def __str__(self):
        return self.name

class Ticket(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets',
        verbose_name='Пользователь'
    )
    
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name='Сеанс'
    )
    
    seat = models.ForeignKey(
        Seat,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name='Место'
    )
    
    status = models.ForeignKey(
        TicketStatus,
        on_delete=models.PROTECT,
        related_name='tickets',
        verbose_name='Статус'
    )
    
    purchase_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Дата покупки/бронирования'
    )
    
    price_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Цена продажи'
    )
    
    class Meta:
        verbose_name = 'Билет'
        verbose_name_plural = 'Билеты'
    
    def __str__(self):
        return f"Билет №{self.ticket_id} - {self.session} - {self.seat}"

# корзина временного бронирования на 15 минут
class Basket(models.Model):
    
    basket_id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='basket_items',
        verbose_name='Пользователь'
    )
    
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        verbose_name='Сеанс'
    )
    
    seat = models.ForeignKey(
        Seat,
        on_delete=models.CASCADE,
        verbose_name='Место'
    )
    
    added_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='Время добавления'
    )
    
    expires_at = models.DateTimeField(
        verbose_name='Бронь до'
    )
    
    class Meta:
        verbose_name = 'Корзина'
        verbose_name_plural = 'Корзина'
        unique_together = ['session', 'seat']
    
    def __str__(self):
        return f"Корзина {self.user.username} - {self.seat}"

# журнал действий
class ActionLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='actions',
        verbose_name='Пользователь'
    )
    
    action_type = models.CharField(
        max_length=50,
        verbose_name='Тип действия'
    )
    
    description = models.TextField(
        verbose_name='Описание действия'
    )
    
    action_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата действия'
    )
    
    class Meta:
        verbose_name = 'Запись журнала'
        verbose_name_plural = 'Журнал действий'
        ordering = ['-action_date']
    
    def __str__(self):
        return f"{self.action_date} - {self.user} - {self.action_type}"

# модель для прогнозов ИИ
class AIPrediction(models.Model):
    prediction_id = models.AutoField(primary_key=True)
    
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='predictions',
        verbose_name='Сеанс'
    )
    
    prediction_date = models.DateField(
        default=timezone.now,
        verbose_name='Дата прогноза'
    )
    
    predicted_tickets = models.IntegerField(
        verbose_name='Прогнозируемое количество билетов'
    )
    
    class Meta:
        verbose_name = 'Прогноз ИИ'
        verbose_name_plural = 'Прогнозы ИИ'
        ordering = ['-prediction_date']
    
    def __str__(self):
        return f"Прогноз для {self.session} от {self.prediction_date}"

class Profile(models.Model):
    profile_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='Пользователь'
    )
    
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='profiles',
        verbose_name='Роль',
        null=True,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        unique=True,     
        blank=False,
        null=False,      
        verbose_name='Телефон'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
    
    def __str__(self):
        return f"{self.user.username} - {self.role.name if self.role else 'Нет роли'}"
