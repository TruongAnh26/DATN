package com.kidsfashion.dto.response;

import com.kidsfashion.entity.enums.OrderStatus;
import com.kidsfashion.entity.enums.PaymentGateway;
import com.kidsfashion.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderCode;
    private OrderStatus status;
    private String recipientName;
    private String recipientPhone;
    private String shippingProvince;
    private String shippingDistrict;
    private String shippingWard;
    private String shippingAddress;
    private String fullShippingAddress;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String shippingMethod;
    private String notes;
    private int totalItems;
    private List<OrderItemResponse> items;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String productName;
        private String variantSku;
        private String sizeName;
        private String colorName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private Long id;
        private String transactionId;
        private PaymentGateway gateway;
        private String gatewayTransactionId;
        private BigDecimal amount;
        private String currency;
        private PaymentStatus status;
        private LocalDateTime paidAt;
    }
}

