package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Brand;
import com.kidsfashion.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Iterable<Brand>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.success(brandRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Brand>> createBrand(@RequestBody Map<String, Object> request) {
        Brand brand = new Brand();
        mapRequestToBrand(request, brand);
        
        Brand saved = brandRepository.save(brand);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Brand>> updateBrand(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        
        mapRequestToBrand(request, brand);
        
        Brand saved = brandRepository.save(brand);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBrand(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        
        brandRepository.delete(brand);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully"));
    }

    private void mapRequestToBrand(Map<String, Object> request, Brand brand) {
        if (request.containsKey("name")) {
            brand.setName((String) request.get("name"));
        }
        if (request.containsKey("slug")) {
            brand.setSlug((String) request.get("slug"));
        }
        if (request.containsKey("description")) {
            brand.setDescription((String) request.get("description"));
        }
        if (request.containsKey("logoUrl")) {
            brand.setLogoUrl((String) request.get("logoUrl"));
        }
        if (request.containsKey("active")) {
            brand.setIsActive(Boolean.parseBoolean(request.get("active").toString()));
        }
    }
}

