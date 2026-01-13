package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Size;
import com.kidsfashion.repository.SizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sizes")
@RequiredArgsConstructor
public class SizeController {

    private final SizeRepository sizeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Size>>> getAllSizes() {
        List<Size> sizes = sizeRepository.findAllByOrderBySortOrderAsc();
        return ResponseEntity.ok(ApiResponse.success(sizes));
    }
}

