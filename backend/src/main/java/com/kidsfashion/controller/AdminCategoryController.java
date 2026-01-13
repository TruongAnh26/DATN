package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Category;
import com.kidsfashion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCategory(@RequestBody Map<String, Object> request) {
        try {
            Category category = new Category();
            mapRequestToCategory(request, category);
            
            Category saved = categoryRepository.save(category);
            
            // Return simple response to avoid lazy loading issues
            Map<String, Object> result = Map.of(
                "id", saved.getId(),
                "name", saved.getName() != null ? saved.getName() : "",
                "slug", saved.getSlug() != null ? saved.getSlug() : "",
                "message", "Category created successfully"
            );
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            
            mapRequestToCategory(request, category);
            
            Category saved = categoryRepository.save(category);
            
            // Return simple response to avoid lazy loading issues
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("id", saved.getId());
            result.put("name", saved.getName() != null ? saved.getName() : "");
            result.put("slug", saved.getSlug() != null ? saved.getSlug() : "");
            result.put("parentId", saved.getParent() != null ? saved.getParent().getId() : null);
            result.put("message", "Category updated successfully");
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        categoryRepository.delete(category);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    private void mapRequestToCategory(Map<String, Object> request, Category category) {
        if (request.containsKey("name")) {
            String name = (String) request.get("name");
            if (name != null && name.length() > 100) {
                throw new IllegalArgumentException("Tên danh mục không được vượt quá 100 ký tự");
            }
            category.setName(name);
        }
        if (request.containsKey("slug")) {
            String slug = (String) request.get("slug");
            if (slug != null && slug.length() > 120) {
                throw new IllegalArgumentException("Slug không được vượt quá 120 ký tự");
            }
            category.setSlug(slug);
        }
        if (request.containsKey("description")) {
            category.setDescription((String) request.get("description"));
        }
        if (request.containsKey("imageUrl")) {
            String imageUrl = (String) request.get("imageUrl");
            if (imageUrl != null && imageUrl.length() > 500) {
                throw new IllegalArgumentException("URL hình ảnh không được vượt quá 500 ký tự");
            }
            category.setImageUrl(imageUrl);
        }
        if (request.containsKey("displayOrder")) {
            category.setSortOrder(Integer.parseInt(request.get("displayOrder").toString()));
        }
        if (request.containsKey("active")) {
            category.setIsActive(Boolean.parseBoolean(request.get("active").toString()));
        }
        if (request.containsKey("parentId") && request.get("parentId") != null) {
            Long parentId = Long.parseLong(request.get("parentId").toString());
            categoryRepository.findById(parentId).ifPresent(category::setParent);
        } else {
            category.setParent(null);
        }
    }
}

