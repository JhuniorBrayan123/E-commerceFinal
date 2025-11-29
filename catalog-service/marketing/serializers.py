from rest_framework import serializers
from .models import Banner

class BannerSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = '__all__'
    
    def get_imagen(self, obj):
        """Genera la URL de la imagen - retorna ruta relativa para que el frontend la procese"""
        if obj.imagen:
            # Retornar la ruta relativa (ej: /media/banners/imagen.jpg)
            # El frontend usará getBannerUrl() para construir la URL completa
            return obj.imagen.url
        return None