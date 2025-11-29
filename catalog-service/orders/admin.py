# orders/admin.py

from django.contrib import admin
# IMPORTACIÓN CORREGIDA: Usamos el nombre exacto de la clase: ItemOrden
from .models import Orden, ItemOrden 


# 1. CLASE INLINE: Permite editar los productos dentro de la Orden
class ItemOrdenInline(admin.TabularInline):
    # Usa el nombre del modelo corregido
    model = ItemOrden 
    
    # Campos que se mostrarán en la tabla
    # Nota: 'get_subtotal' es el método definido más abajo
    fields = ('producto', 'cantidad', 'precio_unitario', 'get_subtotal') 
    
    # Campos que no se pueden editar manualmente
    readonly_fields = ('get_subtotal',) 
    
    # Cantidad de formularios vacíos a mostrar
    extra = 0 

    # Método para calcular el subtotal (se usa en readonly_fields)
    def get_subtotal(self, obj):
        if obj.precio_unitario and obj.cantidad:
            # Usamos el campo 'subtotal' que calculas en el método save del modelo
            return obj.subtotal
        return 0
    get_subtotal.short_description = 'Subtotal Calculado'


# 2. CLASE ADMIN: Registra el modelo Orden con el Inline
@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    # A. Configuración de la Vista de Lista
    list_display = (
        'id', 
        'usuario', 
        'fecha_creacion', 
        'estado', 
        'total', 
        'payment_service_id',
    )
    list_filter = ('estado', 'fecha_creacion')
    search_fields = ('usuario__username', 'id', 'payment_service_id')
    
    # Puedes editar el estado directamente desde la lista
    list_editable = ['estado'] 
    
    # B. Optimización del Formulario de Edición (Fieldsets)
    fieldsets = (
        ('Información Principal', {
            'fields': ('usuario', 'estado', 'total'),
        }),
        ('Fechas y Referencia Externa', {
            'fields': ('payment_service_id', 'fecha_creacion', 'fecha_actualizacion'), 
        }),
    )

    # C. Aquí se agrega el Inline para ver los productos
    inlines = [ItemOrdenInline]

    # D. Campos de Solo Lectura
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion', 'total')

    # E. Acción Personalizada: Marcar como Completada
    actions = ['marcar_como_completada']
    
    @admin.action(description='Marcar las órdenes seleccionadas como Completadas')
    def marcar_como_completada(self, request, queryset):
        # Asegúrate de usar 'completada' si tu choices en el modelo es en minúsculas
        queryset.update(estado='completada') 
        self.message_user(request, f"Se marcaron {queryset.count()} órdenes como Completadas.")


# 3. CLASE ADMIN: Registra ItemOrden (Si quieres una vista separada)
@admin.register(ItemOrden) 
class ItemOrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'producto', 'cantidad', 'precio_unitario', 'subtotal')
    list_filter = ('orden__estado', 'producto__nombre')
    search_fields = ('orden__id', 'producto__nombre')