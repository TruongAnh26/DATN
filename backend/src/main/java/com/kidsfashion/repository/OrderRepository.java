package com.kidsfashion.repository;

import com.kidsfashion.entity.Order;
import com.kidsfashion.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderCode(String orderCode);

    // Find orders by user
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find orders by status
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    // Find orders by user and status
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);

    // Find guest orders by email
    Page<Order> findByGuestEmailOrderByCreatedAtDesc(String guestEmail, Pageable pageable);

    // Search orders
    @Query("SELECT o FROM Order o WHERE " +
            "o.orderCode LIKE CONCAT('%', :keyword, '%') OR " +
            "o.recipientName LIKE CONCAT('%', :keyword, '%') OR " +
            "o.recipientPhone LIKE CONCAT('%', :keyword, '%')")
    Page<Order> searchOrders(@Param("keyword") String keyword, Pageable pageable);

    // Find orders by date range
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate, 
                                 Pageable pageable);

    // Count orders by status
    long countByStatus(OrderStatus status);

    // Count orders by user
    long countByUserId(Long userId);

    // Get total revenue
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    // Get revenue by date range
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.completedAt BETWEEN :startDate AND :endDate")
    BigDecimal getRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);

    // Get daily revenue for a period
    @Query("SELECT CAST(o.completedAt AS date), SUM(o.totalAmount) FROM Order o " +
            "WHERE o.status = 'COMPLETED' AND o.completedAt BETWEEN :startDate AND :endDate " +
            "GROUP BY CAST(o.completedAt AS date) ORDER BY CAST(o.completedAt AS date)")
    List<Object[]> getDailyRevenue(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);

    // Count orders today
    @Query("SELECT COUNT(o) FROM Order o WHERE CAST(o.createdAt AS date) = CURRENT_DATE")
    long countOrdersToday();

    // Get recent orders
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    Page<Order> findRecentOrders(Pageable pageable);
}

