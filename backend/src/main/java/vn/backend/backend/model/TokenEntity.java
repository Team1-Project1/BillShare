package vn.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tokens")
public class TokenEntity  {
    @Id
    @Column(name = "user_id",unique = true)
    public Long userId;

    @Column(name = "email",unique = true)
    public String email;

    @Column(name = "access_token")
    public String accessToken;

    @Column(name = "refresh_token")
    public String refreshToken;

    @Column(name = "created_at",nullable = false )
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "updated_at",nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private Date updatedAt;

}