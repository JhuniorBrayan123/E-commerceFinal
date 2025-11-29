from django.contrib import admin
from .models import MovimientoInventario

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto', 'tipo', 'cantidad', 'mostrar_motivo', 'fecha']
    search_fields = ['producto__nombre', 'descripcion', 'observaciones']
    list_filter = ['tipo', 'fecha']
    readonly_fields = ['fecha']

    def mostrar_motivo(self, obj):
        # Puedes personalizar la lógica del "motivo"
        if obj.tipo == 'entrada':
            return f"Entrada: {obj.descripcion}"
        elif obj.tipo == 'salida':
            return f"Salida - Estado: {obj.payment_status}"
        return obj.descripcion or "Sin motivo"

    mostrar_motivo.short_description = 'Motivo'