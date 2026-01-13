package com.kidsfashion.service;

import com.kidsfashion.dto.request.LoginRequest;
import com.kidsfashion.dto.request.RegisterRequest;
import com.kidsfashion.dto.response.AuthResponse;
import com.kidsfashion.entity.Role;
import com.kidsfashion.entity.User;
import com.kidsfashion.entity.enums.UserStatus;
import com.kidsfashion.repository.RoleRepository;
import com.kidsfashion.repository.UserRepository;
import com.kidsfashion.security.JwtTokenProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Get CUSTOMER role
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new EntityNotFoundException("Role CUSTOMER not found"));

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .build();

        user.addRole(customerRole);
        user = userRepository.save(user);

        // Generate token
        String token = tokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(token, user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmailWithRoles(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return buildAuthResponse(token, user);
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return AuthResponse.builder()
                .user(buildUserResponse(user))
                .build();
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .user(buildUserResponse(user))
                .build();
    }

    private AuthResponse.UserResponse buildUserResponse(User user) {
        return AuthResponse.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Reset admin password - FOR DEVELOPMENT ONLY
     * Creates admin user if not exists, or resets password if exists
     */
    @Transactional
    public String resetAdminPassword() {
        String adminEmail = "admin@kidsfashion.com";
        String newPassword = "admin123";
        
        // Get or create ADMIN role
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name("ADMIN")
                            .description("Administrator with full access")
                            .build();
                    return roleRepository.save(role);
                });

        // Find or create admin user
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        
        if (admin == null) {
            // Create new admin
            admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(newPassword))
                    .fullName("System Admin")
                    .phoneNumber("0123456789")
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
            admin.addRole(adminRole);
            userRepository.save(admin);
            return "Admin user created with email: " + adminEmail + " and password: " + newPassword;
        } else {
            // Reset password
            admin.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(admin);
            return "Admin password reset for email: " + adminEmail + " - New password: " + newPassword;
        }
    }
}

