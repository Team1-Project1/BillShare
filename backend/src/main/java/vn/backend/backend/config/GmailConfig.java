package vn.backend.backend.config;

// Import các thư viện cần thiết
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Configuration
public class GmailConfig {

    private static final String APPLICATION_NAME = "BillShare App";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * Phương thức này tạo ra một Bean Gmail service đã được xác thực.
     * Nó đọc 3 biến từ file application.yml (đã được nạp từ Secret Manager)
     * và sử dụng Refresh Token để tự động lấy Access Token.
     * Không cần trình duyệt, không bị treo.
     */
    @Bean
    public Gmail gmailService(
            @Value("${app.gmail.client-id}") String clientId,
            @Value("${app.gmail.client-secret}") String clientSecret,
            @Value("${app.gmail.refresh-token}") String refreshToken
    ) throws GeneralSecurityException, IOException {

        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

        // 1. Tạo Credential bằng Client ID và Client Secret
        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(HTTP_TRANSPORT)
                .setJsonFactory(JSON_FACTORY)
                .setClientSecrets(clientId, clientSecret)
                .build();

        // 2. Đặt Refresh Token (đây là chìa khóa)
        credential.setRefreshToken(refreshToken);

        // 3. Tạo Gmail service
        // Credential sẽ tự động dùng Refresh Token để lấy Access Token mới khi cần
        return new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }
}