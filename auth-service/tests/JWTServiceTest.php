<?php
require_once __DIR__ . '/../src/Config/bootstrap.php';

use PHPUnit\Framework\TestCase;

class JWTServiceTest extends TestCase
{
    /**
     * Test #8: generateToken() debe generar un token válido no vacío
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertNotEmpty($token) por assertEmpty($token)
     * - El test fallará porque el token generado no está vacío
     */
    public function testGenerateTokenCreatesValidToken()
    {
        echo "Test #8: generateToken() debe generar un token válido no vacío\n";

        $user_id = 123;
        $email = 'test@example.com';

        $resultado = JWTService::generateToken($user_id, $email);

        $this->assertNotEmpty($resultado);
        $this->assertIsString($resultado);

        // JWT tienen 3 partes separadas por puntos
        $partes = explode('.', $resultado);
        $esperadoPartes = 3; // JWT tiene 3 partes: header.payload.signature
        $this->assertCount($esperadoPartes, $partes);
    }

    /**
     * Test #9: generateToken() debe incluir user_id en el payload
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar $user_id = 456 por $user_id = 999 en la aserción final
     * - El test fallará porque el ID en el token no coincidirá con el esperado
     */
    public function testGenerateTokenIncludesUserId()
    {
        echo "Test #9: generateToken() debe incluir user_id en el payload\n";

        $user_id = 456;
        $email = 'user@test.com';

        $token = JWTService::generateToken($user_id, $email);
        $resultado = JWTService::verifyToken($token);

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('user_id', $resultado);

        $esperado = $user_id;
        $this->assertEquals($esperado, $resultado['user_id']);
    }

    /**
     * Test #10: generateToken() debe incluir email en el payload
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar $email = 'email@example.com' por 'wrong@email.com' en la aserción
     * - El test fallará porque el email en el token no coincidirá
     */
    public function testGenerateTokenIncludesEmail()
    {
        echo "Test #10: generateToken() debe incluir email en el payload\n";

        $user_id = 789;
        $email = 'email@example.com';

        $token = JWTService::generateToken($user_id, $email);
        $resultado = JWTService::verifyToken($token);

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('email', $resultado);

        $esperado = $email;
        $this->assertEquals($esperado, $resultado['email']);
    }

    /**
     * Test #11: generateToken() debe incluir claims estándar JWT (iss, iat, exp)
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar 'auth-service' por otro issuer en la aserción
     * - El test fallará porque el issuer no coincidirá
     */
    public function testGenerateTokenIncludesStandardClaims()
    {
        echo "Test #11: generateToken() debe incluir claims estándar JWT\n";

        $user_id = 111;
        $email = 'claims@test.com';

        $token = JWTService::generateToken($user_id, $email);
        $partes = explode('.', $token);
        $header = json_decode(base64_decode(strtr($partes[0], '-_', '+/')), true);
        $payload = json_decode(base64_decode(strtr($partes[1], '-_', '+/')), true);

        // Verificar claims estándar
        $this->assertArrayHasKey('iss', $payload);
        $this->assertEquals('auth-service', $payload['iss']);

        $this->assertArrayHasKey('iat', $payload);
        $this->assertArrayHasKey('exp', $payload);

        // Verificar que exp es mayor que iat
        $this->assertGreaterThan($payload['iat'], $payload['exp']);

        // Verificar algoritmo en header
        $this->assertArrayHasKey('alg', $header);
        $this->assertEquals('HS256', $header['alg']);
    }

    /**
     * Test #12: verifyToken() debe retornar datos con token válido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar $user_id en la aserción por un valor diferente
     * - El test fallará por discrepancia en los datos
     */
    public function testVerifyTokenReturnsDataWithValidToken()
    {
        echo "Test #12: verifyToken() debe retornar datos con token válido\n";

        $user_id = 222;
        $email = 'valid@token.com';

        $token = JWTService::generateToken($user_id, $email);
        $resultado = JWTService::verifyToken($token);

        $this->assertIsArray($resultado);

        $esperadoUserId = $user_id;
        $this->assertEquals($esperadoUserId, $resultado['user_id']);

        $esperadoEmail = $email;
        $this->assertEquals($esperadoEmail, $resultado['email']);
    }

