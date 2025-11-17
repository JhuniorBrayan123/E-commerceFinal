from django.core.management.base import BaseCommand
from categorias.models import Categoria
from productos.models import Producto


class Command(BaseCommand):
    help = 'Crea categorías y productos iniciales para el e-commerce'

    def handle(self, *args, **options):
        self.stdout.write('Creando datos iniciales...')

        # Crear categorías
        categorias_data = [
            {
                'nombre': 'Electrónica',
                'descripcion': 'Dispositivos electrónicos y gadgets tecnológicos',
                'productos': [
                    {'nombre': 'Smartphone Samsung Galaxy S24', 'descripcion': 'Teléfono inteligente con pantalla AMOLED de 6.7 pulgadas, 128GB de almacenamiento', 'precio': 899.99, 'stock': 50},
                    {'nombre': 'Laptop Dell XPS 15', 'descripcion': 'Laptop de alto rendimiento con procesador Intel i7, 16GB RAM, 512GB SSD', 'precio': 1499.99, 'stock': 30},
                    {'nombre': 'Auriculares Sony WH-1000XM5', 'descripcion': 'Auriculares inalámbricos con cancelación de ruido activa', 'precio': 399.99, 'stock': 75},
                    {'nombre': 'Tablet iPad Pro 12.9"', 'descripcion': 'Tablet profesional con pantalla Retina, 256GB de almacenamiento', 'precio': 1099.99, 'stock': 40},
                    {'nombre': 'Smartwatch Apple Watch Series 9', 'descripcion': 'Reloj inteligente con GPS, monitor de salud y resistencia al agua', 'precio': 429.99, 'stock': 60},
                ]
            },
            {
                'nombre': 'Ropa y Moda',
                'descripcion': 'Ropa, calzado y accesorios de moda',
                'productos': [
                    {'nombre': 'Camiseta Nike Dri-FIT', 'descripcion': 'Camiseta deportiva transpirable, talla M', 'precio': 29.99, 'stock': 100},
                    {'nombre': 'Zapatillas Adidas Ultraboost', 'descripcion': 'Zapatillas deportivas con tecnología Boost, talla 42', 'precio': 179.99, 'stock': 80},
                    {'nombre': 'Jeans Levis 501', 'descripcion': 'Jeans clásicos de corte recto, talla 32x32', 'precio': 89.99, 'stock': 90},
                    {'nombre': 'Chaqueta The North Face', 'descripcion': 'Chaqueta impermeable para actividades al aire libre, talla L', 'precio': 199.99, 'stock': 45},
                    {'nombre': 'Vestido Casual Zara', 'descripcion': 'Vestido elegante para ocasiones casuales, talla M', 'precio': 49.99, 'stock': 70},
                ]
            },
            {
                'nombre': 'Hogar y Jardín',
                'descripcion': 'Artículos para el hogar, decoración y jardín',
                'productos': [
                    {'nombre': 'Aspiradora Robot Roomba i7', 'descripcion': 'Aspiradora robot inteligente con mapeo de habitaciones', 'precio': 599.99, 'stock': 25},
                    {'nombre': 'Juego de Sábanas de Algodón', 'descripcion': 'Juego de sábanas 100% algodón, tamaño Queen', 'precio': 39.99, 'stock': 120},
                    {'nombre': 'Mesa de Comedor de Madera', 'descripcion': 'Mesa de comedor para 6 personas, madera de roble', 'precio': 499.99, 'stock': 15},
                    {'nombre': 'Set de Ollas Antiadherentes', 'descripcion': 'Set de 5 ollas con recubrimiento antiadherente', 'precio': 79.99, 'stock': 85},
                    {'nombre': 'Cortadora de Césped Eléctrica', 'descripcion': 'Cortadora de césped eléctrica con cable de 10 metros', 'precio': 149.99, 'stock': 35},
                ]
            },
            {
                'nombre': 'Deportes y Fitness',
                'descripcion': 'Equipamiento deportivo y artículos de fitness',
                'productos': [
                    {'nombre': 'Bicicleta de Montaña Trek', 'descripcion': 'Bicicleta de montaña con 21 velocidades, suspensión delantera', 'precio': 599.99, 'stock': 20},
                    {'nombre': 'Mancuernas Ajustables 20kg', 'descripcion': 'Par de mancuernas ajustables de 2.5kg a 10kg cada una', 'precio': 89.99, 'stock': 50},
                    {'nombre': 'Colchoneta de Yoga Premium', 'descripcion': 'Colchoneta de yoga antideslizante, grosor 6mm', 'precio': 24.99, 'stock': 150},
                    {'nombre': 'Pelota de Fútbol Adidas', 'descripcion': 'Pelota de fútbol oficial, tamaño 5', 'precio': 34.99, 'stock': 95},
                    {'nombre': 'Cinta de Correr Plegable', 'descripcion': 'Cinta de correr eléctrica con inclinación ajustable', 'precio': 449.99, 'stock': 12},
                ]
            },
            {
                'nombre': 'Libros y Entretenimiento',
                'descripcion': 'Libros, música, películas y entretenimiento',
                'productos': [
                    {'nombre': 'Kindle Paperwhite', 'descripcion': 'Lector de libros electrónicos con pantalla iluminada, 8GB', 'precio': 129.99, 'stock': 65},
                    {'nombre': 'Libro "El Código Da Vinci"', 'descripcion': 'Novela de misterio de Dan Brown, tapa blanda', 'precio': 14.99, 'stock': 200},
                    {'nombre': 'Auriculares Gaming Razer Kraken', 'descripcion': 'Auriculares gaming con micrófono retráctil y sonido 7.1', 'precio': 79.99, 'stock': 55},
                    {'nombre': 'Consola Nintendo Switch', 'descripcion': 'Consola de videojuegos portátil y de sobremesa', 'precio': 299.99, 'stock': 30},
                    {'nombre': 'Puzzle 1000 Piezas', 'descripcion': 'Puzzle de 1000 piezas con imagen de paisaje', 'precio': 19.99, 'stock': 110},
                ]
            },
        ]

        # Crear categorías y productos
        for cat_data in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={'descripcion': cat_data['descripcion']}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Categoría creada: {categoria.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠ Categoría ya existe: {categoria.nombre}'))
            
            # Crear productos para esta categoría
            for prod_data in cat_data['productos']:
                producto, created = Producto.objects.get_or_create(
                    nombre=prod_data['nombre'],
                    categoria=categoria,
                    defaults={
                        'descripcion': prod_data['descripcion'],
                        'precio': prod_data['precio'],
                        'stock': prod_data['stock'],
                        'estado': 'activo'
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Producto creado: {producto.nombre}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  ⚠ Producto ya existe: {producto.nombre}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Datos iniciales creados exitosamente!'))
        self.stdout.write(f'Total categorías: {Categoria.objects.count()}')
        self.stdout.write(f'Total productos: {Producto.objects.count()}')

