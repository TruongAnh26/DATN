package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Color;
import com.kidsfashion.repository.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/colors")
@RequiredArgsConstructor
public class ColorController {

    private final ColorRepository colorRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Color>>> getAllColors() {
        List<Color> colors = colorRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(colors));
    }
}


