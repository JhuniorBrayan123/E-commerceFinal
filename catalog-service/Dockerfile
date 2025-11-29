FROM python:3.11.4-slim

WORKDIR /app

# INSTALAR DEPENDENCIAS DEL SISTEMA PARA MYSQL
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para cachear dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar el código de Django
COPY . .

# Puerto expuesto
EXPOSE 8000

# Comando para ejecutar (con migraciones automáticas)
CMD ["sh", "-c", "python manage.py migrate && DEBUG=true python manage.py runserver 0.0.0.0:8000"]