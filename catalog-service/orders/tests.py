from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from sensores.models import Sensor
from categorias.models import Categoria
from orders.models import Orden
from decimal import Decimal


class OrderViewTest(APITestCase):
    """
    Tests para las vistas de órdenes
    Endpoints: POST /api/orders/create/, GET /api/mis-pedidos/
    """
    
    def setUp(self):
        """Configurar datos de prueba"""
        # Crear usuario de prueba
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        
        # Crear categoría de prueba
        self.categoria = Categoria.objects.create(
            nombre='Sensores Agrícolas',
            descripcion='Sensores para agricultura'
        )
        
        # Crear sensor con stock
        self.sensor = Sensor.objects.create(
            nombre='Sensor de Humedad DHT22',
            descripcion='Sensor de humedad y temperatura',
            precio=Decimal('95.00'),
            stock=10,
            categoria=self.categoria,
            marca='DHT',
            modelo='DHT22',
            disponible=True
        )
        
        # Crear sensor sin stock
        self.sensor_sin_stock = Sensor.objects.create(
            nombre='Sensor Agotado',
            descripcion='Este sensor no tiene stock',
            precio=Decimal('50.00'),
            stock=0,
            categoria=self.categoria,
            marca='Test',
            modelo='TEST001',
            disponible=False
        )

    def test_rechaza_usuario_inexistente(self):
        """
        Test #75: crear_orden() debe rechazar usuario inexistente (404)
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)' por 'self.assertEqual(response.status_code, status.HTTP_200_OK)'
        - El test fallará porque se espera un error 404
        """
        print("Test #75: crear_orden() debe rechazar usuario inexistente (404)")
        data = {
            'usuario_id': 99999,  # Usuario que no existe
            'sensores': [
                {'sensor_id': self.sensor.id, 'cantidad': 1}
            ],
            'total': 95.00
        }
        
        response = self.client.post('/api/orders/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
        self.assertIn('Usuario no encontrado', response.data['error'])

    def test_rechaza_sensor_sin_stock(self):
        """
        Test #76: crear_orden() debe rechazar sensor sin stock (400)
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)' por 'self.assertEqual(response.status_code, status.HTTP_201_CREATED)'
        - El test fallará porque se espera un error 400
        """
        print("Test #76: crear_orden() debe rechazar sensor sin stock (400)")
        data = {
            'usuario_id': self.user.id,
            'sensores': [
                {'sensor_id': self.sensor_sin_stock.id, 'cantidad': 1}
            ],
            'total': 50.00
        }
        
        response = self.client.post('/api/orders/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Stock insuficiente', response.data['error'])

    def test_crea_orden_con_datos_validos(self):
        """
        Test #77: crear_orden() debe crear orden con datos válidos (201)
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(response.status_code, status.HTTP_201_CREATED)' por 'self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)'
        - El test fallará porque se espera una creación exitosa (201)
        """
        print("Test #77: crear_orden() debe crear orden con datos válidos (201)")
        data = {
            'usuario_id': self.user.id,
            'sensores': [
                {'sensor_id': self.sensor.id, 'cantidad': 2}
            ],
            'total': 190.00
        }
        
        response = self.client.post('/api/orders/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['usuario'], self.user.id)
        self.assertEqual(response.data['estado'], 'pendiente')
        
        # Verificar que la orden se creó en la base de datos
        orden = Orden.objects.get(id=response.data['id'])
        self.assertEqual(orden.total, Decimal('190.00'))
        self.assertEqual(orden.usuario, self.user)

    def test_mis_pedidos_retorna_ordenes_del_usuario(self):
        """
        Test #78: mis_pedidos() debe retornar sólo las órdenes del usuario correcto
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(len(response.data), 1)' por 'self.assertEqual(len(response.data), 0)'
        - El test fallará porque se espera encontrar 1 orden
        """
        print("Test #78: mis_pedidos() debe retornar sólo las órdenes del usuario correcto")
        # Crear otro usuario
        otro_usuario = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='OtherPass123!'
        )
        
        # Crear órdenes para ambos usuarios
        orden_user1 = Orden.objects.create(
            usuario=self.user,
            total=Decimal('100.00'),
            estado='pendiente'
        )
        
        orden_user2 = Orden.objects.create(
            usuario=otro_usuario,
            total=Decimal('200.00'),
            estado='completada'
        )
        
        # Obtener órdenes del primer usuario
        response = self.client.get(f'/api/mis-pedidos/?user_id={self.user.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Debe retornar solo la orden del usuario 1
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], orden_user1.id)
        # No debe incluir la orden del otro usuario
        orden_ids = [orden['id'] for orden in response.data]
        self.assertNotIn(orden_user2.id, orden_ids)
