# categorias/admin.py

from django.contrib import admin
# Usaremos 'Count' para ordenar por la cantidad de productos
from django.db.models import Count 
from .models import Categoria 


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    # CAMPOS DE LA LISTA: Añadimos 'contar_productos'
    list_display = (
        'id', 
        'nombre', 
        'descripcion',
        'contar_productos', # <<-- Columna personalizada
        'fecha_creacion',
    )
    
    # PERMITE EDITAR LA DESCRIPCIÓN DIRECTAMENTE EN LA LISTA
    list_editable = ('descripcion',) 
    
    # Filtros y Búsqueda (Tus configuraciones originales)
    search_fields = ['nombre', 'descripcion']
    list_filter = ['fecha_creacion']
    
    # El campo de fecha de creación debe ser de solo lectura
    readonly_fields = ('fecha_creacion',)


    # Método personalizado: Cuenta la cantidad de productos
    def contar_productos(self, obj):
        # Accede al campo 'productos' (related_name en tu modelo Producto)
        return obj.productos.count()
    
    contar_productos.short_description = 'Productos Asociados'

    # OPTIMIZACIÓN AVANZADA: Permite ordenar la lista por la cantidad de productos
    def get_queryset(self, request):
        # Sobrescribe el queryset para añadir el conteo de productos
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(_productos_count=Count('productos'))
        return queryset

    def contar_productos(self, obj):
        # Usamos el valor anotado para el conteo
        return obj._productos_count
    contar_productos.admin_order_field = '_productos_count'
    contar_productos.short_description = 'Productos'