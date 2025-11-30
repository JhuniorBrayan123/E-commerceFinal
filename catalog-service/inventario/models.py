from django.db import models
from sensores.models import Sensor


class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    # La única línea que requiere el cambio de Producto a Sensor
    producto = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='movimientos', verbose_name="Producto")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo de Movimiento")
    cantidad = models.IntegerField(verbose_name="Cantidad")
    motivo = models.CharField(max_length=200, verbose_name="Motivo")
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones")

    def __str__(self):
        # Esta línea ahora usa self.producto que es un Sensor
        return f"{self.tipo.upper()} - {self.producto.nombre} - {self.cantidad} unidades"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Aquí también funciona porque self.producto es el objeto Sensor
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
        verbose_name_plural = "Movimientos de Inventario"
        ordering = ['-fecha']