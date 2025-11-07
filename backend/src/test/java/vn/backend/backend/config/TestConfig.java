package vn.backend.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestConfig {

    static {
        // Load .env file for test environment
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        // Set system properties from .env
        dotenv.entries().forEach(entry -> {
            if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }
}

