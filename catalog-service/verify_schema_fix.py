import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute("DESCRIBE orders_itemorden")
    print("Current columns in orders_itemorden:")
    for col in cursor.fetchall():
        print(f"  - {col[0]} ({col[1]})")
