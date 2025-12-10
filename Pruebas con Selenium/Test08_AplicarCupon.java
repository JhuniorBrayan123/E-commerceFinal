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
 * PRUEBA DE SISTEMA 08: Aplicar Cupón de Descuento
 *
 * Objetivo: Verificar que un cupón válido aplica descuento correctamente
 *
 * Flujo: 1. Agregar producto al carrito 2. Ingresar código de cupón 3. Aplicar
 * cupón 4. Verificar que el descuento se aplica 5. Verificar que el total se
 * recalcula
 *
 * Resultado esperado: Descuento aplicado, total actualizado
 */
public class Test08_AplicarCupon {

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
    public void testAplicarCupon() {
        try {
            System.out.println("\n=== PRUEBA 08: APLICAR CUPÓN DE DESCUENTO ===");

            driver.get("http://localhost:3000/");
            pauseSeconds(1);

            // Navegar a Sensores
            wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Sensores"))).click();
            pauseSeconds(2);

            // Hacer scroll y click en primer producto con JavascriptExecutor
            WebElement btnDetalles = wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.xpath("(//button[normalize-space()='Detalles'])[1]")));

            // Scroll al elemento
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", btnDetalles);
            pauseSeconds(1);

            // Click usando JavaScript para evitar interceptación
            js.executeScript("arguments[0].click();", btnDetalles);
            System.out.println(" Click en detalle de producto");
            pauseSeconds(2);

            // Agregar al carrito
            WebElement btnAgregar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(text(), 'Agregar') and contains(text(), 'Carrito')]")));
            btnAgregar.click();
            System.out.println(" Producto agregado al carrito");
            pauseSeconds(2);

            // Verificar que estamos en el carrito
            wait.until(ExpectedConditions.urlContains("carrito"));
            System.out.println("En página de carrito");

            // Scroll hacia abajo para ver el resumen
            js.executeScript("window.scrollTo(0, document.body.scrollHeight/2);");
            pauseSeconds(1);

            // Obtener subtotal antes del cupón
            WebElement subtotalElement = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//span[text()='Subtotal:']/following-sibling::span")));
            String subtotalAntes = subtotalElement.getText();
            System.out.println("Subtotal antes del cupón: " + subtotalAntes);

            // Obtener total antes del cupón
            WebElement totalElement = driver.findElement(
                    By.xpath("//span[text()='Total:']/following-sibling::span"));
            String totalAntes = totalElement.getText();
            System.out.println("Total antes del cupón: " + totalAntes);

            // Buscar input de cupón y hacer scroll
            WebElement inputCupon = wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.id("input-coupon-code")));

            // Scroll al input
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", inputCupon);
            pauseSeconds(1);

            // Asegurar que el input está habilitado y visible
            wait.until(ExpectedConditions.elementToBeClickable(inputCupon));

            // Limpiar e ingresar código letra por letra para activar cambios en React
            inputCupon.clear();
            String cupon = "PRUEBAS";
            for (char c : cupon.toCharArray()) {
                inputCupon.sendKeys(String.valueOf(c));
                Thread.sleep(100);
            }
            System.out.println(" Código de cupón ingresado: PRUEBAS");
            pauseSeconds(1);

            // Click en aplicar cupón
            WebElement btnAplicar = wait.until(ExpectedConditions.elementToBeClickable(
                    By.id("btn-apply-coupon")));
            btnAplicar.click();
            System.out.println(" Botón 'Aplicar' presionado");

            // Scroll hacia arriba para ver el mensaje de confirmación
            js.executeScript("window.scrollTo(0, 0);");
            pauseSeconds(3);

            // Verificar que apareció el mensaje de cupón aplicado
            try {
                WebElement cuponAplicado = wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//p[contains(text(), 'aplicado')]")));
                System.out.println(" Cupón aplicado: " + cuponAplicado.getText());
            } catch (TimeoutException e) {
                System.out.println(" Mensaje de confirmación no encontrado, continuando...");
            }

            // Scroll hacia abajo nuevamente para ver el resumen
            js.executeScript("window.scrollTo(0, document.body.scrollHeight/2);");
            pauseSeconds(2);

            // Verificar que apareció la línea de descuento
            try {
                WebElement descuentoSpan = wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//span[starts-with(text(), 'Descuento')]")));
                String descuentoTexto = descuentoSpan.getText();
                System.out.println(" Línea de descuento visible: " + descuentoTexto);

                // Obtener el monto del descuento
                WebElement montoDescuento = descuentoSpan.findElement(
                        By.xpath("./following-sibling::span"));
                System.out.println(" Monto de descuento: " + montoDescuento.getText());
            } catch (TimeoutException e) {
                System.out.println("️ Línea de descuento no visible");

                // Imprimir el HTML para debug
                String pageSource = driver.getPageSource();
                if (pageSource.contains("Descuento")) {
                    System.out.println(" El texto 'Descuento' SÍ existe en la página");
                } else {
                    System.out.println(" El texto 'Descuento' NO existe en la página");
                }

                throw new AssertionError("El cupón debería mostrar una línea de descuento");
            }

            // Obtener total después del cupón
            String totalDespues = driver.findElement(
                    By.xpath("//span[text()='Total:']/following-sibling::span")).getText();
            System.out.println(" Total después del cupón: " + totalDespues);

            // Verificar que el total cambió (debería ser menor)
            Assert.assertNotEquals("El total debería haber cambiado con el descuento", totalAntes, totalDespues);
            System.out.println(" Total actualizado correctamente con el descuento");

            System.out.println("\nPRUEBA 08 COMPLETADA EXITOSAMENTE\n");

        } catch (Exception e) {
            System.err.println("Test falló: " + e.getMessage());
            System.out.println(" Nota: Esta prueba requiere que exista un cupón 'PRUEBAS' en la BD");
            takeScreenshot("test08_error_" + System.currentTimeMillis());
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
            System.out.println("Screenshot guardado: " + out.toAbsolutePath());
        } catch (IOException ioe) {
            System.err.println("Error guardando screenshot: " + ioe.getMessage());
        }
    }
}
