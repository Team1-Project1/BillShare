package vn.backend.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();

		System.setProperty("spring.sendgrid.api-key", dotenv.get("API_KEY"));
		SpringApplication.run(BackendApplication.class, args);
	}

}
