# 🧪 Pruebas de Sistema con Selenium - E-commerce

## 📋 Descripción

Este directorio contiene **15 pruebas de sistema automatizadas** creadas con Selenium WebDriver para el sistema de e-commerce de sensores agrícolas. Las pruebas cubren los flujos críticos de la aplicación desde la perspectiva del usuario final.

---

## 📦 Requisitos Previos

### 1. Software Necesario
- ✅ **Java JDK 11+** instalado
- ✅ **ChromeDriver** (ubicado en `C:/WebDriver/chromedriver-win64/chromedriver.exe`)
- ✅ **Maven** (para gestionar dependencias)
- ✅ **JUnit 4** (incluido en dependencies)
- ✅ **Selenium WebDriver 4.x**

### 2. Dependencias Maven

Agregar al `pom.xml`:

```xml
<dependencies>
    <!-- Selenium WebDriver -->
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.15.0</version>
    </dependency>

    <!-- JUnit 4 -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 3. Sistema en Ejecución

**IMPORTANTE**: Antes de ejecutar las pruebas, asegurarse que todos los servicios estén corriendo:

```bash
# Backend services (Docker)
docker-compose up -d

# Frontend (React)
cd frontend
npm start
```

**URLs esperadas:**
- Frontend: `http://localhost:3000`
- Django API: `http://localhost:8000`
- Auth Service: `http://localhost:8081`
- Payment Service: `http://localhost:8085`

---

## 📝 Lista de Pruebas

| # | Nombre del Test | Descripción | Archivo |
|---|----------------|-------------|---------|
| 01 | **Login Exitoso** | Verifica login con credenciales válidas | `Test01_LoginExitoso.java` |
| 02 | **Login Fallido** | Verifica rechazo de credenciales incorrectas | `Test02_LoginFallido.java` |
| 03 | **Registro de Usuario** | Verifica registro de nuevo usuario | `Test03_RegistroUsuario.java` |
| 04 | **Ver Detalle Producto** | Verifica visualización de detalles de sensor | `Test04_VerDetalleProducto.java` |
| 05 | **Agregar al Carrito** | Verifica agregar producto al carrito | `Test05_AgregarProductoCarrito.java` |
| 06 | **Modificar Cantidad** | Verifica cambio de cantidad en carrito | `Test06_ModificarCantidadCarrito.java` |
| 07 | **Eliminar Producto** | Verifica eliminación de producto del carrito | `Test07_EliminarProductoCarrito.java` |
| 08 | **Aplicar Cupón** | Verifica aplicación de cupón de descuento | `Test08_AplicarCupon.java` |
| 09 | **Checkout Requiere Login** | Verifica que checkout solicita autenticación | `Test09_CheckoutRequiereLogin.java` |
| 10 | **Selección Método Pago** | Verifica selección de métodos de pago | `Test10_SeleccionMetodoPago.java` |
| 11 | **Agregar Comentario** | Verifica publicación de comentarios en productos | `Test11_AgregarComentario.java` |
| 12 | **Filtrar por Categoría** | Verifica filtrado de sensores por categoría | `Test12_FiltrarPorCategoria.java` |
| 13 | **Ver Mis Pedidos** | Verifica visualización de historial de pedidos | `Test13_VerMisPedidos.java` |
| 14 | **Búsqueda de Productos** | Verifica funcionalidad de búsqueda | `Test14_BusquedaProductos.java` |
| 15 | **Logout y Rutas Protegidas** | Verifica cierre de sesión y protección de rutas | `Test15_LogoutYRutasProtegidas.java` |

---

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Ejecutar una Prueba Individual

```bash
# Compilar y ejecutar test específico
mvn test -Dtest=Test01_LoginExitoso
```

### Opción 2: Ejecutar Todas las Pruebas

```bash
# Ejecutar toda la suite
mvn test -Dtest=Test*
```

### Opción 3: Desde IDE (IntelliJ IDEA / Eclipse)

1. Click derecho en el archivo `.java`
2. Seleccionar **Run 'TestXX...'**
3. Ver resultados en la consola del IDE

