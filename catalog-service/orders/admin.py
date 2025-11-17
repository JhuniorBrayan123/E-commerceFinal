from django.contrib import admin
from .models import Orden, ItemOrden


class ItemOrdenInline(admin.TabularInline):
    model = ItemOrden
    extra = 0


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'total', 'estado', 'fecha_creacion']
    search_fields = ['usuario__username']
    list_filter = ['estado', 'fecha_creacion']
    inlines = [ItemOrdenInline]
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


@admin.register(ItemOrden)
class ItemOrdenAdmin(admin.ModelAdmin):
    list_display = ['id', 'orden', 'producto', 'cantidad', 'precio_unitario', 'subtotal']
    list_filter = ['orden']

