package vn.backend.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
        // Tải .env nếu có (local dev), bỏ qua nếu thiếu (Railway)
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        // Thiết lập các biến môi trường từ .env nếu chưa tồn tại trong hệ thống
        dotenv.entries().forEach(entry -> {
            if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(BackendApplication.class, args);
	}

}
