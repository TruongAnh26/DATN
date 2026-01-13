package com.kidsfashion.dto.response;

import com.kidsfashion.entity.enums.Gender;
import com.kidsfashion.entity.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer discountPercentage;
    private boolean onSale;
    private BrandResponse brand;
    private Integer ageMin;
    private Integer ageMax;
    private Gender gender;
    private String material;
    private ProductStatus status;
    private boolean isFeatured;
    private Long viewCount;
    private Set<CategoryResponse> categories;
    private List<ProductImageResponse> images;
    private String primaryImageUrl;
    private List<VariantResponse> variants;
    private List<SizeResponse> availableSizes;
    private List<ColorResponse> availableColors;
    private boolean inStock;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandResponse {
        private Integer id;
        private String name;
        private String slug;
        private String logoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Integer id;
        private String name;
        private String slug;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImageResponse {
        private Long id;
        private String imageUrl;
        private String altText;
        private Integer sortOrder;
        private boolean isPrimary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String skuVariant;
        private SizeResponse size;
        private ColorResponse color;
        private BigDecimal priceAdjustment;
        private BigDecimal finalPrice;
        private String imageUrl;
        private boolean isActive;
        private int availableQuantity;
        private boolean inStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SizeResponse {
        private Integer id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColorResponse {
        private Integer id;
        private String name;
        private String hexCode;
    }
}

