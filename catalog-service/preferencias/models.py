from django.db import models
from categorias.models import Categoria

class Categoria_Favorita(models.Model):
    id_user = models.IntegerField(verbose_name="ID Usuario")
    id_categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, verbose_name="Categoría Favorita")

    
class Marca_Favorita(models.Model):
    id_user = models.IntegerField(verbose_name="ID Usuario")
    marca = models.CharField(max_length=100, verbose_name="Marca Favorita")