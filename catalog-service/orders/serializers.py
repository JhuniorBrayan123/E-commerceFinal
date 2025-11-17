from rest_framework import serializers
from .models import Orden, ItemOrden
from productos.serializers import ProductoSerializer


class ItemOrdenSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoSerializer(source='producto', read_only=True)

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
            'items', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class CrearOrdenSerializer(serializers.Serializer):
    """
    Serializer para crear órdenes desde Spring Boot
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

