from django.urls import path
from .views import (
    IndexView, 
    SensoresView, 
    SensorDetailView, 
    SensorStatsView,
    SensorFilterView
)

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('sensores/', SensoresView.as_view(), name='sensores-list'),
    path('sensores/<int:sensor_id>/', SensorDetailView.as_view(), name='sensor-detail'),
    path('stats/', SensorStatsView.as_view(), name='sensor-stats'),
    path('filters/', SensorFilterView.as_view(), name='sensor-filters'),
]