from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Cupon, UsoCupon
from .serializers import CuponSerializer, ValidarCuponSerializer, UsoCuponSerializer
from decimal import Decimal


@api_view(['POST'])
def validar_cupon(request):
    """
    Endpoint para validar un cupón y calcular el descuento
    POST /api/cupones/validate/
    Body: {
        "codigo": "VERANO2025",
        "total": 100.00,
        "usuario_id": 1 (opcional)
    }
    """
    serializer = ValidarCuponSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'valid': False,
            'message': 'Datos inválidos',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    codigo = serializer.validated_data['codigo']
    total = serializer.validated_data['total']
    usuario_id = serializer.validated_data.get('usuario_id')
    
    try:
        cupon = Cupon.objects.get(codigo=codigo)
    except Cupon.DoesNotExist:
        return Response({
            'valid': False,
            'message': f'El cupón "{codigo}" no existe',
            'discount': 0
        }, status=status.HTTP_200_OK)
    
    # Validar si el cupón está activo
    if not cupon.activo:
        return Response({
            'valid': False,
            'message': f'El cupón "{codigo}" está desactivado',
            'discount': 0
        }, status=status.HTTP_200_OK)
    
    # Validar vigencia
    if not cupon.esta_vigente():
        ahora = timezone.now()
        if ahora < cupon.fecha_inicio:
            return Response({
                'valid': False,
                'message': f'El cupón "{codigo}" aún no está vigente',
                'discount': 0
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'message': f'El cupón "{codigo}" ha expirado',
                'discount': 0
            }, status=status.HTTP_200_OK)
    
    # Validar usos disponibles
    if not cupon.tiene_usos_disponibles():
        return Response({
            'valid': False,
            'message': f'El cupón "{codigo}" ha alcanzado su límite de usos',
            'discount': 0
        }, status=status.HTTP_200_OK)
    
    # Validar monto mínimo
    if total < cupon.monto_minimo:
        return Response({
            'valid': False,
            'message': f'El monto mínimo para usar este cupón es S/{cupon.monto_minimo}',
            'discount': 0,
            'monto_minimo': float(cupon.monto_minimo)
        }, status=status.HTTP_200_OK)
    
    # Validar usos por usuario
    if usuario_id:
        usos_usuario = UsoCupon.objects.filter(
            cupon=cupon,
            usuario_id=usuario_id
        ).count()
        
        if usos_usuario >= cupon.usos_por_usuario:
            return Response({
                'valid': False,
                'message': f'Ya has usado este cupón el máximo de veces permitido',
                'discount': 0
            }, status=status.HTTP_200_OK)
    
    # Calcular descuento
    descuento = cupon.calcular_descuento(total)
    
    return Response({
        'valid': True,
        'message': f'Cupón válido',
        'discount': float(descuento),
        'cupon_info': {
            'codigo': cupon.codigo,
            'descripcion': cupon.descripcion,
            'tipo': cupon.tipo_descuento,
            'valor': float(cupon.valor_descuento)
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def registrar_uso_cupon(request):
    """
    Endpoint para registrar el uso de un cupón después de completar la compra
    POST /api/cupones/register-use/
    Body: {
        "codigo": "VERANO2025",
        "usuario_id": 1,
        "order_id": 123,
        "monto_descuento": 20.00,
        "monto_original": 100.00
    }
    """
    codigo = request.data.get('codigo')
    usuario_id = request.data.get('usuario_id')
    order_id = request.data.get('order_id')
    monto_descuento = request.data.get('monto_descuento')
    monto_original = request.data.get('monto_original')
    
    if not all([codigo, usuario_id, monto_descuento, monto_original]):
        return Response({
            'success': False,
            'message': 'Faltan campos requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        cupon = Cupon.objects.get(codigo=codigo)
    except Cupon.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Cupón no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Registrar uso
    uso = UsoCupon.objects.create(
        cupon=cupon,
        usuario_id=usuario_id,
        order_id=order_id,
        monto_descuento=Decimal(str(monto_descuento)),
        monto_original=Decimal(str(monto_original))
    )
    
    # Incrementar contador de usos
    cupon.incrementar_uso()
    
    return Response({
        'success': True,
        'message': 'Uso de cupón registrado correctamente',
        'uso_id': uso.id
    }, status=status.HTTP_201_CREATED)


class CuponViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de cupones (admin)"""
    queryset = Cupon.objects.all()
    serializer_class = CuponSerializer
    
    def get_queryset(self):
        """Filtros opcionales"""
        queryset = Cupon.objects.all()
        
        # Filtrar por activos
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtrar por vigentes
        vigente = self.request.query_params.get('vigente')
        if vigente and vigente.lower() == 'true':
            ahora = timezone.now()
            queryset = queryset.filter(
                fecha_inicio__lte=ahora,
                fecha_fin__gte=ahora
            )
        
        return queryset


class UsoCuponViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar historial de uso de cupones"""
    queryset = UsoCupon.objects.all()
    serializer_class = UsoCuponSerializer
    
    def get_queryset(self):
        """Filtros opcionales"""
        queryset = UsoCupon.objects.select_related('cupon').all()
        
        # Filtrar por usuario
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
        
        # Filtrar por cupón
        cupon_id = self.request.query_params.get('cupon_id')
        if cupon_id:
            queryset = queryset.filter(cupon_id=cupon_id)
        
        return queryset
