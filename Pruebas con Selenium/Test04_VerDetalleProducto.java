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
 * PRUEBA DE SISTEMA 04: Navegar y Ver Detalle de Producto
 *
 * Objetivo: Verificar que un usuario puede navegar al catálogo y ver detalles
 * de un sensor
 *
 * Flujo: 1. Navegar a la página principal 2. Ir a sección "Sensores" 3. Hacer
 * click en "Detalles" de un producto 4. Verificar que se muestra la información
 * completa del producto
 *
 * Resultado esperado: Detalle del producto visible con precio, descripción,
 * especificaciones
 */
public class Test04_VerDetalleProducto {

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
    public void testVerDetalleProducto() {
        try {
            System.out.println("\n=== PRUEBA 04: VER DETALLE DE PRODUCTO ===");

            driver.get("http://localhost:3000/");
            System.out.println("Página principal cargada");
            pauseSeconds(1);

            // Navegar a Sensores
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            System.out.println("Navegando a sección Sensores");
            pauseSeconds(2);

            // Click en primer botón "Detalles"
            By botonDetalles = By.xpath("(//button[normalize-space()='Detalles'])[1]");
            wait.until(ExpectedConditions.elementToBeClickable(botonDetalles)).click();
            System.out.println("Click en botón Detalles del primer producto");
            pauseSeconds(2);

            // Verificar que se muestra el precio
            WebElement precio = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(), 'S/')]")));
            System.out.println("Precio visible: " + precio.getText());

            // Verificar descripción
            WebElement descripcion = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(@class, 'text') and string-length(text()) > 50]")));
            System.out.println("Descripción del producto visible");

            // Verificar especificaciones técnicas
            try {
                WebElement especificaciones = driver.findElement(
                        By.xpath("//*[contains(text(), 'Especificaciones') or contains(text(), 'Técnicas')]"));
                System.out.println("Sección de especificaciones técnicas encontrada");
            } catch (NoSuchElementException e) {
                System.out.println("Especificaciones técnicas no encontradas (opcional)");
            }

            // Verificar botón "Agregar al Carrito"
            WebElement btnAgregar = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//button[contains(text(), 'Agregar') or contains(text(), 'Carrito')]")));
            System.out.println("✔ Botón 'Agregar al Carrito' visible");

            System.out.println("\nPRUEBA 04 COMPLETADA EXITOSAMENTE\n");
            pauseSeconds(1);

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test04_error_" + System.currentTimeMillis());
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
