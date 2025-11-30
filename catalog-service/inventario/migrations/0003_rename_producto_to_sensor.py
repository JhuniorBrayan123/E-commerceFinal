# Generated manually - Rename producto_id to sensor_id

from django.db import migrations, connection


def rename_producto_to_sensor(apps, schema_editor):
    """
    Renombra la columna producto_id a sensor_id si existe.
    Si la columna sensor_id ya existe, no hace nada.
    """
    with connection.cursor() as cursor:
        # Verificar si existe la columna producto_id
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'inventario_movimientoinventario'
            AND COLUMN_NAME = 'producto_id'
        """)
        producto_exists = cursor.fetchone()[0] > 0
        
        # Verificar si existe la columna sensor_id
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'inventario_movimientoinventario'
            AND COLUMN_NAME = 'sensor_id'
        """)
        sensor_exists = cursor.fetchone()[0] > 0
        
        # Solo renombrar si producto_id existe y sensor_id no existe
        if producto_exists and not sensor_exists:
            cursor.execute("""
                ALTER TABLE inventario_movimientoinventario 
                CHANGE COLUMN producto_id sensor_id BIGINT NOT NULL
            """)


def reverse_rename(apps, schema_editor):
    """
    Revierte el cambio: renombra sensor_id a producto_id
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'inventario_movimientoinventario'
            AND COLUMN_NAME = 'sensor_id'
        """)
        sensor_exists = cursor.fetchone()[0] > 0
        
        if sensor_exists:
            cursor.execute("""
                ALTER TABLE inventario_movimientoinventario 
                CHANGE COLUMN sensor_id producto_id BIGINT NOT NULL
            """)


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0002_add_purchase_history_fields'),
    ]

    operations = [
        migrations.RunPython(rename_producto_to_sensor, reverse_rename),
    ]

