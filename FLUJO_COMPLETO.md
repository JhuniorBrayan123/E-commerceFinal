# 🔄 Flujo Completo de Integración de Microservicios

## 📋 Descripción General

Este documento describe el flujo completo de integración entre los microservicios de autenticación, catálogo y pagos, incluyendo la comunicación con el frontend React.

---

## 🔐 1. LOGIN Y AUTENTICACIÓN

### Paso 1.1: Usuario inicia sesión
- **Frontend**: Usuario ingresa email y contraseña en el formulario de login
- **Acción**: El frontend envía una petición POST a `/auth/login`

### Paso 1.2: Auth-Service valida credenciales
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "usuario@example.com",
    "password": "password123"
  }
  ```
- **Proceso**:
  1. Auth-Service busca el usuario por email en la base de datos
  2. Verifica que la contraseña sea correcta
  3. Verifica que el usuario esté activo
  4. Genera un JWT token con la información del usuario
  5. Genera un refresh token
  6. Guarda el refresh token en la base de datos

### Paso 1.3: Auth-Service devuelve tokens
- **Respuesta**:
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

### Paso 1.4: Frontend guarda el token
- **Acción**: El frontend guarda el JWT en localStorage:
  ```javascript
  localStorage.setItem("token", jwt.access_token);
  localStorage.setItem("refresh_token", jwt.refresh_token);
  localStorage.setItem("user", JSON.stringify(user));
  ```
- **Importante**: Este token se usará en TODAS las peticiones subsiguientes a todos los servicios

---

## 📦 2. CONSULTA DE SENSORES

### Paso 2.1: Usuario navega al catálogo de sensores
- **Frontend**: El usuario accede a la página de sensores
- **Acción**: El frontend hace una petición GET a `/sensors` con filtros opcionales

### Paso 2.2: Frontend envía petición con JWT
- **Endpoint**: `GET /sensors?tipo=humedad&marca=DHT&precio_min=10&precio_max=100&disponible=true`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### Paso 2.3: Catalog-Service valida JWT y procesa la petición
- **Proceso**:
  1. Catalog-Service extrae el token del header `Authorization`
  2. Valida el JWT usando el mismo `JWT_SECRET` del Auth-Service
  3. Si el token es válido, extrae el `user_id` del payload
  4. Aplica los filtros recibidos (tipo, marca, rango de precio, disponibilidad)
  5. Ejecuta la consulta a la base de datos

### Paso 2.4: Catalog-Service devuelve sensores
- **Respuesta**:
  ```json
  {
    "count": 15,
    "filters_applied": {
      "tipo": "humedad",
      "marca": "DHT",
      "precio_min": "10",
      "precio_max": "100",
      "disponible": "true"
    },
    "sensores": [
      {
        "id": 1,
        "nombre": "Sensor de Humedad DHT22",
        "tipo": "humedad",
        "marca": "DHT",
        "precio": "45.99",
        "stock": 50,
        "disponible": true,
        ...
      }
    ]
  }
  ```

### Paso 2.5: Frontend muestra sensores
- **Acción**: El frontend renderiza la lista de sensores en la página

---

## 🛒 3. AGREGAR SENSOR AL CARRITO

### Paso 3.1: Usuario selecciona un sensor
- **Frontend**: El usuario hace clic en "Agregar al carrito" en un sensor
- **Acción**: El frontend agrega el sensor al carrito local (localStorage)

### Paso 3.2: Frontend actualiza el carrito
- **Acción**: El frontend actualiza el estado del carrito y muestra el badge con la cantidad

---

## 💳 4. CREAR ORDEN DE PAGO

### Paso 4.1: Usuario inicia el proceso de pago
- **Frontend**: El usuario navega a la página del carrito y hace clic en "Proceder al pago"
- **Acción**: El frontend muestra el resumen de compra con los items del carrito

### Paso 4.2: Usuario confirma los items
- **Frontend**: El usuario revisa el resumen y hace clic en "Crear Orden"
- **Acción**: El frontend prepara la petición para crear la orden

### Paso 4.3: Frontend envía petición para crear orden
- **Endpoint**: `POST /payment/order`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```
- **Body**:
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
    "total": 124.48
  }
  ```

### Paso 4.4: Payment-Service valida JWT y crea la orden
- **Proceso**:
  1. Payment-Service extrae el token del header `Authorization`
  2. Valida el JWT usando el mismo `JWT_SECRET` del Auth-Service
  3. Extrae el `user_id` del payload del JWT (del campo `data.user_id`)
  4. Crea un registro de orden con estado `PENDING`
  5. Genera un `paymentToken` propio del servicio (token específico para este pago)
  6. Calcula el total y guarda la información de la orden

### Paso 4.5: Payment-Service devuelve orderId y paymentToken
- **Respuesta**:
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
      "items": [...]
    }
  }
  ```

### Paso 4.6: Frontend recibe orderId y paymentToken
- **Acción**: El frontend guarda el `orderId` y `paymentToken` para el siguiente paso

---

## 💰 5. PROCESAR PAGO

### Paso 5.1: Usuario selecciona método de pago
- **Frontend**: El usuario selecciona un método de pago (Stripe, Yape, PayPal)
- **Acción**: El frontend muestra el formulario del método de pago seleccionado

### Paso 5.2: Usuario confirma el pago
- **Frontend**: El usuario completa los datos del método de pago y hace clic en "Confirmar Pago"
- **Acción**: El frontend prepara la petición para procesar el pago

### Paso 5.3: Frontend envía petición para procesar pago
- **Endpoint**: `POST /payment/confirm`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```
- **Body**:
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

### Paso 5.4: Payment-Service valida y procesa el pago
- **Proceso**:
  1. Payment-Service valida el JWT del header `Authorization`
  2. Verifica que el `paymentToken` sea válido y corresponda al `orderId`
  3. Verifica que el `user_id` del JWT coincida con el usuario de la orden
  4. Valida que el monto sea correcto
  5. Cambia el estado de la orden a `PROCESSING`
  6. Procesa el pago ficticio (simula la comunicación con el gateway)
  7. Si el pago es exitoso:
     - Cambia el estado a `PAID`
     - Genera un `transactionId` del gateway
     - Guarda la información del pago
  8. Si el pago falla:
     - Cambia el estado a `FAILED`
     - Guarda el motivo del error

### Paso 5.5: Payment-Service devuelve resultado del pago
- **Respuesta (Éxito)**:
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
- **Respuesta (Fallo)**:
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

### Paso 5.6: Frontend muestra el resultado
- **Acción**: El frontend redirige a la página de resultado:
  - Si fue exitoso: muestra mensaje de éxito y resumen del pago
  - Si falló: muestra mensaje de error y opción para reintentar

---

## 📊 6. CONSULTAR ESTADO DEL PAGO

### Paso 6.1: Usuario consulta el estado de su orden
- **Frontend**: El usuario accede a "Mis Pedidos" o hace clic en "Ver Estado"
- **Acción**: El frontend hace una petición GET al estado del pago

### Paso 6.2: Frontend envía petición
- **Endpoint**: `GET /payment/status/{orderId}`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### Paso 6.3: Payment-Service devuelve el estado
- **Respuesta**:
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
    "processedAt": "2024-01-15T10:30:00Z"
  }
  ```

---

## 🔄 Diagrama de Estados del Pago

```
PENDING → PROCESSING → PAID
            ↓
          FAILED
```

- **PENDING**: Orden creada, esperando confirmación de pago
- **PROCESSING**: Pago en proceso (validación y comunicación con gateway)
- **PAID**: Pago exitoso
- **FAILED**: Pago fallido

---

## 🔐 Reglas de Seguridad JWT

1. **JWT_SECRET compartido**: Todos los servicios deben usar el mismo `JWT_SECRET`
2. **Validación obligatoria**: Todos los endpoints protegidos deben validar el JWT
3. **Extracción de user_id**: El `user_id` está en `payload.data.user_id` del JWT
4. **Token único**: El frontend usa un solo token para todas las peticiones
5. **Expiración**: El token expira después del tiempo configurado (por defecto 3600 segundos)

---

## 🚨 Manejo de Errores

### Token inválido o expirado
- **Código**: 401 Unauthorized
- **Respuesta**:
  ```json
  {
    "success": false,
    "message": "Token inválido o expirado",
    "error": "INVALID_TOKEN"
  }
  ```
- **Acción del frontend**: Redirigir al login

### Orden no encontrada
- **Código**: 404 Not Found
- **Respuesta**:
  ```json
  {
    "success": false,
    "message": "Orden no encontrada",
    "error": "ORDER_NOT_FOUND"
  }
  ```

### Pago duplicado
- **Código**: 409 Conflict
- **Respuesta**:
  ```json
  {
    "success": false,
    "message": "Ya existe un pago para esta orden",
    "error": "PAYMENT_DUPLICATED"
  }
  ```

---

## ✅ Checklist de Implementación

- [x] Auth-Service genera JWT con `data.user_id`
- [ ] Catalog-Service valida JWT y extrae `user_id`
- [ ] Catalog-Service tiene filtros adicionales para sensores (precio min/max, rango)
- [ ] Payment-Service valida JWT correctamente
- [ ] Payment-Service extrae `user_id` de `data.user_id`
- [ ] Payment-Service tiene endpoint `/payment/order`
- [ ] Payment-Service tiene endpoint `/payment/confirm`
- [ ] Payment-Service tiene endpoint `/payment/status/{orderId}`
- [ ] Frontend guarda JWT en localStorage
- [ ] Frontend envía JWT en todas las peticiones
- [ ] Frontend tiene servicio de sensores
- [ ] Frontend tiene servicio de payment
- [ ] Frontend tiene vistas del proceso de pago

