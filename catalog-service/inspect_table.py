import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute("SHOW CREATE TABLE orders_itemorden")
    row = cursor.fetchone()
    with open('table_schema.txt', 'w', encoding='utf-8') as f:
        f.write(row[1])
