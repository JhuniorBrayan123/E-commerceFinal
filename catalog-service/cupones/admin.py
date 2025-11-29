from django.contrib import admin
from .models import Cupon, UsoCupon


@admin.register(Cupon)
class CuponAdmin(admin.ModelAdmin):
    list_display = [
        'codigo',
        'descripcion',
        'tipo_descuento',
        'valor_descuento',
        'monto_minimo',
        'usos_actuales',
        'usos_maximos',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'esta_vigente_display'
    ]
    list_filter = [
        'activo',
        'tipo_descuento',
        'fecha_inicio',
        'fecha_fin'
    ]
    search_fields = ['codigo', 'descripcion']
    readonly_fields = [
        'usos_actuales',
        'fecha_creacion',
        'fecha_actualizacion'
    ]
    fieldsets = (
        ('Información Básica', {
            'fields': ('codigo', 'descripcion', 'activo')
        }),
        ('Descuento', {
            'fields': ('tipo_descuento', 'valor_descuento', 'monto_minimo')
        }),
        ('Vigencia', {
            'fields': ('fecha_inicio', 'fecha_fin')
        }),
        ('Límites de Uso', {
            'fields': ('usos_maximos', 'usos_actuales', 'usos_por_usuario')
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    @admin.display(boolean=True, description='Vigente')
    def esta_vigente_display(self, obj):
        return obj.esta_vigente()


@admin.register(UsoCupon)
class UsoCuponAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'cupon',
        'usuario_id',
        'order_id',
        'monto_original',
        'monto_descuento',
        'porcentaje_descuento',
        'fecha_uso'
    ]
    list_filter = [
        'cupon',
        'fecha_uso'
    ]
    search_fields = [
        'cupon__codigo',
        'usuario_id',
        'order_id'
    ]
    readonly_fields = [
        'cupon',
        'usuario_id',
        'order_id',
        'monto_descuento',
        'monto_original',
        'fecha_uso'
    ]
    
    @admin.display(description='% Descuento')
    def porcentaje_descuento(self, obj):
        if obj.monto_original > 0:
            porcentaje = (obj.monto_descuento / obj.monto_original) * 100
            return f"{porcentaje:.1f}%"
        return "0%"
    
    def has_add_permission(self, request):
        # No permitir agregar usos manualmente desde el admin
        return False
    
    def has_change_permission(self, request, obj=None):
        # No permitir editar usos
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Permitir delete para correcciones
        return True
