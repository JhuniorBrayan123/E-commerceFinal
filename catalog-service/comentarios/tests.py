from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from sensores.models import Sensor
from categorias.models import Categoria
from comentarios.models import Comentario
from decimal import Decimal


class ComentarioViewTest(APITestCase):
    """
    Tests para las vistas de comentarios
    """
    
    def setUp(self):
        """Configurar datos de prueba"""
        # Crear usuario
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        
        # Crear categoría y sensor
        self.categoria = Categoria.objects.create(
            nombre='Sensores',
            descripcion='Test'
        )
        
        self.sensor = Sensor.objects.create(
            nombre='Sensor Test',
            descripcion='Test',
            precio=Decimal('100.00'),
            stock=10,
            categoria=self.categoria,
            marca='Test',
            modelo='T001',
            disponible=True
        )

    def test_perform_create_asocia_usuario_correctamente(self):
        """
        Test #27: perform_create() debe asociar el usuario autenticado al comentario
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(comentario.usuario, self.user)' por 'self.assertNotEqual(comentario.usuario, self.user)'
        - El test fallará porque el usuario asociado sí es el correcto
        """
        print("Test #27: perform_create() debe asociar el usuario autenticado al comentario")
        # Autenticar el usuario
        self.client.force_authenticate(user=self.user)
        
        data = {
            'id_sensor': self.sensor.id,
            'contenido': 'Excelente producto'
        }
        
        response = self.client.post('/api/comentarios/', data, format='json')
        
        # Verificar que se creó correctamente
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que el comentario está asociado al usuario correcto
        comentario = Comentario.objects.get(id=response.data['id'])
        self.assertEqual(comentario.usuario, self.user)

    def test_get_queryset_filtra_por_sensor_id(self):
        """
        Test #28: get_queryset() debe filtrar comentarios por sensor_id
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertIn(comentario1.id, comentario_ids)' por 'self.assertNotIn(comentario1.id, comentario_ids)'
        - El test fallará porque el comentario 1 sí debería estar en los resultados
        """
        print("Test #28: get_queryset() debe filtrar comentarios por sensor_id")
        # Crear otro sensor
        sensor2 = Sensor.objects.create(
            nombre='Otro Sensor',
            descripcion='Test',
            precio=Decimal('80.00'),
            stock=5,
            categoria=self.categoria,
            marca='Test',
            modelo='T002',
            disponible=True
        )
        
        # Crear comentarios para ambos sensores
        comentario1 = Comentario.objects.create(
            usuario=self.user,
            id_sensor=self.sensor,
            contenido='Comentario sensor 1'
        )
        
        comentario2 = Comentario.objects.create(
            usuario=self.user,
            id_sensor=sensor2,
            contenido='Comentario sensor 2'
        )
        
        # Filtrar por sensor 1
        response = self.client.get(f'/api/comentarios/?sensor_id={self.sensor.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # La respuesta es paginada, los datos están en 'results'
        self.assertEqual(response.data['count'], 1)
        comentario_ids = [c['id'] for c in response.data['results']]
        self.assertIn(comentario1.id, comentario_ids)
        self.assertNotIn(comentario2.id, comentario_ids)

    def test_get_queryset_ordena_por_fecha_creacion_desc(self):
        """
        Test #29: get_queryset() debe ordenar comentarios por -fecha_creacion
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(results[0]['id'], comentario_nuevo.id)' por 'self.assertEqual(results[0]['id'], comentario_antiguo.id)'
        - El test fallará porque el primer resultado debería ser el nuevo, no el antiguo
        """
        print("Test #29: get_queryset() debe ordenar comentarios por -fecha_creacion")
        # Crear múltiples comentarios
        comentario_antiguo = Comentario.objects.create(
            usuario=self.user,
            id_sensor=self.sensor,
            contenido='Comentario antiguo'
        )
        
        comentario_nuevo = Comentario.objects.create(
            usuario=self.user,
            id_sensor=self.sensor,
            contenido='Comentario nuevo'
        )
        
        # Obtener comentarios (deben estar ordenados por fecha desc)
        response = self.client.get(f'/api/comentarios/?sensor_id={self.sensor.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # La respuesta es paginada, los datos están en 'results'
        self.assertEqual(response.data['count'], 2)
        results = response.data['results']
        self.assertGreaterEqual(len(results), 2)
        
        # El primer comentario debe ser el más reciente
        self.assertEqual(results[0]['id'], comentario_nuevo.id)
        # El segundo debe ser el más antiguo
        self.assertEqual(results[1]['id'], comentario_antiguo.id)
