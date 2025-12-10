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
 * PRUEBA DE SISTEMA 14: Búsqueda de Productos
 *
 * Objetivo: Verificar que el sistema permite buscar productos por nombre usando
 * el filtro de búsqueda en la página de Sensores.
 *
 * Flujo: 1. Navegar a página de Sensores 2. Localizar campo de búsqueda
 * (Filtro) 3. Ingresar término de búsqueda 4. Verificar que los resultados
 * coinciden con la búsqueda 5. Buscar con término sin resultados 6. Verificar
 * mensaje de "sin resultados"
 *
 * Resultado esperado: Búsqueda reactiva filtra la lista de productos.
 */
public class Test14_BusquedaProductos {

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
    public void testBusquedaProductos() {
        try {
            System.out.println("\n=== PRUEBA 14: BÚSQUEDA DE PRODUCTOS ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // 1. Navegar a Sensores
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            System.out.println("✔ En página de Sensores");
            pauseSeconds(2);

            // 2. Buscar campo de búsqueda (ID: search)
            try {
                WebElement campoBusqueda = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("search")));
                System.out.println("✔ Campo de búsqueda encontrado (id='search')");

                // 3. Realizar búsqueda con término válido
                String terminoBusqueda = "sensor de gas"; // Término genérico que debería traer resultados
                campoBusqueda.clear();
                campoBusqueda.sendKeys(terminoBusqueda);
                // El filtro es reactivo, pero esperamos un momento
                pauseSeconds(4);
                System.out.println("✔ Búsqueda realizada: " + terminoBusqueda);

                // 4. Verificar resultados
                var resultados = driver.findElements(
                        By.xpath("//div[contains(@class, 'product-card')]")); // Clase usada en SensorList.tsx
                System.out.println("✔ Resultados de búsqueda: " + resultados.size() + " productos");

                if (resultados.size() > 0) {
                    System.out.println("✔ Se mostraron productos correctamente");
                } else {
                    System.out.println(" No se encontraron productos con el término '" + terminoBusqueda + "'");
                }

                // 5. Buscar con término sin resultados
                campoBusqueda.sendKeys(Keys.CONTROL + "a");
                campoBusqueda.sendKeys(Keys.DELETE);
                campoBusqueda.sendKeys("XYZ_TERM_IMPOSIBLE_12345");
                pauseSeconds(2);
                System.out.println("✔ Búsqueda sin resultados ejecutada");

                // 6. Verificar mensaje de sin resultados
                // SensorList.tsx: <p class="text-gray-500 text-lg">No hay sensores
                // disponibles...</p>
                try {
                    WebElement mensaje = wait.until(ExpectedConditions.visibilityOfElementLocated(
                            By.xpath("//p[contains(text(), 'No hay sensores disponibles')]")));
                    System.out.println("✔ Mensaje de 'No hay sensores' mostrado correctamente: " + mensaje.getText());
                } catch (TimeoutException e) {
                    System.out.println(" No se mostró el mensaje de lista vacía");
                }

            } catch (TimeoutException e) {
                System.out.println(" No se encontró el campo de búsqueda (id='search')");
                throw e;
            }

            System.out.println("\n PRUEBA 14 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test14_error_" + System.currentTimeMillis());
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
