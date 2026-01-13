package com.kidsfashion.dto.request;

import com.kidsfashion.entity.enums.Gender;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductFilterRequest {

    private String keyword;
    private List<Integer> categoryIds;
    private List<Integer> brandIds;
    private Gender gender;
    private Integer ageMin;
    private Integer ageMax;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<Integer> sizeIds;
    private List<Integer> colorIds;
    private Boolean onSale;
    private Boolean inStock;

    // Sorting
    private String sortBy = "createdAt"; // name, price, createdAt, viewCount
    private String sortDirection = "DESC"; // ASC, DESC

    // Pagination
    private int page = 0;
    private int size = 12;
}

