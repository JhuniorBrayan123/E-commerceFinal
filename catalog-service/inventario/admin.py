# inventario/admin.py

from django.contrib import admin
from .models import MovimientoInventario

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    # Columnas visibles en la tabla del admin
    list_display = [
        'id',
        'sensor',
        'tipo',
        'cantidad',
        'descripcion',
        'fecha'
    ]

    # Campos por los que se puede buscar
    search_fields = [
        'sensor__nombre',
        'descripcion',
        'observaciones',
    ]

    # Filtros a la derecha del admin
    list_filter = [
        'tipo',
        'fecha',
    ]

    # La fecha es automática: no editable
    readonly_fields = ['fecha']

    # Organización del formulario
    fieldsets = (
        ('Información del Movimiento', {
            'fields': ('sensor', 'tipo', 'cantidad'),
        }),
        ('Detalles Adicionales', {
            'fields': ('descripcion', 'observaciones'),
        }),
        ('Registro del Sistema', {
            'fields': ('fecha',),
        }),
    )
