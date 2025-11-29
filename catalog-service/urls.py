"""
URL configuration for lab08 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('categorias.urls')),
    path('api/', include('inventario.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('sensores.urls')),
    path('api/', include('preferencias.urls')),
    path('api/', include('comentarios.urls')),
    path('api/', include('marketing.urls')),
    path('api/cupones/', include('cupones.urls')),  # ← NUEVA RUTA
]

# Servir archivos media (siempre, no solo en DEBUG para Docker)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