    /**
     * Test #13: verifyToken() debe retornar false con token expirado
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Eliminar putenv('JWT_EXPIRE=-1')
     * - El test fallará porque el token será válido y verifyToken retornará datos en lugar de false
     */
    public function testVerifyTokenReturnsFalseWithExpiredToken()
    {
        echo "Test #13: verifyToken() debe retornar false con token expirado\n";

        // Guardar valor original
        $originalExpire = getenv('JWT_EXPIRE');

        // Temporalmente modificar la variable de entorno de expiración
        putenv('JWT_EXPIRE=-1'); // Expira inmediatamente

        $user_id = 333;
        $email = 'expired@test.com';
        $token = JWTService::generateToken($user_id, $email);

        // Esperar un segundo para que el token expire
        sleep(2);

        $resultado = JWTService::verifyToken($token);

        // Restaurar configuración
        if ($originalExpire !== false) {
            putenv("JWT_EXPIRE=$originalExpire");
        } else {
            putenv('JWT_EXPIRE=3600');
        }

        $esperado = false;
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #14: verifyToken() debe retornar false con token inválido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Usar un token válido generado con generateToken()
     * - El test fallará porque verifyToken retornará true/array
     */
    public function testVerifyTokenReturnsFalseWithInvalidToken()
    {
        echo "Test #14: verifyToken() debe retornar false con token inválido\n";

        $invalidToken = 'esto.no.es.un.token.valido';

        $resultado = JWTService::verifyToken($invalidToken);

        $esperado = false;
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #15: verifyToken() debe retornar false con token manipulado
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - No manipular el token (dejarlo válido)
     * - El test fallará porque verifyToken retornará datos en lugar de false
     */
    public function testVerifyTokenReturnsFalseWithTamperedToken()
    {
        echo "Test #15: verifyToken() debe retornar false con token manipulado\n";

        $user_id = 444;
        $email = 'tampered@test.com';

        $token = JWTService::generateToken($user_id, $email);

        // Manipular el token (cambiar un carácter)
        $tokenManipulado = substr($token, 0, -5) . 'xxxxx';

        $resultado = JWTService::verifyToken($tokenManipulado);

        $esperado = false;
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #16: generateRefreshToken() debe generar string de 128 caracteres hexadecimal
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(128, ...) por assertEquals(64, ...)
     * - El test fallará porque la longitud es 128
     */
    public function testGenerateRefreshTokenCreates128CharacterHexString()
    {
        echo "Test #16: generateRefreshToken() debe generar string de 128 caracteres\n";

        $resultado = JWTService::generateRefreshToken();

        $this->assertIsString($resultado);

        $esperadoLongitud = 128; // 64 bytes * 2 caracteres por byte
        $this->assertEquals($esperadoLongitud, strlen($resultado));

        // Debe ser hexadecimal (solo contiene 0-9 y a-f)
        $this->assertTrue(ctype_xdigit($resultado));
    }

    /**
     * Test #17: verifyToken() debe retornar false con secret key incorrecta
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - No cambiar el secret key temporalmente
     * - El test fallará porque el token será válido con la key correcta
     */
    public function testVerifyTokenReturnsFalseWithWrongSecretKey()
    {
        echo "Test #17: verifyToken() debe retornar false con secret key incorrecta\n";

        // Guardar secret key original
        $originalSecret = getenv('JWT_SECRET');

        // Generar token con secret key original
        $user_id = 555;
        $email = 'wrongkey@test.com';
        $token = JWTService::generateToken($user_id, $email);

        // Cambiar secret key temporalmente
        putenv('JWT_SECRET=wrong-secret-key-12345');

        // Forzar re-inicialización de JWTService
        $resultado = JWTService::verifyToken($token);

        // Restaurar secret key original
        if ($originalSecret !== false) {
            putenv("JWT_SECRET=$originalSecret");
        } else {
            putenv('JWT_SECRET=mi-clave-secreta-jwt-muy-segura-para-ecommerce');
        }

        $esperado = false;
        $this->assertEquals($esperado, $resultado);
    }
}
