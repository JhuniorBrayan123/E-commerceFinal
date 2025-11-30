# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0001_initial'),
    ]

    operations = [
        # Renombrar campo motivo a descripcion
        migrations.RenameField(
            model_name='movimientoinventario',
            old_name='motivo',
            new_name='descripcion',
        ),
        # Agregar campos para historial de compras
        migrations.AddField(
            model_name='movimientoinventario',
            name='order_id',
            field=models.BigIntegerField(blank=True, help_text='ID de la orden en el sistema de pagos', null=True, verbose_name='ID de Orden'),
        ),
        migrations.AddField(
            model_name='movimientoinventario',
            name='user_id',
            field=models.BigIntegerField(blank=True, help_text='ID del usuario que realizó la compra', null=True, verbose_name='ID de Usuario'),
        ),
        migrations.AddField(
            model_name='movimientoinventario',
            name='payment_method',
            field=models.CharField(choices=[('STRIPE', 'Tarjeta de Crédito/Débito'), ('YAPE', 'Yape'), ('PAYPAL', 'PayPal'), ('N/A', 'No Aplica')], default='N/A', max_length=20, verbose_name='Método de Pago'),
        ),
        migrations.AddField(
            model_name='movimientoinventario',
            name='payment_status',
            field=models.CharField(choices=[('PENDING', 'Pendiente'), ('PAID', 'Pagado'), ('FAILED', 'Fallido'), ('REFUNDED', 'Reembolsado'), ('N/A', 'No Aplica')], default='N/A', max_length=20, verbose_name='Estado del Pago'),
        ),
        migrations.AddField(
            model_name='movimientoinventario',
            name='total_amount',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Monto total de la transacción', max_digits=12, null=True, verbose_name='Monto Total'),
        ),
        migrations.AddField(
            model_name='movimientoinventario',
            name='currency',
            field=models.CharField(choices=[('PEN', 'Soles (PEN)'), ('USD', 'Dólares (USD)')], default='PEN', max_length=3, verbose_name='Moneda'),
        ),
        # Actualizar verbose_name_plural
        migrations.AlterModelOptions(
            name='movimientoinventario',
            options={'ordering': ['-fecha'], 'verbose_name': 'Movimiento de Inventario', 'verbose_name_plural': 'Movimientos de Inventario / Historial de Compras'},
        ),
    ]
