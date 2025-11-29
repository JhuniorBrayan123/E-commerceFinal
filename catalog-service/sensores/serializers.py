from rest_framework import serializers
from .models import Sensor

class SensorSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    imagen = serializers.SerializerMethodField()
    
    class Meta:
        model = Sensor
        fields = '__all__'
    
    def get_imagen(self, obj):
        """Return the full URL for the image if it exists"""
        if obj.imagen:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.imagen.url)
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
