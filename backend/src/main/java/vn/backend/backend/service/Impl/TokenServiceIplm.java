package vn.backend.backend.service.Impl;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.repository.TokenRepository;
import vn.backend.backend.service.TokenService;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Builder
@Getter
public class TokenServiceIplm implements TokenService {
    private final TokenRepository tokenRepository;


    @Override
    public Long saveToken(TokenEntity token) {
        Optional<TokenEntity> optional=tokenRepository.findByEmail(token.getEmail());
        if(optional.isEmpty()) {
            tokenRepository.save(token);
            return token.getUserId();
        }else {
            TokenEntity currentToken=optional.get();
            currentToken.setAccessToken(token.getAccessToken());
            currentToken.setRefreshToken(token.getRefreshToken());
            tokenRepository.save(currentToken);
            return currentToken.getUserId();
        }
    }

    @Override
    public String deleteToken(String email) {
        TokenEntity token=findByEmail(email);
        tokenRepository.delete(token);
        return "token deleted";
    }

    @Override
    public TokenEntity findByEmail(String email) {
        return tokenRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("Token not found with email: " + email));
    }
}
