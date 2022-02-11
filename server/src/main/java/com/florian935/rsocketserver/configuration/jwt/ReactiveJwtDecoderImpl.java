package com.florian935.rsocketserver.configuration.jwt;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import reactor.core.publisher.Mono;

import static lombok.AccessLevel.PRIVATE;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class ReactiveJwtDecoderImpl implements ReactiveJwtDecoder {

    ReactiveJwtDecoder reactiveJwtDecoder;

    @Override
    public Mono<Jwt> decode(String token) throws JwtException {

        return reactiveJwtDecoder.decode(token)
                .switchIfEmpty(Mono.error(
                        new JwtException("Jwt invalid")));
    }
}
