from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import MovimientoInventario
from .serializers import MovimientoInventarioSerializer
from sensores.models import Sensor


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['sensor', 'tipo']
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
        sensor_id = request.query_params.get('sensor_id', None)
            
        if sensor_id:
            movimientos = MovimientoInventario.objects.filter(sensor_id=sensor_id)
            serializer = self.get_serializer(movimientos, many=True)
            return Response(serializer.data)
        movimientos = MovimientoInventario.objects.all()
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stock_actual(self, request):
        sensor_id = request.query_params.get('sensor_id', None)
            
        if sensor_id:
            try:
<<<<<<< HEAD
                producto = Sensor.objects.get(id=producto_id)
=======
                sensor = Sensor.objects.get(id=sensor_id)
>>>>>>> 68ad260fce0b60c78ddb09b2d6b4fe40aa1026eb
                return Response({
                    'sensor_id': sensor.id,
                    'sensor_nombre': sensor.nombre,
                    'stock_actual': sensor.stock
                })
            except Sensor.DoesNotExist:
                return Response(
                    {'error': 'Sensor no encontrado'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {'error': 'sensor_id es requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

