package com.kidsfashion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class KidsFashionApplication {

    public static void main(String[] args) {
        SpringApplication.run(KidsFashionApplication.class, args);
    }
}

