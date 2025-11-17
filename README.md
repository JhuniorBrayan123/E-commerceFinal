# E-Commerce - Django REST Framework + React

Proyecto completo de e-commerce desarrollado con Django REST Framework (backend) y React (frontend), utilizando MySQL como base de datos. **Sin Docker - Instalación local**.

## 🏗️ Estructura del Proyecto

```
E-commerceFinal/
├── catalog-service/          # Backend Django
│   ├── categorias/           # App de categorías
│   ├── productos/            # App de productos
│   ├── inventario/           # App de inventario
│   ├── orders/               # App de órdenes (integración Spring Boot)
│   └── manage.py
└── frontend/                 # Frontend React
    └── src/
        ├── components/       # Componentes reutilizables
        ├── pages/            # Páginas principales
        └── services/         # Servicios API
```

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- pip (gestor de paquetes de Python)
- npm (gestor de paquetes de Node.js)

## 🚀 Instalación Paso a Paso

### 1. Configuración de MySQL

1. Instala MySQL en tu sistema
2. Crea la base de datos:
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configuración del Backend (Django)

1. Navega a la carpeta del backend:
```bash
cd catalog-service
```

2. Crea un entorno virtual (recomendado):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Instala las dependencias:
```bash
pip install -r requirements.txt
```

**Nota:** Si tienes problemas instalando `mysqlclient`, puedes usar `pymysql` como alternativa:
```bash
pip install pymysql
```
Luego agrega al inicio de `settings.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

4. Configura las variables de entorno (opcional):
Crea un archivo `.env` en `catalog-service/`:
```
MYSQL_DB=ecommerce_db
MYSQL_USER=ecommerce_user
MYSQL_PASSWORD=tu_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
```

O edita directamente `settings.py` con tus credenciales de MySQL.

5. Realiza las migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Crea un superusuario (opcional, para acceder al admin):
```bash
python manage.py createsuperuser
```

7. Carga los datos iniciales (categorías y productos):
```bash
python manage.py seed_data
```

8. Inicia el servidor:
```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### 3. Configuración del Frontend (React)

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

El frontend estará disponible en: `http://localhost:3000`

## 📚 Endpoints del Backend

### Categorías
- `GET /api/categorias/` - Listar todas las categorías
- `GET /api/categorias/{id}/` - Obtener categoría por ID
- `POST /api/categorias/` - Crear categoría
- `PUT /api/categorias/{id}/` - Actualizar categoría
- `DELETE /api/categorias/{id}/` - Eliminar categoría
- `GET /api/categorias/{id}/productos/` - Productos de una categoría

### Productos
- `GET /api/productos/` - Listar productos (con filtros: `?categoria=1&estado=activo&search=nombre`)
- `GET /api/productos/{id}/` - Obtener producto por ID
- `POST /api/productos/` - Crear producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `DELETE /api/productos/{id}/` - Eliminar producto
- `GET /api/productos/por_categoria/?categoria_id=1` - Productos por categoría
- `GET /api/productos/buscar/?q=nombre` - Búsqueda de productos
- `GET /api/productos/activos/` - Solo productos activos

### Inventario
- `GET /api/inventario/` - Listar movimientos
- `GET /api/inventario/{id}/` - Obtener movimiento por ID
- `POST /api/inventario/registrar_movimiento/` - Registrar movimiento
- `GET /api/inventario/historial/?producto_id=1` - Historial de movimientos
- `GET /api/inventario/stock_actual/?producto_id=1` - Stock actual de un producto

### Órdenes (Integración Spring Boot)
- `POST /api/orders/create/` - Crear orden
  ```json
  {
    "usuario_id": 1,
    "productos": [
      {"producto_id": 1, "cantidad": 2},
      {"producto_id": 2, "cantidad": 1}
    ],
    "total": 199.99
  }
  ```

## 🎨 Características del Frontend

### Páginas Disponibles
- **Home** (`/`) - Página principal con categorías y productos destacados
- **Categorías** (`/categorias`) - Lista de categorías
- **Productos por Categoría** (`/categorias/:id`) - Productos de una categoría específica
- **Productos** (`/productos`) - Lista de productos con filtros y búsqueda
- **Detalle de Producto** (`/productos/:id`) - Vista detallada de un producto
- **Carrito** (`/carrito`) - Carrito de compras
- **Inventario** (`/inventario`) - Gestión de inventario (admin)
- **CRUD Productos** (`/admin/productos`) - Administración de productos
- **CRUD Categorías** (`/admin/categorias`) - Administración de categorías

### Características
- Diseño moderno con Tailwind CSS
- Navegación responsive
- Carrito de compras con localStorage
- Filtros y búsqueda de productos
- Gestión completa de inventario
- CRUD completo para productos y categorías

## 🗄️ Modelos de Base de Datos

### Categoria
- `id` (PK)
- `nombre` (CharField, único)
- `descripcion` (TextField)
- `fecha_creacion` (DateTimeField)
- `fecha_actualizacion` (DateTimeField)

### Producto
- `id` (PK)
- `nombre` (CharField)
- `descripcion` (TextField)
- `precio` (DecimalField)
- `stock` (IntegerField)
- `categoria` (ForeignKey -> Categoria)
- `imagen` (ImageField)
- `estado` (CharField: 'activo'/'inactivo')
- `fecha_creacion` (DateTimeField)
- `fecha_actualizacion` (DateTimeField)

### MovimientoInventario
- `id` (PK)
- `producto` (ForeignKey -> Producto)
- `tipo` (CharField: 'entrada'/'salida')
- `cantidad` (IntegerField)
- `motivo` (CharField)
- `fecha` (DateTimeField)
- `observaciones` (TextField)

### Orden
- `id` (PK)
- `usuario` (ForeignKey -> User)
- `total` (DecimalField)
- `estado` (CharField)
- `fecha_creacion` (DateTimeField)
- `fecha_actualizacion` (DateTimeField)

### ItemOrden
- `id` (PK)
- `orden` (ForeignKey -> Orden)
- `producto` (ForeignKey -> Producto)
- `cantidad` (IntegerField)
- `precio_unitario` (DecimalField)
- `subtotal` (DecimalField)

## 🔧 Comandos Útiles

### Backend
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Cargar datos iniciales
python manage.py seed_data

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### Frontend
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build
```

## 📝 Notas Importantes

1. **MySQL**: Asegúrate de que MySQL esté corriendo antes de iniciar el backend
2. **Puertos**: El backend usa el puerto 8000 y el frontend el 3000
3. **CORS**: Ya está configurado para permitir peticiones desde el frontend
4. **Media Files**: Las imágenes se guardan en `catalog-service/media/productos/`
5. **Datos Iniciales**: El comando `seed_data` crea 5 categorías con al menos 4 productos cada una

## 🚫 Sin Docker

Este proyecto **NO utiliza Docker**. Todo se ejecuta localmente:
- Python/Django ejecutándose nativamente
- MySQL ejecutándose localmente
- Node.js/React ejecutándose nativamente

## 🔗 Integración con Spring Boot

El endpoint `/api/orders/create/` está preparado para ser consumido por Spring Boot para el procesamiento de pagos. El endpoint:
- Recibe productos, usuario y total
- Crea la orden
- Actualiza automáticamente el stock mediante movimientos de inventario
- Retorna la orden creada

## 📞 Soporte

Para problemas o preguntas, revisa:
- Los logs del servidor Django
- La consola del navegador para errores del frontend
- Los logs de MySQL para problemas de conexión

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.
