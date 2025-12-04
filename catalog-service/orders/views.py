from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
# CORRECCIÓN 1: Cambiar 'productos' a 'sensores' y 'Producto' a 'Sensor'
from sensores.models import Sensor
from inventario.models import MovimientoInventario
from .models import Orden, ItemOrden
from .serializers import CrearOrdenSerializer, OrdenSerializer


@api_view(['POST'])
def crear_orden(request):
    """
    Endpoint para crear órdenes desde Spring Boot
    Recibe: usuario_id, sensores (lista con sensor_id y cantidad), total
    """
    serializer = CrearOrdenSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    try:
        usuario = User.objects.get(id=data['usuario_id'])
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Crear la orden
    orden = Orden.objects.create(
        usuario=usuario,
        total=data['total'],
        estado='pendiente'
    )
    
    # Crear items de la orden y actualizar stock
    for item_data in data['sensores']:
        sensor_id = item_data['sensor_id']
        cantidad = item_data['cantidad']
        
        try:
            # CORRECCIÓN 2: Usar Sensor.objects.get
            producto = Sensor.objects.get(id=sensor_id)
        # CORRECCIÓN 3: Usar Sensor.DoesNotExist
            sensor = Sensor.objects.get(id=sensor_id)
        except Sensor.DoesNotExist:
            orden.delete()
            return Response(
                {'error': f'Sensor con id {sensor_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar stock
        if sensor.stock < cantidad:
            orden.delete()
            return Response(
                {'error': f'Stock insuficiente para el sensor {sensor.nombre}. Stock disponible: {sensor.stock}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear item de orden
        ItemOrden.objects.create(
            orden=orden,
            producto=producto, # 'producto' es ahora un objeto Sensor
            sensor=sensor,
            cantidad=cantidad,
            precio_unitario=sensor.precio,
            subtotal=sensor.precio * cantidad
        )
        
        # Registrar movimiento de inventario (salida)
        MovimientoInventario.objects.create(
            producto=producto, # 'producto' es ahora un objeto Sensor
            sensor=sensor,
            tipo='salida',
            cantidad=cantidad,
            motivo=f'Venta - Orden #{orden.id}',
            observaciones=f'Orden creada desde Spring Boot'
        )
    
    # Retornar la orden creada
    orden_serializer = OrdenSerializer(orden)
    return Response(orden_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def sincronizar_orden_pago(request):
    """
    Recibe la confirmación de un pago desde Spring Boot
    (por ahora solo devuelve un mensaje para que Django no falle)
    """
    return Response({"message": "Sincronización de pago recibida"})


@api_view(['GET'])
def obtener_info_sensor(request, sensor_id):
    """
    Devuelve información básica de un sensor para que Spring Boot pueda consultarla
    """
    try:
        # CORRECCIÓN 4: Usar Sensor.objects.get
        producto = Sensor.objects.get(id=sensor_id)
    # CORRECCIÓN 5: Usar Sensor.DoesNotExist
        sensor = Sensor.objects.get(id=sensor_id)
    except Sensor.DoesNotExist:
        return Response(
            {'error': 'Sensor no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    data = {
        "id": sensor.id,
        "nombre": sensor.nombre,
        "precio": sensor.precio,
        "stock": sensor.stock,
        "categoria": sensor.categoria.nombre if sensor.categoria else None
    }

    return Response(data, status=status.HTTP_200_OK)
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
def mis_pedidos(request):
    """
    Obtiene todas las órdenes del usuario autenticado
    """
    # Verificar autenticación (si usas JWT u otro método)
    # Por simplicidad, usamos el parámetro user_id si está disponible
    user_id = request.query_params.get('user_id')
    
    if not user_id:
        return Response(
            {'error': 'Se requiere user_id'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        usuario = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Obtener órdenes del usuario ordenadas por fecha más reciente
    ordenes = Orden.objects.filter(usuario=usuario).order_by('-fecha_creacion')
    serializer = OrdenSerializer(ordenes, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

