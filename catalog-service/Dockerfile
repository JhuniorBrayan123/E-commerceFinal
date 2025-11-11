FROM python:3.9-slim

WORKDIR /app

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto Django (incluyendo la carpeta lab08)
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar CORREGIDO (manage.py está en la raíz)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]