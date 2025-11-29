from rest_framework import serializers
from .models import MovimientoInventario
from sensores.serializers import SensorSerializer


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    sensor_nombre = serializers.CharField(source='sensor.nombre', read_only=True)
    sensor_detalle = SensorSerializer(source='sensor', read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = [
            'id', 'sensor', 'sensor_nombre', 'sensor_detalle',
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
            sensor = data.get('sensor')
            cantidad = data.get('cantidad')
            if sensor and cantidad:
                if sensor.stock < cantidad:
                    raise serializers.ValidationError(
                        f"No hay suficiente stock. Stock disponible: {sensor.stock}"
                    )
        return data

