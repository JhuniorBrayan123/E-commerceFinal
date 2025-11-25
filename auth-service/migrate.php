<?php
// migrate.php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "🚀 Iniciando migración de la base de datos...\n";

// Obtener credenciales con valores por defecto
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '12345';  // Cadena vacía si no hay password
$dbName = getenv('DB_NAME') ?: 'auth_db';

echo "📝 Configuración de conexión:\n";
echo "   Host: $dbHost\n";
echo "   Usuario: $dbUser\n";
echo "   Base de datos: $dbName\n";

try {
    // Conectar a MySQL (sin especificar base de datos primero)
    $dsn = "mysql:host=$dbHost;charset=utf8";
    $pdo = new PDO(
        $dsn,
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    echo "✅ Conexión a MySQL exitosa\n";

    // Crear base de datos si no existe
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName`");
    $pdo->exec("USE `$dbName`");

    echo "✅ Base de datos '$dbName' verificada/creada\n";

    // Leer el archivo de migración
    $migrationFile = __DIR__ . '/src/Database/Migrations/001_create_users_table.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Archivo de migración no encontrado: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    // Ejecutar la migración
    $pdo->exec($sql);

    echo "✅ Tablas creadas exitosamente\n";
    echo "📊 Estructura de la base de datos:\n";

    // Mostrar las tablas creadas
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $table) {
        echo " - $table\n";
    }

    echo "🎉 Migración completada exitosamente!\n";
} catch (PDOException $e) {
    echo "❌ Error de migración: " . $e->getMessage() . "\n";
    echo "💡 Sugerencias:\n";
    echo "   - Verifica que MySQL esté corriendo\n";
    echo "   - Verifica el usuario y host en la configuración\n";
    echo "   - Si usas XAMPP/MAMP, verifica el puerto (usualmente 3306)\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
