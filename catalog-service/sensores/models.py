from django.db import models

class Sensor(models.Model):
    # Tipos de sensores agrícolas
    TIPO_SENSOR = [
        ('humedad', 'Sensor de Humedad'),
        ('temperatura', 'Sensor de Temperatura'),
        ('ph', 'Sensor de pH'),
        ('luz', 'Sensor de Luz'),
        ('nutrientes', 'Sensor de Nutrientes'),
        ('co2', 'Sensor de CO2'),
    ]
    
    # Campos del sensor
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Sensor")
    tipo = models.CharField(max_length=20, choices=TIPO_SENSOR, verbose_name="Tipo de Sensor")
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
        return f"{self.nombre} - {self.marca} ({self.tipo})"

    class Meta:
        verbose_name = "Sensor"
        verbose_name_plural = "Sensores"
        ordering = ['-fecha_creacion']