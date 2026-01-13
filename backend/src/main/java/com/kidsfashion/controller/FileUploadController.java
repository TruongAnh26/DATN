package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/uploads")
@Slf4j
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed"));
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir, "products");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return URL
            String imageUrl = "/uploads/products/" + newFilename;
            
            log.info("File uploaded successfully: {}", imageUrl);
            
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "url", imageUrl,
                "filename", newFilename,
                "originalName", originalFilename != null ? originalFilename : newFilename
            )));

        } catch (IOException e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/images/multiple")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files) {
        
        List<Map<String, String>> uploadedFiles = new ArrayList<>();
        
        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir, "products");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                // Validate file type
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    continue;
                }

                // Generate unique filename
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String newFilename = UUID.randomUUID().toString() + extension;

                // Save file
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Add to result
                String imageUrl = "/uploads/products/" + newFilename;
                uploadedFiles.add(Map.of(
                    "url", imageUrl,
                    "filename", newFilename,
                    "originalName", originalFilename != null ? originalFilename : newFilename
                ));
            }

            log.info("Uploaded {} files successfully", uploadedFiles.size());
            
            return ResponseEntity.ok(ApiResponse.success(uploadedFiles));

        } catch (IOException e) {
            log.error("Failed to upload files", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to upload files: " + e.getMessage()));
        }
    }
}

