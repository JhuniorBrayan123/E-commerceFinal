from django.shortcuts import render
from .models import Categoria_Favorita, Marca_Favorita
from rest_framework.viewsets import ModelViewSet
from .serializers import Categoria_FavoritaSerializer, Marca_FavoritaSerializer

class Categoria_Favorita_ViewSet(ModelViewSet):
    queryset = Categoria_Favorita.objects.all()
    serializer_class = Categoria_FavoritaSerializer 


class Marca_Favorita_ViewSet(ModelViewSet):
    queryset = Marca_Favorita.objects.all()
    serializer_class = Marca_FavoritaSerializer