---

## 📸 Screenshots

Todas las pruebas incluyen captura de pantalla automática en caso de error. Las imágenes se guardan en:

```
screenshots/
├── test01_error_<timestamp>.png
├── test02_error_<timestamp>.png
└── ...
```

---

## ⚙️ Configuración

### Cambiar Ruta de ChromeDriver

Si tu ChromeDriver está en otra ubicación, modificar en cada test:

```java
System.setProperty("webdriver.chrome.driver",
    "TU_RUTA_AQUI/chromedriver.exe"
);
```

### Ajustar Tiempos de Espera

Los tiempos de espera se pueden modificar en el método `setUp()`:

```java
wait = new WebDriverWait(driver, Duration.ofSeconds(15)); // Cambiar 15 por el valor deseado
```

### Credenciales de Prueba

Las pruebas usan el siguiente usuario de prueba:

- **Email**: `tester@gmail.com`
- **Password**: `Tester123.`

**IMPORTANTE**: Este usuario debe existir en la base de datos `auth_db`.

---

## 🔧 Solución de Problemas

### Error: "chromedriver.exe not found"

**Solución**: Descargar ChromeDriver desde [chromedriver.chromium.org](https://chromedriver.chromium.org/) y colocarlo en `C:/WebDriver/chromedriver-win64/`

### Error: "Connection refused to localhost:3000"

**Solución**: Verificar que el frontend React esté corriendo:

```bash
cd frontend
npm start
```

### Error: "Element not found" o "Timeout"

**Posibles causas:**
- El frontend aún no terminó de cargar → Aumentar tiempo de espera
- Cambios en la estructura HTML → Actualizar selectores XPath
- Popup o modal bloqueando el elemento → Cerrar modal primero

### Error: "Usuario no encontrado" en Test01

**Solución**: Crear usuario de prueba manualmente:

```sql
-- Ejecutar en MySQL
USE auth_db;
INSERT INTO users (username, email, password, created_at) 
VALUES ('Tester', 'tester@gmail.com', 'hash_de_Tester123.', NOW());
```

---

## 📊 Interpretación de Resultados

### Test EXITOSO ✅
Output mostrar´a:
```
=== PRUEBA XX: NOMBRE DEL TEST ===
✔ Paso 1 completado
✔ Paso 2 completado
...
✅ PRUEBA XX COMPLETADA EXITOSAMENTE
```

### Test FALLIDO ❌
Se mostrará:
```
❌ Test falló: [mensaje de error]
📸 Screenshot guardado: screenshots/testXX_error_123456789.png
```

Revisar el screenshot para identificar el problema visualmente.

---

## 📌 Notas Importantes

1. **Test 08 (Cupón)**: Requiere que exista un cupón `DESCUENTO10` en la base de datos
2. **Test 11 (Comentarios)**: Los comentarios quedan guardados en la BD
3. **Test 03 (Registro)**: Crea un nuevo usuario en cada ejecución
4. **Orden de Ejecución**: Las pruebas son independientes y pueden ejecutarse en cualquier orden

---

## 🎯 Cobertura de Pruebas

### Funcionalidades Cubiertas

- ✅ Autenticación (login/logout/registro)
- ✅ Catálogo de productos (ver, buscar, filtrar)
- ✅ Carrito de compras (agregar, modificar, eliminar)
- ✅ Cupones de descuento
- ✅ Checkout y métodos de pago
- ✅ Comentarios en productos
- ✅ Historial de pedidos
- ✅ Protección de rutas

### Tipos de Prueba

- ✅ Pruebas Positivas (flujos exitosos)
- ✅ Pruebas Negativas (validación de errores)
- ✅ Pruebas de Seguridad (rutas protegidas)
- ✅ Pruebas de Integración E2E

---

## 👤 Autor

Pruebas creadas para el proyecto E-commerce de Sensores Agrícolas.

**Fecha de creación**: Diciembre 2025

---

## 📄 Licencia

Estas pruebas son parte del proyecto académico de e-commerce.
