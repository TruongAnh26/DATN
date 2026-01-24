package com.kidsfashion.controller;

import com.kidsfashion.dto.request.CreatePaymentRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.PaymentResponse;
import com.kidsfashion.dto.response.StripePaymentResponse;
import com.kidsfashion.service.PaymentService;
import com.kidsfashion.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;

    // ==================== STRIPE ENDPOINTS ====================

    /**
     * Get Stripe publishable key for frontend
     */
    @GetMapping("/stripe/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStripeConfig() {
        Map<String, String> config = Map.of("publishableKey", stripeService.getPublishableKey());
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    /**
     * Create Stripe PaymentIntent for card payments (Elements)
     */
    @PostMapping("/stripe/create-payment-intent")
    public ResponseEntity<ApiResponse<StripePaymentResponse>> createStripePaymentIntent(
            @RequestBody Map<String, Long> request) {
        Long orderId = request.get("orderId");
        StripePaymentResponse response = stripeService.createPaymentIntent(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment intent created", response));
    }

    /**
     * Create Stripe Checkout Session (redirect to Stripe hosted page)
     */
    @PostMapping("/stripe/create-checkout-session")
    public ResponseEntity<ApiResponse<StripePaymentResponse>> createStripeCheckoutSession(
            @RequestBody Map<String, Long> request) {
        Long orderId = request.get("orderId");
        StripePaymentResponse response = stripeService.createCheckoutSession(orderId);
        return ResponseEntity.ok(ApiResponse.success("Checkout session created", response));
    }

    /**
     * Stripe webhook handler
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook handled");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    /**
     * Verify Stripe payment status
     */
    @GetMapping("/stripe/verify/{paymentIntentId}")
    public ResponseEntity<ApiResponse<StripePaymentResponse>> verifyStripePayment(
            @PathVariable String paymentIntentId) {
        StripePaymentResponse response = stripeService.verifyPayment(paymentIntentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== LEGACY ENDPOINTS ====================

    /**
     * Create payment for an order (legacy - COD only now)
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse payment = paymentService.createPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment created successfully", payment));
    }

    /**
     * Get payment by order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponse payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}
