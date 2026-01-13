package com.kidsfashion.controller;

import com.kidsfashion.dto.request.LoginRequest;
import com.kidsfashion.dto.request.RegisterRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.AuthResponse;
import com.kidsfashion.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        AuthResponse response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Reset admin password - FOR DEVELOPMENT ONLY
     * Call this endpoint to create/reset admin user with password "admin123"
     */
    @PostMapping("/reset-admin")
    public ResponseEntity<ApiResponse<String>> resetAdminPassword() {
        String result = authService.resetAdminPassword();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

