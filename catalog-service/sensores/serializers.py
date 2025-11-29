from rest_framework import serializers
from .models import Sensor

class SensorSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    imagen = serializers.SerializerMethodField()
    
    class Meta:
        model = Sensor
        fields = '__all__'
    
    def get_imagen(self, obj):
        """Genera la URL de la imagen - retorna ruta relativa para que el frontend la procese"""
        if obj.imagen:
            # Retornar la ruta relativa (ej: /media/sensores/imagen.jpg)
            # El frontend usará getImageUrl() para construir la URL completa
            return obj.imagen.url
        return None
    
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
