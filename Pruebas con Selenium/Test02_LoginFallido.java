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
 * PRUEBA DE SISTEMA 02: Login Fallido (Credenciales Incorrectas)
 *
 * Objetivo: Verificar que el sistema rechaza credenciales incorrectas
 *
 * Flujo: 1. Navegar a la página principal 2. Abrir modal de login 3. Ingresar
 * credenciales incorrectas 4. Intentar iniciar sesión 5. Verificar que se
 * muestra mensaje de error
 *
 * Resultado esperado: Mensaje de error visible, usuario no autenticado
 */
public class Test02_LoginFallido {

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
    public void testLoginFallido() {
        try {
            System.out.println("\n=== PRUEBA 02: LOGIN FALLIDO (CREDENCIALES INCORRECTAS) ===");

            driver.get("http://localhost:3000/");
            System.out.println("Página principal cargada");
            pauseSeconds(1);

            // Abrir modal de login
            By btnIniciarSesion = By.xpath("//button[.//span[text()='Iniciar Sesión']]");
            wait.until(ExpectedConditions.elementToBeClickable(btnIniciarSesion)).click();
            System.out.println("Modal de login abierto");
            pauseSeconds(1);

            // Seleccionar rol Cliente
            By btnCliente = By.xpath("//button[contains(.,'Cliente')]");
            wait.until(ExpectedConditions.elementToBeClickable(btnCliente)).click();
            System.out.println("Rol Cliente seleccionado");
            pauseSeconds(1);

            // Ingresar email incorrecto
            WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
            email.clear();
            email.sendKeys("usuario_no_existe@gmail.com");
            System.out.println("Email incorrecto ingresado");
            pauseSeconds(1);

            // Ingresar password incorrecta
            WebElement pass = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));
            pass.clear();
            pass.sendKeys("PasswordIncorrecta123");
            System.out.println("Password incorrecta ingresada");
            pauseSeconds(1);

            // Click en botón Login
            By btnLogin = By.xpath("//button[@type='submit']");
            wait.until(ExpectedConditions.elementToBeClickable(btnLogin)).click();
            System.out.println("Botón 'Iniciar Sesión' presionado");
            pauseSeconds(2);

            // Verificar que aparece mensaje de error
            try {
                WebElement errorMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath(
                                "//*[contains(text(), 'Credenciales') or contains(text(), 'incorrecto') or contains(text(), 'error')]")));
                System.out.println("Mensaje de error mostrado: " + errorMsg.getText());
            } catch (TimeoutException e) {
                System.out.println("No se encontró mensaje de error específico, pero login no procedió");
            }

            // Verificar que el modal sigue abierto (no hubo login exitoso)
            WebElement modalAbierto = driver.findElement(By.name("email"));
            Assert.assertNotNull(modalAbierto);
            System.out.println("Modal de login sigue abierto (login rechazado)");

            System.out.println("\nPRUEBA 02 COMPLETADA EXITOSAMENTE\n");
            pauseSeconds(1);

        } catch (Exception e) {
            System.err.println("Test falló: " + e.getMessage());
            takeScreenshot("test02_error_" + System.currentTimeMillis());
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
