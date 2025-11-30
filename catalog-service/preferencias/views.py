from django.shortcuts import render
from .models import Categoria_Favorita, Marca_Favorita
from rest_framework.viewsets import ModelViewSet
from .serializers import Categoria_FavoritaSerializer, Marca_FavoritaSerializer
from sensores.models import Sensor
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from sensores.serializers import SensorSerializer

class Categoria_Favorita_ViewSet(ModelViewSet):
    queryset = Categoria_Favorita.objects.all()
    serializer_class = Categoria_FavoritaSerializer 


class Marca_Favorita_ViewSet(ModelViewSet):
    queryset = Marca_Favorita.objects.all()
    serializer_class = Marca_FavoritaSerializer


class RecomendacionesView(APIView):
    def get(self, request, user_id):
        # buscar categoria favorita
        categoria_fav = Categoria_Favorita.objects.filter(id_user=user_id).first()

        # buscar marca favorita
        marca_fav = Marca_Favorita.objects.filter(id_user=user_id).first()

        # si no hay favoritos retornamos vacío
        if not categoria_fav and not marca_fav:
            return Response({"por_categoria": [], "por_marca": []})

        # filtrar sensores por categoria (max 3)
        sensores_categoria = []
        if categoria_fav:
            sensores_categoria = Sensor.objects.filter(
                categoria=categoria_fav.id_categoria
            )[:3]

        # filtrar sensores por marca (max 2)
        sensores_marca = []
        if marca_fav:
            sensores_marca = Sensor.objects.filter(
                marca=marca_fav.marca
            )[:2]

        # serializar manualmente (simple)
        data = {
            "por_categoria":SensorSerializer(sensores_categoria, many=True).data,
            "por_marca": SensorSerializer(sensores_marca, many=True).data
        }

        return Response(data, status=status.HTTP_200_OK)