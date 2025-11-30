from rest_framework import serializers
from .models import Banner

class BannerSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = '__all__'
    
    def get_imagen(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None