package com.kidsfashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private int totalItems;
    private BigDecimal subtotal;
    private List<CartItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long variantId;
        private String productName;
        private String productSlug;
        private String variantSku;
        private String sizeName;
        private String colorName;
        private String imageUrl;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal subtotal;
        private int availableStock;
        private boolean inStock;
    }
}

