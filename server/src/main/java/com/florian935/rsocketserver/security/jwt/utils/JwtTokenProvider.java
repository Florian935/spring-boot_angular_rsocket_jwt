package com.florian935.rsocketserver.security.jwt.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import io.netty.util.internal.StringUtil;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.BiFunction;

import static java.time.temporal.ChronoUnit.MINUTES;
import static lombok.AccessLevel.PRIVATE;

@Slf4j
@Configuration
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class JwtTokenProvider {

    static String JWT_ROLE_NAME = "roles";
    static String JWT_USERNAME = "username";
    static String ROLE_PREFIX = "ROLE_";
    static long ACCESS_EXPIRE = 15;
    static String ACCESS_SECRET_KEY = "dfg39wLJ92kdI29084JJQjhsj98ksdfKSJnk91Kkjb87GGb898nbBbBBBbsdfkze2KFjksdfDNFSK";
    static Algorithm ACCESS_ALGORITHM = Algorithm.HMAC512(ACCESS_SECRET_KEY);

    public String generateToken() {

        final String tokenId = UUID.randomUUID().toString();

        final Instant now = Instant.now();
        final Instant instant = now.plus(ACCESS_EXPIRE, MINUTES);

        return JWT.create()
                .withJWTId(tokenId)
                .withSubject("user")
                .withExpiresAt(Date.from(instant))
                .sign(ACCESS_ALGORITHM);
    }


    public boolean isValidToken(String token) {

        try {
            JWT.decode(token);
            return true;
        } catch (JWTDecodeException exception) {
            throw new JWTDecodeException(exception.getMessage());
        }
    }

    public Authentication getAuthenticationFromToken(String token) {

        final String username = extractClaimFromToken(token, JWT_USERNAME, extractorClaimFunctionAsString());
        final Collection<? extends GrantedAuthority> authorities = getAuthoritiesFromToken(token);
        final User principal = new User(username, StringUtil.EMPTY_STRING, authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    private BiFunction<String, String, String> extractorClaimFunctionAsString() {

        return (jwt, claimName) -> JWT.decode(jwt).getClaim(claimName).asString();
    }

    private <T> T extractClaimFromToken(String token, String claimName, BiFunction<String, String, T> extractor) {

        return extractor.apply(token, claimName);
    }

    private Collection<? extends GrantedAuthority> getAuthoritiesFromToken(String token) {

        final String role = extractClaimFromToken(token, JWT_ROLE_NAME, extractorClaimFunctionAsString());

        return List.of(new SimpleGrantedAuthority(ROLE_PREFIX + role));
    }
}
