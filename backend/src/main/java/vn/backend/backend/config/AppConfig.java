package vn.backend.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
@Configuration
public class AppConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(request -> request
                            .requestMatchers("/**").permitAll()
                            .anyRequest().authenticated())
                    .sessionManagement(manager->manager.sessionCreationPolicy(STATELESS));
            return http.build();
        }
        @Bean
        public WebSecurityCustomizer ignoreResources(){
            return webSecurity -> webSecurity.ignoring()
                    .requestMatchers("/actuator/**",
                            "/v3/api-docs/**",
                            "/v3/**",
                            "/webjars/**",
                            "/favicon.ico",
                            "/swagger-ui.html",
                            "/swagger-ui/**",
                            "/swagger-ui/**/swagger-initializer.js");
        }
        @Bean
        public PasswordEncoder passwordEncoder(){
            return new BCryptPasswordEncoder();
        }
}
