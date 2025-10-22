package vn.backend.backend.controller.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
@Setter
@Getter
@NoArgsConstructor
public class ReportRowResponse {
    String date;
    Date dateObject;
    String description;
    String category;
    String cost;
    String currency;
    Map<Long, BigDecimal> memberValues = new HashMap<>();
}
