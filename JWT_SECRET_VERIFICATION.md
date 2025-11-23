# Verificación de Secreto JWT - Auth Service y Payment Service

## Configuración Actual

### Auth Service (PHP)
- **Archivo:** `auth-service/docker-compose.yml`
- **Variable:** `JWT_SECRET=mi-clave-secreta-jwt-muy-segura-para-ecommerce`
- **Algoritmo:** HS256
- **Librería:** Firebase JWT (PHP)

### Payment Service (Java/Spring Boot)
- **Archivo:** `payment-service/docker-compose.yml`
- **Variable:** `JWT_SECRET=mi-clave-secreta-jwt-muy-segura-para-ecommerce`
- **Archivo de configuración:** `application.yml` y `application-docker.yml`
- **Propiedad:** `jwt.secret: ${JWT_SECRET:mi-clave-secreta-jwt-muy-segura-para-ecommerce}`
- **Algoritmo:** HS256
- **Librería:** jjwt (Java)

## Cambios Realizados

### 1. JwtService.java
- ✅ Cambiado de `${integration.django.jwt-secret}` a `${jwt.secret}`
- ✅ Agregado uso explícito de algoritmo HS256 con `Keys.hmacShaKeyFor()`
- ✅ Mejorado manejo de errores con mensajes específicos
- ✅ Agregado logging para debugging

### 2. Verificación de Configuración
- ✅ Ambos servicios usan el mismo secreto: `mi-clave-secreta-jwt-muy-segura-para-ecommerce`
- ✅ Ambos servicios usan el algoritmo HS256
- ✅ El secreto se pasa correctamente desde docker-compose.yml

## Cómo Verificar que Funciona

### 1. Verificar Variables de Entorno en Docker

```bash
# Verificar auth-service
docker exec auth-service env | grep JWT_SECRET

# Verificar payment-service
docker exec payment-service env | grep JWT_SECRET
```

Ambos deben mostrar: `JWT_SECRET=mi-clave-secreta-jwt-muy-segura-para-ecommerce`

### 2. Probar Login y Obtener Token

```bash
# Login
curl -X POST http://localhost:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Guardar el token de la respuesta
TOKEN="tu_token_aqui"
```

### 3. Probar el Token en Payment Service

```bash
# Probar crear orden con el token
curl -X POST http://localhost:8085/payment/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"sensorId": 1, "nombre": "Test", "cantidad": 1, "precioUnitario": 10.0}],
    "total": 10.0,
    "currency": "USD"
  }'
```

### 4. Verificar Logs del Payment Service

```bash
docker logs payment-service | grep -i jwt
```

Deberías ver:
- `JwtService - Validando token. Secret preview: mi-cla...erce`
- `JwtService - Token validado exitosamente`

Si ves errores de firma, verifica que ambos servicios estén usando el mismo secreto.

## Solución de Problemas

### Error: "Firma JWT invalida"
1. Verificar que ambos servicios tengan la misma variable `JWT_SECRET`
2. Reiniciar ambos servicios:
   ```bash
   # Auth service
   cd auth-service && docker-compose restart
   
   # Payment service
   cd payment-service && docker-compose restart
   ```

### Error: "JWT expirado"
- El token tiene un tiempo de expiración (por defecto 3600 segundos)
- Hacer login nuevamente para obtener un token fresco

### Error: "JWT malformado"
- Verificar que el token se esté enviando correctamente
- El header debe ser: `Authorization: Bearer {token}`
- No debe haber espacios extra

## Estructura del Token JWT

El token generado por Auth Service tiene esta estructura:

```json
{
  "iss": "auth-service",
  "iat": 1234567890,
  "exp": 1234571490,
  "data": {
    "user_id": 1,
    "email": "user@example.com"
  }
}
```

El Payment Service extrae el `user_id` desde `data.user_id`.

## Notas Importantes

1. **El secreto debe ser EXACTAMENTE el mismo** en ambos servicios
2. **El algoritmo debe ser HS256** en ambos servicios
3. **Los servicios deben reiniciarse** después de cambiar el secreto
4. **El token debe estar en el formato correcto** (Bearer token)

