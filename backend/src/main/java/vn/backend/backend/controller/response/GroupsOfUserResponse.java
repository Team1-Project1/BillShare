package vn.backend.backend.controller.response;

import lombok.*;

import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupsOfUserResponse {
    private List<GroupResponse> groups;
    private int totalGroups;
}
