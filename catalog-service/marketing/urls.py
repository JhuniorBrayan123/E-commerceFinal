from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Banner_ViewSet

router = DefaultRouter()
router.register(r'banners', Banner_ViewSet)


urlpatterns = [
    path('', include(router.urls)),
]