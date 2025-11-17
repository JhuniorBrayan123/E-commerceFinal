from django.contrib import admin
from .models import Categoria


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'descripcion', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    list_filter = ['fecha_creacion']

