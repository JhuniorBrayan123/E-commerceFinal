<?php
require_once '../src/Config/bootstrap.php';

header('Content-Type: application/json');

$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remover query string para el routing
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/auth-service/public', '', $path); // Ajustar según tu configuración

// Routing
switch (true) {
    case $method === 'POST' && $path === '/register':
        $controller = new AuthController();
        echo $controller->register();
        break;

    case $method === 'POST' && $path === '/login':
        $controller = new AuthController();
        echo $controller->login();
        break;

    case $method === 'POST' && $path === '/verify':
        $controller = new TokenController();
        echo $controller->verify();
        break;

    case $method === 'POST' && $path === '/refresh':
        $controller = new TokenController();
        echo $controller->refresh();
        break;

    case $method === 'POST' && $path === '/logout':
        $controller = new TokenController();
        echo $controller->logout();
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
}
