FROM python:3.11.4-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# INSTALAR DEPENDENCIAS DEL SISTEMA PARA MYSQL (Necesario para PyMySQL o mysqlclient)
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para cachear dependencias
COPY requirements.txt .
# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de Django
COPY . .

# Crear el directorio para archivos estáticos y media (buena práctica)
RUN mkdir -p /app/staticfiles /app/media

# Puerto expuesto
EXPOSE 8000

# Comando para ejecutar el servicio.
# 1. Ejecutar las migraciones
# 2. Recolectar los archivos estáticos (¡Importante para Jazzmin y el Admin!)
# 3. Iniciar el servidor de desarrollo de Django
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:8000"]