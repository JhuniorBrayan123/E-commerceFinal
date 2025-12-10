<?php
// Start output buffering IMMEDIATELY to prevent any premature output
ob_start();

// ===== CORS HEADERS - DEBEN SER LO PRIMERO =====
// Configurar CORS headers ANTES de cualquier otro código
$allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($requestOrigin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else if (!empty($allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $allowedOrigins[0]);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

// Manejar preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean(); // Clear any buffered output
    http_response_code(200);
    exit(0);
}
// ===== FIN CORS HEADERS =====

// Habilitar manejo de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    require_once __DIR__ . '/../src/Config/bootstrap.php';

    $request_uri = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];

    // Remover query string para el routing y obtener el path
    $path = parse_url($request_uri, PHP_URL_PATH);

    // Normalizar el path - remover barras extras
    $path = rtrim($path, '/');
    if (empty($path)) {
        $path = '/';
    }

    // Debug: mostrar información de la request
    error_log("Request: $method $path");

    // Routing
    switch (true) {
        case $method === 'POST' && $path === '/api/register':
            $controller = new AuthController();
            echo $controller->register();
            break;

        case $method === 'POST' && $path === '/api/login':
            $controller = new AuthController();
            echo $controller->login();
            break;

        case $method === 'POST' && $path === '/api/verify':
            $controller = new TokenController();
            echo $controller->verify();
            break;

        case $method === 'POST' && $path === '/api/refresh':
            $controller = new TokenController();
            echo $controller->refresh();
            break;

        case $method === 'POST' && $path === '/api/logout':
            $controller = new TokenController();
            echo $controller->logout();
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Endpoint no encontrado: ' . $path
            ]);
    }
} catch (Exception $e) {
    error_log("Error en index.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
} catch (Error $e) {
    error_log("Fatal error en index.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fatal del servidor: ' . $e->getMessage()
    ]);
}
