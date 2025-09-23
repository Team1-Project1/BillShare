package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.ResponseData;
import vn.backend.backend.controller.response.ResponseError;
import vn.backend.backend.service.UserService;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "user controller")
@Slf4j(topic = "user-controller" )
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "add new user",description = "API  add new user to db")
    @PostMapping("/add-user")
    public ResponseData<Long> addUser(@Valid @RequestBody UserCreateRequest request){
        try{
            long userId=userService.addUser(request);
            return new ResponseData<>(HttpStatus.CREATED.value(),"user add success",userId);

        }catch (Exception e){
            log.info("error message={}", e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(),e.getMessage());

        }
    }

}
