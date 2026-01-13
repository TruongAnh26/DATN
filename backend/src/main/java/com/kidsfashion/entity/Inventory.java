package com.kidsfashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false, unique = true)
    private ProductVariant variant;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Get available quantity
    public int getAvailableQuantity() {
        return quantity - reservedQuantity;
    }

    // Check if low stock
    public boolean isLowStock() {
        return getAvailableQuantity() <= lowStockThreshold;
    }

    // Check if out of stock
    public boolean isOutOfStock() {
        return getAvailableQuantity() <= 0;
    }

    // Reserve stock (when adding to cart or placing order)
    public boolean reserve(int amount) {
        if (getAvailableQuantity() >= amount) {
            reservedQuantity += amount;
            return true;
        }
        return false;
    }

    // Release reserved stock (when removing from cart or cancelling order)
    public void releaseReservation(int amount) {
        reservedQuantity = Math.max(0, reservedQuantity - amount);
    }

    // Deduct stock (when order is confirmed)
    public boolean deductStock(int amount) {
        if (quantity >= amount) {
            quantity -= amount;
            reservedQuantity = Math.max(0, reservedQuantity - amount);
            return true;
        }
        return false;
    }

    // Add stock (when restocking)
    public void addStock(int amount) {
        quantity += amount;
    }
}

