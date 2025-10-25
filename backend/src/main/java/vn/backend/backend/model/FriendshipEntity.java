package vn.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.MemberRole;

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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    private FriendshipStatus status=FriendshipStatus.pending;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private Date createdAt;
}
