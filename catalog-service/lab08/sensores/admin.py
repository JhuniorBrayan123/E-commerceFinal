from django.contrib import admin
from .models import Sensor

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'marca', 'precio', 'stock', 'disponible']
    list_filter = ['tipo', 'marca', 'disponible']
    search_fields = ['nombre', 'marca', 'modelo']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'tipo', 'marca', 'modelo', 'precio', 'descripcion', 'imagen')
        }),
        ('Especificaciones Técnicas', {
            'fields': ('rango_medicion', 'precision', 'alimentacion', 'protocolo_comunicacion')
        }),
        ('Inventario', {
            'fields': ('stock', 'disponible')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )