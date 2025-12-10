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
 * PRUEBA DE SISTEMA 09: Proceso de Checkout (Requiere Login)
 *
 * Objetivo: Verificar que el checkout solicita login cuando el usuario no está
 * autenticado
 *
 * Flujo: 1. Agregar producto al carrito (sin login) 2. Intentar ir a checkout
 * 3. Verificar que aparece el modal de login 4. Hacer login 5. Verificar que se
 * redirige a checkout
 *
 * Resultado esperado: Sistema requiere autenticación para checkout
 */
public class Test09_CheckoutRequiereLogin {

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
    public void testCheckoutRequiereLogin() {
        try {
            System.out.println("\n=== PRUEBA 09: CHECKOUT REQUIERE LOGIN ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // Agregar producto al carrito SIN login
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]"))).click();
            System.out.println("Producto agregado al carrito (sin login)");
            pauseSeconds(2);

            // Intentar proceder al checkout
            WebElement btnCheckout = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath(
                            "//button[contains(text(), 'Checkout') or contains(text(), 'Proceder') or contains(text(), 'Finalizar')]")));
            btnCheckout.click();
            System.out.println("Click en botón Checkout");
            pauseSeconds(2);

            // Verificar que aparece modal de login
            WebElement modalLogin = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//input[@name='email'] | //input[@type='email']")));
            System.out.println("Modal de login apareció (autenticación requerida)");
            pauseSeconds(1);

            // Completar login
            By btnCliente = By.xpath("//button[contains(.,'Cliente')]");
            try {
                wait.until(ExpectedConditions.elementToBeClickable(btnCliente)).click();
                pauseSeconds(1);
            } catch (TimeoutException e) {
                System.out.println(" Selector de rol no encontrado, continuando...");
            }

            WebElement email = driver.findElement(By.name("email"));
            email.clear();
            email.sendKeys("tester@gmail.com");
            pauseSeconds(2);

            WebElement pass = driver.findElement(By.name("password"));
            pass.clear();
            pass.sendKeys("Tester123.");
            pauseSeconds(2);

            By btnLogin = By.xpath("//button[@type='submit']");
            wait.until(ExpectedConditions.elementToBeClickable(btnLogin)).click();
            System.out.println(" Login completado");
            pauseSeconds(3);

            // Verificar que se redirigió a checkout
            wait.until(ExpectedConditions.urlContains("checkout"));
            System.out.println(" Redirigido a página de checkout después de login");

            System.out.println("\n PRUEBA 09 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test09_error_" + System.currentTimeMillis());
            throw e;
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
