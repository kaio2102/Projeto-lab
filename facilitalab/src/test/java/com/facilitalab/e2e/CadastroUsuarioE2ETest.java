package com.facilitalab.e2e;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import java.time.Duration;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CadastroUsuarioE2ETest {

    private WebDriver driver;

    @BeforeEach
    void configurar() {
        WebDriverManager.chromedriver().setup();
        driver = new org.openqa.selenium.chrome.ChromeDriver();
    }

    @AfterEach
    void finalizar() {
        driver.quit();
    }

    @Test
    void deveFazerLogin() {

        driver.get("http://localhost:8081/login");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("http://localhost:8081/login");

        WebElement email = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("email"))
        );

        WebElement senha = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("senha"))
        );

        email.sendKeys("admin@facilitalab.com");
        senha.sendKeys("admin123");

        WebElement botaoLogin = wait.until(
                ExpectedConditions.elementToBeClickable(By.id("btnLogin"))
        );

        botaoLogin.click();

        wait.until(ExpectedConditions.urlToBe(
                "http://localhost:8081/dashboard"
        ));

        WebElement linkUsuarios = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.cssSelector("a[href='/lista-usuarios']")
                )
        );

        linkUsuarios.click();

        wait.until(ExpectedConditions.urlToBe(
                "http://localhost:8081/lista-usuarios"
        ));

        assertEquals(
                "http://localhost:8081/lista-usuarios",
                driver.getCurrentUrl()
        );

        WebElement botaoCadastrar = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.cssSelector("a[href='/cadastro-usuario']")
                )
        );

        botaoCadastrar.click();

        wait.until(ExpectedConditions.urlToBe(
                "http://localhost:8081/cadastro-usuario"
        ));

        assertEquals(
                "http://localhost:8081/cadastro-usuario",
                driver.getCurrentUrl()
        );

        // Preenche o formulário de cadastro
        WebElement nome = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("nome"))
        );

        WebElement emailCadastro = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("email"))
        );

        WebElement senhaCadastro = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("senha"))
        );

        WebElement cpf = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("cpf"))
        );

        WebElement telefone = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("telefone"))
        );

        nome.sendKeys("Usuario Teste E2E");

        emailCadastro.sendKeys(
                "e2e." + System.currentTimeMillis() + "@teste.com"
        );

        senhaCadastro.sendKeys("Senha@123");

        cpf.sendKeys("12345677789");

        telefone.sendKeys("71999999999");

        // Seleciona o perfil
        WebElement perfil = wait.until(
                ExpectedConditions.elementToBeClickable(By.id("perfil"))
        );

        perfil.sendKeys("RECEPCAO");

        // Clica em cadastrar
        WebElement botaoCadastrarUsuario = wait.until(
                ExpectedConditions.elementToBeClickable(By.id("btnCadastrar"))
        );

        botaoCadastrarUsuario.click();

        // Após o cadastro bem-sucedido,
        // a aplicação deve voltar para a lista de usuários
        wait.until(ExpectedConditions.urlToBe(
                "http://localhost:8081/lista-usuarios"
        ));

        assertEquals(
                "http://localhost:8081/lista-usuarios",
                driver.getCurrentUrl()
        );
    }
}