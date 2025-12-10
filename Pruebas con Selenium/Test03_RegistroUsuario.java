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
 * PRUEBA DE SISTEMA 03: Registro de Nuevo Usuario
 *
 * Objetivo: Verificar que un nuevo usuario puede registrarse en el sistema
 *
 * Flujo: 1. Navegar a la página principal 2. Abrir modal de registro 3.
 * Completar formulario de registro (Nombre, Apellido, Email, Password) 4.
 * Enviar registro 5. Verificar que el usuario queda autenticado
 *
 * Resultado esperado: Usuario registrado y autenticado automáticamente
 */
public class Test03_RegistroUsuario {

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
    public void testRegistroUsuario() {
        try {
            System.out.println("\n=== PRUEBA 03: REGISTRO DE NUEVO USUARIO ===");

            String timestamp = String.valueOf(System.currentTimeMillis());
            String nuevoEmail = "usuario_" + timestamp + "@test.com";

            driver.get("http://localhost:3000/");
            System.out.println("Página principal cargada");
            pauseSeconds(1);

            // Abrir modal de login/registro
            By btnIniciarSesion = By.xpath("//button[.//span[text()='Iniciar Sesión']]");
            wait.until(ExpectedConditions.elementToBeClickable(btnIniciarSesion)).click();
            System.out.println("Modal abierto");
            pauseSeconds(1);

            // Seleccionar rol Cliente
            By btnCliente = By.xpath("//button[contains(.,'Cliente')]");
            wait.until(ExpectedConditions.elementToBeClickable(btnCliente)).click();
            System.out.println("Rol Cliente seleccionado");
            pauseSeconds(1);

            // Cambiar a pestaña de registro (buscar botón "¿Ya tienes una cuenta?")
            By btnRegistro = By.xpath("//button[contains(text(), 'No tienes cuenta?') or contains(text(), 'cuenta')]");
            wait.until(ExpectedConditions.elementToBeClickable(btnRegistro)).click();
            System.out.println("Pestaña de registro seleccionada");
            pauseSeconds(1);

            // Llenar formulario de registro
            // Los inputs NO tienen atributo "name", usar placeholder
            // Campo: Nombre (primer input de texto)
            WebElement firstName = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//input[@placeholder='Ingresa tu nombre']")));
            firstName.clear();
            firstName.sendKeys("Usuario" + timestamp);
            System.out.println("Nombre ingresado: Usuario" + timestamp);
            pauseSeconds(1);

            // Campo: Apellido (segundo input de texto)
            WebElement lastName = driver.findElement(
                    By.xpath("//input[@placeholder='Ingresa tu apellido']"));
            lastName.clear();
            lastName.sendKeys("Prueba" + timestamp);
            System.out.println("Apellido ingresado: Prueba" + timestamp);
            pauseSeconds(1);

            // Campo: Email
            WebElement email = driver.findElement(
                    By.xpath("//input[@type='email' and @placeholder='correo@ejemplo.com']"));
            email.clear();
            email.sendKeys(nuevoEmail);
            System.out.println("Email ingresado: " + nuevoEmail);
            pauseSeconds(1);

            // Campo: Password
            WebElement password = driver.findElement(
                    By.xpath("//input[@type='password' and @placeholder='••••••••']"));
            password.clear();
            password.sendKeys("Password123.");
            System.out.println("Password ingresada");
            pauseSeconds(1);

            // Enviar formulario
            By btnSubmit = By.xpath("//button[@type='submit' and contains(text(), 'Registrarse')]");
            wait.until(ExpectedConditions.elementToBeClickable(btnSubmit)).click();
            System.out.println("Formulario de registro enviado");
            pauseSeconds(3);

            // Verificar que el usuario está autenticado
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Sensores")));
            System.out.println("Usuario registrado y autenticado exitosamente");

            // Verificar que el navbar muestra información del usuario
            WebElement userMenu = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//nav//button[contains(@class, 'flex')]")));
            System.out.println("Menú de usuario visible en navbar");

            System.out.println("\n PRUEBA 03 COMPLETADA EXITOSAMENTE\n");
            pauseSeconds(1);

        } catch (Exception e) {
            System.err.println(" Test falló: " + e.getMessage());
            takeScreenshot("test03_error_" + System.currentTimeMillis());
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
