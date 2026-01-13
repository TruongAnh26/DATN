package com.kidsfashion.controller;

import com.kidsfashion.dto.request.CreateOrderRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.OrderResponse;
import com.kidsfashion.entity.User;
import com.kidsfashion.entity.enums.OrderStatus;
import com.kidsfashion.repository.UserRepository;
import com.kidsfashion.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    /**
     * Create a new order from cart
     * Both authenticated users and guests can create orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(name = "X-Cart-Session", required = false) String sessionId,
            @Valid @RequestBody CreateOrderRequest request) {
        
        Long userId = getUserId(userDetails);
        OrderResponse order = orderService.createOrder(userId, sessionId, request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    /**
     * Get order by order code (for tracking)
     * Public endpoint - anyone with order code can view
     */
    @GetMapping("/track/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(@PathVariable String orderCode) {
        OrderResponse order = orderService.trackOrder(orderCode);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * Get order details by ID
     * Only order owner can view
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        
        Long userId = getUserId(userDetails);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Please login to view order details"));
        }
        
        OrderResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * Get current user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserId(userDetails);
        if (userId == null) {
            // Return empty page instead of error for better UX
            Page<OrderResponse> emptyPage = new org.springframework.data.domain.PageImpl<>(
                java.util.Collections.emptyList(),
                org.springframework.data.domain.PageRequest.of(page, size),
                0
            );
            return ResponseEntity.ok(ApiResponse.success(emptyPage));
        }
        
        Page<OrderResponse> orders = orderService.getUserOrders(userId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * Get guest orders by email
     */
    @GetMapping("/guest")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getGuestOrders(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<OrderResponse> orders = orderService.getGuestOrders(email, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * Cancel an order
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {
        
        Long userId = getUserId(userDetails);
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Please login to cancel order"));
        }
        
        OrderResponse order = orderService.cancelOrder(orderId, userId, reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all orders (Admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<OrderResponse> orders = orderService.getAllOrders(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * Update order status (Admin only)
     */
    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        
        OrderResponse order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
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

