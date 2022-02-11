package com.florian935.rsocketserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import reactor.core.publisher.Hooks;

@SpringBootApplication
public class RsocketServerApplication {

	public static void main(String[] args) {
		Hooks.onErrorDropped(System.out::println);
		SpringApplication.run(RsocketServerApplication.class, args);
	}

}
