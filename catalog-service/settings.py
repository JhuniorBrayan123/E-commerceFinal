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

DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition - CONFIGURACIÓN CORREGIDA
INSTALLED_APPS = [
    'jazzmin', # Agregado para el diseño moderno (IMPORTANTE: Debe ser la primera app)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    
    # TUS APPS - CONFIGURACIÓN CORRECTA
    'categorias.apps.CategoriasConfig',
    'productos.apps.ProductosConfig', 
    'inventario.apps.InventarioConfig',
    'orders.apps.OrdersConfig',
    'preferencias.apps.PreferenciasConfig',
    'sensores.apps.SensoresConfig',
]

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

# CORRECCIÓN DE UN PROBLEMA DE CONFIGURACIÓN
# Si tu ROOT_URLCONF no especifica el proyecto, Django puede tener problemas con las rutas.
# Si tu carpeta de proyecto principal se llama 'ecommerce', debe ir así:
# ROOT_URLCONF = 'ecommerce.urls' 
# Basado en tu archivo de URLs, la ruta correcta es:
ROOT_URLCONF = 'urls'

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

# BASE DE DATOS - SQLITE PARA DESARROLLO
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

"""
# CONFIGURACIÓN MYSQL (PARA CUANDO ESTÉ LISTO)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ecommerce_db',
        'USER': 'root',
        'PASSWORD': 'tu_password',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}
"""

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

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (imágenes de productos)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CONFIGURACIÓN DE CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_ALL_ORIGINS = True  # Para desarrollo

# Permitir métodos HTTP
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]

# Permitir headers
CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-requested-with',
]



# ==============================================================================
# CONFIGURACIÓN DE DJANGO JAZZMIN (DISEÑO Y ORGANIZACIÓN)
# ==============================================================================

# --- 1. CONFIGURACIÓN DE APARIENCIA (TWEAKS) ---
JAZZMIN_UI_TWEAKS = {
    "navbar_fixed": True,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-success", # Sidebar oscuro con acento verde
    "accent": "accent-success",        # Resaltado en color verde
    "navbar_colour": "navbar-dark",    # Barra superior oscura
    "brand_colour": "navbar-dark",     # Logo oscuro
    "sidebar_nav_small_text": False,
    "body_small_text": False,
}

# --- 2. CONFIGURACIÓN DEL MENÚ Y DASHBOARD (SETTINGS) ---
JAZZMIN_SETTINGS = {
    # Títulos
    "site_title": "E-commerce JOSHU",
    "site_header": "Admin E-commerce",
    "site_brand": "JOSHU Shop",
    "welcome_message": "¡Hola, Administrador! 👋 Gestiona tu tienda desde aquí.",
    "site_icon": "fas fa-store", 

    # 1. ORDEN Y AGRUPACIÓN DEL MENÚ (Orden solicitado)
    "order_with_respect_to": [
        "auth",             # 1. Joshua/Auth (Usuarios/Grupos)
        "categorias",       # 2. Categorias
        "productos",        # 3. Productos
        "inventario",       # 4. Inventario
        "orders",           # 5. Orders (Órdenes e Items)
        "preferencias",     # 6. Preferencias
        "sensores",         # 7. Sensores
    ],

    # 2. Iconos para las aplicaciones
    "app_icons": {
        "auth": "fas fa-users-cog",
        "categorias": "fas fa-tags",
        "productos": "fas fa-box-open",
        "inventario": "fas fa-warehouse",
        "orders": "fas fa-receipt",
        "preferencias": "fas fa-star",
        "sensores": "fas fa-microchip",
    },
    
    # 3. INYECCIÓN DE MÉTRICAS AL DASHBOARD (Para que aparezcan los cuadros)
    "index_context": {
        # Usamos valores estáticos como marcadores de posición, ya que la vista dinámica falló.
        "dashboard_cards": [
            { "title": "Ventas Hoy", "value": "S/ XXXX.XX", "icon": "fas fa-chart-line", "color": "success", },
            { "title": "Órdenes Pendientes", "value": "XX", "icon": "fas fa-clock", "color": "warning", },
            { "title": "Stock Crítico", "value": "XX", "icon": "fas fa-exclamation-triangle", "color": "danger", },
            { "title": "Categorías Totales", "value": "XX", "icon": "fas fa-tags", "color": "info", },
        ]
    }
}