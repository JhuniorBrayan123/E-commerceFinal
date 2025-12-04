<?php
// revert_db.php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "🚀 Iniciando reversión de la base de datos...\n";

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

    // Drop columns
    $sql = "ALTER TABLE users DROP COLUMN verification_token, DROP COLUMN is_verified;";
    $pdo->exec($sql);

    echo "✅ Columnas eliminadas exitosamente\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
