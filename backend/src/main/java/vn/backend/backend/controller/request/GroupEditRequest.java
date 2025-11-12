package vn.backend.backend.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupEditRequest {
    private String groupName;
    private String description;
    private String defaultCurrency;
}
