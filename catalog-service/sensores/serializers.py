from rest_framework import serializers
from .models import Sensor

class SensorSerializer(serializers.ModelSerializer):
    # Campo para obtener el nombre legible del tipo
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Sensor
        fields = [
            'id',
            'nombre',
            'tipo',
            'tipo_display',
            'marca',
            'modelo',
            'precio',
            'descripcion',
            'rango_medicion',
            'precision',
            'alimentacion',
            'protocolo_comunicacion',
            'imagen',
            'stock',
            'disponible',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
    
    def validate_precio(self, value):
        """Validar que el precio sea positivo"""
        if value < 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value
    
    def validate_stock(self, value):
        """Validar que el stock sea no negativo"""
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
