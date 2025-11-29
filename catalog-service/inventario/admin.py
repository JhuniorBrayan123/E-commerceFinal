from django.contrib import admin
from .models import MovimientoInventario

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'sensor', 'tipo', 'cantidad', 'descripcion', 'fecha']
    search_fields = ['sensor__nombre', 'descripcion', 'observaciones']
    list_filter = ['tipo', 'fecha']
    readonly_fields = ['fecha']
