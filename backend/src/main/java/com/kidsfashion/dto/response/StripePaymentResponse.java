package com.kidsfashion.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StripePaymentResponse {
    private Long paymentId;
    private Long orderId;
    private String orderCode;
    
    // For PaymentIntent (client-side card payment)
    private String clientSecret;
    private String paymentIntentId;
    
    // For Checkout Session (Stripe hosted page)
    private String sessionId;
    private String checkoutUrl;
    
    private BigDecimal amount;
    private String currency;
    private String status;
}
