from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from productos.models import Producto
from inventario.models import MovimientoInventario
from .models import Orden, ItemOrden
from .serializers import CrearOrdenSerializer, OrdenSerializer


@api_view(['POST'])
def crear_orden(request):
    """
    Endpoint para crear órdenes desde Spring Boot
    Recibe: usuario_id, productos (lista con producto_id y cantidad), total
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
    for item_data in data['productos']:
        producto_id = item_data['producto_id']
        cantidad = item_data['cantidad']
        
        try:
            producto = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            orden.delete()
            return Response(
                {'error': f'Producto con id {producto_id} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar stock
        if producto.stock < cantidad:
            orden.delete()
            return Response(
                {'error': f'Stock insuficiente para el producto {producto.nombre}. Stock disponible: {producto.stock}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear item de orden
        ItemOrden.objects.create(
            orden=orden,
            producto=producto,
            cantidad=cantidad,
            precio_unitario=producto.precio,
            subtotal=producto.precio * cantidad
        )
        
        # Registrar movimiento de inventario (salida)
        MovimientoInventario.objects.create(
            producto=producto,
            tipo='salida',
            cantidad=cantidad,
            motivo=f'Venta - Orden #{orden.id}',
            observaciones=f'Orden creada desde Spring Boot'
        )
    
    # Retornar la orden creada
    orden_serializer = OrdenSerializer(orden)
    return Response(orden_serializer.data, status=status.HTTP_201_CREATED)

