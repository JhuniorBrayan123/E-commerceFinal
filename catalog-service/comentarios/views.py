from django.shortcuts import render
from .models import Comentario
from rest_framework.viewsets import ModelViewSet
from .serializers import ComentarioSerializer


class Comentario_ViewSet(ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer 

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_queryset(self):
        sensor_id = self.request.query_params.get("sensor_id", None)
        queryset = Comentario.objects.all()

        if sensor_id:
            queryset = queryset.filter(id_sensor=sensor_id)

        return queryset.order_by('-fecha_creacion')
