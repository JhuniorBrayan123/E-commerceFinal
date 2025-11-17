from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import MovimientoInventario
from .serializers import MovimientoInventarioSerializer
from productos.models import Producto


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['producto', 'tipo']
    ordering_fields = ['fecha', 'cantidad']
    ordering = ['-fecha']

    @action(detail=False, methods=['post'])
    def registrar_movimiento(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def historial(self, request):
        producto_id = request.query_params.get('producto_id', None)
        if producto_id:
            movimientos = MovimientoInventario.objects.filter(producto_id=producto_id)
            serializer = self.get_serializer(movimientos, many=True)
            return Response(serializer.data)
        movimientos = MovimientoInventario.objects.all()
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stock_actual(self, request):
        producto_id = request.query_params.get('producto_id', None)
        if producto_id:
            try:
                producto = Producto.objects.get(id=producto_id)
                return Response({
                    'producto_id': producto.id,
                    'producto_nombre': producto.nombre,
                    'stock_actual': producto.stock
                })
            except Producto.DoesNotExist:
                return Response(
                    {'error': 'Producto no encontrado'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {'error': 'producto_id es requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

