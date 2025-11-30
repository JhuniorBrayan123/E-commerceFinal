import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Get all tables
    cursor.execute("SHOW TABLES")
    all_tables = [row[0] for row in cursor.fetchall()]
    
    print("="*80)
    print("ALL TABLES IN DATABASE")
    print("="*80)
    
    expected_tables = [
        'sensores_sensor',
        'categorias_categoria', 
        'orders_orden',
        'orders_itemorden',
        'cupones_cupon',
        'cupones_usocupon',
        'comentarios_comentario',
        'preferencias_preferencia',
        'marketing_banner',
        'inventario_movimiento',
    ]
    
    obsolete_tables = []
    
    for table in sorted(all_tables):
        if 'producto' in table.lower():
            obsolete_tables.append(table)
            print(f"❌ OBSOLETE: {table}")
        elif table.startswith('auth_') or table.startswith('django_'):
            print(f"✅ SYSTEM: {table}")
        elif table in expected_tables:
            print(f"✅ ACTIVE: {table}")
        else:
            print(f"⚠️  UNKNOWN: {table}")
    
    if obsolete_tables:
        print("\n" + "="*80)
        print("OBSOLETE TABLES FOUND (need to be dropped):")
        print("="*80)
        for table in obsolete_tables:
            print(f"  - {table}")
            
            # Check what references this table
            cursor.execute(f"""
                SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                    AND REFERENCED_TABLE_NAME = '{table}'
            """)
            refs = cursor.fetchall()
            if refs:
                print(f"    Referenced by:")
                for ref in refs:
                    print(f"      - {ref[0]}.{ref[1]} (constraint: {ref[2]})")
