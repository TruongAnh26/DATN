package com.kidsfashion.repository;

import com.kidsfashion.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    // Find low stock items
    @Query("SELECT i FROM Inventory i WHERE (i.quantity - i.reservedQuantity) <= i.lowStockThreshold")
    Page<Inventory> findLowStockItems(Pageable pageable);

    // Find out of stock items
    @Query("SELECT i FROM Inventory i WHERE (i.quantity - i.reservedQuantity) <= 0")
    Page<Inventory> findOutOfStockItems(Pageable pageable);

    // Update quantity
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = :quantity WHERE i.variant.id = :variantId")
    void updateQuantity(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Reserve stock
    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity + :amount WHERE i.variant.id = :variantId")
    void reserveStock(@Param("variantId") Long variantId, @Param("amount") Integer amount);

    // Release reserved stock
    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = GREATEST(0, i.reservedQuantity - :amount) WHERE i.variant.id = :variantId")
    void releaseReservedStock(@Param("variantId") Long variantId, @Param("amount") Integer amount);

    // Deduct stock (when order confirmed)
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :amount, " +
            "i.reservedQuantity = GREATEST(0, i.reservedQuantity - :amount) " +
            "WHERE i.variant.id = :variantId AND i.quantity >= :amount")
    int deductStock(@Param("variantId") Long variantId, @Param("amount") Integer amount);

    // Count low stock items
    @Query("SELECT COUNT(i) FROM Inventory i WHERE (i.quantity - i.reservedQuantity) <= i.lowStockThreshold")
    long countLowStockItems();

    // Count out of stock items
    @Query("SELECT COUNT(i) FROM Inventory i WHERE (i.quantity - i.reservedQuantity) <= 0")
    long countOutOfStockItems();

    @Modifying
    @Query("DELETE FROM Inventory i WHERE i.variant.id = :variantId")
    void deleteByVariantId(@Param("variantId") Long variantId);
}

