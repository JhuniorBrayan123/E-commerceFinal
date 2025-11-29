from django.core.management.base import BaseCommand
from sensores.models import Sensor
from categorias.models import Categoria
from random import randint, choice
import decimal

class Command(BaseCommand):
    help = "Carga 40 sensores de ejemplo en la base de datos"

    def handle(self, *args, **kwargs):

        sensores_data = [
            {
                "nombre": "Sensor de Temperatura DS18B20",
                "marca": "Maxim",
                "modelo": "DS18B20",
                "precio": "5.00",
                "descripcion": "Sonda digital impermeable.",
                "rango_medicion": "-55°C a +125°C",
                "precision": "±0.5°C",
                "alimentacion": "3-5.5V",
                "protocolo_comunicacion": "1-Wire",
                "imagen": "sensores/temperatura.jpg"
            },
            {
                "nombre": "Sensor de Humedad DHT22",
                "marca": "Aosong",
                "modelo": "DHT22",
                "precio": "9.50",
                "descripcion": "Sensor de humedad y temperatura.",
                "rango_medicion": "0-100% HR",
                "precision": "±2%",
                "alimentacion": "3.3-5V",
                "protocolo_comunicacion": "Digital",
                "imagen": "sensores/humedad.jpg"
            },
            {
                "nombre": "Sensor de Gas MQ-2",
                "marca": "Winsen",
                "modelo": "MQ-2",
                "precio": "7.00",
                "descripcion": "Detecta gases inflamables y humo.",
                "rango_medicion": "300-10000 ppm",
                "precision": "±3%",
                "alimentacion": "5V",
                "protocolo_comunicacion": "Analógico",
                "imagen": "sensores/gas.jpg"
            },
            {
                "nombre": "Sensor de Presión BMP280",
                "marca": "Bosch",
                "modelo": "BMP280",
                "precio": "15.00",
                "descripcion": "Sensor barométrico de presión y altitud.",
                "rango_medicion": "300-1100 hPa",
                "precision": "±1 hPa",
                "alimentacion": "3.3V",
                "protocolo_comunicacion": "I2C",
                "imagen": "sensores/presion.jpg"
            },
            {
                "nombre": "Sensor Ultrasónico HC-SR04",
                "marca": "Elegoo",
                "modelo": "HC-SR04",
                "precio": "6.00",
                "descripcion": "Medición ultrasónica de distancia.",
                "rango_medicion": "2cm - 400cm",
                "precision": "±3mm",
                "alimentacion": "5V",
                "protocolo_comunicacion": "Ultrasonido",
                "imagen": "sensores/distancia.jpg"
            }
        ]

        for i in range(40):  # 40 sensores 🔥
            data = choice(sensores_data)
            categoria_id = randint(1, 5)  # Categorías 1-5

            try:
                categoria = Categoria.objects.get(id=categoria_id)
            except Categoria.DoesNotExist:
                self.stdout.write(self.style.ERROR(
                    f"⚠ ERROR: La categoría ID {categoria_id} no existe. Crea las categorías 1-5 primero."
                ))
                return

            stock_random = randint(0, 50)

            Sensor.objects.create(
                nombre=f"{data['nombre']} #{i+1}",
                categoria=categoria,
                marca=data["marca"],
                modelo=data["modelo"],
                precio=decimal.Decimal(data["precio"]),
                descripcion=data["descripcion"],
                rango_medicion=data["rango_medicion"],
                precision=data["precision"],
                alimentacion=data["alimentacion"],
                protocolo_comunicacion=data["protocolo_comunicacion"],
                stock=stock_random,
                disponible=stock_random > 0,
                imagen=data["imagen"]  # rutas en MEDIA/sensores/
            )

        self.stdout.write(self.style.SUCCESS("\n🔥 40 sensores agregados correctamente 🚀"))