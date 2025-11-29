import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

def clean_migrations():
    print("Limpiando historial de migraciones para 'orders' e 'inventario'...")
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM django_migrations WHERE app IN ('orders', 'inventario')")
        print(f"Registros eliminados: {cursor.rowcount}")

if __name__ == '__main__':
    clean_migrations()
