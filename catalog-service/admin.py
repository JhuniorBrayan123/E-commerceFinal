# catalog-service/admin.py

from django.db.models import Sum
from django.utils import timezone
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from datetime import timedelta

# MODELOS
from orders.models import Orden
from categorias.models import Categoria
from sensores.models import Sensor

# Límite para considerar stock crítico
STOCK_CRITICO_LIMITE = 10


@staff_member_required
def dashboard_view(request):
    """
    Dashboard del administrador con métricas y gráfica de ventas.
    """
    try:
        today = timezone.localdate()

        # ==============================
        # 1. MÉTRICAS PRINCIPALES
        # ==============================

        # Ventas del día
        ventas_hoy = (
            Orden.objects.filter(fecha_creacion__date=today)
            .aggregate(total_sum=Sum("total"))
            .get("total_sum") or 0
        )

        # Órdenes pendientes
        ordenes_pendientes = Orden.objects.filter(estado="pendiente").count()

        # Stock crítico (sensores cuyo stock es menor o igual al límite)
        stock_critico_count = Sensor.objects.filter(stock__lte=STOCK_CRITICO_LIMITE).count()

        # Total categorías registradas
        total_categorias = Categoria.objects.count()

        # ==============================
        # 2. GRÁFICA DE VENTAS (últimos 7 días)
        # ==============================

        sales_data = {}

        for i in range(7):
            date = today - timedelta(days=i)

            daily_sales = (
                Orden.objects.filter(fecha_creacion__date=date)
                .aggregate(sum_total=Sum("total"))
                .get("sum_total") or 0.0
            )

            sales_data[date.strftime("%a, %d/%m")] = float(daily_sales)

        # Ordenar cronológicamente
        labels = list(reversed(list(sales_data.keys())))
        data = [sales_data[label] for label in labels]

        # ==============================
        # 3. MÉTRICAS PARA LAS TARJETAS
        # ==============================

        metrics = [
            {
                "title": "Ventas Hoy",
                "value": f"S/ {ventas_hoy:,.2f}",
                "icon": "fas fa-chart-line",
                "color": "success",
            },
            {
                "title": "Órdenes Pendientes",
                "value": ordenes_pendientes,
                "icon": "fas fa-clock",
                "color": "warning",
            },
            {
                "title": "Stock Crítico",
                "value": stock_critico_count,
                "icon": "fas fa-exclamation-triangle",
                "color": "danger",
            },
            {
                "title": "Categorías Totales",
                "value": total_categorias,
                "icon": "fas fa-tags",
                "color": "info",
            },
        ]

        # ==============================
        # CONTEXTO FINAL
        # ==============================

        context = {
            "dashboard_cards": metrics,
            "title": "Panel de Control Principal",
            "sales_chart_labels": labels,
            "sales_chart_data": data,
        }

        return render(request, "admin/index.html", context)

    except Exception as e:
        print(f"ERROR AL CALCULAR MÉTRICAS: {e}")
        return render(
            request,
            "admin/index.html",
            {"title": "Dashboard", "error_message": f"Error al cargar datos: {e}"},
        )
