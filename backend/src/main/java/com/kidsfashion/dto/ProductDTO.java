package com.kidsfashion.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ProductDTO {
    private String name;
    private String sku;
    private String slug;
    private String description;
    private String shortDescription;
    private Double basePrice;
    private Double salePrice;
    private Long categoryId;
    private Long brandId;
    private String gender;
    private String ageGroup;
    private String material;
    private String careInstructions;
    private Boolean featured;
    private Boolean active;
    private String metaTitle;
    private String metaDescription;
    private List<Map<String, Object>> images;
    private List<Map<String, Object>> variants;
}

