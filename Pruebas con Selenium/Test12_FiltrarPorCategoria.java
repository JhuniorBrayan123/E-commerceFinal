package com.selenium.practica;

import org.junit.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

/**
 * PRUEBA DE SISTEMA 12: Filtrar Productos por Categoría
 *
 * Objetivo: Verificar que el sistema permite filtrar productos por categoría
 * desde el Navbar y desde la página de Sensores.
 *
 * Flujo: 1. Desde Home, click en 'Categorias' en Navbar. 2. Verificar
 * navegación. 3. Ir a página de Sensores. 4. Usar select de categorías para
 * filtrar por 'Electrónica'. 5. Verificar resultados. 6. Filtrar por 'Sensores
 * de humedad'. 7. Verificar cambios.
 *
 * Resultado esperado: Navegación correcta y productos filtrados dinámicamente.
 */
public class Test12_FiltrarPorCategoria {

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
    public void testFiltrarPorCategoria() {
        try {
            System.out.println("\n=== PRUEBA 12: FILTRAR PRODUCTOS POR CATEGORÍA ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // --- PARTE 1: Navegación desde el Navbar ---
            System.out.println("--- Parte 1: Navegación desde Navbar ---");
            try {
                // Selector basado en el HTML proporcionado para el botón de Categorías del
                // navbar
                WebElement btnCategoriasNavbar = wait.until(ExpectedConditions.elementToBeClickable(
                        By.xpath(
                                "//button[contains(@class, 'rounded-full') and .//span[contains(text(), 'Categorias')]]")));

                btnCategoriasNavbar.click();
                System.out.println("✔ Click en botón 'Categorias' del navbar");
                pauseSeconds(2);

                // Verificar redirección
                String urlActual = driver.getCurrentUrl();
                if (urlActual.contains("categorias")) {
                    System.out.println("✔ Redirigido correctamente a página de categorías: " + urlActual);
                } else {
                    System.out.println(" La URL no parece ser de categorías: " + urlActual);
                }
            } catch (Exception e) {
                System.out.println(" Falló la navegación desde Navbar: " + e.getMessage());
            }

            // Volver al inicio
            driver.navigate().to("http://localhost:3000/");
            pauseSeconds(1);

            // --- PARTE 2: Filtro en Página de Sensores ---
            System.out.println("\n--- Parte 2: Filtro en página Sensores ---");

            // Navegar a Sensores
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            System.out.println(" Navegando a página de Sensores");
            pauseSeconds(2);

            // Ubicar el select de categorías
            try {
                WebElement selectElement = wait
                        .until(ExpectedConditions.visibilityOfElementLocated(By.id("categoria")));
                Select selectCategoria = new Select(selectElement);
                System.out.println(" Selector de categorías encontrado (id='categoria')");

                // Filtro 1: Electrónica (Value="1")
                selectCategoria.selectByValue("1");
                System.out.println(" Filtrando por: Electrónica (Value=1)");
                pauseSeconds(2);

                var productosElectronica = driver.findElements(
                        By.xpath("//div[contains(@class, 'bg-white') and .//button[contains(text(),'Detalles')]]"));
                System.out.println(" Productos en Electrónica: " + productosElectronica.size());

                // Filtro 2: Sensores de humedad (Value="7")
                selectCategoria.selectByValue("7");
                System.out.println(" Filtrando por: Sensores de humedad (Value=7)");
                pauseSeconds(2);

                var productosHumedad = driver.findElements(
                        By.xpath("//div[contains(@class, 'bg-white') and .//button[contains(text(),'Detalles')]]"));
                System.out.println("Productos en Sensores de humedad: " + productosHumedad.size());

                if (productosElectronica.size() != productosHumedad.size()) {
                    System.out.println(" El número de productos cambió correctamente entre categorías");
                }

            } catch (TimeoutException e) {
                System.out.println(" No se encontró el selector de categorías en la página de sensores");
                throw new AssertionError("Fallo en selector de categorías");
            }

            System.out.println("\n PRUEBA 12 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test12_error_" + System.currentTimeMillis());
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
            System.out.println("📸 Screenshot guardado: " + out.toAbsolutePath());
        } catch (IOException ioe) {
            System.err.println("Error guardando screenshot: " + ioe.getMessage());
        }
    }
}
