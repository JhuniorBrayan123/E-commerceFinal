package com.example.payment_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PaymentServiceApplicationTests {

    /**
     * Test #74: contextLoads() debe verificar que el contexto de Spring Boot carga
     * correctamente
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Introducir un error en la configuración de Spring (ej. bean duplicado)
     * - El test fallará si el contexto no puede cargar
     */
    @Test
    void contextLoads() {
        System.out
                .println("Test #74: contextLoads() debe verificar que el contexto de Spring Boot carga correctamente");
        // Este test pasa si el contexto se carga sin errores
    }

}
