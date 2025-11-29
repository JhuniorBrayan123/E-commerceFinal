# inventario/admin.py

from django.contrib import admin
# El modelo se llama MovimientoInventario, ¡lo usamos aquí!
from .models import MovimientoInventario 


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = (
        'producto', 
        'tipo',
        'cantidad',
        'motivo',
        'fecha',
        'stock_del_producto_actual', # Columna personalizada para el stock
    )
    
    # Filtros laterales
    list_filter = ('tipo', 'motivo', 'fecha') 
    
    # Campos de búsqueda
    # Permite buscar por nombre de producto y por el motivo
    search_fields = ('producto__nombre', 'motivo')
    
    # Campos que se pueden editar en la vista de lista (opcional, si lo quieres)
    # list_editable = ('motivo', 'cantidad') 
    
    # Optimización del formulario de Edición con Fieldsets
    fieldsets = (
        ('Información del Movimiento', {
            # Nota: 'producto' debe ser editable para seleccionar el producto
            'fields': ('producto', 'tipo', 'cantidad', 'motivo'),
        }),
        ('Detalles y Registro', {
            'fields': ('observaciones', 'fecha'),
        }),
    )
    
    # La fecha es generada automáticamente, no debe ser editable
    readonly_fields = ('fecha',)

    # Método personalizado para mostrar el stock actual del producto después del movimiento
    def stock_del_producto_actual(self, obj):
        # Accede al campo 'stock' del modelo Producto relacionado
        return obj.producto.stock
        
    stock_del_producto_actual.short_description = 'Stock Final'


# Nota Importante: 
# Para evitar inconsistencias, una vez que el movimiento se guarda, el stock 
# del producto se actualiza. Por lo tanto, NO es recomendable permitir 
# la edición en línea (list_editable) de 'tipo' o 'cantidad' para evitar 
# cálculos erróneos si se modifica un registro antiguo.
# YA VOY COMO 4 HORASSSSSS 