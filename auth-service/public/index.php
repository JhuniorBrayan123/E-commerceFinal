<?php
require_once __DIR__ . '/../src/Config/bootstrap.php';

header('Content-Type: application/json');

$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remover query string para el routing y obtener el path
$path = parse_url($request_uri, PHP_URL_PATH);

// Normalizar el path - remover barras extras
$path = rtrim($path, '/');
if (empty($path)) {
    $path = '/';
}

// Debug: mostrar información de la request (opcional, puedes quitar esto después)
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
