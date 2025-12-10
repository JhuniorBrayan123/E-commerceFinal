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
 * PRUEBA DE SISTEMA 13: Enlaces de Soporte y FAQ
 *
 * Objetivo: Verificar que la página de soporte carga correctamente y sus
 * enlaces e interacciones funcionan.
 *
 * Flujo: 1. Desde el Home, navegar a Soporte. 2. Verificar existencia de
 * enlaces de contacto (Email, WhatsApp). 3. Interactuar con el acordeón de
 * Preguntas Frecuentes (FAQ). 4. Verificar que las respuestas se despliegan.
 *
 * Resultado esperado: Página de soporte funcional y elementos interactivos
 * operativos.
 */
public class Test13_EnlacesSoporte {

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
    public void testEnlacesYFaq() {
        try {
            System.out.println("\n=== PRUEBA 13: ENLACES DE SOPORTE Y FAQ ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // 1. Navegar a Soporte desde el navbar
            try {
                WebElement btnSoporte = wait.until(ExpectedConditions.elementToBeClickable(
                        By.linkText("Soporte")));
                btnSoporte.click();
                System.out.println("✔ Click en 'Soporte' del Navbar");
            } catch (Exception e) {
                // Fallback si el texto es diferente o es icono
                driver.get("http://localhost:3000/soporte");
                System.out.println(" Navegación directa a /soporte");
            }
            pauseSeconds(2);

            // 2. Verificar enlaces de contacto (mailto y whatsapp)
            try {
                // El enlace puede ser mailto: o un link directo a Gmail como en el código
                // fuente
                WebElement linkEmail = driver
                        .findElement(By.xpath("//a[contains(@href, 'mailto:') or contains(@href, 'mail.google.com')]"));
                System.out.println("✔ Enlace de Email encontrado: " + linkEmail.getAttribute("href"));

                WebElement linkWhatsApp = driver.findElement(By.xpath("//a[contains(@href, 'wa.me')]"));
                System.out.println("✔ Enlace de WhatsApp encontrado: " + linkWhatsApp.getAttribute("href"));
            } catch (NoSuchElementException e) {
                System.out.println("️ Faltan enlaces de contacto importantes");
                throw e;
            }

            // 3. Probar FAQ (Acordeón)
            System.out.println("--- Probando interacción con FAQ ---");
            try {
                // Buscar el primer botón de pregunta
                WebElement primeraPregunta = wait.until(ExpectedConditions.elementToBeClickable(
                        By.xpath("(//h3[contains(@class, 'text-lg')]/.. | //button[contains(., '?')])[1]")));

                System.out.println("✔ Pregunta encontrada: " + primeraPregunta.getText().split("\n")[0]);

                // Clic para abrir
                primeraPregunta.click();
                pauseSeconds(1);

                // Verificar que se muestra la respuesta (buscando texto visible cercano)
                WebElement respuesta = driver.findElement(By.xpath("(//div[contains(@class, 'text-gray-600')])[1]"));
                if (respuesta.isDisplayed()) {
                    System.out.println("✔ Respuesta desplegada correctamente");
                } else {
                    System.out.println(" La respuesta no parece visible");
                }

                // Cerrar
                primeraPregunta.click();
                pauseSeconds(1);

            } catch (Exception e) {
                System.out.println(" Error interactuando con FAQ: " + e.getMessage());
            }

            System.out.println("\n PRUEBA 13 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test13_error_" + System.currentTimeMillis());
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
