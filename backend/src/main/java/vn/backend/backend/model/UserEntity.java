package vn.backend.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "users")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true,nullable = false, name = "email")
    private String email;


    @Column(nullable = false,name ="password" )
    private String password;

    @Column(nullable = false,name ="full_name" )
    private String fullName;

    @Column(name ="phone",length = 10)
    private String phone;

    @Column(name ="avatar_url")
    private String avatarUrl;

    @Column(name ="default_currency")
    @Builder.Default
    private String defaultCurrency="VND";

    @Column(name ="notification_email")
    @Builder.Default
    private Boolean notificationEmail=true;

    @Column(name = "created_at",nullable = false )
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "updated_at",nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private Date updatedAt;

    @Column(name ="is_active")
    @Builder.Default
    private Boolean isActive=true;

    @Column(name = "last_login")
    @Temporal(TemporalType.DATE)
    private Date lastLogin;


}
