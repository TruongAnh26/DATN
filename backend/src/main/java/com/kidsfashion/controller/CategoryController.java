package com.kidsfashion.controller;

import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.CategoryTreeResponse;
import com.kidsfashion.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryTreeResponse>>> getAllCategories() {
        List<CategoryTreeResponse> categories = categoryService.getCategoryTree();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<CategoryTreeResponse>>> getCategoryTree() {
        List<CategoryTreeResponse> categories = categoryService.getCategoryTree();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CategoryTreeResponse>> getCategoryBySlug(@PathVariable String slug) {
        CategoryTreeResponse category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/{slug}/children")
    public ResponseEntity<ApiResponse<List<CategoryTreeResponse>>> getChildCategories(@PathVariable String slug) {
        List<CategoryTreeResponse> children = categoryService.getChildCategories(slug);
        return ResponseEntity.ok(ApiResponse.success(children));
    }
}

