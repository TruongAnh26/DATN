package com.kidsfashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "size_id", "color_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id", nullable = false)
    private Size size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    private Color color;

    @Column(name = "sku_variant", nullable = false, unique = true, length = 80)
    private String skuVariant;

    @Column(name = "price_adjustment", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal priceAdjustment = BigDecimal.ZERO;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToOne(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    // Calculate final price for this variant
    public BigDecimal getFinalPrice() {
        BigDecimal effectivePrice = product.getEffectivePrice();
        return effectivePrice.add(priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO);
    }

    // Get available quantity
    public int getAvailableQuantity() {
        if (inventory == null) return 0;
        return inventory.getQuantity() - inventory.getReservedQuantity();
    }

    // Check if in stock
    public boolean isInStock() {
        return getAvailableQuantity() > 0;
    }

    // Get display name (e.g., "S - Red")
    public String getDisplayName() {
        return size.getName() + " - " + color.getName();
    }
}

