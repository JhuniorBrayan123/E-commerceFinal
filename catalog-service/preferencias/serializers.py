from rest_framework import serializers
from .models import Categoria_Favorita, Marca_Favorita

class Categoria_FavoritaSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Categoria_Favorita
        fields  = '__all__'

class Marca_FavoritaSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Marca_Favorita
        fields  = '__all__'