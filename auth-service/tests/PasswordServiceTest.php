<?php
// Autoload de Composer
require_once __DIR__ . '/../vendor/autoload.php';

use PHPUnit\Framework\TestCase;

class PasswordServiceTest extends TestCase
{
    private $passService;

    //Instanciar la clase PasswordService antes de cada prueba (es la clase con los metodos a probar)
    public function setUp(): void
    {
        $this->passService = new PasswordService();
    }

    //Pruebas para el metodo validatePassword

    /**
     * Test #18: validatePassword() debe rechazar contraseña muy corta
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "Ab1!" por "Abcdefg1!" (contraseña válida de 9 caracteres)
     * - El test fallará porque la contraseña tendrá más de 8 caracteres
     */
    public function testContrasenaMuyCorta()
    {
        echo "Test #18: validatePassword() debe rechazar contraseña muy corta\n";

        $resultado = $this->passService->validatePassword("Ab1!");
        $esperado = ["La contraseña debe tener al menos 8 caracteres"];
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #19: validatePassword() debe rechazar contraseña sin mayúscula
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "abcdefg1!" por "Abcdefg1!" (con mayúscula)
     * - El test fallará porque la contraseña tendrá una mayúscula
     */
    public function testContrasenaSinMayuscula()
    {
        echo "Test #19: validatePassword() debe rechazar contraseña sin mayúscula\n";

        $resultado = $this->passService->validatePassword("abcdefg1!");
        $esperado = ["La contraseña debe contener al menos una letra mayúscula"];
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #20: validatePassword() debe rechazar contraseña sin minúscula
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "ABCDEFG1!" por "Abcdefg1!" (con minúscula)
     * - El test fallará porque la contraseña tendrá una minúscula
     */
    public function testContrasenaSinMinuscula()
    {
        echo "Test #20: validatePassword() debe rechazar contraseña sin minúscula\n";

        $resultado = $this->passService->validatePassword("ABCDEFG1!");
        $esperado = ["La contraseña debe contener al menos una letra minúscula"];
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #21: validatePassword() debe rechazar contraseña sin número
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "Abcdefgh!" por "Abcdefg1!" (con número)
     * - El test fallará porque la contraseña tendrá un número
     */
    public function testContrasenaSinNumero()
    {
        echo "Test #21: validatePassword() debe rechazar contraseña sin número\n";

        $resultado = $this->passService->validatePassword("Abcdefgh!");
        $esperado = ["La contraseña debe contener al menos un número"];
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #22: validatePassword() debe rechazar contraseña sin carácter especial
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "Abcdefg1" por "Abcdefg1!" (con carácter especial)
     * - El test fallará porque la contraseña tendrá un carácter especial
     */
    public function testContrasenaSinCaracterEspecial()
    {
        echo "Test #22: validatePassword() debe rechazar contraseña sin carácter especial\n";

        $resultado = $this->passService->validatePassword("Abcdefg1");
        $esperado = ["La contraseña debe contener al menos un carácter especial"];
        $this->assertEquals($esperado, $resultado);
    }

    /**
     * Test #23: validatePassword() debe aceptar contraseña válida
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar "Abcdefg1!" por "Ab1!" (contraseña corta)
     * - El test fallará porque la contraseña no cumple con los requisitos
     */
    public function testContrasenaValida()
    {
        echo "Test #23: validatePassword() debe aceptar contraseña válida\n";

        $resultado = $this->passService->validatePassword("Abcdefg1!");
        $esperado = [];
        $this->assertEquals($esperado, $resultado);
    }


    //Pruebas para el metodo hashPassword
    /**
     * Test #24: hashPassword() debe generar un hash válido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertNotFalse($hash) por assertFalse($hash)
     * - El test fallará porque el hash no es false
     */
    public function testHashPasswordGeneratesValidHash()
    {
        echo "Test #24: hashPassword() debe generar un hash válido\n";

        $password = 'Abcdef1!';
        $hash = $this->passService->hashPassword($password);

        // Verificamos que el hash no sea falso ni vacío
        $this->assertNotFalse($hash);
        $this->assertNotEmpty($hash);
        $this->assertIsString($hash);
    }


    //Pruebas para el metodo verifyPassword
    /**
     * Test #25: verifyPassword() debe retornar true con contraseña correcta
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertTrue($respuesta) por assertFalse($respuesta)
     * - El test fallará porque la verificación es verdadera (true)
     */
    public function testVerifyPasswordDevuelveTrueContrasenaCorrecta()
    {
        echo "Test #25: verifyPassword() debe retornar true con contraseña correcta\n";

        $password = 'Abcdef1!';
        $hash =  $this->passService->hashPassword($password);
        $respuesta = $this->passService->verifyPassword($password, $hash);

        // Verificamos que verifyPassword retorne true con el password correcto
        $this->assertTrue($respuesta);
    }

    /**
     * Test #26: verifyPassword() debe retornar false con contraseña incorrecta
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar $passwordWrong por $password (usar la contraseña correcta)
     * - El test fallará porque la verificación será verdadera (true) no falsa
     */
    public function testVerifyPasswordDevuelveFalseContrasenaIncorrecta()
    {
        echo "Test #26: verifyPassword() debe retornar false con contraseña incorrecta\n";

        $password = 'Abcdef1!';
        $passwordWrong = "MalaContr@sena";
        $hash =  $this->passService->hashPassword($password);
        $respuesta = $this->passService->verifyPassword($passwordWrong, $hash);

        // Verificamos que verifyPassword retorne true con el password correcto
        $this->assertFalse($respuesta);
    }
}
