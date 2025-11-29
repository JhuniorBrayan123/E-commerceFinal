# 📋 Endpoints Finales de la Arquitectura de Microservicios

## 🔐 AUTH-SERVICE (PHP)

**Base URL**: `http://localhost:8081/api`

### POST /auth/register
Registra un nuevo usuario.

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "abc123def456...",
      "expires_in": 3600
    }
  }
}
```

---

### POST /auth/login
Inicia sesión con un usuario existente.

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "abc123def456...",
      "expires_in": 3600
    }
  }
}
```

---

## 📦 CATALOG-SERVICE (Django)

**Base URL**: `http://localhost:8000/api`

**Headers requeridos**:
```
Authorization: Bearer {JWT_TOKEN}
```

---

### GET /sensors
Lista todos los sensores con filtros opcionales.

**Query Parameters** (opcionales):
- `tipo`: Tipo de sensor (humedad, temperatura, ph, luz, nutrientes, co2)
- `marca`: Marca del sensor (búsqueda parcial)
- `rango`: Rango de medición (búsqueda parcial)
- `precio_min`: Precio mínimo (decimal)
- `precio_max`: Precio máximo (decimal)
- `disponible`: Disponibilidad (true/false)
- `search`: Búsqueda general en nombre, marca, modelo, descripción
- `ordering`: Ordenamiento (id, nombre, precio, marca, tipo, stock, fecha_creacion)
- `limit`: Límite de resultados
- `offset`: Offset para paginación

**Ejemplo**:
```
GET /sensors?tipo=humedad&marca=DHT&precio_min=10&precio_max=100&disponible=true&ordering=-precio
```

**Response** (200 OK):
```json
{
  "count": 15,
  "filters_applied": {
    "tipo": "humedad",
    "marca": "DHT",
    "precio_min": "10",
    "precio_max": "100",
    "disponible": "true",
    "ordering": "-precio"
  },
  "sensores": [
    {
      "id": 1,
      "nombre": "Sensor de Humedad DHT22",
      "tipo": "humedad",
      "tipo_display": "Sensor de Humedad",
      "marca": "DHT",
      "modelo": "DHT22",
      "precio": "45.99",
      "descripcion": "Sensor de humedad y temperatura digital",
      "rango_medicion": "0-100% RH",
      "precision": "±2% RH",
      "alimentacion": "3.3V - 5V",
      "protocolo_comunicacion": "Digital",
      "imagen": "/media/sensores/DHT22.jpg",
      "stock": 50,
      "disponible": true,
      "fecha_creacion": "2024-01-10T08:00:00Z",
      "fecha_actualizacion": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET /sensors/{id}
Obtiene los detalles de un sensor específico.

**Response** (200 OK):
```json
{
  "id": 1,
  "nombre": "Sensor de Humedad DHT22",
  "tipo": "humedad",
  "tipo_display": "Sensor de Humedad",
  "marca": "DHT",
  "modelo": "DHT22",
  "precio": "45.99",
  "descripcion": "Sensor de humedad y temperatura digital",
  "rango_medicion": "0-100% RH",
  "precision": "±2% RH",
  "alimentacion": "3.3V - 5V",
  "protocolo_comunicacion": "Digital",
  "imagen": "/media/sensores/DHT22.jpg",
  "stock": 50,
  "disponible": true,
  "fecha_creacion": "2024-01-10T08:00:00Z",
  "fecha_actualizacion": "2024-01-15T10:00:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "error": "Sensor con ID 1 no encontrado"
}
```

---

### GET /sensors/filters
Obtiene las opciones disponibles para los filtros.

**Response** (200 OK):
```json
{
  "tipos": [
    {"value": "humedad", "label": "Sensor de Humedad"},
    {"value": "temperatura", "label": "Sensor de Temperatura"},
    {"value": "ph", "label": "Sensor de pH"},
    {"value": "luz", "label": "Sensor de Luz"},
    {"value": "nutrientes", "label": "Sensor de Nutrientes"},
    {"value": "co2", "label": "Sensor de CO2"}
  ],
  "marcas": ["DHT", "LM35", "Arduino", "Raspberry Pi"],
  "rangos": ["0-100% RH", "-40 a 125°C", "0-14 pH"]
}
```

---

### GET /stats
Obtiene estadísticas generales de sensores.

**Response** (200 OK):
```json
{
  "total_sensores": 50,
  "sensores_disponibles": 45,
  "sensores_agotados": 5,
  "sensores_con_stock": 40,
  "precio_promedio": 45.99,
  "precio_minimo": 10.00,
  "precio_maximo": 299.99,
  "stock_total": 500,
  "por_tipo": {
    "humedad": 15,
    "temperatura": 12,
    "ph": 8,
    "luz": 10,
    "nutrientes": 3,
    "co2": 2
  },
  "por_marca": {
    "DHT": 15,
    "LM35": 12,
    "Arduino": 10,
    "Raspberry Pi": 13
  }
}
```

---

### POST /sensors
Crea un nuevo sensor (si está implementado).

**Request**:
```json
{
  "nombre": "Nuevo Sensor",
  "tipo": "humedad",
  "marca": "DHT",
  "modelo": "DHT22",
  "precio": "45.99",
  "descripcion": "Descripción del sensor",
  "rango_medicion": "0-100% RH",
  "precision": "±2% RH",
  "alimentacion": "3.3V - 5V",
  "protocolo_comunicacion": "Digital",
  "stock": 50,
  "disponible": true
}
```

**Response** (201 Created):
```json
{
  "mensaje": "Sensor creado exitosamente",
  "sensor": {
    "id": 51,
    ...
  }
}
```

---

### PUT /sensors/{id}
Actualiza un sensor existente (si está implementado).

**Request**: (mismo formato que POST)

**Response** (200 OK):
```json
{
  "mensaje": "Sensor actualizado exitosamente",
  "sensor": {
    ...
  }
}
```

---

## 💳 PAYMENT-SERVICE (Spring Boot)

**Base URL**: `http://localhost:8080/api`

