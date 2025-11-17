from django.core.management.base import BaseCommand
from sensores.models import Sensor


class Command(BaseCommand):
    help = 'Crea sensores iniciales agrícolas en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creando sensores iniciales...'))

        sensores_data = [
            # Sensores de Humedad
            {
                'nombre': 'Sensor de Humedad del Suelo DHT22',
                'tipo': 'humedad',
                'marca': 'DHT',
                'modelo': 'DHT22',
                'precio': 25.99,
                'descripcion': 'Sensor de humedad y temperatura del suelo de alta precisión',
                'rango_medicion': '0-100% HR',
                'precision': '±2%',
                'alimentacion': 'Batería AA o 5V DC',
                'protocolo_comunicacion': 'Serial/OneWire',
                'stock': 15,
                'disponible': True
            },
            {
                'nombre': 'Sensor de Humedad Capacitivo V1.2',
                'tipo': 'humedad',
                'marca': 'YL-69',
                'modelo': 'V1.2',
                'precio': 12.50,
                'descripcion': 'Sensor capacitivo para medición directa de humedad del suelo',
                'rango_medicion': '0-100%',
                'precision': '±5%',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'Analógico',
                'stock': 25,
                'disponible': True
            },
            
            # Sensores de Temperatura
            {
                'nombre': 'Sensor de Temperatura DS18B20',
                'tipo': 'temperatura',
                'marca': 'Maxim',
                'modelo': 'DS18B20',
                'precio': 8.99,
                'descripcion': 'Sensor de temperatura digital con precisión de 0.5°C',
                'rango_medicion': '-55 a +125°C',
                'precision': '±0.5°C',
                'alimentacion': 'Parasitic o 3.3-5V',
                'protocolo_comunicacion': '1-Wire',
                'stock': 50,
                'disponible': True
            },
            {
                'nombre': 'Sensor Infrarrojo de Temperatura MLX90614',
                'tipo': 'temperatura',
                'marca': 'Melexis',
                'modelo': 'MLX90614',
                'precio': 45.99,
                'descripcion': 'Sensor infrarrojo sin contacto para temperatura',
                'rango_medicion': '-40 a +125°C',
                'precision': '±0.5°C',
                'alimentacion': '3.3-5V DC',
                'protocolo_comunicacion': 'I2C',
                'stock': 8,
                'disponible': True
            },

            # Sensores de pH
            {
                'nombre': 'Sensor de pH Analógico',
                'tipo': 'ph',
                'marca': 'DFRobot',
                'modelo': 'SEN0161',
                'precio': 39.99,
                'descripcion': 'Sensor de pH para medir acidez/alcalinidad del suelo',
                'rango_medicion': '0-14 pH',
                'precision': '±0.1 pH',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'Analógico',
                'stock': 12,
                'disponible': True
            },
            {
                'nombre': 'Sensor de pH Digital Inteligente',
                'tipo': 'ph',
                'marca': 'Atlas Scientific',
                'modelo': 'EZO-pH',
                'precio': 95.00,
                'descripcion': 'Sensor de pH digital con salida I2C y compensación de temperatura',
                'rango_medicion': '0-14 pH',
                'precision': '±0.01 pH',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'I2C/Serial',
                'stock': 3,
                'disponible': True
            },

            # Sensores de Luz
            {
                'nombre': 'Sensor de Luz LDR GL5528',
                'tipo': 'luz',
                'marca': 'Generic',
                'modelo': 'GL5528',
                'precio': 2.50,
                'descripcion': 'Resistencia dependiente de luz para medir intensidad luminosa',
                'rango_medicion': '8-1200 lux',
                'precision': '±10%',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'Analógico',
                'stock': 100,
                'disponible': True
            },
            {
                'nombre': 'Sensor de Luz BH1750FVI',
                'tipo': 'luz',
                'marca': 'ROHM',
                'modelo': 'BH1750FVI',
                'precio': 6.99,
                'descripcion': 'Sensor digital de luz ambiente de alta resolución',
                'rango_medicion': '1-65535 lux',
                'precision': '±15%',
                'alimentacion': '2.4-3.6V',
                'protocolo_comunicacion': 'I2C',
                'stock': 30,
                'disponible': True
            },

            # Sensores de Nutrientes
            {
                'nombre': 'Sensor de EC/Conductividad DFRobot',
                'tipo': 'nutrientes',
                'marca': 'DFRobot',
                'modelo': 'SEN0227',
                'precio': 49.99,
                'descripcion': 'Sensor de conductividad eléctrica para nutrientes del suelo',
                'rango_medicion': '0-2000 µS/cm',
                'precision': '±3%',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'Analógico',
                'stock': 10,
                'disponible': True
            },
            {
                'nombre': 'Sensor de Nutrientes NPK',
                'tipo': 'nutrientes',
                'marca': 'DFRobot',
                'modelo': 'SEN0395',
                'precio': 199.99,
                'descripcion': 'Sensor NPK para medir Nitrógeno, Fósforo y Potasio',
                'rango_medicion': '0-1999 mg/kg',
                'precision': '±2%',
                'alimentacion': '5-12V DC',
                'protocolo_comunicacion': 'Modbus',
                'stock': 2,
                'disponible': True
            },

            # Sensores de CO2
            {
                'nombre': 'Sensor de CO2 MH-Z19B',
                'tipo': 'co2',
                'marca': 'Winsen',
                'modelo': 'MH-Z19B',
                'precio': 55.00,
                'descripcion': 'Sensor CO2 infrarrojo no dispersivo de bajo costo',
                'rango_medicion': '0-5000 ppm',
                'precision': '±50 ppm',
                'alimentacion': '5V DC',
                'protocolo_comunicacion': 'Serial',
                'stock': 7,
                'disponible': True
            },
            {
                'nombre': 'Sensor de CO2 SCD41',
                'tipo': 'co2',
                'marca': 'Sensirion',
                'modelo': 'SCD41',
                'precio': 79.99,
                'descripcion': 'Sensor CO2 fotoacústico compacto con temperatura y humedad',
                'rango_medicion': '400-5000 ppm',
                'precision': '±(50 + 5%) ppm',
                'alimentacion': '3.3-5.5V',
                'protocolo_comunicacion': 'I2C',
                'stock': 5,
                'disponible': True
            },
        ]

        created_count = 0
        for sensor_data in sensores_data:
            sensor, created = Sensor.objects.get_or_create(
                nombre=sensor_data['nombre'],
                defaults=sensor_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Sensor creado: {sensor.nombre}')
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Sensor ya existe: {sensor.nombre}')
                )

        total_sensores = Sensor.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Proceso completado!\n'
                f'Sensores creados: {created_count}\n'
                f'Total de sensores: {total_sensores}'
            )
        )
