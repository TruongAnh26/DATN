package com.kidsfashion.repository;

import com.kidsfashion.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    // Get best selling products
    @Query("SELECT oi.variant.product.id, oi.productName, SUM(oi.quantity) as totalSold " +
            "FROM OrderItem oi JOIN oi.order o " +
            "WHERE o.status = 'COMPLETED' " +
            "GROUP BY oi.variant.product.id, oi.productName " +
            "ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts();

    // Count total items sold
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi JOIN oi.order o WHERE o.status = 'COMPLETED'")
    long countTotalItemsSold();

    // Check if variant is used in any order
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.variant.id = :variantId")
    boolean existsByVariantId(@Param("variantId") Long variantId);
}

