package vn.backend.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TokenService;
import vn.backend.backend.service.UserService;

import java.io.IOException;
@Component
@RequiredArgsConstructor
public class Prefilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final TokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authorization = request.getHeader("Authorization");
        if (StringUtils.isBlank(authorization) || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String token = authorization.substring("Bearer ".length());
        final  String email=jwtService.extractEmail(token, TokenType.ACCESS_TOKEN);
        if (StringUtils.isNoneEmpty(email)&& SecurityContextHolder.getContext().getAuthentication() == null) {
            TokenEntity tokenEntity=tokenService.findByEmail(email);
            if(tokenEntity==null || !token.equals(tokenEntity.getAccessToken())) {
                filterChain.doFilter(request, response);
                return;
            }
            UserDetails userDetails=userDetailsService.loadUserByUsername(email);
            if (jwtService.isValid(token, userDetails, TokenType.ACCESS_TOKEN)) {
                //  Lấy userId từ token và gắn vào request
                Long userId = jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
                request.setAttribute("userId", userId);

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }

        }
        filterChain.doFilter(request, response);
    }
}
