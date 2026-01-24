package com.kidsfashion.repository;

import com.kidsfashion.entity.Payment;
import com.kidsfashion.entity.enums.PaymentGateway;
import com.kidsfashion.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);

    // Find payments by status
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    // Find payments by gateway
    Page<Payment> findByGateway(PaymentGateway gateway, Pageable pageable);

    // Find pending payments older than threshold (for cleanup/reminder)
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :threshold")
    Page<Payment> findStalePendingPayments(@Param("threshold") LocalDateTime threshold, Pageable pageable);

    // Get total successful payments amount
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal getTotalSuccessfulPayments();

    // Get total by gateway
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND p.gateway = :gateway")
    BigDecimal getTotalByGateway(@Param("gateway") PaymentGateway gateway);

    // Count by status
    long countByStatus(PaymentStatus status);
}

