# productos/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Producto # Asegúrate de que el modelo se llame Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista de Productos
    list_display = (
        'nombre', 
        'categoria', # Asume que tienes un campo de relación 'categoria'
        'precio', 
        'stock', 
        'mostrar_imagen_miniatura', # El método personalizado para la miniatura
        'fecha_creacion'
    )
    
    # Filtros laterales
    list_filter = ('categoria', 'stock')
    
    # Campos de búsqueda
    search_fields = ('nombre', 'descripcion')
    
    # Campos editables en la vista de lista
    list_editable = ('precio', 'stock') 

    # Optimización del formulario de Edición con Fieldsets
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'categoria'),
        }),
        ('Precio e Inventario', {
            'fields': ('precio', 'stock'),
        }),
        ('Imagen', {
            'fields': ('imagen', 'mostrar_imagen_en_detalle'), # Muestra la imagen en grande
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('fecha_creacion', 'mostrar_imagen_en_detalle')


    # Método para crear la miniatura en la lista de productos
    def mostrar_imagen_miniatura(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 5px;" />', obj.imagen.url)
        return "Sin Imagen"
    mostrar_imagen_miniatura.short_description = 'Miniatura'


    # Método para mostrar la imagen grande en el formulario de edición
    def mostrar_imagen_en_detalle(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="150" height="150" style="border-radius: 5px;" />', obj.imagen.url)
        return "No hay imagen cargada"
    mostrar_imagen_en_detalle.short_description = 'Vista Previa'