package vn.backend.backend.controller.response;

public class ResponseError extends ResponseData{
    public ResponseError(int status, String message) {
        super(status, message);
    }
}
