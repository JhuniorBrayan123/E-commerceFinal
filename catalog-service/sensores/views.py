from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from django.db.models import Q, Avg, Min, Max, Count
from django.db import models
from categorias.models import Categoria

from .models import Sensor
from .serializers import SensorSerializer

# Importar Paginación de DRF
from rest_framework.pagination import PageNumberPagination

# Definir una clase de paginación si se necesita personalizar, si no, se usa la de settings.py
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20  # Sobrescribir o usar el valor de settings
    page_size_query_param = 'page_size'
    max_page_size = 100

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
    Vista para listar y crear sensores (Implementando paginación)
    GET: Lista sensores con filtros opcionales
    POST: Crear un nuevo sensor
    """
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        # Inicializar paginador
        paginator = self.pagination_class()

        # Obtener parámetros de filtro, búsqueda y ordenamiento
        tipo_filter = request.GET.get('categoria', None)
        marca_filter = request.GET.get('marca', None)
        rango_filter = request.GET.get('rango', None)
        precio_min = request.GET.get('precio_min', None)
        precio_max = request.GET.get('precio_max', None)
        disponible_filter = request.GET.get('disponible', None)
        stock_min = request.GET.get('stock_min', None)
        modelo_filter = request.GET.get('modelo', None)
        protocolo_filter = request.GET.get('protocolo', None)
        search_query = request.GET.get('search', None)
        ordering = request.GET.get('ordering', '-fecha_creacion')
        
        # Base queryset
        sensores = Sensor.objects.all()
        
        # Aplicar filtros (código existente)
        if tipo_filter:
            sensores = sensores.filter(categoria=tipo_filter)
        if marca_filter:
            sensores = sensores.filter(marca__icontains=marca_filter)
        if rango_filter:
            sensores = sensores.filter(rango_medicion__icontains=rango_filter)
        if precio_min:
            try:
                precio_min_decimal = float(precio_min)
                sensores = sensores.filter(precio__gte=precio_min_decimal)
            except (ValueError, TypeError):
                pass
        if precio_max:
            try:
                precio_max_decimal = float(precio_max)
                sensores = sensores.filter(precio__lte=precio_max_decimal)
            except (ValueError, TypeError):
                pass
        if disponible_filter is not None:
            sensores = sensores.filter(disponible=disponible_filter.lower() == 'true')
        if stock_min:
            try:
                stock_min_int = int(stock_min)
                sensores = sensores.filter(stock__gte=stock_min_int)
            except (ValueError, TypeError):
                pass
        if modelo_filter:
            sensores = sensores.filter(modelo__icontains=modelo_filter)
        if protocolo_filter:
            sensores = sensores.filter(protocolo_comunicacion__icontains=protocolo_filter)
        
        # Aplicar búsqueda (código existente)
        if search_query:
            sensores = sensores.filter(
                Q(nombre__icontains=search_query) |
                Q(marca__icontains=search_query) |
                Q(modelo__icontains=search_query) |
                Q(descripcion__icontains=search_query) |
                Q(rango_medicion__icontains=search_query) |
                Q(protocolo_comunicacion__icontains=search_query)
            )
        
        # Aplicar ordenamiento (código existente)
        valid_ordering_fields = ['id', 'nombre', 'precio', 'marca', 'categoria', 'stock', 'fecha_creacion']
        if ordering.lstrip('-') in valid_ordering_fields:
            sensores = sensores.order_by(ordering)
        else:
            sensores = sensores.order_by('-fecha_creacion')
        
        # Aplicar paginación
        page = paginator.paginate_queryset(sensores, request, view=self)
        
        # Serializar y retornar
        serializer = SensorSerializer(page, many=True, context={'request': request})
        
        # Retornar respuesta paginada con metadata (DRF se encarga del formato)
        # return paginator.get_paginated_response(serializer.data)
        
        # Si prefieres tu formato de respuesta original con la paginación manual:
        response_data = {
             'count': sensores.count(), # Total sin paginación
             'next': paginator.get_next_link(),
             'previous': paginator.get_previous_link(),
             'filters_applied': {
                 'categoria': tipo_filter,
                 'marca': marca_filter,
                 'rango': rango_filter,
                 'precio_min': precio_min,
                 'precio_max': precio_max,
                 'disponible': disponible_filter,
                 'stock_min': stock_min,
                 'modelo': modelo_filter,
                 'protocolo': protocolo_filter,
                 'search': search_query,
                 'ordering': ordering
             },
             'sensores': serializer.data
        }
        
        # Usar la respuesta estándar de paginación para mantener la coherencia con DRF
        return paginator.get_paginated_response(serializer.data)

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
    PUT: Actualizar un sensor (Reemplazo Total)
    PATCH: Actualización parcial (Corregido: usa partial=True)
    DELETE: Eliminar un sensor
    """
    
    def get(self, request, sensor_id):
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            serializer = SensorSerializer(sensor, context={'request': request})
            return Response(serializer.data)
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, sensor_id):
        """Actualización completa (Requiere todos los campos)"""
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            # PUT por defecto NO usa partial=True, forzando la validación de todos los campos
            serializer = SensorSerializer(sensor, data=request.data) 
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'mensaje': 'Sensor actualizado exitosamente (Reemplazo Total)',
                    'sensor': serializer.data
                })
            else:
                # Si falló la prueba de Postman (PUT 23) fue porque no enviaste todos los campos
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Sensor.DoesNotExist:
            return Response(
                {'error': f'Sensor con ID {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request, sensor_id):
        """Actualización parcial (Permite actualizar solo algunos campos)"""
        try:
            sensor = Sensor.objects.get(pk=sensor_id)
            # CORRECCIÓN: partial=True permite la actualización parcial (solo los campos enviados)
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

# ... (El resto de las clases IndexView, SensorStatsView, SensorFilterView y DeductStockView permanecen sin cambios)

# ... (Código de SensorStatsView)
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
                Sensor.objects.values('categoria').annotate(count=Count('id')).values_list('categoria', 'count')
            ),
            'por_marca': dict(
                Sensor.objects.values('marca').annotate(count=Count('id')).values_list('marca', 'count')
            ),
        }
        return Response(stats)

