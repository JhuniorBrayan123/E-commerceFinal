from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Cupon(models.Model):
    """Modelo para cupones de descuento"""
    
    TIPO_DESCUENTO_CHOICES = [
        ('porcentaje', 'Porcentaje'),
        ('fijo', 'Fijo'),
    ]
    
    # Información básica del cupón
    codigo = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Código del Cupón",
        help_text="Código único que el usuario ingresará (ej: VERANO2025)"
    )
    descripcion = models.CharField(
        max_length=200, 
        verbose_name="Descripción",
        help_text="Descripción breve del cupón"
    )
    
    # Tipo y valor del descuento
    tipo_descuento = models.CharField(
        max_length=20, 
        choices=TIPO_DESCUENTO_CHOICES, 
        verbose_name="Tipo de Descuento"
    )
    valor_descuento = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor del Descuento",
        help_text="Porcentaje (1-100) o monto fijo en PEN"
    )
    
    # Restricciones
    monto_minimo = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Monto Mínimo de Compra",
        help_text="Monto mínimo requerido para aplicar el cupón"
    )
    
    # Fechas de vigencia
    fecha_inicio = models.DateTimeField(
        verbose_name="Fecha de Inicio",
        help_text="Fecha y hora desde la cual el cupón es válido"
    )
    fecha_fin = models.DateTimeField(
        verbose_name="Fecha de Fin",
        help_text="Fecha y hora hasta la cual el cupón es válido"
    )
    
    # Límites de uso
    usos_maximos = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        verbose_name="Usos Máximos Totales",
        help_text="Número máximo total de veces que se puede usar. Dejar vacío para ilimitado"
    )
    usos_actuales = models.IntegerField(
        default=0,
        verbose_name="Usos Actuales",
        help_text="Contador de cuántas veces se ha usado"
    )
    usos_por_usuario = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Usos Máximos por Usuario",
        help_text="Número máximo de veces que un usuario puede usar este cupón"
    )
    
    # Estado
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
        help_text="Si el cupón está activo o desactivado"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        verbose_name = "Cupón de Descuento"
        verbose_name_plural = "Cupones de Descuento"
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        if self.tipo_descuento == 'porcentaje':
            return f"{self.codigo} - {self.valor_descuento}% OFF"
        else:
            return f"{self.codigo} - S/{self.valor_descuento} OFF"
    
    def esta_vigente(self):
        """Verifica si el cupón está dentro del período de vigencia"""
        ahora = timezone.now()
        return self.fecha_inicio <= ahora <= self.fecha_fin
    
    def tiene_usos_disponibles(self):
        """Verifica si el cupón tiene usos disponibles"""
        if self.usos_maximos is None:
            return True
        return self.usos_actuales < self.usos_maximos
    
    def calcular_descuento(self, monto):
        """
        Calcula el descuento para un monto dado
        Retorna el monto del descuento (no el total final)
        """
        if self.tipo_descuento == 'porcentaje':
            descuento = monto * (self.valor_descuento / Decimal('100'))
        else:
            descuento = self.valor_descuento
        
        # El descuento no puede ser mayor que el monto total
        return min(descuento, monto)
    
    def incrementar_uso(self):
        """Incrementa el contador de usos"""
        self.usos_actuales += 1
        self.save(update_fields=['usos_actuales'])


class UsoCupon(models.Model):
    """Modelo para registrar el historial de uso de cupones"""
    
    cupon = models.ForeignKey(
        Cupon,
        on_delete=models.CASCADE,
        related_name='usos',
        verbose_name="Cupón"
    )
    usuario_id = models.BigIntegerField(
        verbose_name="ID de Usuario",
        help_text="ID del usuario que usó el cupón"
    )
    order_id = models.BigIntegerField(
        null=True,
        blank=True,
        verbose_name="ID de Orden",
        help_text="ID de la orden en la que se usó el cupón"
    )
    monto_descuento = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monto del Descuento Aplicado"
    )
    monto_original = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monto Original (antes del descuento)"
    )
    fecha_uso = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Uso"
    )
    
    class Meta:
        verbose_name = "Uso de Cupón"
        verbose_name_plural = "Historial de Uso de Cupones"
        ordering = ['-fecha_uso']
        indexes = [
            models.Index(fields=['cupon', 'usuario_id']),
            models.Index(fields=['order_id']),
        ]
    
    def __str__(self):
        return f"{self.cupon.codigo} usado por usuario {self.usuario_id} - S/{self.monto_descuento}"
