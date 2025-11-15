package vn.backend.backend.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class GroupCreateRequest {
    private String groupName;
    private String description;
    private String defaultCurrency;
}
