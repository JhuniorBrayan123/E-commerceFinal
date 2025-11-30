from django.db import models
from productos.models import Producto


class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('STRIPE', 'Tarjeta de Crédito/Débito'),
        ('YAPE', 'Yape'),
        ('PAYPAL', 'PayPal'),
        ('N/A', 'No Aplica'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('PAID', 'Pagado'),
        ('FAILED', 'Fallido'),
        ('REFUNDED', 'Reembolsado'),
        ('N/A', 'No Aplica'),
    ]
    
    CURRENCY_CHOICES = [
        ('PEN', 'Soles (PEN)'),
        ('USD', 'Dólares (USD)'),
    ]

    # Campos básicos del movimiento
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos', verbose_name="Producto")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo de Movimiento")
    motivo = models.CharField(
    max_length=100,
    verbose_name="Motivo",
    help_text="Motivo del movimiento de inventario"
)
    cantidad = models.IntegerField(verbose_name="Cantidad")
    descripcion = models.CharField(max_length=200, verbose_name="Descripción", help_text="Descripción del movimiento")
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones")
    
    # Campos para historial de compras (aplicables solo para salidas/ventas)
    order_id = models.BigIntegerField(blank=True, null=True, verbose_name="ID de Orden", help_text="ID de la orden en el sistema de pagos")
    user_id = models.BigIntegerField(blank=True, null=True, verbose_name="ID de Usuario", help_text="ID del usuario que realizó la compra")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='N/A', verbose_name="Método de Pago")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='N/A', verbose_name="Estado del Pago")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="Monto Total", help_text="Monto total de la transacción")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='PEN', verbose_name="Moneda")

    def __str__(self):
        if self.tipo == 'salida' and self.order_id:
            return f"VENTA #{self.order_id} - {self.producto.nombre} - {self.cantidad} unidades - {self.payment_status}"
        return f"{self.tipo.upper()} - {self.producto.nombre} - {self.cantidad} unidades"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Actualizar stock del producto automáticamente
        if self.tipo == 'entrada':
            self.producto.stock += self.cantidad
        elif self.tipo == 'salida':
            self.producto.stock -= self.cantidad
            if self.producto.stock < 0:
                self.producto.stock = 0
        self.producto.save()

    class Meta:
        verbose_name = "Movimiento de Inventario"
        verbose_name_plural = "Movimientos de Inventario / Historial de Compras"
        ordering = ['-fecha']

