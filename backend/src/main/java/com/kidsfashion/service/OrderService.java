package com.kidsfashion.service;

import com.kidsfashion.dto.request.CreateOrderRequest;
import com.kidsfashion.dto.response.OrderResponse;
import com.kidsfashion.entity.*;
import com.kidsfashion.entity.enums.CartStatus;
import com.kidsfashion.entity.enums.OrderStatus;
import com.kidsfashion.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("599000");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");

    @Transactional
    public OrderResponse createOrder(Long userId, String sessionId, CreateOrderRequest request) {
        // Get cart - try user cart first, then session cart
        Cart cart = null;
        
        if (userId != null) {
            cart = cartRepository.findActiveCartByUserId(userId).orElse(null);
        }
        
        // If user cart is empty/null but sessionId provided, use session cart
        if ((cart == null || cart.isEmpty()) && sessionId != null) {
            cart = cartRepository.findActiveCartBySessionId(sessionId).orElse(null);
        }
        
        if (cart == null || cart.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng trống");
        }

        // Validate stock and reserve inventory
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            Inventory inventory = variant.getInventory();
            
            if (inventory == null || !inventory.reserve(cartItem.getQuantity())) {
                throw new IllegalArgumentException(
                    "Not enough stock for: " + variant.getProduct().getName() + 
                    " (" + variant.getSize().getName() + " - " + variant.getColor().getName() + ")"
                );
            }
            inventoryRepository.save(inventory);
        }

        // Calculate totals
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 
                ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
        BigDecimal totalAmount = subtotal.add(shippingFee);

        // Get user if logged in
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        
        // Validate guest email for guest orders (only if not logged in)
        if (user == null && (request.getGuestEmail() == null || request.getGuestEmail().isBlank())) {
            throw new IllegalArgumentException("Email is required for guest checkout");
        }

        // Create order
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .user(user)
                .guestEmail(user == null ? request.getGuestEmail() : null)
                .status(OrderStatus.PENDING)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingProvince(request.getShippingProvince())
                .shippingDistrict(request.getShippingDistrict())
                .shippingWard(request.getShippingWard())
                .shippingAddress(request.getShippingAddress())
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .shippingMethod(request.getShippingMethod() != null ? request.getShippingMethod() : "STANDARD")
                .notes(request.getNotes())
                .build();

        // Convert cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.fromCartItem(cartItem);
            order.addItem(orderItem);
        }

        order = orderRepository.save(order);

        // Clear cart - mark as MERGED (reusing status since CONVERTED not in DB constraint)
        cart.setStatus(CartStatus.MERGED);
        cartRepository.save(cart);
        cartItemRepository.deleteAllByCartId(cart.getId());

        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderCode));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        
        return orders.map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getGuestOrders(String email, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByGuestEmailOrderByCreatedAtDesc(email, pageable)
                .map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderCode));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Verify ownership
        if (order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to cancel this order");
        }

        if (!order.canBeCancelled()) {
            throw new IllegalArgumentException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        // Release reserved inventory
        for (OrderItem item : order.getItems()) {
            Inventory inventory = item.getVariant().getInventory();
            if (inventory != null) {
                inventory.releaseReservation(item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }

        order.setCancellationReason(reason);
        order.updateStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    // Admin methods
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        
        return orders.map(this::mapToOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Handle inventory for status transitions
        if (newStatus == OrderStatus.SHIPPING && order.getStatus() == OrderStatus.PAID) {
            // Deduct stock when shipping
            for (OrderItem item : order.getItems()) {
                Inventory inventory = item.getVariant().getInventory();
                if (inventory != null) {
                    inventory.deductStock(item.getQuantity());
                    inventoryRepository.save(inventory);
                }
            }
        }

        order.updateStatus(newStatus);
        order = orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    private String generateOrderCode() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.countOrdersToday() + 1;
        return "ORD-" + datePrefix + "-" + String.format("%06d", count);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingProvince(order.getShippingProvince())
                .shippingDistrict(order.getShippingDistrict())
                .shippingWard(order.getShippingWard())
                .shippingAddress(order.getShippingAddress())
                .fullShippingAddress(order.getFullShippingAddress())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .shippingMethod(order.getShippingMethod())
                .notes(order.getNotes())
                .totalItems(order.getTotalItemsCount())
                .items(order.getItems().stream()
                        .map(this::mapToOrderItemResponse)
                        .collect(Collectors.toList()))
                .payment(order.getPayment() != null ? mapToPaymentResponse(order.getPayment()) : null)
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .shippedAt(order.getShippedAt())
                .completedAt(order.getCompletedAt())
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .build();
    }

    private OrderResponse.OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .variantSku(item.getVariantSku())
                .sizeName(item.getSizeName())
                .colorName(item.getColorName())
                .productImageUrl(item.getProductImageUrl())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    private OrderResponse.PaymentResponse mapToPaymentResponse(Payment payment) {
        return OrderResponse.PaymentResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .gateway(payment.getGateway())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .build();
    }
}

