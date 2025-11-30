# categorias/admin.py

from django.contrib import admin
# Usaremos 'Count' para ordenar por la cantidad de sensores
from django.db.models import Count 
from .models import Categoria 


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    # CAMPOS DE LA LISTA: Añadimos 'contar_sensores'
    list_display = (
        'id', 
        'nombre', 
        'descripcion',
        'contar_sensores', # <<-- Columna personalizada
        'fecha_creacion',
    )
    
    # PERMITE EDITAR LA DESCRIPCIÓN DIRECTAMENTE EN LA LISTA
    list_editable = ('descripcion',) 
    
    # Filtros y Búsqueda (Tus configuraciones originales)
    search_fields = ['nombre', 'descripcion']
    list_filter = ['fecha_creacion']
    
    # El campo de fecha de creación debe ser de solo lectura
    readonly_fields = ('fecha_creacion',)

    # OPTIMIZACIÓN AVANZADA: Permite ordenar la lista por la cantidad de sensores
    def get_queryset(self, request):
        # Sobrescribe el queryset para añadir el conteo de sensores
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(_sensores_count=Count('sensores'))
        return queryset

    def contar_sensores(self, obj):
        # Usamos el valor anotado para el conteo
        return obj._sensores_count
    contar_sensores.admin_order_field = '_sensores_count'
    contar_sensores.short_description = 'Sensores Asociados'