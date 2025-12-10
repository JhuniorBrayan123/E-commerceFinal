<?php
require_once __DIR__ . '/../src/Config/bootstrap.php';

use PHPUnit\Framework\TestCase;

class AuthControllerTest extends TestCase
{
    private $authController;

    // Instanciar la clase AuthController antes de cada prueba
    public function setUp(): void
    {
        $this->authController = new AuthController();
    }

    // Pruebas para el método register()

    /**
     * Test #1: register() debe rechazar email inválido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar 'email-invalido-sin-arroba' por 'valid@email.com'
     * - El test fallará porque el email será válido y no será rechazado
     */ 
    //bueno esto es nuevo   
    public function testRegisterRechazaEmailInvalido()
    {
        echo "Test #1: register() debe rechazar email inválido\n";

        $input = json_encode([
            'email' => 'email-invalido-sin-arroba',
            'password' => 'Password123!',
            'first_name' => 'Test',
            'last_name' => 'User'
        ]);

        $this->mockInputData($input);

        $resultado = $this->authController->register();
        $data = json_decode($resultado, true);

        $this->assertFalse($data['success'], '❌ Test #1 FALLÓ: success debe ser false para email inválido');
        $this->assertEquals('Email no válido', $data['message'], '❌ Test #1 FALLÓ: mensaje debe ser "Email no válido"');
    }

    /**
     * Test #2: register() debe rechazar usuario duplicado con código 409
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertFalse por assertTrue en la línea 76
     * - El test fallará porque se espera falso para usuario duplicado
     */
    public function testRegisterRechazaUsuarioDuplicado()
    {
        echo "Test #2: register() debe rechazar usuario duplicado con código 409\n";

        $emailDuplicado = 'duplicado_' . uniqid() . '@test.com';

        // PRIMERO: Crear un usuario
        $input1 = json_encode([
            'email' => $emailDuplicado,
            'password' => 'Password123!',
            'first_name' => 'Primero',
            'last_name' => 'Usuario'
        ]);

        $this->mockInputData($input1);
        $resultado1 = $this->authController->register();
        $data1 = json_decode($resultado1, true);

        // Verificar que el primer registro fue exitoso
        $this->assertTrue($data1['success'], '❌ Test #2 FALLÓ: primer registro debe ser exitoso');

        // SEGUNDO: Intentar registrar el mismo email
        $input2 = json_encode([
            'email' => $emailDuplicado,
            'password' => 'OtraPassword123!',
            'first_name' => 'Segundo',
            'last_name' => 'Usuario'
        ]);

        $this->mockInputData($input2);
        $resultado2 = $this->authController->register();
        $data2 = json_decode($resultado2, true);

        // Verificar que el segundo registro falla por duplicado
        $this->assertFalse($data2['success'], '❌ Test #2 FALLÓ: segundo registro debe fallar por usuario duplicado');
        $this->assertEquals('El usuario ya existe', $data2['message'], '❌ Test #2 FALLÓ: mensaje debe ser "El usuario ya existe"');
    }

    /**
     * Test #3: login() debe rechazar credenciales inválidas con código 401
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertFalse por assertTrue en la línea 112
     * - El test fallará porque se espera falso para credenciales inválidas
     */
    public function testLoginRechazaCredencialesInvalidas()
    {
        echo "Test #3: login() debe rechazar credenciales inválidas con código 401\n";

        $input = json_encode([
            'email' => 'noexiste_' . uniqid() . '@test.com',
            'password' => 'WrongPassword123!'
        ]);

        $this->mockInputData($input);

        $resultado = $this->authController->login();
        $data = json_decode($resultado, true);

        $this->assertFalse($data['success'], '❌ Test #3 FALLÓ: success debe ser false para credenciales inválidas');
        $this->assertEquals('Credenciales inválidas', $data['message'], '❌ Test #3 FALLÓ: mensaje debe ser "Credenciales inválidas"');
    }

    /**
     * Test #4: login() debe rechazar usuario inactivo con código 403
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Crear un usuario activo en lugar de inactivo
     * - El test fallará porque un usuario activo no debería dar error 403
     */
    public function testLoginRechazaUsuarioInactivo()
    {
        echo "Test #4: login() debe rechazar usuario inactivo con código 403\n";

        $emailInactivo = 'inactivo_' . uniqid() . '@test.com';

        // Crear usuario inactivo directamente en BD
        $this->crearUsuarioInactivo($emailInactivo, 'Password123!');

        $input = json_encode([
            'email' => $emailInactivo,
            'password' => 'Password123!'
        ]);

        $this->mockInputData($input);

        $resultado = $this->authController->login();
        $data = json_decode($resultado, true);

        $this->assertFalse($data['success'], '❌ Test #4 FALLÓ: success debe ser false para usuario inactivo');
        $this->assertEquals('Usuario desactivado', $data['message'], '❌ Test #4 FALLÓ: mensaje debe ser "Usuario desactivado"');
    }

