# 🌱 API de Sensores Agrícolas - Documentación de Endpoints

## Base URL

```
http://localhost:8001/sensores
```

## Endpoints Disponibles

### 1. **GET /sensores/** - Listar Sensores

Obtiene una lista de sensores con filtros y búsqueda opcionales.

**Parámetros de Query:**

- `tipo` (string): Filtrar por tipo de sensor (humedad, temperatura, ph, luz, nutrientes, co2)
- `marca` (string): Filtrar por marca (búsqueda parcial)
- `disponible` (boolean): Filtrar por disponibilidad (true/false)
- `search` (string): Búsqueda por nombre, marca, modelo o descripción
- `ordering` (string): Ordenar resultados (ej: `-precio`, `nombre`, `-fecha_creacion`)

**Ejemplo de Request:**

```
GET http://localhost:8001/sensores/sensores/?tipo=humedad&marca=DHT&disponible=true&search=suelo
```

**Response (200 OK):**

```json
{
  "count": 2,
  "filters_applied": {
    "tipo": "humedad",
    "marca": "DHT",
    "disponible": "true",
    "search": "suelo",
    "ordering": "-fecha_creacion"
  },
  "sensores": [
    {
      "id": 1,
      "nombre": "Sensor de Humedad del Suelo DHT22",
      "tipo": "humedad",
      "tipo_display": "Sensor de Humedad",
      "marca": "DHT",
      "modelo": "DHT22",
      "precio": "25.99",
      "descripcion": "Sensor de humedad y temperatura del suelo de alta precisión",
      "rango_medicion": "0-100% HR",
      "precision": "±2%",
      "alimentacion": "Batería AA o 5V DC",
      "protocolo_comunicacion": "Serial/OneWire",
      "imagen": null,
      "stock": 15,
      "disponible": true,
      "fecha_creacion": "2025-11-17T04:55:00Z",
      "fecha_actualizacion": "2025-11-17T04:55:00Z"
    }
  ]
}
```

---

### 2. **POST /sensores/** - Crear Sensor

Crea un nuevo sensor en la base de datos.

**Body (JSON):**

```json
{
  "nombre": "Nuevo Sensor de Humedad",
  "tipo": "humedad",
  "marca": "Sensor Corp",
  "modelo": "SM-100",
  "precio": "49.99",
  "descripcion": "Sensor de humedad de alta precisión",
  "rango_medicion": "0-100%",
  "precision": "±1%",
  "alimentacion": "5V DC",
  "protocolo_comunicacion": "I2C",
  "stock": 10,
  "disponible": true
}
```

**Response (201 Created):**

```json
{
  "mensaje": "Sensor creado exitosamente",
  "sensor": {
    "id": 13,
    "nombre": "Nuevo Sensor de Humedad",
    ...
  }
}
```

---

### 3. **GET /sensores/{id}/** - Obtener Sensor por ID

Obtiene los detalles completos de un sensor específico.

**Ejemplo de Request:**

```
GET http://localhost:8001/sensores/sensores/1/
```

**Response (200 OK):**

```json
{
  "id": 1,
  "nombre": "Sensor de Humedad del Suelo DHT22",
  "tipo": "humedad",
  "tipo_display": "Sensor de Humedad",
  "marca": "DHT",
  "modelo": "DHT22",
  "precio": "25.99",
  "descripcion": "Sensor de humedad y temperatura del suelo de alta precisión",
  "rango_medicion": "0-100% HR",
  "precision": "±2%",
  "alimentacion": "Batería AA o 5V DC",
  "protocolo_comunicacion": "Serial/OneWire",
  "imagen": null,
  "stock": 15,
  "disponible": true,
  "fecha_creacion": "2025-11-17T04:55:00Z",
  "fecha_actualizacion": "2025-11-17T04:55:00Z"
}
```

---

### 4. **PUT /sensores/{id}/** - Actualizar Sensor Completo

Actualiza todos los campos de un sensor existente.

**Body (JSON):**

```json
{
  "nombre": "Sensor Actualizado",
  "tipo": "temperatura",
  "marca": "New Brand",
  "modelo": "NB-200",
  "precio": "59.99",
  "descripcion": "Sensor actualizado",
  "rango_medicion": "-40 a 125°C",
  "precision": "±0.5°C",
  "alimentacion": "5V DC",
  "protocolo_comunicacion": "I2C",
  "stock": 20,
  "disponible": true
}
```

**Response (200 OK):**

```json
{
  "mensaje": "Sensor actualizado exitosamente",
  "sensor": { ...datos del sensor actualizado... }
}
```

---

### 5. **PATCH /sensores/{id}/** - Actualizar Sensor Parcialmente

Actualiza solo los campos especificados de un sensor.

**Body (JSON):**

```json
{
  "precio": "29.99",
  "stock": 25
}
```

**Response (200 OK):**

```json
{
  "mensaje": "Sensor actualizado parcialmente",
  "sensor": { ...datos del sensor actualizado... }
}
```

---

### 6. **DELETE /sensores/{id}/** - Eliminar Sensor

Elimina un sensor de la base de datos.

**Ejemplo de Request:**

