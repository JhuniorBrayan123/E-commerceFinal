# Guía de Solución del Error JWT

## 🔧 Solución Implementada

Se han creado las siguientes mejoras para resolver el error de firma JWT inválida:

### Archivos Creados

1. **`verify_jwt_config.bat`** - Script para Windows que verifica la configuración JWT
2. **`verify_jwt_config.sh`** - Script para Linux/Mac que verifica la configuración JWT
3. **`docker-compose-unified.yml`** - Configuración Docker unificada con JWT_SECRET consistente

### Cambios Realizados

1. **Catalog Service** (`catalog-service/settings.py`, línea 89):
   - ✅ Ahora usa variable de entorno `JWT_SECRET`
   - ✅ Fallback al valor por defecto si no está definida

2. **Auth Service** (`auth-service/src/Services/JWTService.php`, línea 15):
   - ✅ Agregado logging para debug
   - ✅ Muestra los primeros caracteres del secreto y su longitud

## 🚀 Cómo Usar

### Opción 1: Ejecutar con Docker (Recomendado)

```bash
# Detener contenedores actuales
docker-compose down

# Usar la nueva configuración unificada
docker-compose -f docker-compose-unified.yml up --build
```

Esto garantiza que todos los servicios usen el mismo `JWT_SECRET`.

### Opción 2: Ejecutar Manualmente

#### 1. Verificar configuración actual

**Windows:**
```cmd
verify_jwt_config.bat
```

**Linux/Mac:**
```bash
chmod +x verify_jwt_config.sh
./verify_jwt_config.sh
```

#### 2. Configurar variables de entorno

**Auth Service (PHP):**
- Ya configurado en archivo `.env`

**Catalog Service (Django):**
```bash
# Windows PowerShell
$env:JWT_SECRET="mi-clave-secreta-jwt-muy-segura-para-ecommerce"
python manage.py runserver 8000

# Linux/Mac
export JWT_SECRET="mi-clave-secreta-jwt-muy-segura-para-ecommerce"
python manage.py runserver 8000
```

**Payment Service (Spring Boot):**
- Ya configurado en `application.yml`

### Opción 3: Usar archivo .env global

Crear archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=mi-clave-secreta-jwt-muy-segura-para-ecommerce
JWT_EXPIRE=3600
```

## 🧪 Verificación

### Paso 1: Verificar que los servicios estén corriendo

```bash
# Auth Service
curl http://localhost:8081/api/auth/login

# Catalog Service
curl http://localhost:8000/api/sensors

# Payment Service
curl http://localhost:8080/api/payment/status/1
```

### Paso 2: Probar login y obtener token

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "password123"}'
```

Guarda el `access_token` de la respuesta.

### Paso 3: Probar token en Catalog Service

```bash
curl -X GET http://localhost:8000/api/sensors \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

✅ Si funciona, verás la lista de sensores.
❌ Si falla, verás el error de firma JWT.

### Paso 4: Revisar logs de debug

**Auth Service:**
- Revisa `auth-service/logs/` para ver el mensaje de debug del JWT_SECRET

**Catalog Service:**
- Los errores aparecerán en la consola donde ejecutas el servidor Django

**Payment Service:**
- Revisa los logs de Spring Boot en la consola

## 🐛 Troubleshooting

### El error persiste después de los cambios

1. **Reinicia TODOS los servicios** completamente
2. **Limpia la caché de Docker** si usas Docker:
   ```bash
   docker-compose down -v
   docker system prune -a
   ```
3. **Verifica que no hay espacios en blanco** en el JWT_SECRET

### Los servicios no leen las variables de entorno

1. **Para Docker:** Verifica que estés usando `docker-compose-unified.yml`
2. **Para ejecución manual:** Verifica que las variables de entorno estén exportadas en la sesión actual:
   ```bash
   # Windows PowerShell
   Get-ChildItem Env:JWT_SECRET
   
   # Linux/Mac
   echo $JWT_SECRET
   ```

### El token expira muy rápido

En `application.yml` (Payment Service) y `.env` (Auth Service), ajusta:
```yaml
jwt:
  expiration: 86400000  # 24 horas en milisegundos
```

## 📝 Notas Importantes

- **TODOS los servicios deben usar el MISMO JWT_SECRET**
- **El secreto NO debe tener espacios al inicio o al final**
- **En producción, usa un secreto más seguro y almacénalo en un servicio de secretos**
- **Elimina el logging de debug en producción** (línea 16-17 de JWTService.php)

## ✅ Checklist de Verificación

- [ ] Ejecuté el script de verificación
- [ ] Todos los servicios usan el mismo JWT_SECRET
- [ ] Reinicié todos los servicios después de los cambios
- [ ] El login genera un token correctamente
- [ ] El token funciona en Catalog Service
- [ ] El token funciona en Payment Service
- [ ] No hay errores de firma JWT en los logs
