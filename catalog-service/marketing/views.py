from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import BannerSerializer
from .models import Banner


class Banner_ViewSet(ModelViewSet):
    serializer_class = BannerSerializer 
    
    def get_queryset(self):
        return Banner.objects.filter(activo=True).order_by('orden')