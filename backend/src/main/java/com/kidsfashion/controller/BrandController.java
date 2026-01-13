package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Brand;
import com.kidsfashion.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Brand>>> getAllBrands() {
        List<Brand> brands = brandRepository.findByIsActiveTrueOrderByNameAsc();
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<Brand>> getBrandBySlug(@PathVariable String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        return ResponseEntity.ok(ApiResponse.success(brand));
    }
}

