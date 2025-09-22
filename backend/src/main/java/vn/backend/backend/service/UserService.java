package vn.backend.backend.service;

import vn.backend.backend.controller.request.UserCreateRequest;

public interface UserService {
    Long addUser(UserCreateRequest request);

}
