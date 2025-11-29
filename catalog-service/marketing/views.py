from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import BannerSerializer
from .models import Banner


class Banner_ViewSet(ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    
    def get_serializer_context(self):
        """Pasar el request al serializer para que pueda construir URLs correctas"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context 