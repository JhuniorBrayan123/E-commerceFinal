from django.urls import path
from .views import crear_orden, sincronizar_orden_pago, obtener_info_producto

urlpatterns = [
    # Ruta original (no se toca)
    path('orders/create/', crear_orden, name='crear_orden'),

    # Rutas nuevas solicitadas
    path('sincronizar/', sincronizar_orden_pago, name='sincronizar-orden'),
    path('producto/<int:producto_id>/', obtener_info_producto, name='info-producto'),
]
