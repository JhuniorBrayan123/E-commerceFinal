from django.db import models
from sensores.models import Sensor

class Comentario(models.Model):
    id_user = models.IntegerField(verbose_name="ID Usuario")
    id_sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, verbose_name="Sensor", db_column='id_producto', null=True, blank=True)
    contenido = models.TextField(verbose_name="Contenido del Comentario")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    def __str__(self):
        return f"Usuario {self.id_user} - Sensor {self.id_sensor.nombre}"