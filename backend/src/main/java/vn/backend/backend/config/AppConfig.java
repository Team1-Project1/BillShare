package vn.backend.backend.config;


import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import vn.backend.backend.service.UserService;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@RequiredArgsConstructor
public class AppConfig {
    private final UserService userService;
    private final Prefilter prefilter; // Filter tự viết để kiểm tra JWT trong request
    private String[] WHITE_LIST = {"/auth/**","/group-member/**","/friendship/**"}; // Các API không cần login (ví dụ: đăng ký, đăng nhập)

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Content-Disposition", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Cấu hình bảo mật chính (ai được vào API nào)
    @Bean
    public SecurityFilterChain securityFilterChain(@NonNull  HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // tắt CSRF vì dùng JWT
                .cors(cors -> {})
                .authorizeHttpRequests(request -> request
//                        .requestMatchers("/**").permitAll())
                        .requestMatchers(WHITE_LIST).permitAll() // /auth/** ai cũng vào được
                        .anyRequest().authenticated()) // còn lại thì phải login mới được
                .sessionManagement(manager->manager.sessionCreationPolicy(STATELESS)) // không lưu session, vì JWT là stateless
                .authenticationProvider(provider()) // gắn provider để Spring biết cách xác thực
                .addFilterBefore(prefilter, UsernamePasswordAuthenticationFilter.class);
        // thêm filter custom của mình vào trước filter mặc định
        return http.build();
    }

    // AuthenticationManager: bộ máy quản lý việc xác thực
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
        // Spring sẽ tự động dùng provider() mình đã cấu hình để kiểm tra login
    }

    // AuthenticationProvider: định nghĩa cách xác thực username/password
    @Bean
    public AuthenticationProvider provider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Khi login, Spring Security sẽ gọi userService.loadUserByUsername()
        // để lấy thông tin user từ database
        authProvider.setUserDetailsService(userService); // lấy user từ DB
        // Xác thực mật khẩu bằng thuật toán BCrypt
        // (so sánh password client nhập với password đã mã hóa trong DB)
        authProvider.setPasswordEncoder(passwordEncoder()); // so sánh mật khẩu bằng BCrypt
        return authProvider;
    }

    // Bỏ qua security cho tài nguyên tĩnh (swagger, favicon, docs…)
    @Bean
    public WebSecurityCustomizer ignoreResources(){
        return webSecurity -> webSecurity.ignoring()
                .requestMatchers("/actuator/**",
                        "/v3/api-docs/**",
                        "/v3/**",
                        "/webjars/**",
                        "/favicon.ico",
                        "/swagger-ui.html",
                        "/swagger-ui/**");
    }

    // PasswordEncoder: để mã hóa và so sánh mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(); // dùng thuật toán BCrypt để hash mật khẩu
    }

}