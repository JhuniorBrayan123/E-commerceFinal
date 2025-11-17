# Documentación de Endpoints API

Base URL: `http://localhost:8000/api`

## Categorías

### Listar todas las categorías
```
GET /categorias/
```

### Obtener categoría por ID
```
GET /categorias/{id}/
```

### Crear categoría
```
POST /categorias/
Body: {
  "nombre": "Electrónica",
  "descripcion": "Dispositivos electrónicos"
}
```

### Actualizar categoría
```
PUT /categorias/{id}/
Body: {
  "nombre": "Electrónica",
  "descripcion": "Dispositivos electrónicos actualizados"
}
```

### Eliminar categoría
```
DELETE /categorias/{id}/
```

### Productos de una categoría
```
GET /categorias/{id}/productos/
```

## Productos

### Listar productos (con filtros)
```
GET /productos/?categoria=1&estado=activo&search=nombre&ordering=precio
```

Parámetros opcionales:
- `categoria`: ID de categoría
- `estado`: 'activo' o 'inactivo'
- `search`: Búsqueda por nombre o descripción
- `ordering`: Ordenar por 'precio', 'stock', 'nombre', 'fecha_creacion'

### Obtener producto por ID
```
GET /productos/{id}/
```

### Crear producto
```
POST /productos/
Content-Type: multipart/form-data
Body (FormData):
  - nombre: "Producto"
  - descripcion: "Descripción"
  - precio: 99.99
  - stock: 100
  - categoria: 1
  - estado: "activo"
  - imagen: (archivo)
```

### Actualizar producto
```
PUT /productos/{id}/
Content-Type: multipart/form-data
Body (FormData): (mismo formato que crear)
```

### Eliminar producto
```
DELETE /productos/{id}/
```

### Productos por categoría
```
GET /productos/por_categoria/?categoria_id=1
```

### Búsqueda de productos
```
GET /productos/buscar/?q=nombre
```

### Solo productos activos
```
GET /productos/activos/
```

## Inventario

### Listar movimientos
```
GET /inventario/?producto=1&tipo=entrada
```

### Obtener movimiento por ID
```
GET /inventario/{id}/
```

### Registrar movimiento
```
POST /inventario/registrar_movimiento/
Body: {
  "producto": 1,
  "tipo": "entrada",
  "cantidad": 10,
  "motivo": "Compra de proveedor",
  "observaciones": "Lote #123"
}
```

### Historial de movimientos
```
GET /inventario/historial/?producto_id=1
```

### Stock actual de un producto
```
GET /inventario/stock_actual/?producto_id=1
Response: {
  "producto_id": 1,
  "producto_nombre": "Producto",
  "stock_actual": 50
}
```

## Órdenes (Integración Spring Boot)

### Crear orden
```
POST /orders/create/
Body: {
  "usuario_id": 1,
  "productos": [
    {"producto_id": 1, "cantidad": 2},
    {"producto_id": 2, "cantidad": 1}
  ],
  "total": 199.99
}
```

**Nota:** Este endpoint:
- Crea la orden
- Crea los items de la orden
- Actualiza automáticamente el stock mediante movimientos de inventario
- Retorna la orden creada con todos sus detalles

## Respuestas de Error Comunes

### 400 Bad Request
```json
{
  "error": "Mensaje de error descriptivo"
}
```

### 404 Not Found
```json
{
  "error": "Recurso no encontrado"
}
```

### 500 Internal Server Error
Error del servidor, revisar logs de Django.

