from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuponViewSet, UsoCuponViewSet, validar_cupon, registrar_uso_cupon

router = DefaultRouter()
router.register(r'cupones', CuponViewSet, basename='cupon')
router.register(r'usos', UsoCuponViewSet, basename='uso-cupon')

urlpatterns = [
    # Endpoint para validar cupón
    path('validate/', validar_cupon, name='validar-cupon'),
    
    # Endpoint para registrar uso de cupón
    path('register-use/', registrar_uso_cupon, name='registrar-uso-cupon'),
    
    # Rutas del router (CRUD)
    path('', include(router.urls)),
]
