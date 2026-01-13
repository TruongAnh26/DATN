package com.kidsfashion.repository;

import com.kidsfashion.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    Optional<ProductVariant> findBySkuVariant(String skuVariant);

    boolean existsBySkuVariant(String skuVariant);

    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);

    List<ProductVariant> findByProductId(Long productId);

    Optional<ProductVariant> findByProductIdAndSizeIdAndColorId(Long productId, Integer sizeId, Integer colorId);

    // Find variants with available stock
    @Query("SELECT v FROM ProductVariant v JOIN v.inventory i " +
            "WHERE v.product.id = :productId AND v.isActive = true AND (i.quantity - i.reservedQuantity) > 0")
    List<ProductVariant> findAvailableVariants(@Param("productId") Long productId);

    // Get available sizes for a product
    @Query("SELECT DISTINCT v.size FROM ProductVariant v JOIN v.inventory i " +
            "WHERE v.product.id = :productId AND v.isActive = true AND (i.quantity - i.reservedQuantity) > 0 " +
            "ORDER BY v.size.sortOrder")
    List<Object> findAvailableSizes(@Param("productId") Long productId);

    // Get available colors for a product
    @Query("SELECT DISTINCT v.color FROM ProductVariant v JOIN v.inventory i " +
            "WHERE v.product.id = :productId AND v.isActive = true AND (i.quantity - i.reservedQuantity) > 0 " +
            "ORDER BY v.color.sortOrder")
    List<Object> findAvailableColors(@Param("productId") Long productId);

    // Get available colors for a specific size
    @Query("SELECT DISTINCT v.color FROM ProductVariant v JOIN v.inventory i " +
            "WHERE v.product.id = :productId AND v.size.id = :sizeId AND v.isActive = true " +
            "AND (i.quantity - i.reservedQuantity) > 0 ORDER BY v.color.sortOrder")
    List<Object> findAvailableColorsForSize(@Param("productId") Long productId, @Param("sizeId") Integer sizeId);

    // Check if product has any variants in stock
    @Query("SELECT COUNT(v) > 0 FROM ProductVariant v JOIN v.inventory i " +
            "WHERE v.product.id = :productId AND (i.quantity - i.reservedQuantity) > 0")
    boolean hasAvailableStock(@Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM ProductVariant v WHERE v.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}

