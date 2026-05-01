"""
Сервис для расчёта цен на билеты
"""
from decimal import Decimal
from datetime import date
from .models import WeekdayCoefficient, TimeCoefficient, Holiday


class PriceCalculator:
    """Калькулятор цен"""
    
    @staticmethod
    def get_weekday_coefficient(session_date: date) -> Decimal:
        """Коэффициент по дню недели"""
        coeff = WeekdayCoefficient.objects.filter(
            weekday=session_date.weekday(),
            is_active=True
        ).first()
        return coeff.coefficient if coeff else Decimal('1.0')
    
    @staticmethod
    def get_time_coefficient(session_time) -> Decimal:
        """Коэффициент по времени суток"""
        hour = session_time.hour
        
        if 6 <= hour <= 11:
            slot = 'morning'
        elif 12 <= hour <= 17:
            slot = 'afternoon'
        elif 18 <= hour <= 21:
            slot = 'evening'
        else:
            slot = 'night'
        
        coeff = TimeCoefficient.objects.filter(time_slot=slot, is_active=True).first()
        return coeff.coefficient if coeff else Decimal('1.0')
    
    @staticmethod
    def get_holiday_coefficient(session_date: date) -> Decimal:
        """Коэффициент праздника"""
        holiday = Holiday.objects.filter(
            month=session_date.month,
            day=session_date.day,
            is_active=True
        ).first()
        return holiday.coefficient if holiday else Decimal('1.0')
    
    @staticmethod
    def round_price(price: Decimal) -> Decimal:
        """Округление до десятков"""
        price_int = int(price)
        remainder = price_int % 10
        if remainder < 5:
            rounded = price_int - remainder
        else:
            rounded = price_int + (10 - remainder)
        return Decimal(max(rounded, 100))
    
    @classmethod
    def calculate_session_price(cls, session) -> Decimal:
        """
        Рассчитывает цену сеанса (без учёта сектора)
        Формула: цена_спектакля × день_недели × время × праздник
        """
        base_price = session.play.price
        
        weekday_coeff = cls.get_weekday_coefficient(session.date)
        time_coeff = cls.get_time_coefficient(session.time)
        holiday_coeff = cls.get_holiday_coefficient(session.date)
        
        result = base_price * weekday_coeff * time_coeff * holiday_coeff
        result = cls.round_price(result)
        
        return result
    
    @classmethod
    def calculate_ticket_price(cls, session, seat) -> Decimal:
        """
        Рассчитывает финальную цену билета
        Формула: цена_сеанса × коэффициент_сектора
        """
        session_price = session.calculated_price
        if session_price is None:
            session_price = cls.calculate_session_price(session)
        
        sector_coeff = seat.sector.price_coefficient
        result = session_price * sector_coeff
        result = cls.round_price(result)
        
        return result