package com.florian935.rsocketserver.configuration.jwt;

import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

import javax.crypto.spec.SecretKeySpec;

import static lombok.AccessLevel.PRIVATE;

@Configuration
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class ReactiveJwtDecoderConfiguration {

    static String ACCESS_SECRET_KEY = "dfg39wLJ92kdI29084JJQjhsj98ksdfKSJnk91Kkjb87GGb898nbBbBBBbsdfkze2KFjksdfDNFSK";
    static MacAlgorithm MAC_ALGORITHM = MacAlgorithm.HS512;
    static String HMAC_SHA_512 = "HmacSHA512";

    @Bean
    ReactiveJwtDecoder reactiveJwtDecoder() {

        final SecretKeySpec secretKey = new SecretKeySpec(ACCESS_SECRET_KEY.getBytes(), HMAC_SHA_512);

        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MAC_ALGORITHM)
                .build();
    }
}
