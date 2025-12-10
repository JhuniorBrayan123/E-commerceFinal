<?php
try {
    $pdo = new PDO('mysql:host=host.docker.internal;dbname=auth_db', 'root', '');
    echo "✅ AUTH-SERVICE: Conectado a MySQL local correctamente\n";
    echo "Database: auth_db\n";
    echo "Host: host.docker.internal:3306\n";
} catch(Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
