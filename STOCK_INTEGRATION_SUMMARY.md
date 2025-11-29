# Integración de Descuento de Stock - Payment Service y Catalog Service

## Resumen

Se ha implementado la integración completa para que cuando el Payment Service confirme un pago exitoso, automáticamente se descuente el stock de los sensores en el servicio de catálogo (Django REST Framework).

## Componentes Implementados

### 1. CatalogService (Java/Spring Boot)
**Archivo:** `payment-service/src/main/java/com/example/payment_service/service/CatalogService.java`

- Servicio que se comunica con el servicio de catálogo Django
- Utiliza WebClient para hacer peticiones HTTP asíncronas
- Método `deductStock()` que envía los items de la orden al endpoint de Django

**Características:**
- Comunicación asíncrona (no bloquea la respuesta del pago)
- Timeout de 10 segundos
- Logging completo para debugging
- Manejo de errores sin afectar el flujo del pago

### 2. DeductStockView (Django)
**Archivo:** `catalog-service/sensores/views.py`

- Endpoint POST `/api/sensores/deduct-stock/`
- Recibe una lista de items con `sensor_id` y `cantidad`
- Descuenta el stock de cada sensor
- Valida que haya suficiente stock antes de descontar
- Marca sensores como no disponibles si el stock llega a 0

**Características:**
- Validación de datos de entrada
- Verificación de stock disponible
- Manejo de errores por item (continúa procesando otros items)
- Respuestas detalladas con resultados y errores

### 3. Integración en OrderService
**Archivo:** `payment-service/src/main/java/com/example/payment_service/service/OrderService.java`

- Se llama a `catalogService.deductStock()` después de confirmar el pago exitosamente
- Se ejecuta de forma asíncrona para no bloquear la respuesta
- Los errores se loguean pero no revierten el pago (el pago ya fue confirmado)

## Flujo de Ejecución

1. **Cliente confirma el pago** → `POST /payment/confirm`
2. **Payment Service valida y procesa el pago**
3. **Estado de la orden cambia a PAID**
4. **Se llama asíncronamente a CatalogService.deductStock()**
5. **CatalogService envía petición a Django** → `POST /api/sensores/deduct-stock/`
6. **Django descuenta el stock** de cada sensor en la orden
7. **Se registran los resultados** (éxitos y errores)

## Formato de la Petición

**Endpoint:** `POST http://django-service:8000/api/sensores/deduct-stock/`

**Body:**
```json
{
  "items": [
    {
      "sensor_id": 5,
      "cantidad": 3
    },
    {
      "sensor_id": 11,
      "cantidad": 7
    }
  ]
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Stock descontado para 2 sensores",
  "results": [
    {
      "sensor_id": 5,
      "nombre": "Sensor de pH Analógico",
      "cantidad_descontada": 3,
      "stock_restante": 12
    },
    {
      "sensor_id": 11,
      "nombre": "Sensor de CO2 MH-Z19B",
      "cantidad_descontada": 7,
      "stock_restante": 8
    }
  ]
}
```

**Respuesta con Errores (207 Multi-Status o 400):**
```json
{
  "success": false,
  "message": "Stock descontado para 1 sensores, 1 errores",
  "results": [...],
  "errors": [
    {
      "sensor_id": 8,
      "error": "Stock insuficiente. Disponible: 2, Solicitado: 5"
    }
  ]
}
```

## Configuración

### Payment Service
- **URL del servicio Django:** Configurada en `application-docker.yml`:
  ```yaml
  django:
    service:
      url: http://django-service:8000
  ```
- Se usa el valor por defecto si no está configurado

### Catalog Service (Django)
- **Endpoint:** `/api/sensores/deduct-stock/`
- **Método:** POST
- **CSRF:** Deshabilitado (para permitir llamadas desde otros servicios)

## Manejo de Errores

### En Payment Service
- Si falla el descuento de stock, **NO se revierte el pago**
- Los errores se loguean para debugging
- El pago se considera exitoso aunque falle el descuento de stock
- Esto es intencional para no afectar la experiencia del usuario

### En Django
- Valida que cada item tenga `sensor_id` y `cantidad`
- Verifica que exista el sensor
- Verifica que haya suficiente stock
- Continúa procesando otros items aunque uno falle
- Retorna información detallada de éxitos y errores

## Características de Seguridad

1. **Validación de datos:** Se valida que los datos sean correctos antes de procesar
2. **Verificación de stock:** Se verifica que haya suficiente stock antes de descontar
3. **Transacciones atómicas:** Cada descuento se hace de forma atómica
4. **Logging:** Se registran todas las operaciones para auditoría

## Testing

### Probar el endpoint directamente:
```bash
curl -X POST http://localhost:8000/api/sensores/deduct-stock/ \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"sensor_id": 5, "cantidad": 2},
      {"sensor_id": 11, "cantidad": 1}
    ]
  }'
```

### Verificar en los logs:
```bash
# Payment Service
docker logs payment-service | grep -i stock

# Django Service
docker logs django-service | grep -i deduct
```

## Notas Importantes

1. **El descuento es asíncrono:** No bloquea la respuesta del pago
2. **Los errores no revierten el pago:** Una vez confirmado, el pago es final
3. **El stock se valida antes de descontar:** Previene stocks negativos
4. **Los sensores se marcan como no disponibles** cuando el stock llega a 0
5. **La integración es resiliente:** Si Django no está disponible, el pago se completa igual

## Archivos Modificados/Creados

### Payment Service:
- ✅ `payment-service/src/main/java/com/example/payment_service/service/CatalogService.java` (nuevo)
- ✅ `payment-service/src/main/java/com/example/payment_service/service/OrderService.java` (modificado)

### Catalog Service (Django):
- ✅ `catalog-service/sensores/views.py` (agregado DeductStockView)
- ✅ `catalog-service/sensores/urls.py` (agregada ruta)

## Próximos Pasos (Opcional)

1. Implementar retry automático si falla la comunicación
2. Agregar notificaciones cuando el stock esté bajo
3. Implementar rollback si es necesario (aunque actualmente no se revierte el pago)
4. Agregar métricas y monitoreo de la integración

