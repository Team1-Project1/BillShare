package vn.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "forgot_password")
public class ForgotPasswordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserEntity user;

    // store hashed OTP (BCrypt)
    @Column(nullable = false,name = "otp_hash")
    private String otpHash;

    @Column(name = "expiration_time", nullable = false)
    private LocalDateTime expirationTime;

    @Column(name = "last_request_time", nullable = false)
    private LocalDateTime lastRequestTime;

    @Column(name = "retry_count", nullable = false)
    private int retryCount;
}
