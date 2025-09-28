package vn.backend.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.*;

import java.io.Serializable;
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMembersId implements Serializable {
    @Column(name = "group_id")
    private Long groupId;
    @Column(name = "user_id")
    private Long userId;
}
