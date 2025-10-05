package vn.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "friendships")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friendship_id")
    private Long friendshipId;

    @ManyToOne
    @JoinColumn(name = "user_id_1")
    private UserEntity user1;

    @ManyToOne
    @JoinColumn(name = "user_id_2")
    private UserEntity user2;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private Date createdAt;
}
