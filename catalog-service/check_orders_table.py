import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check orders_itemorden specifically
    print("ORDERS_ITEMORDEN TABLE STRUCTURE:")
    print("-" * 60)
    cursor.execute("DESCRIBE orders_itemorden")
    for row in cursor.fetchall():
        print(f"{row[0]:20s} {row[1]:20s} {row[2]:5s} {row[3]:5s}")
    
    print("\n" + "-" * 60)
    print("FOREIGN KEYS:")
    print("-" * 60)
    cursor.execute("""
        SELECT 
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME,
            CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'orders_itemorden'
            AND REFERENCED_TABLE_NAME IS NOT NULL
    """)
    for row in cursor.fetchall():
        print(f"{row[0]} → {row[1]}.{row[2]}")
        print(f"  Constraint: {row[3]}")
