from django.db import models
from sensores.models import Sensor
from django.contrib.auth.models import User

class Comentario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuario")
    id_sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, verbose_name="Sensor", db_column='sensor_id')
    contenido = models.TextField(verbose_name="Contenido del Comentario")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    def __str__(self):
        return f"{self.usuario.username} - {self.contenido}"