**Headers requeridos**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

### POST /payment/order
Crea una nueva orden de pago.

**Request**:
```json
{
  "items": [
    {
      "sensor_id": 1,
      "nombre": "Sensor de Humedad DHT22",
      "cantidad": 2,
      "precio_unitario": "45.99"
    },
    {
      "sensor_id": 2,
      "nombre": "Sensor de Temperatura LM35",
      "cantidad": 1,
      "precio_unitario": "32.50"
    }
  ],
  "total": 124.48,
  "currency": "USD"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "orderId": 123,
    "paymentToken": "pay_token_abc123def456...",
    "total": 124.48,
    "currency": "USD",
    "status": "PENDING",
    "items": [
      {
        "sensor_id": 1,
        "nombre": "Sensor de Humedad DHT22",
        "cantidad": 2,
        "precio_unitario": "45.99",
        "subtotal": "91.98"
      },
      {
        "sensor_id": 2,
        "nombre": "Sensor de Temperatura LM35",
        "cantidad": 1,
        "precio_unitario": "32.50",
        "subtotal": "32.50"
      }
    ],
    "createdAt": "2024-01-15T10:25:00Z"
  }
}
```

**Errors**:
- `401 Unauthorized`: Token inválido o expirado
- `400 Bad Request`: Datos inválidos o faltantes

---

### POST /payment/confirm
Procesa el pago de una orden.

**Request**:
```json
{
  "orderId": 123,
  "paymentToken": "pay_token_abc123def456...",
  "paymentMethod": "STRIPE",
  "amount": 124.48,
  "currency": "USD",
  "paymentData": {
    "cardNumber": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvv": "123"
  }
}
```

**Response** (200 OK - Éxito):
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "paymentId": 456,
    "orderId": 123,
    "status": "PAID",
    "transactionId": "txn_abc123def456",
    "amount": 124.48,
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "processedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response** (400 Bad Request - Falla):
```json
{
  "success": false,
  "message": "El pago no pudo ser procesado",
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Tarjeta rechazada por el banco emisor"
  }
}
```

**Errors**:
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Orden no encontrada
- `409 Conflict`: Pago duplicado
- `400 Bad Request`: Datos inválidos o pago fallido

