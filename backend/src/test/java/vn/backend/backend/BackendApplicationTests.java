package vn.backend.backend;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import vn.backend.backend.config.TestConfig;
import vn.backend.backend.controller.AuthenticationController;
import vn.backend.backend.controller.EmailController;
import vn.backend.backend.controller.UserController;

@SpringBootTest
@Import(TestConfig.class)
class BackendApplicationTests {

	@InjectMocks
	private AuthenticationController authenticationController;

	@InjectMocks
	private UserController userController;

	@InjectMocks
	private EmailController emailController;

	@Test
	void contextLoads() {
		Assertions.assertNotNull(authenticationController);
		Assertions.assertNotNull(userController);
		Assertions.assertNotNull(emailController);
	}

}
