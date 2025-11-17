from django.contrib import admin
from .models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'precio', 'stock', 'categoria', 'estado', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    list_filter = ['categoria', 'estado', 'fecha_creacion']
    list_editable = ['precio', 'stock', 'estado']