---

### GET /payment/status/{orderId}
Obtiene el estado de una orden de pago.

**Response** (200 OK):
```json
{
  "orderId": 123,
  "status": "PAID",
  "paymentId": 456,
  "amount": 124.48,
  "currency": "USD",
  "paymentMethod": "STRIPE",
  "transactionId": "txn_abc123def456",
  "createdAt": "2024-01-15T10:25:00Z",
  "processedAt": "2024-01-15T10:30:00Z",
  "items": [
    {
      "sensor_id": 1,
      "nombre": "Sensor de Humedad DHT22",
      "cantidad": 2,
      "precio_unitario": "45.99",
      "subtotal": "91.98"
    },
    {
      "sensor_id": 2,
      "nombre": "Sensor de Temperatura LM35",
      "cantidad": 1,
      "precio_unitario": "32.50",
      "subtotal": "32.50"
    }
  ]
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Orden no encontrada",
  "error": "ORDER_NOT_FOUND"
}
```

**Errors**:
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Orden no encontrada

---

### GET /payment/{paymentId}
Obtiene los detalles de un pago específico.

**Response** (200 OK):
```json
{
  "paymentId": 456,
  "orderId": 123,
  "userId": 1,
  "status": "PAID",
  "amount": 124.48,
  "currency": "USD",
  "paymentMethod": "STRIPE",
  "gatewayTransactionId": "txn_abc123def456",
  "gatewayType": "STRIPE",
  "refundedAmount": 0.00,
  "createdAt": "2024-01-15T10:25:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### GET /payment/order/{orderId}
Obtiene el pago asociado a una orden específica.

**Response**: (mismo formato que GET /payment/{paymentId})

---

### POST /payment/{paymentId}/refund
Procesa un reembolso de un pago (si está implementado).

**Request**:
```json
{
  "amount": 124.48,
  "reason": "Solicitud del cliente"
}
```

**Response** (200 OK):
```json
{
  "paymentId": 456,
  "orderId": 123,
  "status": "REFUNDED",
  "refundedAmount": 124.48,
  "refundedAt": "2024-01-15T11:00:00Z"
}
```

---

## 📊 Estados de Pago

- **PENDING**: Orden creada, esperando confirmación de pago
- **PROCESSING**: Pago en proceso
- **PAID**: Pago exitoso
- **FAILED**: Pago fallido
- **REFUNDED**: Pago reembolsado

---

## 🔐 Métodos de Pago Soportados

- **STRIPE**: Tarjeta de crédito/débito (Stripe)
- **YAPE**: Yape (si está implementado)
- **PAYPAL**: PayPal (si está implementado)

---

## 🚨 Códigos de Error Comunes

- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: No tiene permisos para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: pago duplicado)
- **500 Internal Server Error**: Error interno del servidor

---

## 📝 Notas Importantes

1. **JWT Token**: Todos los endpoints protegidos requieren un JWT token válido en el header `Authorization: Bearer {token}`

2. **JWT_SECRET**: Todos los servicios deben usar el mismo `JWT_SECRET` para validar los tokens

3. **user_id**: El `user_id` se extrae del JWT desde `payload.data.user_id`

4. **CORS**: Los servicios deben estar configurados para permitir peticiones desde el frontend (localhost:3000)

5. **Formato de Fechas**: Todas las fechas están en formato ISO 8601 (UTC)

6. **Formato de Precios**: Todos los precios están en formato decimal con 2 decimales

---

## ✅ Checklist de Implementación

- [x] Auth-Service: POST /auth/register
- [x] Auth-Service: POST /auth/login
- [ ] Catalog-Service: GET /sensors (con todos los filtros)
- [ ] Catalog-Service: GET /sensors/{id}
- [ ] Catalog-Service: GET /sensors/filters
- [ ] Catalog-Service: GET /stats
- [ ] Payment-Service: POST /payment/order
- [ ] Payment-Service: POST /payment/confirm
- [ ] Payment-Service: GET /payment/status/{orderId}
- [ ] Payment-Service: GET /payment/{paymentId}
- [ ] Payment-Service: GET /payment/order/{orderId}

