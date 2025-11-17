from django.contrib import admin
from .models import MovimientoInventario


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto', 'tipo', 'cantidad', 'motivo', 'fecha']
    search_fields = ['producto__nombre', 'motivo']
    list_filter = ['tipo', 'fecha']
    readonly_fields = ['fecha']

