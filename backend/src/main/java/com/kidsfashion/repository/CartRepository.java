package com.kidsfashion.repository;

import com.kidsfashion.entity.Cart;
import com.kidsfashion.entity.enums.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserIdAndStatus(Long userId, CartStatus status);

    Optional<Cart> findBySessionIdAndStatus(String sessionId, CartStatus status);

    // Find active cart for user
    default Optional<Cart> findActiveCartByUserId(Long userId) {
        return findByUserIdAndStatus(userId, CartStatus.ACTIVE);
    }

    // Find active cart for guest
    default Optional<Cart> findActiveCartBySessionId(String sessionId) {
        return findBySessionIdAndStatus(sessionId, CartStatus.ACTIVE);
    }

    // Find expired guest carts
    @Query("SELECT c FROM Cart c WHERE c.sessionId IS NOT NULL AND c.expiresAt < :now AND c.status = 'ACTIVE'")
    List<Cart> findExpiredGuestCarts(@Param("now") LocalDateTime now);

    // Mark expired carts as abandoned
    @Modifying
    @Query("UPDATE Cart c SET c.status = 'ABANDONED' WHERE c.sessionId IS NOT NULL AND c.expiresAt < :now AND c.status = 'ACTIVE'")
    int markExpiredCartsAsAbandoned(@Param("now") LocalDateTime now);

    // Count active carts
    long countByStatus(CartStatus status);
}

