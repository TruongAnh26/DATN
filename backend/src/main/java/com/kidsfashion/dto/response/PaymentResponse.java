package com.kidsfashion.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kidsfashion.entity.enums.PaymentGateway;
import com.kidsfashion.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS) // Always include fields, even if null
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String transactionId;
    private PaymentGateway gateway;
    private String gatewayTransactionId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String paymentUrl; // URL để redirect hoặc QR code
    private String qrCode; // Base64 encoded QR code image
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
