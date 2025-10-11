package vn.backend.backend.controller.response;


import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.Locale;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSimpleResponse {
    private Long expenseId;
    private Long categoryId;
    private String expenseName;
    private LocalDate expenseDate;
}