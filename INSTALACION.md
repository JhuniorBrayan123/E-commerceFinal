# Guía Rápida de Instalación

## Requisitos
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

## Pasos Rápidos

### 1. MySQL
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```bash
cd catalog-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## Acceso
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## Problemas Comunes

### Error al instalar mysqlclient
Usa pymysql:
```bash
pip install pymysql
```
Agrega al inicio de `catalog-service/settings.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Error de conexión a MySQL
Verifica:
1. MySQL está corriendo
2. Credenciales en `settings.py` son correctas
3. Usuario tiene permisos en la base de datos

### CORS Error
Ya está configurado. Si persiste, verifica que el backend esté en el puerto 8000.

