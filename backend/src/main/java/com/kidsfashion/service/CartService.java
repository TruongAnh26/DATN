package com.kidsfashion.service;

import com.kidsfashion.dto.request.AddToCartRequest;
import com.kidsfashion.dto.response.CartResponse;
import com.kidsfashion.entity.*;
import com.kidsfashion.entity.enums.CartStatus;
import com.kidsfashion.entity.enums.ProductStatus;
import com.kidsfashion.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;

    private static final int GUEST_CART_EXPIRY_DAYS = 7;

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId, String sessionId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, String sessionId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId);

        // Validate variant
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new EntityNotFoundException("Product variant not found"));

        if (!variant.getIsActive() || variant.getProduct().getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Product is not available");
        }

        // Check stock
        int availableStock = variant.getAvailableQuantity();
        if (availableStock < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock. Available: " + availableStock);
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (availableStock < newQuantity) {
                throw new IllegalArgumentException("Not enough stock. Available: " + availableStock);
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(Long userId, String sessionId, Long variantId, int quantity) {
        Cart cart = getOrCreateCart(userId, sessionId);

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            // Check stock
            int availableStock = item.getVariant().getAvailableQuantity();
            if (availableStock < quantity) {
                throw new IllegalArgumentException("Not enough stock. Available: " + availableStock);
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(Long userId, String sessionId, Long variantId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        cartItemRepository.deleteByCartIdAndVariantId(cart.getId(), variantId);
        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public void clearCart(Long userId, String sessionId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        cartItemRepository.deleteAllByCartId(cart.getId());
    }

    @Transactional
    public CartResponse mergeGuestCartToUser(Long userId, String sessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Find guest cart
        Optional<Cart> guestCartOpt = cartRepository.findActiveCartBySessionId(sessionId);
        if (guestCartOpt.isEmpty()) {
            return getCart(userId, null);
        }

        Cart guestCart = guestCartOpt.get();

        // Find or create user cart
        Cart userCart = cartRepository.findActiveCartByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .status(CartStatus.ACTIVE)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Merge items
        for (CartItem guestItem : guestCart.getItems()) {
            Optional<CartItem> existingItem = cartItemRepository
                    .findByCartIdAndVariantId(userCart.getId(), guestItem.getVariant().getId());

            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                int newQuantity = item.getQuantity() + guestItem.getQuantity();
                int availableStock = guestItem.getVariant().getAvailableQuantity();
                item.setQuantity(Math.min(newQuantity, availableStock));
                cartItemRepository.save(item);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(userCart)
                        .variant(guestItem.getVariant())
                        .quantity(guestItem.getQuantity())
                        .build();
                cartItemRepository.save(newItem);
            }
        }

        // Mark guest cart as merged
        guestCart.setStatus(CartStatus.MERGED);
        cartRepository.save(guestCart);

        return mapToCartResponse(cartRepository.findById(userCart.getId()).orElse(userCart));
    }

    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    private Cart getOrCreateCart(Long userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findActiveCartByUserId(userId)
                    .orElseGet(() -> {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));
                        Cart cart = Cart.builder()
                                .user(user)
                                .status(CartStatus.ACTIVE)
                                .build();
                        return cartRepository.save(cart);
                    });
        } else if (sessionId != null) {
            return cartRepository.findActiveCartBySessionId(sessionId)
                    .orElseGet(() -> {
                        Cart cart = Cart.builder()
                                .sessionId(sessionId)
                                .status(CartStatus.ACTIVE)
                                .expiresAt(LocalDateTime.now().plusDays(GUEST_CART_EXPIRY_DAYS))
                                .build();
                        return cartRepository.save(cart);
                    });
        } else {
            throw new IllegalArgumentException("Either userId or sessionId must be provided");
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .totalItems(cart.getTotalItemsCount())
                .subtotal(cart.getSubtotal())
                .items(cart.getItems().stream()
                        .map(this::mapToCartItemResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private CartResponse.CartItemResponse mapToCartItemResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        Product product = variant.getProduct();

        return CartResponse.CartItemResponse.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .variantSku(variant.getSkuVariant())
                .sizeName(variant.getSize().getName())
                .colorName(variant.getColor().getName())
                .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getPrimaryImageUrl())
                .unitPrice(variant.getFinalPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .availableStock(variant.getAvailableQuantity())
                .inStock(variant.isInStock())
                .build();
    }
}

