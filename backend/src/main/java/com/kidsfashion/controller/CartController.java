package com.kidsfashion.controller;

import com.kidsfashion.dto.request.AddToCartRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.CartResponse;
import com.kidsfashion.entity.User;
import com.kidsfashion.repository.UserRepository;
import com.kidsfashion.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId) {
        Long userId = getUserId(userDetails);
        CartResponse cart = cartService.getCart(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId,
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = getUserId(userDetails);
        
        // If guest and no session, create one
        if (userId == null && sessionId == null) {
            sessionId = cartService.generateSessionId();
        }
        
        CartResponse cart = cartService.addToCart(userId, sessionId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId,
            @PathVariable Long variantId,
            @RequestParam int quantity) {
        Long userId = getUserId(userDetails);
        CartResponse cart = cartService.updateCartItem(userId, sessionId, variantId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId,
            @PathVariable Long variantId) {
        Long userId = getUserId(userDetails);
        CartResponse cart = cartService.removeFromCart(userId, sessionId, variantId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId) {
        Long userId = getUserId(userDetails);
        cartService.clearCart(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<CartResponse>> mergeCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId) {
        Long userId = getUserId(userDetails);
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Must be logged in to merge cart"));
        }
        CartResponse cart = cartService.mergeGuestCartToUser(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart merged", cart));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<String>> getNewSessionId() {
        String sessionId = cartService.generateSessionId();
        return ResponseEntity.ok(ApiResponse.success(sessionId));
    }

    private Long getUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElse(null);
    }
}

