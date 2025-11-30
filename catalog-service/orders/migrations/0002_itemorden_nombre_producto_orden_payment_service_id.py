
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemorden',
            name='nombre_producto',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='orden',
            name='payment_service_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
