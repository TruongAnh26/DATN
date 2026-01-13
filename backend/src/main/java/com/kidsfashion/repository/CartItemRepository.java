package com.kidsfashion.repository;

import com.kidsfashion.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);

    // Delete all items in a cart
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteAllByCartId(@Param("cartId") Long cartId);

    // Delete specific item
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.variant.id = :variantId")
    void deleteByCartIdAndVariantId(@Param("cartId") Long cartId, @Param("variantId") Long variantId);

    // Update quantity
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = :quantity WHERE ci.cart.id = :cartId AND ci.variant.id = :variantId")
    void updateQuantity(@Param("cartId") Long cartId, @Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Count items in cart
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    int countItemsInCart(@Param("cartId") Long cartId);

    // Check if variant exists in cart
    boolean existsByCartIdAndVariantId(Long cartId, Long variantId);
}

