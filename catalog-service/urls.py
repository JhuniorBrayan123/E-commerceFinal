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
    path('api/', include('productos.urls')),
    path('api/', include('inventario.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('sensores.urls')),
    path('api/', include('preferencias.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)