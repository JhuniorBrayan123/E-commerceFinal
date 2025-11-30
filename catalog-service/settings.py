"""
Django settings for ecommerce project.
"""

from pathlib import Path
import os
import pymysql

# Usar PyMySQL como driver MySQL
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-#zvzk4+1y(&ssrx0e@gtk+a#j+rap9!dv_=g3+bj)nbz7svb6_'

# DEBUG para Docker - False en producción
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = ['*']  # Para desarrollo, en producción especifica dominios

# ==========================================================================
# 🔹 INSTALLED_APPS — Jazzmin agregado correctamente como PRIMERA app
# ==========================================================================
INSTALLED_APPS = [
    'jazzmin',           # ← DEBE ESTAR PRIMERO SIEMPRE
    'marketing',
    'comentarios',
    'preferencias',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'sensores',
    'categorias',
    'inventario',
    'orders',
    'cupones',

    # Django defaults
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# ==========================================================================
# 🔹 MIDDLEWARE
# ==========================================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'urls'

# ==========================================================================
# 🔹 TEMPLATES
# ==========================================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'wsgi.application'

# ==========================================================================
# 🔹 BASE DE DATOS — NO SE TOCÓ NADA
# ==========================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE', 'ecommerce_db'),
        'USER': os.getenv('MYSQL_USER', 'root'),
        'PASSWORD': os.getenv('MYSQL_PASSWORD', ''),
        'HOST': os.getenv('MYSQL_HOST', 'localhost'),
        'PORT': os.getenv('MYSQL_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}

JWT_SECRET_KEY = 'mi-clave-secreta-jwt-muy-segura-para-ecommerce'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==========================================================================
# 🔹 STATIC & MEDIA (Correctos)
# ==========================================================================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================================================
# 🔹 Django REST Framework
# ==========================================================================
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# ==========================================================================
# 🔹 CORS — NO SE MODIFICÓ NADA DEL COMPORTAMIENTO
# ==========================================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",  # Si el frontend está en Docker
]

CORS_ALLOW_ALL_ORIGINS = True  # Para desarrollo

# Métodos permitidos
CORS_ALLOW_METHODS = [
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'
]

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-requested-with',
]

# ==========================================================================
# 🔹 CONFIGURACIÓN DE JAZZMIN — COMPLETAMENTE AGREGADA
# ==========================================================================

JAZZMIN_UI_TWEAKS = {
    "navbar_fixed": True,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-success",
    "accent": "accent-success",
    "navbar_colour": "navbar-dark",
    "brand_colour": "navbar-dark",
    "sidebar_nav_small_text": False,
    "body_small_text": False,
}

JAZZMIN_SETTINGS = {
    "site_title": "E-commerce ",
    "site_header": "Admin E-commerce",
    "site_brand": "Shop admin",
    "welcome_message": "¡Hola, Administrador! 👋 Gestiona tu tienda desde aquí.",
    "site_icon": "fas fa-store",

    "order_with_respect_to": [
        "auth",
        "categorias",
        "inventario",
        "orders",
        "preferencias",
        "sensores",
    ],

    "app_icons": {
        "auth": "fas fa-users-cog",
        "categorias": "fas fa-tags",
        "inventario": "fas fa-warehouse",
        "orders": "fas fa-receipt",
        "preferencias": "fas fa-star",
        "sensores": "fas fa-microchip",
    },

    "index_context": {
        "dashboard_cards": [
            {"title": "Ventas Hoy", "value": "S/ XXXX.XX", "icon": "fas fa-chart-line", "color": "success"},
            {"title": "Órdenes Pendientes", "value": "XX", "icon": "fas fa-clock", "color": "warning"},
            {"title": "Stock Crítico", "value": "XX", "icon": "fas fa-exclamation-triangle", "color": "danger"},
            {"title": "Categorías Totales", "value": "XX", "icon": "fas fa-tags", "color": "info"},
        ]
    }
}
