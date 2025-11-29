# sensores/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Sensor # El nombre del modelo es Sensor


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = (
        'nombre', 
        'tipo',
        'marca',
        'stock', 
        'precio',
        'disponible', # Muestra un ícono de True/False
        'mostrar_imagen_miniatura', # Miniatura de la imagen
    )
    
    # Filtros laterales
    list_filter = ('tipo', 'marca', 'disponible') 
    
    # Campos de búsqueda
    search_fields = ('nombre', 'marca', 'modelo', 'descripcion')
    
    # Campos editables en la vista de lista
    list_editable = ('stock', 'precio', 'disponible') 

    # --- Optimización del Formulario de Edición con Fieldsets ---
    fieldsets = (
        ('Información Comercial Básica', {
            'fields': ('nombre', 'tipo', 'marca', 'modelo', 'precio', 'descripcion'),
        }),
        ('Inventario y Disponibilidad', {
            'fields': ('stock', 'disponible', 'fecha_creacion', 'fecha_actualizacion'),
        }),
        ('Especificaciones Técnicas', {
            'fields': (
                'rango_medicion', 
                'precision', 
                'alimentacion', 
                'protocolo_comunicacion'
            ),
            'classes': ('collapse',), # Opcional: Hace que esta sección se pueda colapsar
        }),
        ('Imagen del Sensor', {
            'fields': ('imagen', 'mostrar_imagen_en_detalle'),
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion', 'mostrar_imagen_en_detalle')

    # --- Métodos para el Manejo de Imágenes ---

    # 1. Método para crear la miniatura en la lista de sensores
    def mostrar_imagen_miniatura(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 5px;" />', obj.imagen.url)
        return "Sin Imagen"
    mostrar_imagen_miniatura.short_description = 'Miniatura'


    # 2. Método para mostrar la imagen grande en el formulario de edición
    def mostrar_imagen_en_detalle(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="150" height="150" style="border-radius: 5px;" />', obj.imagen.url)
        return "No hay imagen cargada"
    mostrar_imagen_en_detalle.short_description = 'Vista Previa'