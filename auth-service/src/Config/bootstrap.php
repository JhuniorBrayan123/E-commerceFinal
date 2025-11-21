<?php

require_once __DIR__ . '/../../vendor/autoload.php';

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Headers CORS
header("Access-Control-Allow-Origin: " . (getenv('CORS_ALLOWED_ORIGINS') ?: '*'));
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir todas las clases
spl_autoload_register(function ($class_name) {
    $file = __DIR__ . '/../' . str_replace('\\', '/', $class_name) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Incluir manualmente las clases principales
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/RefreshToken.php';
require_once __DIR__ . '/../Services/JWTService.php';
require_once __DIR__ . '/../Services/PasswordService.php';
require_once __DIR__ . '/../Controllers/AuthController.php';
require_once __DIR__ . '/../Controllers/TokenController.php';
require_once __DIR__ . '/../Middleware/JwtMiddleware.php';
