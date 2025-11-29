import os
import django
from django.core.files import File
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from marketing.models import Banner

def load_banners():
    print("Iniciando carga de banners...")
    
    banners_dir = os.path.join(settings.MEDIA_ROOT, 'banners')
    if not os.path.exists(banners_dir):
        print(f"Directorio no encontrado: {banners_dir}")
        return

    files = [f for f in os.listdir(banners_dir) if os.path.isfile(os.path.join(banners_dir, f))]
    
    if not files:
        print("No se encontraron imágenes en media/banners/")
        return

    count = 0
    for filename in files:
        # Ignorar archivos ocultos o no imágenes
        if filename.startswith('.') or not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            continue

        # Verificar si ya existe un banner con esta imagen (aproximación por nombre)
        # La ruta en la BD sería 'banners/filename'
        db_path = f'banners/{filename}'
        if Banner.objects.filter(imagen=db_path).exists():
            print(f"Banner ya existe para: {filename}")
            continue

        # Crear título basado en el nombre del archivo
        titulo = filename.split('.')[0].replace('_', ' ').replace('-', ' ').title()
        
        # Crear objeto Banner
        # Nota: No necesitamos abrir el archivo si ya está en la ruta correcta, 
        # pero Django ImageField espera un archivo para guardar. 
        # Sin embargo, si asignamos el string path directamente, Django asume que está relativo a MEDIA_ROOT.
        
        banner = Banner(
            titulo=titulo,
            imagen=db_path  # Asignamos la ruta relativa directamente
        )
        banner.save()
        print(f"Banner creado: {titulo}")
        count += 1

    print(f"Proceso finalizado. {count} banners nuevos creados.")

if __name__ == '__main__':
    load_banners()
