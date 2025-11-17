from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovimientoInventarioViewSet

router = DefaultRouter()
router.register(r'inventario', MovimientoInventarioViewSet, basename='inventario')

urlpatterns = [
    path('', include(router.urls)),
]

