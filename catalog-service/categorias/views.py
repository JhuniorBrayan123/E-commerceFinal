from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria
from .serializers import CategoriaSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        categoria = self.get_object()
        productos = categoria.producto_set.all()
        from productos.serializers import ProductoSerializer
        serializer = ProductoSerializer(productos, many=True, context={'request': request})
        return Response(serializer.data)

