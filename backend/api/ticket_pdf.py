import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from django.utils import timezone



font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'DejaVuSans.ttf')
pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', font_path)) 


def generate_ticket_pdf(ticket):

    buffer = io.BytesIO()
    
    # Создаём PDF с русским шрифтом
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Рамка билета
    p.setStrokeColor(colors.black)
    p.setLineWidth(2)
    p.rect(20*mm, 20*mm, width - 40*mm, height - 40*mm)
    
    # Заголовок (русский шрифт)
    p.setFont("DejaVuSans-Bold", 24)
    p.drawCentredString(width/2, height - 40*mm, "ЭЛЕКТРОННЫЙ БИЛЕТ")
    
    # Театр
    p.setFont("DejaVuSans-Bold", 16)
    p.drawCentredString(width/2, height - 55*mm, "Театр")
    
    # Данные билета
    y_position = height - 80*mm
    
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Спектакль:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.session.play.title)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Дата и время:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"{ticket.session.date} {ticket.session.time}")
    
    y_position -= 10*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Зал:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.session.hall.name)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Место:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"Ряд {ticket.seat.row_number}, Место {ticket.seat.seat_number}")
    
    y_position -= 10*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Сектор:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.seat.sector.name)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "Цена:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"{ticket.price_paid} ₽")
    
    y_position -= 15*mm
    p.setFont("DejaVuSans-Bold", 12)
    p.drawString(30*mm, y_position, "ID билета:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, str(ticket.ticket_id))
    
    y_position -= 15*mm
    p.setFont("DejaVuSans", 10)
    p.drawString(30*mm, y_position, "Предъявите этот билет при входе")
        
    # Нижний колонтитул
    p.setFont("DejaVuSans", 8)
    p.drawString(30*mm, 25*mm, f"Билет сгенерирован: {timezone.now()}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer