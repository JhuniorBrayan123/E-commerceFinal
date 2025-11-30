# Pruebas de Integración para Postman

Este documento detalla más de 30 escenarios de prueba para validar la integración de los microservicios (Auth, Catalog, Payment).

## 🔐 Auth Service (PHP)

### Registro de Usuario
1.  **Registro Exitoso**
    *   **Endpoint**: `POST /auth/register`
    *   **Body**: `{"email": "test_new@example.com", "password": "password123", "first_name": "Test", "last_name": "User"}`
    *   **Esperado**: 200 OK, `success: true`, tokens recibidos.
2.  **Registro - Email Ya Existe**
    *   **Endpoint**: `POST /auth/register`
    *   **Body**: `{"email": "usuario@example.com", "password": "password123", "first_name": "Juan", "last_name": "Perez"}` (Usar email ya registrado)
    *   **Esperado**: 409 Conflict o 400 Bad Request, mensaje de error apropiado.
3.  **Registro - Campos Faltantes**
    *   **Endpoint**: `POST /auth/register`
    *   **Body**: `{"email": "incomplete@example.com", "password": "password123"}`
    *   **Esperado**: 400 Bad Request.
4.  **Registro - Formato de Email Inválido**
    *   **Endpoint**: `POST /auth/register`
    *   **Body**: `{"email": "notanemail", "password": "password123", "first_name": "Test", "last_name": "User"}`
    *   **Esperado**: 400 Bad Request.

### Login de Usuario
5.  **Login Exitoso**
    *   **Endpoint**: `POST /auth/login`
    *   **Body**: `{"email": "usuario@example.com", "password": "password123"}`
    *   **Esperado**: 200 OK, `token` recibido. **Guardar token en variable de entorno `{{jwt_token}}`**.
6.  **Login - Credenciales Inválidas**
    *   **Endpoint**: `POST /auth/login`
    *   **Body**: `{"email": "usuario@example.com", "password": "wrongpassword"}`
    *   **Esperado**: 401 Unauthorized.
7.  **Login - Usuario No Existente**
    *   **Endpoint**: `POST /auth/login`
    *   **Body**: `{"email": "nonexistent@example.com", "password": "password123"}`
    *   **Esperado**: 404 Not Found o 401 Unauthorized.
8.  **Login - Campos Faltantes**
    *   **Endpoint**: `POST /auth/login`
    *   **Body**: `{"email": "usuario@example.com"}`
    *   **Esperado**: 400 Bad Request.

---

## 📦 Catalog Service (Django)

**Nota**: Usar el token obtenido en el login (`Authorization: Bearer {{jwt_token}}`) para las peticiones que lo requieran.

### Listado de Sensores
9.  **Listar Todos los Sensores**
    *   **Endpoint**: `GET /sensors`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, lista de sensores no vacía.
10. **Filtrar por Tipo**
    *   **Endpoint**: `GET /sensors?tipo=humedad`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, todos los resultados deben ser `tipo: "humedad"`.
11. **Filtrar por Marca**
    *   **Endpoint**: `GET /sensors?marca=DHT`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, todos los resultados deben ser `marca: "DHT"`.
12. **Filtrar por Rango de Precio**
    *   **Endpoint**: `GET /sensors?precio_min=10&precio_max=50`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, precios dentro del rango.
13. **Búsqueda por Texto**
    *   **Endpoint**: `GET /sensors?search=Temperatura`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, resultados relevantes.
14. **Paginación**
    *   **Endpoint**: `GET /sensors?limit=5&offset=0`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, máximo 5 resultados.

### Detalle de Sensor
15. **Obtener Sensor por ID**
    *   **Endpoint**: `GET /sensors/1`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, detalles del sensor ID 1.
16. **Sensor No Encontrado**
    *   **Endpoint**: `GET /sensors/99999`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 404 Not Found.
17. **ID Inválido**
    *   **Endpoint**: `GET /sensors/abc`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 400 Bad Request o 404 Not Found.

### Otros Endpoints de Catálogo
18. **Obtener Filtros Disponibles**
    *   **Endpoint**: `GET /sensors/filters`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, estructura de filtros.
19. **Obtener Estadísticas**
    *   **Endpoint**: `GET /stats`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, datos estadísticos.

### Gestión de Sensores (Admin)
20. **Crear Sensor**
    *   **Endpoint**: `POST /sensors`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"nombre": "Nuevo Sensor Test", "tipo": "luz", "marca": "TestBrand", "precio": "15.00", "stock": 10, "disponible": true}`
    *   **Esperado**: 201 Created.
21. **Crear Sensor - Sin Token**
    *   **Endpoint**: `POST /sensors`
    *   **Headers**: (Sin header Authorization)
    *   **Body**: `{...}`
    *   **Esperado**: 401 Unauthorized.
22. **Crear Sensor - Datos Inválidos**
    *   **Endpoint**: `POST /sensors`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"nombre": ""}` (Nombre vacío)
    *   **Esperado**: 400 Bad Request.
23. **Actualizar Sensor**
    *   **Endpoint**: `PUT /sensors/1`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"precio": "50.00"}`
    *   **Esperado**: 200 OK.

---

## 💳 Payment Service (Spring Boot)

### Creación de Órdenes
24. **Crear Orden Exitosamente**
    *   **Endpoint**: `POST /payment/order`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`, `Content-Type: application/json`
    *   **Body**: `{"items": [{"sensor_id": 1, "nombre": "Sensor 1", "cantidad": 1, "precio_unitario": "45.99"}], "total": 45.99, "currency": "USD"}`
    *   **Esperado**: 201 Created, `orderId` recibido. **Guardar `orderId` en variable**.
25. **Crear Orden - Sin Token**
    *   **Endpoint**: `POST /payment/order`
    *   **Headers**: (Sin Authorization)
    *   **Body**: `{...}`
    *   **Esperado**: 401 Unauthorized.
26. **Crear Orden - Lista de Items Vacía**
    *   **Endpoint**: `POST /payment/order`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"items": [], "total": 0, "currency": "USD"}`
    *   **Esperado**: 400 Bad Request.
27. **Crear Orden - Total Negativo**
    *   **Endpoint**: `POST /payment/order`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"items": [...], "total": -10, "currency": "USD"}`
    *   **Esperado**: 400 Bad Request.

### Procesamiento de Pagos
28. **Confirmar Pago - Exitoso (Stripe)**
    *   **Endpoint**: `POST /payment/confirm`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"orderId": {{orderId}}, "paymentMethod": "STRIPE", "amount": 45.99, "currency": "USD", "paymentData": {"cardNumber": "4242424242424242", "expMonth": 12, "expYear": 2025, "cvv": "123"}}`
    *   **Esperado**: 200 OK, `status: PAID`.
29. **Confirmar Pago - Tarjeta Rechazada**
    *   **Endpoint**: `POST /payment/confirm`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"orderId": {{orderId}}, "paymentMethod": "STRIPE", "amount": 45.99, "currency": "USD", "paymentData": {"cardNumber": "4000000000000002", "expMonth": 12, "expYear": 2025, "cvv": "123"}}` (Usar tarjeta de test de fallo si aplica, o simular error)
    *   **Esperado**: 400 Bad Request o 402 Payment Required.
30. **Confirmar Pago - Orden No Existe**
    *   **Endpoint**: `POST /payment/confirm`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"orderId": 999999, ...}`
    *   **Esperado**: 404 Not Found.
31. **Confirmar Pago - Orden Ya Pagada**
    *   **Endpoint**: `POST /payment/confirm`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: (Usar ID de orden ya pagada en test 28)
    *   **Esperado**: 409 Conflict o 400 Bad Request.

### Consultas de Pago
32. **Obtener Estado de Orden**
    *   **Endpoint**: `GET /payment/status/{{orderId}}`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK, verificar estado.
33. **Obtener Estado - Orden Inexistente**
    *   **Endpoint**: `GET /payment/status/99999`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 404 Not Found.
34. **Obtener Detalle de Pago**
    *   **Endpoint**: `GET /payment/{{paymentId}}` (Usar ID obtenido en confirmación)
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK.
35. **Obtener Pago por Orden**
    *   **Endpoint**: `GET /payment/order/{{orderId}}`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 200 OK.

### Reembolsos
36. **Solicitar Reembolso - Exitoso**
    *   **Endpoint**: `POST /payment/{{paymentId}}/refund`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"amount": 45.99, "reason": "Test Refund"}`
    *   **Esperado**: 200 OK, `status: REFUNDED`.
37. **Reembolso - Monto Inválido**
    *   **Endpoint**: `POST /payment/{{paymentId}}/refund`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Body**: `{"amount": 999999, "reason": "Fraud"}`
    *   **Esperado**: 400 Bad Request.
38. **Reembolso - Pago No Encontrado**
    *   **Endpoint**: `POST /payment/99999/refund`
    *   **Headers**: `Authorization: Bearer {{jwt_token}}`
    *   **Esperado**: 404 Not Found.
