from django.db import models
from django.contrib.auth.models import User
from productos.models import Producto


class Orden(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('procesando', 'Procesando'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ordenes', verbose_name="Usuario")
    
    # NUEVO ➜ ID del servicio externo (Spring Boot o pasarela de pago)
    payment_service_id = models.CharField(max_length=100, blank=True, null=True)

    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', verbose_name="Estado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    def __str__(self):
        return f"Orden #{self.id} - {self.usuario.username} - ${self.total}"

    class Meta:
        verbose_name = "Orden"
        verbose_name_plural = "Órdenes"
        ordering = ['-fecha_creacion']


class ItemOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='items', verbose_name="Orden")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, verbose_name="Producto")

    # NUEVOS CAMPOS ➜ Compatibilidad con microservicio o frontend desacoplado
    #producto_id = models.IntegerField(blank=True, null=True)  
    nombre_producto = models.CharField(max_length=255, blank=True, null=True)

    cantidad = models.IntegerField(verbose_name="Cantidad")
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Subtotal")

    def save(self, *args, **kwargs):
        # autocalcular subtotal
        self.subtotal = self.precio_unitario * self.cantidad

        # completar valores automáticamente si vienen de Producto
        if self.producto:
            if not self.producto_id:
                self.producto_id = self.producto.id
            if not self.nombre_producto:
                self.nombre_producto = self.producto.nombre

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.producto.nombre} x{self.cantidad} - ${self.subtotal}"

    class Meta:
        verbose_name = "Item de Orden"
        verbose_name_plural = "Items de Orden"
