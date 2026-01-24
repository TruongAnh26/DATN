package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.User;
import com.kidsfashion.entity.enums.UserStatus;
import com.kidsfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users = userRepository.findAll(pageRequest);
        
        // Map to DTO to avoid exposing sensitive data
        Page<Map<String, Object>> userDtos = users.map(this::mapUserToDto);
        
        return ResponseEntity.ok(ApiResponse.success(userDtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(ApiResponse.success(mapUserToDto(user)));
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String statusStr = request.get("status");
        if (statusStr != null) {
            try {
                UserStatus newStatus = UserStatus.valueOf(statusStr);
                boolean isAdmin = user.getRoles().stream()
                        .map(role -> role.getName())
                        .anyMatch(role -> "ADMIN".equals(role) || "ROLE_ADMIN".equals(role));
                if (isAdmin && newStatus == UserStatus.LOCKED) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Không thể khóa tài khoản admin"));
                }
                user.setStatus(newStatus);
                userRepository.save(user);
            } catch (Exception e) {
                throw new RuntimeException("Invalid status: " + statusStr);
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(mapUserToDto(user)));
    }

    private Map<String, Object> mapUserToDto(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("email", user.getEmail());
        dto.put("fullName", user.getFullName());
        dto.put("phoneNumber", user.getPhoneNumber());
        dto.put("avatarUrl", user.getAvatarUrl());
        dto.put("status", user.getStatus().name());
        dto.put("emailVerified", user.getEmailVerified());
        dto.put("createdAt", user.getCreatedAt());
        dto.put("roles", user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList()));
        return dto;
    }
}

