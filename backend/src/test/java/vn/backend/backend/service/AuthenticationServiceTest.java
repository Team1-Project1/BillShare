package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.ForgotPasswordRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.Impl.AuthenticationServiceImpl;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private TokenService tokenService;
    @Mock private ForgotPasswordRepository forgotPasswordRepository;
    @Mock private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private UserEntity user;
    private UserCreateRequest createRequest;
    private SignInRequest signInRequest;
    private final String rawPassword = "password123";
    private final String encodedPassword = "encodedPassword123";
    private final String accessToken = "access-token-jwt";
    private final String refreshToken = "refresh-token-jwt";

    @BeforeAll
    static void beforeAll() {

    }


    @BeforeEach
    void setUp() {

        //khoi tao buoc trien khai authenticationService



        user = UserEntity.builder()
                .userId(1L)
                .email("test@gmail.com")
                .password(encodedPassword)
                .fullName("Test User")
                .phone("0123456789")
                .build();
        createRequest = new UserCreateRequest();
        createRequest.setEmail("test@gmail.com");
        createRequest.setPassword(rawPassword);
        createRequest.setFullName("Test User");
        createRequest.setPhone("0123456789");

        signInRequest = new SignInRequest();
        signInRequest.setEmail("test@gmail.com");
        signInRequest.setPassword(rawPassword);
    }

    @AfterEach
    void tearDown() {
    }

    @Test
    @DisplayName("Register thành công")
    void register() {
        when(passwordEncoder.encode(rawPassword)).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> {
            UserEntity u = i.getArgument(0);
            u.setUserId(1L);
            return u;
        });

        Long id = authenticationService.register(createRequest);

        assertThat(id).isEqualTo(1L);
        verify(userRepository).save(any());
    }

    @Test
    void authenticated() {
    }

    @Test
    void refresh() {
    }

    @Test
    void logout() {
    }
}