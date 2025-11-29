from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Comentario_ViewSet

router = DefaultRouter()
router.register(r'comentarios', Comentario_ViewSet)


urlpatterns = [
    path('', include(router.urls)),
]