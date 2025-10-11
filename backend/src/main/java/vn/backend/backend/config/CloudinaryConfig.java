package vn.backend.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Value("${CLOUD_NAME}")
    private String cloudName;

    @Value("${CLOUD_API_KEY}")
    private String apiKey;

    @Value("${CLOUD_API_SECRET}")
    private String apiSecret;
    @Bean
    public Cloudinary configKey(){
        Map config = new HashMap();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret",apiSecret);
        return new Cloudinary(config);
    }

}
