# URL configuration for lab08 project.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 1. IMPORTACIÓN CLAVE: ELIMINAR la importación de la vista del dashboard personalizada
# from admin import dashboard_view # ESTA LÍNEA DEBE SER ELIMINADA

urlpatterns = [
    # 1. SOLO DEJA LA RUTA ORIGINAL DE DJANGO ADMIN. 
    # Jazzmin la interceptará y le aplicará el tema y el contexto de settings.py.
    path('admin/', admin.site.urls),
    
    # 2. Tus URLs de API (sin cambios)
    path('api/', include('categorias.urls')),
<<<<<<< HEAD
    # REMOVIDA: path('api/', include('productos.urls')), 
=======
>>>>>>> 68ad260fce0b60c78ddb09b2d6b4fe40aa1026eb
    path('api/', include('inventario.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('sensores.urls')), # <-- Esta es la ruta correcta
    path('api/', include('preferencias.urls')),
    path('api/', include('comentarios.urls')),
    path('api/', include('marketing.urls')),
    path('api/cupones/', include('cupones.urls')),  # ← NUEVA RUTA
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
<<<<<<< HEAD
    # urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
=======

>>>>>>> 68ad260fce0b60c78ddb09b2d6b4fe40aa1026eb
