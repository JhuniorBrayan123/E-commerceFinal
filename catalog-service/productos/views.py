from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto
from .serializers import ProductoSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'estado']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'stock', 'fecha_creacion', 'nombre']
    ordering = ['-fecha_creacion']

    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        categoria_id = request.query_params.get('categoria_id', None)
        if categoria_id:
            productos = Producto.objects.filter(categoria_id=categoria_id, estado='activo')
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response({'error': 'categoria_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def buscar(self, request):
        query = request.query_params.get('q', '')
        if query:
            productos = Producto.objects.filter(
                nombre__icontains=query,
                estado='activo'
            ) | Producto.objects.filter(
                descripcion__icontains=query,
                estado='activo'
            )
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response({'error': 'Parámetro q es requerido'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def activos(self, request):
        productos = Producto.objects.filter(estado='activo')
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

