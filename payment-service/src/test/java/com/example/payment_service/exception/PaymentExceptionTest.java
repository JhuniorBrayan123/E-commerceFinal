package com.example.payment_service.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class PaymentExceptionTest {

    /**
     * Test #63: unauthorized() debe crear excepción con HttpStatus.UNAUTHORIZED
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.UNAUTHORIZED, ...) a
     * assertEquals(HttpStatus.FORBIDDEN, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void unauthorized_ShouldCreateExceptionWithUnauthorizedStatus() {
        System.out.println(" Test #63: unauthorized() debe crear excepción con HttpStatus.UNAUTHORIZED");

        // When
        PaymentException exception = PaymentException.unauthorized("AUTH_ERROR", "No autorizado");

        // Then
        assertEquals("AUTH_ERROR", exception.getErrorCode(), "❌ Test #63 FALLÓ: errorCode debe ser AUTH_ERROR");
        assertEquals("No autorizado", exception.getMessage(), "❌ Test #63 FALLÓ: mensaje debe ser 'No autorizado'");
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus(), "❌ Test #63 FALLÓ: status debe ser UNAUTHORIZED");
        assertNull(exception.getCause(), "❌ Test #63 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción UNAUTHORIZED creada correctamente");
    }

    /**
     * Test #64: conflict() debe crear excepción con HttpStatus.CONFLICT
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.CONFLICT, ...) a
     * assertEquals(HttpStatus.OK, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void conflict_ShouldCreateExceptionWithConflictStatus() {
        System.out.println("Test #64: conflict() debe crear excepción con HttpStatus.CONFLICT");

        // When
        PaymentException exception = PaymentException.conflict("CONFLICT_ERROR", "Conflicto detectado");

        // Then
        assertEquals("CONFLICT_ERROR", exception.getErrorCode(), "❌ Test #64 FALLÓ: errorCode debe ser CONFLICT_ERROR");
        assertEquals("Conflicto detectado", exception.getMessage(), "❌ Test #64 FALLÓ: mensaje debe ser 'Conflicto detectado'");
        assertEquals(HttpStatus.CONFLICT, exception.getStatus(), "❌ Test #64 FALLÓ: status debe ser CONFLICT");
        assertNull(exception.getCause(), "❌ Test #64 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción CONFLICT creada correctamente");
    }

    /**
     * Test #65: notFound() debe crear excepción con HttpStatus.NOT_FOUND
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.NOT_FOUND, ...) a
     * assertEquals(HttpStatus.FOUND, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void notFound_ShouldCreateExceptionWithNotFoundStatus() {
        System.out.println(" Test #65: notFound() debe crear excepción con HttpStatus.NOT_FOUND");

        // When
        PaymentException exception = PaymentException.notFound("NOT_FOUND", "Recurso no encontrado");

        // Then
        assertEquals("NOT_FOUND", exception.getErrorCode(), "❌ Test #65 FALLÓ: errorCode debe ser NOT_FOUND");
        assertEquals("Recurso no encontrado", exception.getMessage(), "❌ Test #65 FALLÓ: mensaje debe ser 'Recurso no encontrado'");
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus(), "❌ Test #65 FALLÓ: status debe ser NOT_FOUND");
        assertNull(exception.getCause(), "❌ Test #65 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción NOT_FOUND creada correctamente");
    }

    /**
     * Test #66: badRequest() debe crear excepción con HttpStatus.BAD_REQUEST
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.BAD_REQUEST, ...) a
     * assertEquals(HttpStatus.OK, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void badRequest_ShouldCreateExceptionWithBadRequestStatus() {
        System.out.println("Test #66: badRequest() debe crear excepción con HttpStatus.BAD_REQUEST");

        // When
        PaymentException exception = PaymentException.badRequest("INVALID_INPUT", "Solicitud inválida");

        // Then
        assertEquals("INVALID_INPUT", exception.getErrorCode(), "❌ Test #66 FALLÓ: errorCode debe ser INVALID_INPUT");
        assertEquals("Solicitud inválida", exception.getMessage(), "❌ Test #66 FALLÓ: mensaje debe ser 'Solicitud inválida'");
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus(), "❌ Test #66 FALLÓ: status debe ser BAD_REQUEST");
        assertNull(exception.getCause(), "❌ Test #66 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción BAD_REQUEST creada correctamente");
    }

    /**
     * Test #67: gatewayError() debe crear excepción con HttpStatus.BAD_GATEWAY
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.BAD_GATEWAY, ...) a
     * assertEquals(HttpStatus.GATEWAY_TIMEOUT, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void gatewayError_ShouldCreateExceptionWithBadGatewayStatus() {
        System.out.println(" Test #67: gatewayError() debe crear excepción con HttpStatus.BAD_GATEWAY");

        // When
        PaymentException exception = PaymentException.gatewayError("GATEWAY_ERROR", "Error en gateway");

        // Then
        assertEquals("GATEWAY_ERROR", exception.getErrorCode(), "❌ Test #67 FALLÓ: errorCode debe ser GATEWAY_ERROR");
        assertEquals("Error en gateway", exception.getMessage(), "❌ Test #67 FALLÓ: mensaje debe ser 'Error en gateway'");
        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus(), "❌ Test #67 FALLÓ: status debe ser BAD_GATEWAY");
        assertNull(exception.getCause(), "❌ Test #67 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción BAD_GATEWAY creada correctamente");
    }

    /**
     * Test #68: gatewayError(code, message, cause) debe preservar la causa
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(originalCause, ...) a assertNull(exception.getCause())
     * - El test fallará porque la causa no será null
     */
    @Test
    void gatewayErrorWithCause_ShouldCreateExceptionWithCause() {
        System.out.println(" Test #68: gatewayError(code, message, cause) debe preservar la causa");

        // Given
        Throwable originalCause = new RuntimeException("Error original");

        // When
        PaymentException exception = PaymentException.gatewayError("GATEWAY_ERROR", "Error en gateway", originalCause);

        // Then
        assertEquals("GATEWAY_ERROR", exception.getErrorCode(), "❌ Test #68 FALLÓ: errorCode debe ser GATEWAY_ERROR");
        assertEquals("Error en gateway", exception.getMessage(), "❌ Test #68 FALLÓ: mensaje debe ser 'Error en gateway'");
        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus(), "❌ Test #68 FALLÓ: status debe ser BAD_GATEWAY");
        assertEquals(originalCause, exception.getCause(), "❌ Test #68 FALLÓ: cause debe ser igual a originalCause");
        assertEquals("Error original", exception.getCause().getMessage(), "❌ Test #68 FALLÓ: mensaje de cause debe ser 'Error original'");
        System.out.println(" PASÓ: Excepción con causa preservada correctamente");
    }

    /**
     * Test #69: forbidden() debe crear excepción con HttpStatus.FORBIDDEN
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.FORBIDDEN, ...) a
     * assertEquals(HttpStatus.UNAUTHORIZED, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void forbidden_ShouldCreateExceptionWithForbiddenStatus() {
        System.out.println(" Test #69: forbidden() debe crear excepción con HttpStatus.FORBIDDEN");

        // When
        PaymentException exception = PaymentException.forbidden("FORBIDDEN", "Acceso denegado");

        // Then
        assertEquals("FORBIDDEN", exception.getErrorCode(), "❌ Test #69 FALLÓ: errorCode debe ser FORBIDDEN");
        assertEquals("Acceso denegado", exception.getMessage(), "❌ Test #69 FALLÓ: mensaje debe ser 'Acceso denegado'");
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus(), "❌ Test #69 FALLÓ: status debe ser FORBIDDEN");
        assertNull(exception.getCause(), "❌ Test #69 FALLÓ: cause debe ser null");
        System.out.println(" PASÓ: Excepción FORBIDDEN creada correctamente");
    }

    /**
     * Test #70: getErrorCode() debe retornar el código correcto
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("TEST_CODE", ...) a assertEquals("WRONG_CODE", ...)
     * - El test fallará porque el código esperado no coincidirá
     */
    @Test
    void getErrorCode_ShouldReturnCorrectErrorCode() {
        System.out.println(" Test #70: getErrorCode() debe retornar el código correcto");

        // When
        PaymentException exception = PaymentException.badRequest("TEST_CODE", "Mensaje de prueba");

        // Then
        assertEquals("TEST_CODE", exception.getErrorCode(), "❌ Test #70 FALLÓ: errorCode debe ser TEST_CODE");
        System.out.println(" PASÓ: getErrorCode() retorna código correcto");
    }

    /**
     * Test #71: getStatus() debe retornar el HttpStatus correcto
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(HttpStatus.NOT_FOUND, ...) a
     * assertEquals(HttpStatus.OK, ...)
     * - El test fallará porque el status HTTP esperado no coincidirá
     */
    @Test
    void getStatus_ShouldReturnCorrectHttpStatus() {
        System.out.println(" Test #71: getStatus() debe retornar el HttpStatus correcto");

        // When
        PaymentException exception = PaymentException.notFound("TEST", "Test");

        // Then
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus(), "❌ Test #71 FALLÓ: status debe ser NOT_FOUND");
        System.out.println(" PASÓ: getStatus() retorna HttpStatus correcto");
    }

    /**
     * Test #72: getMessage() debe retornar el mensaje correcto
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("Mensaje personalizado", ...) a assertEquals("Otro
     * mensaje", ...)
     * - El test fallará porque el mensaje esperado no coincidirá
     */
    @Test
    void getMessage_ShouldReturnCorrectMessage() {
        System.out.println(" Test #72: getMessage() debe retornar el mensaje correcto");

        // When
        PaymentException exception = PaymentException.unauthorized("CODE", "Mensaje personalizado");

        // Then
        assertEquals("Mensaje personalizado", exception.getMessage(), "❌ Test #72 FALLÓ: mensaje debe ser 'Mensaje personalizado'");
        System.out.println(" PASÓ: getMessage() retorna mensaje correcto");
    }

    /**
     * Test #73: PaymentException debe ser instancia de RuntimeException
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertTrue(...) a assertFalse(...)
     * - El test fallará porque PaymentException sí es instancia de RuntimeException
     */
    @Test
    void exceptionHierarchy_ShouldBeRuntimeException() {
        System.out.println(" Test #73: PaymentException debe ser instancia de RuntimeException");

        // When
        PaymentException exception = PaymentException.badRequest("TEST", "Test");

        // Then
        assertTrue(exception instanceof RuntimeException, "❌ Test #73 FALLÓ: debe ser instancia de RuntimeException");
        System.out.println(" PASÓ: PaymentException extiende RuntimeException correctamente");
    }
}
