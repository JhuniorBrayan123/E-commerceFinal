import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.db import connection
from django.apps import apps

def get_table_columns(table_name):
    """Get all columns for a table"""
    with connection.cursor() as cursor:
        cursor.execute(f"DESCRIBE {table_name}")
        return {row[0]: row[1] for row in cursor.fetchall()}

def get_foreign_keys(table_name):
    """Get all foreign keys for a table"""
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT 
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME,
                CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = '{table_name}'
                AND REFERENCED_TABLE_NAME IS NOT NULL
        """)
        return cursor.fetchall()

print("="*80)
print("DATABASE SCHEMA AUDIT")
print("="*80)

# Get all models from catalog-service apps
apps_to_check = ['sensores', 'categorias', 'orders', 'cupones', 'comentarios', 'preferencias', 'marketing', 'inventario']

for app_name in apps_to_check:
    try:
        app_models = apps.get_app_config(app_name).get_models()
        
        print(f"\n{'='*80}")
        print(f"APP: {app_name}")
        print(f"{'='*80}")
        
        for model in app_models:
            table_name = model._meta.db_table
            print(f"\n📋 Model: {model.__name__} → Table: {table_name}")
            
            try:
                # Get actual DB columns
                db_columns = get_table_columns(table_name)
                print(f"   ✅ Actual DB Columns: {list(db_columns.keys())}")
                
                # Get model fields
                model_fields = []
                for field in model._meta.get_fields():
                    if hasattr(field, 'column'):
                        model_fields.append(field.column)
                
                print(f"   📝 Expected Model Fields: {model_fields}")
                
                # Check for mismatches
                missing_in_db = set(model_fields) - set(db_columns.keys())
                extra_in_db = set(db_columns.keys()) - set(model_fields)
                
                if missing_in_db:
                    print(f"   ⚠️  MISSING IN DB: {missing_in_db}")
                if extra_in_db:
                    print(f"   ℹ️  EXTRA IN DB: {extra_in_db}")
                
                # Get foreign keys
                fks = get_foreign_keys(table_name)
                if fks:
                    print(f"   🔗 Foreign Keys:")
                    for fk in fks:
                        print(f"      - {fk[0]} → {fk[1]}.{fk[2]} (constraint: {fk[3]})")
                        
            except Exception as e:
                print(f"   ❌ ERROR: {str(e)}")
                
    except Exception as e:
        print(f"\n❌ Error accessing app {app_name}: {str(e)}")

print("\n" + "="*80)
print("AUDIT COMPLETE")
print("="*80)
