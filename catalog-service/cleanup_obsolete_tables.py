import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.db import connection

print("="*80)
print("CLEANING UP OBSOLETE TABLES")
print("="*80)

with connection.cursor() as cursor:
    # Check if productos_producto exists
    cursor.execute("SHOW TABLES LIKE 'productos_producto'")
    if cursor.fetchone():
        print("\n🗑️  Dropping obsolete table: productos_producto")
        
        # First, we need to drop all FK constraints that reference this table
        cursor.execute("""
            SELECT TABLE_NAME, CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                AND REFERENCED_TABLE_NAME = 'productos_producto'
        """)
        constraints = cursor.fetchall()
        
        for table_name, constraint_name in constraints:
            print(f"   Dropping FK constraint: {table_name}.{constraint_name}")
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {constraint_name}")
        
        # Now drop the table
        print(f"   Dropping table: productos_producto")
        cursor.execute("DROP TABLE productos_producto")
        
        print("✅ productos_producto table dropped successfully")
    else:
        print("✅ productos_producto table does not exist (already clean)")
    
    # Check for other obsolete tables
    cursor.execute("SHOW TABLES")
    all_tables = [row[0] for row in cursor.fetchall()]
    
    obsolete_patterns = ['producto', 'banner_producto']
    for table in all_tables:
        if any(pattern in table.lower() for pattern in obsolete_patterns) and table != 'productos_producto':
            print(f"\n⚠️  Found potentially obsolete table: {table}")
            print(f"   Please review manually before dropping")

print("\n" + "="*80)
print("CLEANUP COMPLETE")
print("="*80)
