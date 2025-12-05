from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from .serializers import BannerSerializer
from .models import Banner


class Banner_ViewSet(ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        """Pasar el request al serializer para que pueda construir URLs correctas"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context