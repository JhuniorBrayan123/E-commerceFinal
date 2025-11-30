import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.db import connection
from django.apps import apps

print("="*80)
print("TESTING ADMIN CRUD OPERATIONS")
print("="*80)

# Test that critical models can be accessed
models_to_test = [
    ('sensores', 'Sensor'),
    ('categorias', 'Categoria'),
    ('orders', 'Orden'),
    ('orders', 'ItemOrden'),
    ('cupones', 'Cupon'),
    ('comentarios', 'Comentario'),
]

for app_name, model_name in models_to_test:
    try:
        model = apps.get_model(app_name, model_name)
        count = model.objects.count()
        print(f"✅ {app_name}.{model_name}: {count} records")
        
        # Check for FK issues
        for field in model._meta.get_fields():
            if field.many_to_one:
                related_model = field.related_model
                related_table = related_model._meta.db_table
                
                # Verify the related table exists
                with connection.cursor() as cursor:
                    cursor.execute(f"SHOW TABLES LIKE '{related_table}'")
                    if not cursor.fetchone():
                        print(f"   ⚠️  FK to missing table: {field.name} → {related_table}")
                    
    except Exception as e:
        print(f"❌ {app_name}.{model_name}: ERROR - {str(e)}")

print("\n" + "="*80)
print("VERIFICATION COMPLETE")
print("="*80)
