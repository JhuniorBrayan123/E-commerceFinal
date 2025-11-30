from rest_framework import serializers
from .models import MovimientoInventario
from productos.serializers import ProductoSerializer


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_detalle = ProductoSerializer(source='producto', read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = [
            'id', 'producto', 'producto_nombre', 'producto_detalle',
            'tipo', 'cantidad', 'motivo', 'fecha', 'observaciones'
        ]
        read_only_fields = ['id', 'fecha']

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value

    def validate(self, data):
        # Validar que no se pueda hacer una salida mayor al stock disponible
        if data.get('tipo') == 'salida':
            producto = data.get('producto')
            cantidad = data.get('cantidad')
            if producto and cantidad:
                if producto.stock < cantidad:
                    raise serializers.ValidationError(
                        f"No hay suficiente stock. Stock disponible: {producto.stock}"
                    )
        return data

