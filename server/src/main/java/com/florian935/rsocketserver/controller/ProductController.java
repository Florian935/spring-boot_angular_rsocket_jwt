package com.florian935.rsocketserver.controller;

import com.florian935.rsocketserver.domain.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import static java.time.Duration.ofSeconds;

@Controller
@MessageMapping("product")
@Slf4j
public class ProductController {

    @MessageMapping("request.response.{id}")
    Mono<Product> requestResponse(@DestinationVariable String id, @Payload Product product) {

        product.setId(id);
        return Mono.just(product);
    }

    @MessageMapping("fire.and.forget")
    Mono<Void> fireAndForget(@Payload String greeting) {

      log.info(greeting);

      return Mono.empty();
    }

    @MessageMapping("request.stream")
    Flux<Product> requestStream(@Payload List<String> ids) {

        return Flux.fromIterable(ids)
                .delayElements(ofSeconds(1))
                .map(index ->
                        Product.builder()
                                .id(index)
                                .label(String.format("Jean %s", index))
                                .price(100)
                                .build()
                );
    }

    @MessageMapping("channel")
    Flux<Double> channelSquare(@Payload Flux<Double> integerToBeSquared, @Headers Map<String, Object> headers) {
        System.out.println(headers);
        return integerToBeSquared.map(integer -> Math.pow(integer, 2));
    }
}
