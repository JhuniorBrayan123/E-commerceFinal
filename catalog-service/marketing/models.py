from django.db import models

class Banner(models.Model):
    titulo = models.CharField(max_length=200, verbose_name="Título del Banner")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    imagen = models.ImageField(upload_to='banners/', verbose_name="Imagen del Banner")
    link = models.URLField(blank=True, null=True, verbose_name="Enlace (Opcional)")
    orden = models.IntegerField(default=0, verbose_name="Orden de aparición")
    activo = models.BooleanField(default=True, verbose_name="¿Activo?")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    class Meta:
        ordering = ['orden', '-fecha_creacion']
        verbose_name = "Banner Promocional"
        verbose_name_plural = "Banners Promocionales"

    def __str__(self):
        return self.titulo
