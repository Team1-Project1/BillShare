package vn.backend.backend.controller.response;


import lombok.*;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private Long groupId;
    private String groupName;
    private Long payerId;
    private String payerName;
    private Long payeeId;
    private String payeeName;
    private BigDecimal amount;
    private String currency;
    private Date paymentDate;
    private Date deletedAt;
}
