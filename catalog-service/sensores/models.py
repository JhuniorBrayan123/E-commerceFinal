from django.db import models
from categorias.models import Categoria
class Sensor(models.Model):
    
    # Campos del sensor
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Sensor")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, verbose_name="Categoría", related_name="sensores")
    marca = models.CharField(max_length=50, verbose_name="Marca")
    modelo = models.CharField(max_length=50, verbose_name="Modelo")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    descripcion = models.TextField(verbose_name="Descripción")
    
    # Especificaciones técnicas
    rango_medicion = models.CharField(max_length=100, verbose_name="Rango de Medición")
    precision = models.CharField(max_length=50, verbose_name="Precisión")
    alimentacion = models.CharField(max_length=50, verbose_name="Alimentación")
    protocolo_comunicacion = models.CharField(max_length=50, verbose_name="Protocolo de Comunicación")
    
    # Imagen del producto
    imagen = models.ImageField(upload_to='sensores/', blank=True, null=True, verbose_name="Imagen del Sensor")
    
    # Stock y disponibilidad
    stock = models.IntegerField(default=0, verbose_name="Stock Disponible")
    disponible = models.BooleanField(default=True, verbose_name="Disponible")
    
    # Fechas
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    def __str__(self):
        return f"{self.nombre} - {self.marca}"
    
    def save(self, *args, **kwargs):
        self.disponible = self.stock > 0
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Sensor"
        verbose_name_plural = "Sensores"
        ordering = ['-fecha_creacion']