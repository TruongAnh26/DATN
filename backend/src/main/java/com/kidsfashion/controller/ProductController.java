package com.kidsfashion.controller;

import com.kidsfashion.dto.request.ProductFilterRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.ProductResponse;
import com.kidsfashion.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @ModelAttribute ProductFilterRequest filter) {
        Page<ProductResponse> products = productService.getProducts(filter);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<ProductResponse> products = productService.getFeaturedProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getNewArrivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<ProductResponse> products = productService.getNewArrivals(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/on-sale")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getOnSaleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<ProductResponse> products = productService.getOnSaleProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Page<ProductResponse> products = productService.getRelatedProducts(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/category/{slug}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.getProductsByCategory(slug, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/brand/{slug}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByBrand(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.getProductsByBrand(slug, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}

