from django.core.management.base import BaseCommand
from categorias.models import Categoria
from sensores.models import Sensor


class Command(BaseCommand):
    help = 'Crea categorías y sensores iniciales para el e-commerce'

    def handle(self, *args, **options):
        self.stdout.write('Creando datos iniciales...')

        # Crear categorías
        categorias_data = [
            {
                'nombre': 'Sensores de Temperatura',
                'descripcion': 'Sensores para medir temperatura ambiental e industrial',
                'sensores': [
                    {'nombre': 'Sensor DHT11', 'marca': 'Generic', 'modelo': 'DHT11-V1', 'descripcion': 'Sensor digital de temperatura y humedad básico', 'precio': 15.50, 'stock': 50, 'rango': '0-50°C', 'precision': '±2°C', 'alimentacion': '3.3-5V', 'protocolo': 'Digital 1-wire'},
                    {'nombre': 'Sensor DHT22', 'marca': 'Aosong', 'modelo': 'AM2302', 'descripcion': 'Sensor digital de temperatura y humedad de alta precisión', 'precio': 25.90, 'stock': 30, 'rango': '-40-80°C', 'precision': '±0.5°C', 'alimentacion': '3.3-6V', 'protocolo': 'Digital 1-wire'},
                    {'nombre': 'Termopar Tipo K', 'marca': 'Omega', 'modelo': 'K-Type-Probe', 'descripcion': 'Sonda de temperatura para altas temperaturas', 'precio': 45.00, 'stock': 20, 'rango': '-200-1350°C', 'precision': '±2.2°C', 'alimentacion': 'N/A', 'protocolo': 'Analógico'},
                ]
            },
            {
                'nombre': 'Sensores de Distancia',
                'descripcion': 'Sensores para medir proximidad y distancia',
                'sensores': [
                    {'nombre': 'Ultrasonido HC-SR04', 'marca': 'ElecFreaks', 'modelo': 'HC-SR04', 'descripcion': 'Sensor de distancia ultrasónico económico', 'precio': 12.00, 'stock': 100, 'rango': '2cm-400cm', 'precision': '3mm', 'alimentacion': '5V', 'protocolo': 'TTL Pulse'},
                    {'nombre': 'LIDAR Lite v3', 'marca': 'Garmin', 'modelo': 'LLV3', 'descripcion': 'Sensor láser de distancia de alto rendimiento', 'precio': 350.00, 'stock': 10, 'rango': '0-40m', 'precision': '±2.5cm', 'alimentacion': '5V', 'protocolo': 'I2C/PWM'},
                ]
            },
            {
                'nombre': 'Sensores de Gas',
                'descripcion': 'Detectores de gases y calidad de aire',
                'sensores': [
                    {'nombre': 'Sensor MQ-2', 'marca': 'Hanwei', 'modelo': 'MQ-2', 'descripcion': 'Detector de gas combustible y humo', 'precio': 18.50, 'stock': 40, 'rango': '300-10000ppm', 'precision': 'N/A', 'alimentacion': '5V', 'protocolo': 'Analógico/Digital'},
                    {'nombre': 'Sensor CO2 MH-Z19', 'marca': 'Winsen', 'modelo': 'MH-Z19B', 'descripcion': 'Sensor infrarrojo de dióxido de carbono', 'precio': 85.00, 'stock': 15, 'rango': '0-5000ppm', 'precision': '±50ppm', 'alimentacion': '5V', 'protocolo': 'UART/PWM'},
                ]
            },
        ]

        # Crear categorías y sensores
        for cat_data in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={'descripcion': cat_data['descripcion']}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Categoría creada: {categoria.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠ Categoría ya existe: {categoria.nombre}'))
            
            # Crear sensores para esta categoría
            for sens_data in cat_data['sensores']:
                sensor, created = Sensor.objects.get_or_create(
                    nombre=sens_data['nombre'],
                    categoria=categoria,
                    defaults={
                        'marca': sens_data['marca'],
                        'modelo': sens_data['modelo'],
                        'descripcion': sens_data['descripcion'],
                        'precio': sens_data['precio'],
                        'stock': sens_data['stock'],
                        'rango_medicion': sens_data['rango'],
                        'precision': sens_data['precision'],
                        'alimentacion': sens_data['alimentacion'],
                        'protocolo_comunicacion': sens_data['protocolo'],
                        'disponible': True
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Sensor creado: {sensor.nombre}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  ⚠ Sensor ya existe: {sensor.nombre}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Datos iniciales creados exitosamente!'))
        self.stdout.write(f'Total categorías: {Categoria.objects.count()}')
        self.stdout.write(f'Total sensores: {Sensor.objects.count()}')

