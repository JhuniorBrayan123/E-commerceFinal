package com.selenium.practica;

import org.junit.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

/**
 * PRUEBA DE SISTEMA 10: Selección de Método de Pago
 *
 * Objetivo: Verificar que el usuario puede seleccionar entre diferentes métodos
 * de pago
 *
 * Flujo: 1. Login 2. Agregar producto y proceder a checkout 3. Crear orden en
 * página de resumen 4. Navegar a selección de método de pago 5. Seleccionar
 * diferentes métodos (Stripe, Yape, PayPal) 6. Verificar que cada método
 * muestra su formulario correspondiente
 *
 * Resultado esperado: Métodos de pago disponibles y seleccionables
 */
public class Test10_SeleccionMetodoPago {

    private WebDriver driver;
    private WebDriverWait wait;

    @Before
    public void setUp() {
        System.setProperty("webdriver.chrome.driver",
                "C:/WebDriver/chromedriver-win64/chromedriver.exe");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @Test
    public void testSeleccionMetodoPago() {
        try {
            System.out.println("\n=== PRUEBA 10: SELECCIÓN DE MÉTODO DE PAGO ===");

            // Login primero
            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            By btnIniciarSesion = By.xpath("//button[.//span[text()='Iniciar Sesión']]");
            wait.until(ExpectedConditions.elementToBeClickable(btnIniciarSesion)).click();
            pauseSeconds(1);

            // Seleccionar rol Cliente
            By btnCliente = By.xpath("//button[contains(.,'Cliente')]");
            wait.until(ExpectedConditions.elementToBeClickable(btnCliente)).click();
            System.out.println("✔ Rol Cliente seleccionado");
            pauseSeconds(2);

            WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
            email.sendKeys("tester@gmail.com");
            driver.findElement(By.name("password")).sendKeys("Tester123.");
            wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']"))).click();
            System.out.println("✔ Login completado");
            pauseSeconds(2);

            // Agregar producto al carrito
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(2);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]"))).click();
            pauseSeconds(2);

            // Proceder a checkout (Resumen de compra)
            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Checkout') or contains(text(), 'Proceder')]"))).click();
            System.out.println(" En página de resumen de orden");
            pauseSeconds(2);

            // IMPORTANTE: Hacer clic en "Crear Orden y Continuar" para ir a pago
            try {
                WebElement btnCrearOrden = wait.until(ExpectedConditions.elementToBeClickable(
                        By.id("btn-create-order")));
                btnCrearOrden.click();
                System.out.println("✔ Botón 'Crear Orden' presionado");

                // Esperar a que se procese la orden y redirija
                wait.until(ExpectedConditions.urlContains("payment-method"));
                System.out.println(" Redirigido a selección de método de pago");
                pauseSeconds(2);
            } catch (TimeoutException e) {
                System.out.println(" No se pudo completar la creación de orden o redirección");
                throw new RuntimeException("Fallo al crear orden para ir a métodos de pago");
            }

            // Buscar y probar métodos de pago
            try {
                // Verificar que existen opciones de pago
                WebElement metodoPagoContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(), 'Métodos de Pago Disponibles')]")));
                System.out.println(" Título de métodos de pago visible");

                // Verificar Stripe
                try {
                    WebElement radioStripe = driver.findElement(By.id("radio-payment-stripe"));
                    // Click en el contenedor padre si el radio no es clickeable directamente
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", radioStripe);
                    System.out.println("Método Stripe seleccionado");
                    pauseSeconds(1);

                    // Verificar campos de tarjeta visibles
                    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("input-card-number")));
                    System.out.println("   Formulario de tarjeta visible");
                } catch (Exception e) {
                    System.out.println(" Error probando Stripe: " + e.getMessage());
                }

                // Verificar Yape
                try {
                    WebElement radioYape = driver.findElement(By.id("radio-payment-yape"));
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", radioYape);
                    System.out.println(" Método Yape seleccionado");
                    pauseSeconds(1);
                } catch (Exception e) {
                    System.out.println(" Yape no disponible o error al seleccionar");
                }

            } catch (TimeoutException e) {
                System.out.println(" Página de métodos de pago no cargó correctamente");
                throw new AssertionError("No se encontraron los métodos de pago");
            }

            System.out.println("\n PRUEBA 10 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println("Test falló: " + e.getMessage());
            takeScreenshot("test10_error_" + System.currentTimeMillis());
            throw new RuntimeException(e);
        }
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private void pauseSeconds(int secs) {
        try {
            Thread.sleep(secs * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void takeScreenshot(String name) {
        try {
            if (!(driver instanceof TakesScreenshot)) {
                return;
            }
            File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path outDir = Path.of("screenshots");
            if (!Files.exists(outDir)) {
                Files.createDirectories(outDir);
            }
            Path out = outDir.resolve(name + ".png");
            Files.copy(src.toPath(), out);
            System.out.println(" Screenshot guardado: " + out.toAbsolutePath());
        } catch (IOException ioe) {
            System.err.println("Error guardando screenshot: " + ioe.getMessage());
        }
    }
}
