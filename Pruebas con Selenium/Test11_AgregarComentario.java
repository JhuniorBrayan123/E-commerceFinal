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
 * PRUEBA DE SISTEMA 11: Agregar Comentario a Producto
 *
 * Objetivo: Verificar que un usuario autenticado puede agregar comentarios a
 * productos
 *
 * Flujo: 1. Login 2. Navegar a detalle de producto 3. Escribir comentario 4.
 * Publicar comentario 5. Verificar que el comentario aparece en la lista
 *
 * Resultado esperado: Comentario publicado y visible en el producto
 */
public class Test11_AgregarComentario {

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
    public void testAgregarComentario() {
        try {
            System.out.println("\n=== PRUEBA 11: AGREGAR COMENTARIO A PRODUCTO ===");

            // Login
            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            By btnIniciarSesion = By.xpath("//button[.//span[text()='Iniciar Sesión']]");
            wait.until(ExpectedConditions.elementToBeClickable(btnIniciarSesion)).click();
            pauseSeconds(1);

            try {
                wait.until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(.,'Cliente')]"))).click();
                pauseSeconds(1);
            } catch (Exception e) {
                /* Continuar */ }

            wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")))
                    .sendKeys("tester@gmail.com");
            driver.findElement(By.name("password")).sendKeys("Tester123.");
            wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']")))
                    .click();
            System.out.println("✔ Login completado");
            pauseSeconds(2);

            // Navegar a detalle de producto
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(1);

            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]"))).click();
            System.out.println("✔ En detalle de producto");
            pauseSeconds(2);

            // Scroll hacia abajo para ver sección de comentarios
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            pauseSeconds(1);

            // Buscar campo de comentario
            WebElement campoComentario = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath(
                            "//textarea[@placeholder='Escribe tu comentario' or contains(@placeholder, 'comentario')]")));
            String comentarioTexto = "Este es un comentario de prueba automatizado - " + System.currentTimeMillis();
            campoComentario.clear();
            campoComentario.sendKeys(comentarioTexto);
            System.out.println("✔ Comentario escrito: " + comentarioTexto);
            pauseSeconds(1);

            // Publicar comentario
            WebElement btnPublicar = driver.findElement(
                    By.xpath(
                            "//button[contains(text(), 'Publicar') or contains(text(), 'Enviar') or contains(text(), 'Comentar')]"));
            btnPublicar.click();
            System.out.println("✔ Botón 'Publicar' presionado");
            pauseSeconds(3);

            // Verificar que el comentario aparece
            WebElement comentarioPublicado = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(), 'prueba automatizado')]")));
            System.out.println("✔ Comentario publicado visible en la página");

            System.out.println("\n PRUEBA 11 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test11_error_" + System.currentTimeMillis());
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
            System.out.println("📸 Screenshot guardado: " + out.toAbsolutePath());
        } catch (IOException ioe) {
            System.err.println("Error guardando screenshot: " + ioe.getMessage());
        }
    }
}
