<?php
use PHPUnit\Framework\TestCase;

class PasswordServiceTest extends TestCase{
    private $passService;

    //Instanciar la clase PasswordService antes de cada prueba (es la clase con los metodos a probar)
    public function setUp(): void{
        $this->passService = new PasswordService();
    }

    //Pruebas para el metodo validatePassword

    public function testContrasenaMuyCorta(){
        $resultado = $this->passService->validatePassword("Ab1!");
        $esperado = ["La contraseña debe tener al menos 8 caracteres"];
        $this->assertEquals($esperado, $resultado);
    }

    public function testContrasenaSinMayuscula(){
        $resultado = $this->passService->validatePassword("abcdefg1!");
        $esperado = ["La contraseña debe contener al menos una letra mayúscula"];
        $this->assertEquals($esperado, $resultado);
    }

    public function testContrasenaSinMinuscula(){
        $resultado = $this->passService->validatePassword("ABCDEFG1!");
        $esperado = ["La contraseña debe contener al menos una letra minúscula"];
        $this->assertEquals($esperado, $resultado);
    }

    public function testContrasenaSinNumero(){
        $resultado = $this->passService->validatePassword("Abcdefgh!");
        $esperado = ["La contraseña debe contener al menos un número"];
        $this->assertEquals($esperado, $resultado);
    }

    public function testContrasenaSinCaracterEspecial(){
        $resultado = $this->passService->validatePassword("Abcdefg1");
        $esperado = ["La contraseña debe contener al menos un carácter especial"];  
        $this->assertEquals($esperado, $resultado);
    }

    public function testContrasenaValida(){
        $resultado = $this->passService->validatePassword("Abcdefg1!");
        $esperado = [];
        $this->assertEquals($esperado, $resultado);
    }


    //Pruebas para el metodo hashPassword
    public function testHashPasswordGeneratesValidHash()
    {
        $password = 'Abcdef1!';
        $hash = $this->passService->hashPassword($password);

        // Verificamos que el hash no sea falso ni vacío
        $this->assertNotFalse($hash);
        $this->assertNotEmpty($hash);
        $this->assertIsString($hash);
    }


    //Pruebas para el metodo verifyPassword
    public function testVerifyPasswordDevuelveTrueContrasenaCorrecta()
    {
        $password = 'Abcdef1!';
        $hash =  $this->passService->hashPassword($password);
        $respuesta = $this->passService->verifyPassword($password, $hash);

        // Verificamos que verifyPassword retorne true con el password correcto
        $this->assertTrue($respuesta);
    }

    public function testVerifyPasswordDevuelveFalseContrasenaIncorrecta()
    {
        $password = 'Abcdef1!';
        $passwordWrong = "MalaContr@sena";
        $hash =  $this->passService->hashPassword($password);
        $respuesta = $this->passService->verifyPassword($passwordWrong, $hash);

        // Verificamos que verifyPassword retorne true con el password correcto
        $this->assertFalse($respuesta);
    }

}


?>