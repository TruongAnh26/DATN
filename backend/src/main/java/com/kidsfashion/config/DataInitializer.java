package com.kidsfashion.config;

import com.kidsfashion.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Data Initializer - Runs after schema.sql execution
 * Ensures admin user has correct password
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Run after database initialization
public class DataInitializer implements CommandLineRunner {

    private final AuthService authService;

    @Override
    public void run(String... args) {
        try {
            log.info("Initializing admin user...");
            String result = authService.resetAdminPassword();
            log.info("Admin initialization: {}", result);
        } catch (Exception e) {
            log.error("Error initializing admin user", e);
        }
    }
}
