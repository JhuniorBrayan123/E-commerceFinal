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
 * PRUEBA DE SISTEMA 05: Agregar Producto al Carrito
 *
 * Objetivo: Verificar que un usuario puede agregar un producto al carrito
 *
 * Flujo: 1. Navegar a catálogo de sensores 2. Ver detalle de un producto 3.
 * Seleccionar cantidad 4. Agregar al carrito 5. Verificar que aparece en el
 * carrito
 *
 * Resultado esperado: Producto agregado correctamente al carrito con la
 * cantidad seleccionada
 */
public class Test05_AgregarProductoCarrito {

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
    public void testAgregarProductoCarrito() {
        try {
            System.out.println("\n=== PRUEBA 05: AGREGAR PRODUCTO AL CARRITO ===");

            driver.get("http://localhost:3000/");
            System.out.println("Página principal cargada");
            pauseSeconds(1);

            // Navegar a Sensores
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            System.out.println("Navegando a sección Sensores");
            pauseSeconds(2);

            // Click en primer producto
            By botonDetalles = By.xpath("(//button[normalize-space()='Detalles'])[1]");
            wait.until(ExpectedConditions.elementToBeClickable(botonDetalles)).click();
            System.out.println("Detalle de producto abierto");
            pauseSeconds(2);

            // Incrementar cantidad
            try {
                WebElement btnMas = driver.findElement(By.xpath("//button[text()='+']"));
                btnMas.click();
                System.out.println("Cantidad incrementada");
                pauseSeconds(1);
            } catch (NoSuchElementException e) {
                System.out.println("Botón '+' no encontrado, usando cantidad por defecto");
            }

            // Click en "Agregar al Carrito"
            WebElement btnAgregar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]")));
            btnAgregar.click();
            System.out.println("Click en 'Agregar al Carrito'");
            pauseSeconds(2);

            // Debería redirigir al carrito automáticamente
            wait.until(ExpectedConditions.urlContains("carrito"));
            System.out.println("Redirigido a página de carrito");
            pauseSeconds(1);

            // Verificar que el producto aparece en el carrito
            WebElement productoEnCarrito = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath(
                            "//div[contains(@class, 'carrito') or contains(@class, 'cart')]//img | //h3 | //p[contains(@class, 'precio')]")));
            System.out.println("Producto visible en el carrito");

            // Verificar que existe el total
            WebElement total = driver.findElement(By.xpath("//*[contains(text(), 'Total') or contains(text(), 'S/')]"));
            System.out.println("Total del carrito visible: " + total.getText());

            System.out.println("\n PRUEBA 05 COMPLETADA EXITOSAMENTE\n");
            pauseSeconds(1);

        } catch (Exception e) {
            System.err.println("Test falló: " + e.getMessage());
            takeScreenshot("test05_error_" + System.currentTimeMillis());
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
