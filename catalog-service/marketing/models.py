from django.db import models

class Banner(models.Model):
    titulo = models.CharField(max_length=200, verbose_name="Título del Banner")
    imagen = models.ImageField(upload_to='banners/', verbose_name="Imagen del Banner")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    def __str__(self):
        return self.titulo
