from django.urls import path
from .views import crear_orden

urlpatterns = [
    path('orders/create/', crear_orden, name='crear_orden'),
]

