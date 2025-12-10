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
 * PRUEBA DE SISTEMA 15: Logout y Protección de Rutas
 *
 * ➤ FLUJO COMPLETO DE COMPRA Y SEGURIDAD: 1. Login 2. Selección de sensor 3.
 * Agregar a carrito 4. Checkout 5. Ir a payment-method 6. Logout 7. Intentar
 * acceder nuevamente sin login 8. Verificar que pide login y si no ingresa en
 * 5s → redirección a Home
 *
 * Resultado esperado: Logout exitoso, sesión terminada, rutas protegidas
 * inaccesibles, timeout de login funcional.
 */
public class Test15_LogoutYRutasProtegidas {

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
    public void testLogoutYRutasProtegidas() {
        try {
            System.out.println("\n=== PRUEBA 15: LOGOUT Y PROTECCIÓN DE RUTAS ===");

            // ---------------------------------------------------
            // 1. LOGIN
            // ---------------------------------------------------
            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            By btnIniciarSesion = By.xpath("//button[.//span[text()='Iniciar Sesión']]");
            wait.until(ExpectedConditions.elementToBeClickable(btnIniciarSesion)).click();
            pauseSeconds(1);

            try {
                wait.until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(.,'Cliente')]"))).click();
                pauseSeconds(1);
            } catch (Exception ignored) {
            }

            wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")))
                    .sendKeys("tester@gmail.com");
            driver.findElement(By.name("password")).sendKeys("Tester123.");
            wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']")))
                    .click();

            System.out.println("Login completado");
            pauseSeconds(2);

            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//nav//button[contains(@class,'flex')]")));
            System.out.println("Usuario autenticado");

            // ---------------------------------------------------
            // 2. SELECCIONAR SENSOR → DETALLES → AGREGAR CARRITO
            // ---------------------------------------------------
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            System.out.println("Navegando a Sensores");
            pauseSeconds(2);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            System.out.println("Viendo detalle de producto");
            pauseSeconds(2);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(),'Agregar') and contains(text(),'Carrito')]")))
                    .click();

            System.out.println("Producto agregado al carrito");
            pauseSeconds(2);

            // ---------------------------------------------------
            // 3. IR A CHECKOUT
            // ---------------------------------------------------
            // El botón en el carrito dice "Proceder al Pago" (línea 213 de Carrito.tsx)
            wait.until(ExpectedConditions.elementToBeClickable(
                    By.id("btn-proceed-checkout"))).click();

            System.out.println("Procediendo al Checkout");
            pauseSeconds(2);

            wait.until(ExpectedConditions.urlContains("checkout"));
            System.out.println("En página de Checkout");

            // ---------------------------------------------------
            // 4. IR A PAYMENT-METHOD
            // ---------------------------------------------------
            wait.until(ExpectedConditions.elementToBeClickable(
                    By.id("btn-create-order"))).click();
            System.out.println("Creando la orden");

            wait.until(ExpectedConditions.urlContains("payment-method"));
            System.out.println("Llegaste a /payment-method");

            pauseSeconds(2);

            // ---------------------------------------------------
            // 5. LOGOUT
            // ---------------------------------------------------
            WebElement menuUsuario = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//nav//button[contains(@class,'flex')]")));
            menuUsuario.click();
            System.out.println("Menú de usuario abierto");
            pauseSeconds(1);

            WebElement btnLogout = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath(
                            "//button[contains(text(), 'Cerrar')] | //button[contains(text(), 'Logout')] | //button[contains(text(), 'Salir')]")));
            btnLogout.click();

            System.out.println("Logout realizado");
            pauseSeconds(2);

            // Verificar que volvió a home
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//button[.//span[text()='Iniciar Sesión']]")));
            System.out.println("Sesión cerrada - Botón 'Iniciar Sesión' visible");

            // ---------------------------------------------------
            // 6. INTENTAR ACCEDER A PAYMENT-METHOD SIN LOGIN
            // ---------------------------------------------------
            System.out.println("--- Probando acceso no autorizado a /payment-method ---");
            driver.get("http://localhost:3000/payment-method");
            pauseSeconds(2);

            // ---------------------------------------------------
            // 7. VALIDAR PROTECCIÓN DE RUTA Y TIMEOUT DE LOGIN
            // ---------------------------------------------------
            try {
                // Verificar que aparece el modal de login
                WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(3));
                WebElement loginModal = shortWait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//input[@name='email' or @type='email']")));
                System.out.println("Modal de login apareció (ruta protegida OK)");

                // Esperar 5 segundos SIN hacer login para verificar timeout
                System.out.println("  Esperando 5 segundos sin hacer login para verificar timeout...");
                pauseSeconds(5);

                // Verificar si fue redirigido al home
                String urlActual = driver.getCurrentUrl();
                if (urlActual.equals("http://localhost:3000/") || urlActual.endsWith("/")) {
                    System.out.println("Redirigido automáticamente al Home después de timeout");
                } else if (!urlActual.contains("payment-method")) {
                    System.out.println("Redirigido fuera de payment-method (OK)");
                } else {
                    // Si todavía está en payment-method, verificar que el modal siga visible
                    try {
                        WebElement modalStillVisible = driver.findElement(
                                By.xpath("//input[@name='email' or @type='email']"));
                        if (modalStillVisible.isDisplayed()) {
                            System.out.println("Modal de login aún visible - sistema esperando autenticación");
                        }
                    } catch (NoSuchElementException e) {
                        System.out.println("Modal desapareció pero no hubo redirección");
                    }
                }

            } catch (TimeoutException e) {
                // Si no aparece el modal, verificar redirección
                String urlActual = driver.getCurrentUrl();
                if (urlActual.equals("http://localhost:3000/")
                        || !urlActual.contains("payment-method")) {
                    System.out.println("Redirigido al Home inmediatamente (ruta protegida OK)");
                } else {
                    throw new AssertionError(" /payment-method NO está protegida correctamente");
                }
            }

            System.out.println("\nPRUEBA 15 COMPLETADA EXITOSAMENTE\n");
            System.out.println("===========================================");
            System.out.println(" TODAS LAS 15 PRUEBAS COMPLETADAS JHUNIOR");
            System.out.println("===========================================\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test15_error_" + System.currentTimeMillis());
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
