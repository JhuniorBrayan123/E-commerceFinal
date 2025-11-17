from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from django.db.models import Q, Avg, Min, Max, Count
from django.db import models

from .models import Sensor
from .serializers import SensorSerializer

class IndexView(APIView):
    """Endpoint raíz para verificar que el servidor está activo"""
    def get(self, request):
        context = {
            'mensaje': 'Servidor de Sensores Agrícolas activo',
            'version': '1.0',
            'endpoints': {
                'sensores': '/sensores/',
                'detalle': '/sensores/<id>/',
                'stats': '/stats/',
                'filtros': '/sensores/?tipo=humedad&marca=DHT&disponible=true&search=query&ordering=-precio'
            }
        }
        return Response(context)

@method_decorator(csrf_exempt, name='dispatch')
class SensoresView(APIView):
    """
    Vista para listar y crear sensores
    GET: Lista sensores con filtros opcionales
    POST: Crear un nuevo sensor
    """
    
    def get(self, request):
        # Obtener parámetros de filtro, búsqueda y ordenamiento
        tipo_filter = request.GET.get('tipo', None)
        marca_filter = request.GET.get('marca', None)
        disponible_filter = request.GET.get('disponible', None)
        search_query = request.GET.get('search', None)
        ordering = request.GET.get('ordering', '-fecha_creacion')
        
        # Base queryset
        sensores = Sensor.objects.all()
        
        # Aplicar filtros
        if tipo_filter:
            sensores = sensores.filter(tipo=tipo_filter)
        if marca_filter:
            sensores = sensores.filter(marca__icontains=marca_filter)
        if disponible_filter is not None:
            sensores = sensores.filter(disponible=disponible_filter.lower() == 'true')
        
        # Aplicar búsqueda
        if search_query:
            sensores = sensores.filter(
                Q(nombre__icontains=search_query) |
                Q(marca__icontains=search_query) |
                Q(modelo__icontains=search_query) |
                Q(descripcion__icontains=search_query)
            )
        
        # Aplicar ordenamiento
        valid_ordering_fields = ['id', 'nombre', 'precio', 'marca', 'tipo', 'stock', 'fecha_creacion']
        if ordering.lstrip('-') in valid_ordering_fields:
            sensores = sensores.order_by(ordering)
        else:
            sensores = sensores.order_by('-fecha_creacion')
        
        # Serializar y retornar
        serializer = SensorSerializer(sensores, many=True)
        
        # Agregar metadata útil en la respuesta
        response_data = {
            'count': sensores.count(),
            'filters_applied': {
                'tipo': tipo_filter,
                'marca': marca_filter,
                'disponible': disponible_filter,
                'search': search_query,
                'ordering': ordering
            },
            'sensores': serializer.data
        }
        
        return Response(response_data)
    
    def post(self, request):
        """Crear un nuevo sensor"""
        serializer = SensorSerializer(data=request.data)
        
        if serializer.is_valid():
            sensor = serializer.save()
            return Response(
                {'mensaje': 'Sensor creado exitosamente', 'sensor': serializer.data},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class SensorDetailView(APIView):
    """
    Vista para obtener, actualizar y eliminar un sensor específico
    GET: Obtener detalles de un sensor
    PUT: Actualizar un sensor
    PATCH: Actualización parcial
    DELETE: Eliminar un sensor
    """
    
    def get(self, request, sensor_id):
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor)
            return Response(serializer.data)
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, sensor_id):
        """Actualización completa"""
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor, data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'mensaje': 'Sensor actualizado exitosamente',
                    'sensor': serializer.data
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request, sensor_id):
        """Actualización parcial"""
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'mensaje': 'Sensor actualizado parcialmente',
                    'sensor': serializer.data
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, sensor_id):
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor)
            sensor.delete()
            return Response(
                {'mensaje': f'Sensor eliminado correctamente', 'sensor_eliminado': serializer.data},
                status=status.HTTP_200_OK
            )
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )

@method_decorator(csrf_exempt, name='dispatch')
class SensorStatsView(APIView):
    """Vista para obtener estadísticas de sensores"""
    
    def get(self, request):
        total_sensores = Sensor.objects.count()
        
        stats = {
            'total_sensores': total_sensores,
            'sensores_disponibles': Sensor.objects.filter(disponible=True).count(),
            'sensores_agotados': Sensor.objects.filter(stock=0).count(),
            'sensores_con_stock': Sensor.objects.filter(stock__gt=0).count(),
            'precio_promedio': Sensor.objects.aggregate(Avg('precio'))['precio__avg'],
            'precio_minimo': Sensor.objects.aggregate(Min('precio'))['precio__min'],
            'precio_maximo': Sensor.objects.aggregate(Max('precio'))['precio__max'],
            'stock_total': Sensor.objects.aggregate(models.Sum('stock'))['stock__sum'] or 0,
            'por_tipo': dict(
                Sensor.objects.values('tipo').annotate(count=Count('id')).values_list('tipo', 'count')
            ),
            'por_marca': dict(
                Sensor.objects.values('marca').annotate(count=Count('id')).values_list('marca', 'count')
            ),
        }
        return Response(stats)

@method_decorator(csrf_exempt, name='dispatch')
class SensorFilterView(APIView):
    """Vista para obtener opciones disponibles de filtrado"""
    
    def get(self, request):
        tipos = [{'value': t[0], 'label': t[1]} for t in Sensor.TIPO_SENSOR]
        marcas = list(Sensor.objects.values_list('marca', flat=True).distinct())
        
        filters = {
            'tipos': tipos,
            'marcas': sorted(marcas),
        }
        return Response(filters)
