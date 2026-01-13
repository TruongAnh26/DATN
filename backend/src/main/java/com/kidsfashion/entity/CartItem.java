package com.kidsfashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cart_id", "variant_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Get subtotal for this item
    public BigDecimal getSubtotal() {
        return variant.getFinalPrice().multiply(BigDecimal.valueOf(quantity));
    }

    // Get unit price
    public BigDecimal getUnitPrice() {
        return variant.getFinalPrice();
    }

    // Check if item is still available
    public boolean isAvailable() {
        return variant.getIsActive() && 
               variant.getProduct().getStatus() == com.kidsfashion.entity.enums.ProductStatus.ACTIVE;
    }

    // Check if requested quantity is in stock
    public boolean hasEnoughStock() {
        return variant.getAvailableQuantity() >= quantity;
    }
}

