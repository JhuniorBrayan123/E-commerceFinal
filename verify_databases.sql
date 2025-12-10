-- Verificación de bases de datos MySQL local
-- Este script verifica que auth_db y ecommerce_db existen y muestra su estructura

SHOW DATABASES LIKE '%auth_db%';
SHOW DATABASES LIKE '%ecommerce_db%';

-- Verificar tablas en auth_db
USE auth_db;
SHOW TABLES;

-- Verificar tablas en ecommerce_db
USE ecommerce_db;
SHOW TABLES;

-- Contar usuarios en auth_db
SELECT COUNT(*) as total_usuarios FROM auth_db.users;

-- Contar órdenes en ecommerce_db (si existe la tabla)
SELECT COUNT(*) as total_orders FROM ecommerce_db.orders;

-- Mostrar últimos 5 usuarios creados
SELECT id, username, email, created_at 
FROM auth_db.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Mostrar últimas 5 órdenes
SELECT id, user_id, total, status, created_at 
FROM ecommerce_db.orders 
ORDER BY created_at DESC 
LIMIT 5;
