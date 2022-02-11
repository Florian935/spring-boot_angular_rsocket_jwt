package com.florian935.rsocketserver.controller;

import com.florian935.rsocketserver.domain.TokenResponse;
import com.florian935.rsocketserver.security.jwt.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import static lombok.AccessLevel.PRIVATE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/api/v1.0/authenticate")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AuthenticationController {

    JwtTokenProvider jwtTokenProvider;

    @GetMapping(produces = APPLICATION_JSON_VALUE)
    Mono<TokenResponse> authenticate() {

        return Mono.just(TokenResponse
                .builder()
                .token(jwtTokenProvider.generateToken())
                .build()
        );
    }
}
