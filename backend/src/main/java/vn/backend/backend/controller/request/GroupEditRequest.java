package vn.backend.backend.controller.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupEditRequest {
    private String groupName;
    private String description;
    private String defaultCurrency;
}
