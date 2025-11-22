from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Categoria_Favorita_ViewSet, Marca_Favorita_ViewSet

router = DefaultRouter()
router.register(r'categoria_favorita', Categoria_Favorita_ViewSet)
router.register(r'marca_favorita', Marca_Favorita_ViewSet)

urlpatterns = router.urls