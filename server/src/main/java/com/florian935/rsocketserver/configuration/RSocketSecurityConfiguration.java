package com.florian935.rsocketserver.configuration;

import com.florian935.rsocketserver.configuration.jwt.ReactiveJwtDecoderImpl;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.rsocket.RSocketStrategies;
import org.springframework.messaging.rsocket.annotation.support.RSocketMessageHandler;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.rsocket.EnableRSocketSecurity;
import org.springframework.security.config.annotation.rsocket.RSocketSecurity;
import org.springframework.security.messaging.handler.invocation.reactive.AuthenticationPrincipalArgumentResolver;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtReactiveAuthenticationManager;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.rsocket.core.PayloadSocketAcceptorInterceptor;

import static lombok.AccessLevel.PRIVATE;

@Configuration
@EnableRSocketSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class RSocketSecurityConfiguration {

    static String JWT_ROLE_NAME = "roles";
    static String ROLE_PREFIX = "ROLE_";
    ReactiveJwtDecoderImpl reactiveJwtDecoderImpl;

    @Bean
    PayloadSocketAcceptorInterceptor authorization(RSocketSecurity rSocketSecurity) {

        return rSocketSecurity
                .authorizePayload(authorize -> authorize
                                .anyRequest().authenticated()
                                .anyExchange().permitAll()
                )
                .jwt(jwtSpec -> jwtSpec.authenticationManager(jwtReactiveAuthenticationManager()))
                .build();
    }

    @Bean
    public JwtReactiveAuthenticationManager jwtReactiveAuthenticationManager() {

        JwtReactiveAuthenticationManager authenticationManager = new JwtReactiveAuthenticationManager(reactiveJwtDecoderImpl);
        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix(ROLE_PREFIX);

        grantedAuthoritiesConverter.setAuthoritiesClaimName(JWT_ROLE_NAME);
        authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        authenticationManager.setJwtAuthenticationConverter(new ReactiveJwtAuthenticationConverterAdapter(authenticationConverter));

        return authenticationManager;
    }

    @Bean
    RSocketMessageHandler messageHandler(RSocketStrategies strategies) {

        RSocketMessageHandler rSocketMessageHandler = new RSocketMessageHandler();
        rSocketMessageHandler.getArgumentResolverConfigurer().addCustomResolver(
                new AuthenticationPrincipalArgumentResolver());
        rSocketMessageHandler.setRSocketStrategies(strategies);

        return rSocketMessageHandler;
    }
}
