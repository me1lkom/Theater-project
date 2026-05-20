import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import qrcode
from django.conf import settings


# Регистрируем русский шрифт
font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'DejaVuSans.ttf')
pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))


def generate_qr_code(ticket):
    # Генерирует QR-код со ссылкой на проверку билета
    
    frontend_url = "http://localhost:8001"
    qr_data = f"{frontend_url}/check-ticket/{ticket.ticket_id}"
    
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=2,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return ImageReader(img_buffer)


def generate_ticket_pdf(ticket):

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Рамка билета
    p.setStrokeColor(colors.black)
    p.setLineWidth(2)
    p.rect(20*mm, 20*mm, width - 40*mm, height - 40*mm)
    
    p.setFont("DejaVuSans", 24)
    p.drawCentredString(width/2, height - 40*mm, "ЭЛЕКТРОННЫЙ БИЛЕТ")

    p.setFont("DejaVuSans", 16)
    p.drawCentredString(width/2, height - 55*mm, "Театр")

    y_position = height - 80*mm
    
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Спектакль:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.session.play.title)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Дата и время:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"{ticket.session.date.strftime('%d.%m.%Y')} {ticket.session.time}")
    
    y_position -= 10*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Зал:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.session.hall.name)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Место:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"Ряд {ticket.seat.row_number}, Место {ticket.seat.seat_number}")
    
    y_position -= 10*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Сектор:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, ticket.seat.sector.name)
    
    y_position -= 10*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "Цена:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, f"{ticket.price_paid} ₽")
    
    y_position -= 15*mm
    p.setFont("DejaVuSans", 12)
    p.drawString(30*mm, y_position, "ID билета:")
    p.setFont("DejaVuSans", 12)
    p.drawString(80*mm, y_position, str(ticket.ticket_id))

    y_position -= 100*mm
    qr_img = generate_qr_code(ticket)
    p.drawImage(qr_img, width - 100*mm, y_position, width=70*mm, height=70*mm)

    p.setFont("DejaVuSans", 10)
    p.drawString(width - 75*mm, y_position - 5*mm, "QR-код для проверки")
        
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer