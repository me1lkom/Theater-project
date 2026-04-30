FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements.txt
COPY requirements.txt .

# Увеличиваем таймаут и используем зеркало
RUN pip install --no-cache-dir --timeout 120 \
    -i https://pypi.tuna.tsinghua.edu.cn/simple \
    --trusted-host pypi.tuna.tsinghua.edu.cn \
    -r requirements.txt

COPY . .

RUN mkdir -p /app/media /app/static

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]