package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder ;

    @Override
    public Long addUser(UserCreateRequest request) {
        log.info("User saving");
        UserEntity user=UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .fullName(request.getFullNname())
                .build();
        userRepository.save(user);
        log.info("user has save , userId={}", user.getUserId());
        return user.getUserId();
    }
}
