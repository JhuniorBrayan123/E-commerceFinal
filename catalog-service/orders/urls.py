from django.urls import path
from .views import crear_orden, sincronizar_orden_pago, obtener_info_sensor, mis_pedidos

urlpatterns = [
    # Ruta original (no se toca)
    path('orders/create/', crear_orden, name='crear_orden'),

    # Rutas nuevas solicitadas
    path('sincronizar/', sincronizar_orden_pago, name='sincronizar-orden'),
    path('sensor/<int:sensor_id>/', obtener_info_sensor, name='info-sensor'),
    
    # Nueva ruta para historial de pedidos del usuario
    path('mis-pedidos/', mis_pedidos, name='mis-pedidos'),
]
