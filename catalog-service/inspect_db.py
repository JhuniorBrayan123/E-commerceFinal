import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute("DESCRIBE orders_itemorden")
    columns = [col[0] for col in cursor.fetchall()]
    print("Columns in orders_itemorden:", columns)
