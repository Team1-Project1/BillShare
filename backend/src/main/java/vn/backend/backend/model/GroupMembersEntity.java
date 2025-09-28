package vn.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.backend.backend.common.MemberRole;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "group_members")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMembersEntity {
    @EmbeddedId
    private GroupMembersId id;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "role")
    private MemberRole role=MemberRole.member;

    @Column(name = "joined_at",nullable = false )
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date joinedAt;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive=true;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    private GroupEntity group;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity member;

}
