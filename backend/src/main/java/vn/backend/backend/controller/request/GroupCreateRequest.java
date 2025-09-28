package vn.backend.backend.controller.request;

import lombok.Getter;

@Getter
public class GroupCreateRequest {
    private String groupName;
    private String description;
    private String defaultCurrency;
}