```
DELETE http://localhost:8001/sensores/sensores/5/
```

**Response (200 OK):**

```json
{
  "mensaje": "Sensor eliminado correctamente",
  "sensor_eliminado": {
    "id": 5,
    "nombre": "Sensor Eliminado",
    ...
  }
}
```

---

### 7. **GET /stats/** - Estadísticas de Sensores

Obtiene estadísticas generales sobre los sensores.

**Ejemplo de Request:**

```
GET http://localhost:8001/sensores/stats/
```

**Response (200 OK):**

```json
{
  "total_sensores": 12,
  "sensores_disponibles": 11,
  "sensores_agotados": 0,
  "sensores_con_stock": 12,
  "precio_promedio": 45.5,
  "precio_minimo": 2.5,
  "precio_maximo": 199.99,
  "stock_total": 186,
  "por_tipo": {
    "humedad": 2,
    "temperatura": 2,
    "ph": 2,
    "luz": 2,
    "nutrientes": 2,
    "co2": 2
  },
  "por_marca": {
    "DHT": 1,
    "YL-69": 1,
    "Maxim": 1,
    "Melexis": 1,
    "DFRobot": 3,
    "Generic": 1,
    "ROHM": 1,
    "Winsen": 1,
    "Sensirion": 1,
    "Atlas Scientific": 1
  }
}
```

---

### 8. **GET /filters/** - Obtener Opciones de Filtro

Obtiene las opciones disponibles para filtrar sensores.

**Ejemplo de Request:**

```
GET http://localhost:8001/sensores/filters/
```

**Response (200 OK):**

```json
{
  "tipos": [
    { "value": "humedad", "label": "Sensor de Humedad" },
    { "value": "temperatura", "label": "Sensor de Temperatura" },
    { "value": "ph", "label": "Sensor de pH" },
    { "value": "luz", "label": "Sensor de Luz" },
    { "value": "nutrientes", "label": "Sensor de Nutrientes" },
    { "value": "co2", "label": "Sensor de CO2" }
  ],
  "marcas": [
    "Atlas Scientific",
    "DFRobot",
    "DHT",
    "Generic",
    "Maxim",
    "Melexis",
    "ROHM",
    "Sensirion",
    "Winsen",
    "YL-69"
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Significado                           |
| ------ | ------------------------------------- |
| 200    | OK - Solicitud exitosa                |
| 201    | Created - Recurso creado exitosamente |
| 400    | Bad Request - Error en validación     |
| 404    | Not Found - Recurso no encontrado     |

---

## Tipos de Sensores Disponibles

| Tipo          | Descripción           |
| ------------- | --------------------- |
| `humedad`     | Sensor de Humedad     |
| `temperatura` | Sensor de Temperatura |
| `ph`          | Sensor de pH          |
| `luz`         | Sensor de Luz         |
| `nutrientes`  | Sensor de Nutrientes  |
| `co2`         | Sensor de CO2         |

---

## Ejemplos con cURL

### Obtener todos los sensores de humedad:

```bash
curl -X GET "http://localhost:8001/sensores/sensores/?tipo=humedad"
```

### Crear un nuevo sensor:

```bash
curl -X POST "http://localhost:8001/sensores/sensores/" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Sensor",
    "tipo": "temperatura",
    "marca": "TestBrand",
    "modelo": "TB-100",
    "precio": "39.99",
    "descripcion": "Un nuevo sensor de prueba",
    "rango_medicion": "-40 a 125°C",
    "precision": "±0.5°C",
    "alimentacion": "5V DC",
    "protocolo_comunicacion": "I2C",
    "stock": 5,
    "disponible": true
  }'
```

### Actualizar precio de un sensor:

```bash
curl -X PATCH "http://localhost:8001/sensores/sensores/1/" \
  -H "Content-Type: application/json" \
  -d '{"precio": "35.99"}'
```

### Obtener estadísticas:

```bash
curl -X GET "http://localhost:8001/sensores/stats/"
```

---

## Manejo de Errores

### Sensor no encontrado (404):

```json
{
  "error": "Sensor con ID 999 no encontrado"
}
```

### Validación fallida (400):

```json
{
  "nombre": ["Este campo no puede estar en blanco."],
  "precio": ["El precio debe ser mayor a 0"],
  "stock": ["El stock no puede ser negativo"]
}
```

---

## Notas Importantes

1. **CORS habilitado**: La API acepta solicitudes desde cualquier origen (`ALLOWED_HOSTS = ['*']`)
2. **CSRF exento**: Los endpoints están protegidos con `@csrf_exempt` para facilitar pruebas
3. **Validación automática**: Los precios y stocks se validan automáticamente
4. **Imágenes**: El campo `imagen` puede ser nulo por ahora (preparado para futuras implementaciones)
5. **Timestamps**: Las fechas se devuelven en formato ISO 8601 (UTC)

---

## Comandos Django Útiles

### Crear datos de prueba:

```bash
python manage.py seed_sensores
```

### Ver sensores en admin:

```
http://localhost:8000/admin/sensores/sensor/
```

### Crear migraciones:

```bash
python manage.py makemigrations
python manage.py migrate
```
