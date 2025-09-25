package vn.backend.backend.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private String code;     // "success" hoặc "error"
    private String message;  // thông báo
    private T data;          // dữ liệu trả về
}
