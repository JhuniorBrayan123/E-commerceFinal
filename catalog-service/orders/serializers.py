from rest_framework import serializers
from .models import Orden, ItemOrden
# CORRECCIÓN 1: Cambiar la importación de 'productos' a 'sensores' y la clase a 'SensorSerializer'
from sensores.serializers import SensorSerializer


class ItemOrdenSerializer(serializers.ModelSerializer):
    # CORRECCIÓN 2: Usar la clase SensorSerializer
    producto_detalle = SensorSerializer(source='producto', read_only=True)

    class Meta:
        model = ItemOrden
        fields = ['id', 'producto', 'producto_detalle', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['id', 'precio_unitario', 'subtotal']


class OrdenSerializer(serializers.ModelSerializer):
    items = ItemOrdenSerializer(many=True, read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Orden
        fields = [
            'id', 'usuario', 'usuario_username', 'total', 'estado',
            'items', 'fecha_creacion', 'fecha_actualizacion', 'payment_service_id'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class CrearOrdenSerializer(serializers.Serializer):
    """
    Serializador para crear órdenes desde Spring Boot
    """
    usuario_id = serializers.IntegerField()
    productos = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField()
        )
    )
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_productos(self, value):
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un producto.")
        for item in value:
            if 'producto_id' not in item or 'cantidad' not in item:
                raise serializers.ValidationError("Cada producto debe tener 'producto_id' y 'cantidad'.")
            if item['cantidad'] <= 0:
                raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value