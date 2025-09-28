package vn.backend.backend.controller.response;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.Date;
@Getter
@Setter
@Builder
public class GroupResponse implements Serializable {
    private Long groupId;
    private String groupName;
    private String description;
    private Long createdBy;
    private String defaultCurrency;
    private Date createdAt;
    private Date updatedAt;
    private Boolean isActive;
}