# ... (Código de SensorFilterView)
@method_decorator(csrf_exempt, name='dispatch')
class SensorFilterView(APIView):
    """Vista para obtener opciones disponibles de filtrado"""
    
    def get(self, request):
        categorias = [
            {'value': c.id, 'label': c.nombre}
            for c in Categoria.objects.all()
        ]
        marcas = list(Sensor.objects.values_list('marca', flat=True).distinct())
        rangos = list(Sensor.objects.values_list('rango_medicion', flat=True).distinct())
        modelos = list(Sensor.objects.values_list('modelo', flat=True).distinct())
        protocolos = list(Sensor.objects.values_list('protocolo_comunicacion', flat=True).distinct())
        
        # Obtener precio mínimo y máximo para los filtros
        precio_min = Sensor.objects.aggregate(Min('precio'))['precio__min']
        precio_max = Sensor.objects.aggregate(Max('precio'))['precio__max']
        stock_max = Sensor.objects.aggregate(Max('stock'))['stock__max']
        
        filters = {
            'categorias': categorias,
            'marcas': sorted(marcas),
            'rangos': sorted(set(rangos)) if rangos else [],
            'modelos': sorted(set(modelos)) if modelos else [],
            'protocolos': sorted(set(protocolos)) if protocolos else [],
            'precio_min': float(precio_min) if precio_min else 0,
            'precio_max': float(precio_max) if precio_max else 0,
            'stock_max': int(stock_max) if stock_max else 0,
        }
        return Response(filters)


# ... (Código de DeductStockView)
@method_decorator(csrf_exempt, name='dispatch')
class DeductStockView(APIView):
    """
    Vista para descontar stock de sensores después de un pago exitoso
    POST: Recibe una lista de items con sensor_id y cantidad para descontar
    """
    
    def post(self, request):
        

        try:
            print("\n===== DEDUCT STOCK DEBUG =====")
            print("RAW BODY:", request.body.decode('utf-8'))
            print("CONTENT TYPE:", request.content_type)
            print("PARSED DATA:", request.data)
            print("================================\n")
            items = request.data

            if not isinstance(items, list):
                return Response(
                    {'error': 'Se requiere una lista JSON de items'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            
            results = []
            errors = []
            
            for item in items:
                sensor_id = item.get('sensor_id')
                cantidad = item.get('cantidad')
                
                if not sensor_id or not cantidad:
                    errors.append({
                        'item': item,
                        'error': 'sensor_id y cantidad son requeridos'
                    })
                    continue
                
                try:
                    sensor = Sensor.objects.get(pk=sensor_id)
                    
                    # Verificar que hay suficiente stock
                    if sensor.stock < cantidad:
                        errors.append({
                            'sensor_id': sensor_id,
                            'error': f'Stock insuficiente. Disponible: {sensor.stock}, Solicitado: {cantidad}'
                        })
                        continue
                    
                    # Descontar el stock
                    sensor.stock -= cantidad
                    
                    # Si el stock llega a 0, marcar como no disponible
                    if sensor.stock == 0:
                        sensor.disponible = False
                    
                    sensor.save()
                    
                    results.append({
                        'sensor_id': sensor_id,
                        'nombre': sensor.nombre,
                        'cantidad_descontada': cantidad,
                        'stock_restante': sensor.stock
                    })
                    
                except Sensor.DoesNotExist:
                    errors.append({
                        'sensor_id': sensor_id,
                        'error': f'Sensor con ID {sensor_id} no encontrado'
                    })
                except Exception as e:
                    errors.append({
                        'sensor_id': sensor_id,
                        'error': f'Error al descontar stock: {str(e)}'
                    })
            
            response_data = {
                'success': len(errors) == 0,
                'message': f'Stock descontado para {len(results)} sensores',
                'results': results
            }
            
            if errors:
                response_data['errors'] = errors
                response_data['message'] += f', {len(errors)} errores'
            
            # Si hay errores pero también resultados, retornar 207 (Multi-Status)
            # Si solo hay errores, retornar 400
            # Si todo está bien, retornar 200
            if errors and not results:
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            elif errors and results:
                return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
            else:
                return Response(response_data, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': f'Error al procesar la solicitud: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )