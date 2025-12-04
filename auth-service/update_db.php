<?php
// update_db.php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "🚀 Iniciando actualización de la base de datos...\n";

$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '12345';
$dbName = getenv('DB_NAME') ?: 'auth_db';

try {
    $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "✅ Conexión exitosa\n";

    $migrationFile = __DIR__ . '/src/Database/Migrations/002_add_verification_fields.sql';
    
    if (!file_exists($migrationFile)) {
        throw new Exception("Archivo no encontrado: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);
    $pdo->exec($sql);

    echo "✅ Migración 002 ejecutada correctamente\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
