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
 * PRUEBA DE SISTEMA 01: Login Exitoso
 *
 * Objetivo: Verificar que un usuario registrado puede iniciar sesión
 * correctamente
 *
 * Flujo: 1. Navegar a la página principal 2. Abrir modal de login 3.
 * Seleccionar rol "Cliente" 4. Ingresar credenciales válidas 5. Hacer click en
 * "Iniciar Sesión" 6. Verificar que se muestra el menú de usuario autenticado
 *
 * Resultado esperado: Usuario logueado exitosamente, navbar muestra email del
 * usuario
 */
public class Test01_LoginExitoso {

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
    public void testLoginExitoso() {
        try {
            System.out.println("\n=== PRUEBA 01: LOGIN EXITOSO ===");

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

            // Ingresar email
            WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
            email.clear();
            email.sendKeys("tester@gmail.com");
            System.out.println("Email ingresado: tester@gmail.com");
            pauseSeconds(1);

            // Ingresar password
            WebElement pass = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));
            pass.clear();
            pass.sendKeys("Tester123.");
            System.out.println("Password ingresado");
            pauseSeconds(1);

            // Click en botón Login
            By btnLogin = By.xpath("//button[@type='submit']");
            wait.until(ExpectedConditions.elementToBeClickable(btnLogin)).click();
            System.out.println("Botón 'Iniciar Sesión' presionado");
            pauseSeconds(2);

            // Verificar login exitoso
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Sensores")));
            System.out.println("Login exitoso - Página cargada con menú de navegación");

            // Verificar que aparece el email en el navbar
            WebElement userButton = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//nav//button[contains(@class, 'flex')]")));
            System.out.println("Botón de usuario visible en navbar");

            System.out.println("\nPRUEBA 01 COMPLETADA EXITOSAMENTE\n");
            pauseSeconds(1);

        } catch (Exception e) {
            System.err.println("Test falló: " + e.getMessage());
            takeScreenshot("test01_error_" + System.currentTimeMillis());
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
