package com.kidsfashion.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnore
    private ProductVariant variant;

    // Snapshot fields - captured at time of purchase
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "variant_sku", nullable = false, length = 80)
    private String variantSku;

    @Column(name = "size_name", nullable = false, length = 20)
    private String sizeName;

    @Column(name = "color_name", nullable = false, length = 50)
    private String colorName;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Create snapshot from cart item
    public static OrderItem fromCartItem(CartItem cartItem) {
        ProductVariant variant = cartItem.getVariant();
        Product product = variant.getProduct();

        return OrderItem.builder()
                .variant(variant)
                .productName(product.getName())
                .variantSku(variant.getSkuVariant())
                .sizeName(variant.getSize().getName())
                .colorName(variant.getColor().getName())
                .unitPrice(variant.getFinalPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(cartItem.getSubtotal())
                .productImageUrl(product.getPrimaryImageUrl())
                .build();
    }

    // Get display variant info
    public String getVariantDisplay() {
        return sizeName + " - " + colorName;
    }
}

