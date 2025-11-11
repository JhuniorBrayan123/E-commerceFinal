from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q

from .models import Sensor
from .serializers import SensorSerializer

class IndexView(APIView):
    def get(self, request):
        context = {'mensaje': 'Servidor de Sensores Agrícolas activo', 'version': '1.0'}
        return Response(context)

@method_decorator(csrf_exempt, name='dispatch')
class SensoresView(APIView):
    
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
            sensores = sensores.filter(marca=marca_filter)
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
        if ordering in ['nombre', 'precio', 'fecha_creacion', '-nombre', '-precio', '-fecha_creacion']:
            sensores = sensores.order_by(ordering)
        else:
            sensores = sensores.order_by('-fecha_creacion')  # Orden por defecto
        
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
        print("📦 Datos recibidos para crear sensor:", request.data)
        serializer = SensorSerializer(data=request.data)
        
        if serializer.is_valid():
            sensor = serializer.save()
            print(f"✅ Sensor creado exitosamente: {sensor.nombre}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class SensorDetailView(APIView):
    
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
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor, data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                print(f"✅ Sensor {sensor_id} actualizado exitosamente")
                return Response(serializer.data)
            else:
                print("❌ Errores de validación:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, sensor_id):
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor)  # Serializar antes de eliminar
            sensor.delete()
            print(f"✅ Sensor {sensor_id} eliminado exitosamente")
            return Response(
                {'mensaje': f'Sensor {sensor_id} eliminado correctamente', 'sensor_eliminado': serializer.data},
                status=status.HTTP_200_OK
            )
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Vista adicional para estadísticas de sensores
class SensorStatsView(APIView):
    def get(self, request):
        stats = {
            'total_sensores': Sensor.objects.count(),
            'sensores_disponibles': Sensor.objects.filter(disponible=True).count(),
            'sensores_agotados': Sensor.objects.filter(stock=0).count(),
            'por_tipo': {
                tipo: Sensor.objects.filter(tipo=tipo).count() 
                for tipo in ['humedad', 'temperatura', 'ph', 'luz', 'nutrientes', 'co2']
            },
            'precio_promedio': Sensor.objects.aggregate(models.Avg('precio'))['precio__avg']
        }
        return Response(stats)