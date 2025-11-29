from django.shortcuts import render
from .models import Comentario
from rest_framework.viewsets import ModelViewSet
from .serializers import ComentarioSerializer


class Comentario_ViewSet(ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer 

    def get_queryset(self):
        id_producto = self.request.query_params.get("producto_id", None)
        queryset = Comentario.objects.all()

        if id_producto:
            queryset = queryset.filter(id_producto=id_producto)

        return queryset
