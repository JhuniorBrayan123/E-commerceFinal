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
 * PRUEBA DE SISTEMA 07: Eliminar Producto del Carrito
 *
 * Objetivo: Verificar que un usuario puede eliminar productos del carrito
 *
 * Flujo: 1. Agregar producto al carrito 2. Click en botón eliminar 3. Verificar
 * que el producto se eliminó 4. Verificar que el total se actualiza
 *
 * Resultado esperado: Producto eliminado, total recalculado correctamente
 */
public class Test07_EliminarProductoCarrito {

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
    public void testEliminarProductoCarrito() {
        try {
            System.out.println("\n=== PRUEBA 07: ELIMINAR PRODUCTO DEL CARRITO ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // Agregar producto al carrito
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]"))).click();
            System.out.println(" Producto agregado al carrito");
            pauseSeconds(2);

            // Verificar que estamos en el carrito
            wait.until(ExpectedConditions.urlContains("carrito"));

            // Identificar botón de eliminar
            WebElement btnEliminar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath(
                            "//button[contains(@id, 'remove') or contains(text(), '×') or contains(text(), 'Eliminar')]")));
            System.out.println(" Botón eliminar encontrado");
            pauseSeconds(2);

            // Click en eliminar
            btnEliminar.click();
            System.out.println(" Click en eliminar producto");
            pauseSeconds(2);

            // Verificar que el carrito está vacío
            try {
                WebElement carritoVacio = wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath(
                                "//*[contains(text(), 'vacío') or contains(text(), 'Vacío') or contains(text(), 'sin productos')]")));
                System.out.println(" Mensaje de carrito vacío mostrado: " + carritoVacio.getText());
            } catch (TimeoutException e) {
                // Si no hay mensaje, verificar que el total es 0
                WebElement total = driver.findElement(By.xpath("//*[contains(text(), 'S/ 0')]"));
                System.out.println("Total actualizado a S/ 0.00");
            }

            System.out.println("\nPRUEBA 07 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test07_error_" + System.currentTimeMillis());
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
            System.out.println("Screenshot guardado: " + out.toAbsolutePath());
        } catch (IOException ioe) {
            System.err.println("Error guardando screenshot: " + ioe.getMessage());
        }
    }
}
