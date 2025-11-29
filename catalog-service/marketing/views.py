from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import BannerSerializer
from .models import Banner


class Banner_ViewSet(ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer 