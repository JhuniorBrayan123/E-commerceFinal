# catalog-service/admin.py

from django.db.models import Sum, Count
from django.utils import timezone
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from datetime import timedelta

# IMPORTACIONES DE TUS MODELOS (¡Asegúrate de que los nombres sean exactos!)
from productos.models import Producto
from orders.models import Orden # Usaremos este para las ventas
from categorias.models import Categoria 

# Definición del límite de stock para considerarlo 'Crítico'
STOCK_CRITICO_LIMITE = 10 

@staff_member_required
def dashboard_view(request):
    """
    Calcula métricas clave y datos para la gráfica de ventas.
    """
    try:
        today = timezone.localdate()
        
        # --- 1. CÁLCULO DE MÉTRICAS (para las tarjetas) ---
        
        # 1. Ventas Hoy
        ventas_hoy_query = Orden.objects.filter( 
            fecha_creacion__date=today,
        ).aggregate(
            total_sum=Sum('total') # Debe ser el campo 'total' en tu modelo Orden
        )
        ventas_hoy = ventas_hoy_query['total_sum'] if ventas_hoy_query['total_sum'] else 0

        # 2. Órdenes Pendientes
        ordenes_pendientes = Orden.objects.filter(estado='pendiente').count() # Usa 'pendiente' en minúsculas
        
        # 3. Stock Crítico
        # Asumiendo que el campo 'stock' está en el modelo Producto
        stock_critico_count = Producto.objects.filter(stock__lte=STOCK_CRITICO_LIMITE).count() 
        
        # 4. Total Categorías
        total_categorias = Categoria.objects.count()

        # --- 2. PREPARACIÓN DE DATOS PARA LA GRÁFICA (Ventas de los últimos 7 días) ---
        
        sales_data = {}
        for i in range(7):
            date = today - timedelta(days=i)
            # Filtra por fecha_creacion del modelo Orden
            daily_sales = Orden.objects.filter(fecha_creacion__date=date).aggregate(
                sum_total=Sum('total')
            )['sum_total'] or 0.0
            
            # Formateamos la clave como 'Día, DD/MM'
            label = date.strftime('%a, %d/%m') 
            sales_data[label] = float(daily_sales)

        # Los datos deben estar ordenados del más antiguo al más reciente
        labels = list(reversed(sales_data.keys()))
        data = [sales_data[label] for label in labels]

        # --- 3. CONTEXTO FINAL ---
        metrics = [
            { "title": "Ventas Hoy", "value": f"S/ {ventas_hoy:,.2f}", "icon": "fas fa-chart-line", "color": "success", },
            { "title": "Órdenes Pendientes", "value": ordenes_pendientes, "icon": "fas fa-clock", "color": "warning", },
            { "title": "Stock Crítico", "value": stock_critico_count, "icon": "fas fa-exclamation-triangle", "color": "danger", },
            { "title": "Categorías Totales", "value": total_categorias, "icon": "fas fa-tags", "color": "info", },
        ]
        
        context = {
            'dashboard_cards': metrics, 
            'title': 'Panel de Control Principal', 
            # Datos de la gráfica para el template
            'sales_chart_labels': labels,
            'sales_chart_data': data,
        }
        
        # Retorna el template estándar de Jazzmin, que modificaremos en el Paso 3.
        return render(request, 'admin/index.html', context)
    
    except Exception as e:
        print(f"ERROR AL CALCULAR MÉTRICAS: {e}")
        return render(request, 'admin/index.html', {'title': 'Dashboard', 'error_message': f'Error al cargar datos: {e}'})