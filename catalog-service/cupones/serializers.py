from rest_framework import serializers
from .models import Cupon, UsoCupon
from django.utils import timezone
from decimal import Decimal


class CuponSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Cupon"""
    
    class Meta:
        model = Cupon
        fields = '__all__'
        read_only_fields = ['usos_actuales', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate(self, data):
        """Validaciones personalizadas"""
        # Validar que fecha_fin sea después de fecha_inicio
        if data.get('fecha_inicio') and data.get('fecha_fin'):
            if data['fecha_fin'] <= data['fecha_inicio']:
                raise serializers.ValidationError({
                    'fecha_fin': 'La fecha de fin debe ser posterior a la fecha de inicio'
                })
        
        # Validar porcentaje
        if data.get('tipo_descuento') == 'porcentaje':
            if data.get('valor_descuento') and (data['valor_descuento'] < 1 or data['valor_descuento'] > 100):
                raise serializers.ValidationError({
                    'valor_descuento': 'El porcentaje debe estar entre 1 y 100'
                })
        
        return data


class ValidarCuponSerializer(serializers.Serializer):
    """Serializer para validar un cupón"""
    codigo = serializers.CharField(max_length=50)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    usuario_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_codigo(self, value):
        """Convertir código a mayúsculas"""
        return value.upper().strip()


class UsoCuponSerializer(serializers.ModelSerializer):
    """Serializer para el historial de uso de cupones"""
    cupon_codigo = serializers.CharField(source='cupon.codigo', read_only=True)
    cupon_descripcion = serializers.CharField(source='cupon.descripcion', read_only=True)
    
    class Meta:
        model = UsoCupon
        fields = [
            'id',
            'cupon',
            'cupon_codigo',
            'cupon_descripcion',
            'usuario_id',
            'order_id',
            'monto_descuento',
            'monto_original',
            'fecha_uso'
        ]
        read_only_fields = ['fecha_uso']
