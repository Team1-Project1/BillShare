package vn.backend.backend.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GroupCreateRequest {
    private String groupName;
    private String description;
    private String defaultCurrency;
}