    /**
     * Test #5: login() debe retornar tokens con credenciales válidas
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar 'Password123!' por una contraseña incorrecta
     * - El test fallará porque las credenciales serán incorrectas
     */
    public function testLoginRetornaTokensConCredencialesValidas()
    {
        echo "Test #5: login() debe retornar tokens con credenciales válidas\n";

        $email = 'valido_' . uniqid() . '@test.com';
        $password = 'Password123!';

        // PRIMERO: Registrar un usuario
        $inputRegistro = json_encode([
            'email' => $email,
            'password' => $password,
            'first_name' => 'Usuario',
            'last_name' => 'Valido'
        ]);

        $this->mockInputData($inputRegistro);
        $resultadoRegistro = $this->authController->register();
        $dataRegistro = json_decode($resultadoRegistro, true);

        $this->assertTrue($dataRegistro['success'], '❌ Test #5 FALLÓ: registro debe ser exitoso');

        // SEGUNDO: Hacer login
        $inputLogin = json_encode([
            'email' => $email,
            'password' => $password
        ]);

        $this->mockInputData($inputLogin);
        $resultadoLogin = $this->authController->login();
        $dataLogin = json_decode($resultadoLogin, true);

        $this->assertTrue($dataLogin['success'], '❌ Test #5 FALLÓ: login debe ser exitoso');
        $this->assertArrayHasKey('access_token', $dataLogin['data']['tokens'], '❌ Test #5 FALLÓ: debe tener access_token');
        $this->assertArrayHasKey('refresh_token', $dataLogin['data']['tokens'], '❌ Test #5 FALLÓ: debe tener refresh_token');
        $this->assertNotEmpty($dataLogin['data']['tokens']['access_token'], '❌ Test #5 FALLÓ: access_token no debe estar vacío');
        $this->assertNotEmpty($dataLogin['data']['tokens']['refresh_token'], '❌ Test #5 FALLÓ: refresh_token no debe estar vacío');
    }

    /**
     * Test #6: register() debe crear usuario con datos válidos
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Omitir algun campo requerido (email, password, first_name, last_name)
     * - El test fallará porque faltará un campo requerido
     */
    public function testRegisterCreaUsuarioConDatosValidos()
    {
        echo "Test #6: register() debe crear usuario con datos válidos\n";

        $email = 'nuevo_' . uniqid() . '@test.com';

        $input = json_encode([
            'email' => $email,
            'password' => 'Password123!',
            'first_name' => 'Juan',
            'last_name' => 'Pérez'
        ]);

        $this->mockInputData($input);

        $resultado = $this->authController->register();
        $data = json_decode($resultado, true);

        $this->assertTrue($data['success'], '❌ Test #6 FALLÓ: registro debe ser exitoso');
        $this->assertEquals('Usuario registrado exitosamente', $data['message'], '❌ Test #6 FALLÓ: mensaje debe ser "Usuario registrado exitosamente"');
        $this->assertArrayHasKey('user', $data['data'], '❌ Test #6 FALLÓ: debe tener key "user" en data');
        $this->assertEquals($email, $data['data']['user']['email'], '❌ Test #6 FALLÓ: email del usuario debe coincidir');
        $this->assertEquals('Juan', $data['data']['user']['first_name'], '❌ Test #6 FALLÓ: first_name debe ser "Juan"');
        $this->assertEquals('Pérez', $data['data']['user']['last_name'], '❌ Test #6 FALLÓ: last_name debe ser "Pérez"');
    }

    /**
     * Test #7: login() debe retornar user_id correcto en el response
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Comparar con un user_id diferente al real
     * - El test fallará porque el user_id no coincidirá
     */
    public function testLoginRetornaUserIdCorrecto()
    {
        echo "Test #7: login() debe retornar user_id correcto en el response\n";

        $email = 'conid_' . uniqid() . '@test.com';
        $password = 'Password123!';

        // Registrar usuario
        $inputRegistro = json_encode([
            'email' => $email,
            'password' => $password,
            'first_name' => 'Con',
            'last_name' => 'ID'
        ]);

        $this->mockInputData($inputRegistro);
        $resultadoRegistro = $this->authController->register();
        $dataRegistro = json_decode($resultadoRegistro, true);

        $userIdRegistro = $dataRegistro['data']['user']['id'];
        $this->assertTrue($dataRegistro['success'], '❌ Test #7 FALLÓ: registro debe ser exitoso');

        // Hacer login
        $inputLogin = json_encode([
            'email' => $email,
            'password' => $password
        ]);

        $this->mockInputData($inputLogin);
        $resultadoLogin = $this->authController->login();
        $dataLogin = json_decode($resultadoLogin, true);

        $this->assertTrue($dataLogin['success'], '❌ Test #7 FALLÓ: login debe ser exitoso');
        $this->assertArrayHasKey('user', $dataLogin['data'], '❌ Test #7 FALLÓ: debe tener key "user" en data');
        $this->assertArrayHasKey('id', $dataLogin['data']['user'], '❌ Test #7 FALLÓ: user debe tener key "id"');
        $this->assertEquals($userIdRegistro, $dataLogin['data']['user']['id'], '❌ Test #7 FALLÓ: user_id debe coincidir con el del registro');
    }

    /**
     * Helper method para mockear php://input
     */
    private function mockInputData($data)
    {
        require_once __DIR__ . '/MockPhpStream.php';

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', 'MockPhpStream');

        MockPhpStream::$content = $data;
    }

    /**
     * Helper para crear usuario inactivo directamente en BD
     */
    private function crearUsuarioInactivo($email, $password)
    {
        // Esta función necesita acceso directo a la BD
        // para crear un usuario con is_active = 0
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("
            INSERT INTO users (email, password, first_name, last_name, is_active, created_at) 
            VALUES (?, ?, 'Inactivo', 'Usuario', 0, NOW())
        ");

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt->execute([$email, $hashedPassword]);
    }

    protected function tearDown(): void
    {
        if (in_array('php', stream_get_wrappers())) {
            stream_wrapper_restore('php');
        }
    }
}
