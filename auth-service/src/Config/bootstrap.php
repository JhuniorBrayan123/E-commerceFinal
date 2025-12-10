<?php
// Habilitar manejo de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';

// Cargar variables de entorno (si existe el archivo .env)
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
    $dotenv->load();
}

// Los headers CORS ahora se manejan en index.php
// No configurar headers aquí para evitar conflictos

// Incluir manualmente las clases principales
require_once __DIR__ . '/../Config/database.php';  // <-- Agregamos esta línea
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/RefreshToken.php';
require_once __DIR__ . '/../Services/JWTService.php';
require_once __DIR__ . '/../Services/PasswordService.php';
require_once __DIR__ . '/../Controllers/AuthController.php';
require_once __DIR__ . '/../Controllers/TokenController.php';
require_once __DIR__ . '/../Middleware/JwtMiddleware.php';
