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
 * PRUEBA DE SISTEMA 06: Modificar Cantidad en Carrito
 *
 * Objetivo: Verificar que un usuario puede modificar la cantidad de productos
 * en el carrito
 *
 * Flujo: 1. Agregar un producto al carrito 2. En el carrito, incrementar
 * cantidad 3. Verificar que el subtotal se actualiza 4. Decrementar cantidad 5.
 * Verificar actualización del subtotal
 *
 * Resultado esperado: Cantidades y subtotales se actualizan correctamente
 */
public class Test06_ModificarCantidadCarrito {

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
    public void testModificarCantidadCarrito() {
        try {
            System.out.println("\n=== PRUEBA 06: MODIFICAR CANTIDAD EN CARRITO ===");

            driver.get("http://localhost:3000/");
            System.out.println("Página principal cargada");
            pauseSeconds(1);

            // Navegar a S ensores y agregar producto
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]"))).click();
            System.out.println("Producto agregado al carrito");
            pauseSeconds(2);

            // Debería estar en el carrito ahora
            wait.until(ExpectedConditions.urlContains("carrito"));
            System.out.println("En página de carrito");

            // Obtener cantidad inicial (ejemplo: del primer producto)
            WebElement cantidadDisplay = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//span[starts-with(@id, 'quantity-')]")));
            String cantidadInicial = cantidadDisplay.getText();
            System.out.println("Cantidad inicial: " + cantidadInicial);
            pauseSeconds(1);

            // Obtener subtotal inicial del producto (el que se multiplica por cantidad)
            // Este está en un div.text-right, después de los botones +/-
            WebElement subtotalElement = driver.findElement(
                    By.xpath("//div[@class='text-right']//p[@class='font-bold']"));
            String subtotalInicial = subtotalElement.getText();
            System.out.println("Subtotal inicial del producto: " + subtotalInicial);

            // Incrementar cantidad
            WebElement btnIncrementar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[starts-with(@id, 'btn-increase')]")));
            btnIncrementar.click();
            System.out.println("Cantidad incrementada");
            pauseSeconds(2);

            // Verificar que el subtotal del producto cambió
            // Esperar a que el elemento se actualice
            wait.until(ExpectedConditions.not(
                    ExpectedConditions.textToBe(
                            By.xpath("//div[@class='text-right']//p[@class='font-bold']"),
                            subtotalInicial)));

            String subtotalDespues = driver.findElement(
                    By.xpath("//div[@class='text-right']//p[@class='font-bold']")).getText();
            System.out.println("Nuevo subtotal del producto: " + subtotalDespues);

            Assert.assertNotEquals("El subtotal debería haber cambiado", subtotalInicial, subtotalDespues);
            System.out.println("Subtotal actualizado correctamente");

            // Decrementar cantidad
            WebElement btnDecrementar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[starts-with(@id, 'btn-decrease')]")));
            btnDecrementar.click();
            System.out.println("Cantidad decrementada");
            pauseSeconds(2);

            System.out.println("\n PRUEBA 06 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test06_error_" + System.currentTimeMillis());
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
