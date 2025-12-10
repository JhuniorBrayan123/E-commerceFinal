from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from cupones.models import Cupon
from django.urls import reverse


class CuponValidacionTest(APITestCase):
    """
    Tests para la funcionalidad de validación de cupones
    Endpoint: POST /api/cupones/validate/
    """
    
    def setUp(self):
        """Crear cupones de prueba para los tests"""
        # Cupón válido (porcentaje)
        self.cupon_valido = Cupon.objects.create(
            codigo='VERANO2025',
            descripcion='Descuento de verano',
            tipo_descuento='porcentaje',
            valor_descuento=Decimal('20.00'),
            fecha_inicio=timezone.now() - timedelta(days=1),
            fecha_fin=timezone.now() + timedelta(days=30),
            monto_minimo=Decimal('50.00'),
            usos_maximos=100,
            usos_actuales=0,
            usos_por_usuario=3,
            activo=True
        )
        
        # Cupón inactivo
        self.cupon_inactivo = Cupon.objects.create(
            codigo='INACTIVO2025',
            descripcion='Cupón desactivado',
            tipo_descuento='porcentaje',
            valor_descuento=Decimal('10.00'),
            fecha_inicio=timezone.now() - timedelta(days=1),
            fecha_fin=timezone.now() + timedelta(days=30),
            monto_minimo=Decimal('0.00'),
            usos_maximos=100,
            usos_actuales=0,
            usos_por_usuario=1,
            activo=False  # ← Inactivo
        )
        
        # Cupón expirado
        self.cupon_expirado = Cupon.objects.create(
            codigo='EXPIRADO2024',
            descripcion='Cupón vencido',
            tipo_descuento='monto_fijo',
            valor_descuento=Decimal('15.00'),
            fecha_inicio=timezone.now() - timedelta(days=60),
            fecha_fin=timezone.now() - timedelta(days=1),  # ← Expirado
            monto_minimo=Decimal('0.00'),
            usos_maximos=50,
            usos_actuales=0,
            usos_por_usuario=1,
            activo=True
        )

    def test_rechaza_cupon_inexistente(self):
        """
        Test #30: validar_cupon() debe rechazar cupón inexistente
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertFalse(response.data['valid'])' por 'self.assertTrue(response.data['valid'])'
        - El test fallará porque se espera que el cupón sea inválido
        """
        print("Test #30: validar_cupon() debe rechazar cupón inexistente")
        # Usar URL directa en lugar de reverse()
        url = '/api/cupones/validate/'
        data = {
            'codigo': 'NOEXISTE',
            'total': 100.00,
            'usuario_id': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, '❌ Test #30 FALLÓ: status_code debe ser 200 OK')
        self.assertFalse(response.data['valid'], '❌ Test #30 FALLÓ: cupón inexistente debe ser inválido')
        self.assertIn('no existe', response.data['message'].lower(), '❌ Test #30 FALLÓ: mensaje debe indicar que no existe')
        self.assertEqual(response.data['discount'], 0, '❌ Test #30 FALLÓ: descuento debe ser 0')

    def test_rechaza_cupon_inactivo(self):
        """
        Test #31: validar_cupon() debe rechazar cupón inactivo
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertFalse(response.data['valid'])' por 'self.assertTrue(response.data['valid'])'
        - El test fallará porque se espera que el cupón sea inválido
        """
        print("Test #31: validar_cupon() debe rechazar cupón inactivo")
        url = '/api/cupones/validate/'
        data = {
            'codigo': 'INACTIVO2025',
            'total': 100.00,
            'usuario_id': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, '❌ Test #31 FALLÓ: status_code debe ser 200 OK')
        self.assertFalse(response.data['valid'], '❌ Test #31 FALLÓ: cupón inactivo debe ser inválido')
        self.assertIn('desactivado', response.data['message'].lower(), '❌ Test #31 FALLÓ: mensaje debe indicar que está desactivado')
        self.assertEqual(response.data['discount'], 0, '❌ Test #31 FALLÓ: descuento debe ser 0')

    def test_rechaza_cupon_expirado(self):
        """
        Test #32: validar_cupon() debe rechazar cupón expirado
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertFalse(response.data['valid'])' por 'self.assertTrue(response.data['valid'])'
        - El test fallará porque se espera que el cupón sea inválido
        """
        print("Test #32: validar_cupon() debe rechazar cupón expirado")
        url = '/api/cupones/validate/'
        data = {
            'codigo': 'EXPIRADO2024',
            'total': 100.00,
            'usuario_id': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, '❌ Test #32 FALLÓ: status_code debe ser 200 OK')
        self.assertFalse(response.data['valid'], '❌ Test #32 FALLÓ: cupón expirado debe ser inválido')
        self.assertIn('expirado', response.data['message'].lower(), '❌ Test #32 FALLÓ: mensaje debe indicar que está expirado')
        self.assertEqual(response.data['discount'], 0, '❌ Test #32 FALLÓ: descuento debe ser 0')

    def test_calcula_descuento_porcentaje_correctamente(self):
        """
        Test #33: validar_cupon() debe calcular descuento porcentaje correctamente
        Cupón: 20% de descuento, Total: 100.00 → Descuento: 20.00
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(float(response.data['discount']), 20.00)' por 'self.assertEqual(float(response.data['discount']), 50.00)'
        - El test fallará porque el descuento calculado no coincidirá
        """
        print("Test #33: validar_cupon() debe calcular descuento porcentaje correctamente")
        url = '/api/cupones/validate/'
        data = {
            'codigo': 'VERANO2025',
            'total': 100.00,
            'usuario_id': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, '❌ Test #33 FALLÓ: status_code debe ser 200 OK')
        self.assertTrue(response.data['valid'], '❌ Test #33 FALLÓ: cupón válido debe ser válido')
        self.assertEqual(float(response.data['discount']), 20.00, '❌ Test #33 FALLÓ: descuento porcentaje debe ser 20.00')
        self.assertEqual(response.data['cupon_info']['codigo'], 'VERANO2025', '❌ Test #33 FALLÓ: código del cupón debe coincidir')

    def test_calcula_descuento_monto_fijo_correctamente(self):
        """
        Test #34: validar_cupon() debe calcular descuento monto_fijo correctamente
        
        CÓMO HACER FALLAR ESTE TEST:
        - Cambiar 'self.assertEqual(float(response.data['discount']), 50.00)' por 'self.assertEqual(float(response.data['discount']), 10.00)'
        - El test fallará porque el descuento calculado no coincidirá
        """
        print("Test #34: validar_cupon() debe calcular descuento monto_fijo correctamente")
        # Crear cupón de monto fijo
        cupon_fijo = Cupon.objects.create(
            codigo='FIJO50',
            descripcion='Descuento fijo de 50 soles',
            tipo_descuento='monto_fijo',
            valor_descuento=Decimal('50.00'),
            fecha_inicio=timezone.now() - timedelta(days=1),
            fecha_fin=timezone.now() + timedelta(days=30),
            monto_minimo=Decimal('100.00'),
            usos_maximos=50,
            usos_actuales=0,
            usos_por_usuario=1,
            activo=True
        )
        
        url = '/api/cupones/validate/'
        data = {
            'codigo': 'FIJO50',
            'total': 150.00,
            'usuario_id': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, '❌ Test #34 FALLÓ: status_code debe ser 200 OK')
        self.assertTrue(response.data['valid'], '❌ Test #34 FALLÓ: cupón válido debe ser válido')
        self.assertEqual(float(response.data['discount']), 50.00, '❌ Test #34 FALLÓ: descuento monto fijo debe ser 50.00')
        self.assertEqual(response.data['cupon_info']['tipo'], 'monto_fijo', '❌ Test #34 FALLÓ: tipo de cupón debe ser "monto_fijo"')
