package com.kidsfashion.service;

import com.kidsfashion.dto.response.StripePaymentResponse;
import com.kidsfashion.entity.Order;
import com.kidsfashion.entity.Payment;
import com.kidsfashion.entity.enums.OrderStatus;
import com.kidsfashion.entity.enums.PaymentGateway;
import com.kidsfashion.entity.enums.PaymentStatus;
import com.kidsfashion.repository.OrderRepository;
import com.kidsfashion.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Value("${payment.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${payment.stripe.publishable-key}")
    private String stripePublishableKey;

    @Value("${payment.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${payment.stripe.success-url}")
    private String successUrl;

    @Value("${payment.stripe.cancel-url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe initialized with API key");
    }

    /**
     * Get Stripe publishable key for frontend
     */
    public String getPublishableKey() {
        return stripePublishableKey;
    }

    /**
     * Create a PaymentIntent for client-side confirmation (Elements/Card)
     */
    @Transactional
    public StripePaymentResponse createPaymentIntent(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        // Check if payment already exists
        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Order already paid");
        }

        try {
            // Convert VND to smallest unit (VND doesn't have decimals, but Stripe expects it)
            long amountInSmallestUnit = order.getTotalAmount().longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSmallestUnit)
                    .setCurrency("vnd")
                    .setDescription("PhanKid Order: " + order.getOrderCode())
                    .putMetadata("orderId", order.getId().toString())
                    .putMetadata("orderCode", order.getOrderCode())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Created PaymentIntent: {} for order: {}", paymentIntent.getId(), order.getOrderCode());

            // Create or update payment record
            Payment payment;
            if (existingPayment != null) {
                // Update existing payment
                payment = existingPayment;
                payment.setGateway(PaymentGateway.STRIPE);
                payment.setGatewayTransactionId(paymentIntent.getId());
                payment.setAmount(order.getTotalAmount());
                payment.setStatus(PaymentStatus.PENDING);
            } else {
                // Create new payment
                payment = Payment.builder()
                        .order(order)
                        .transactionId(generateTransactionId())
                        .gateway(PaymentGateway.STRIPE)
                        .gatewayTransactionId(paymentIntent.getId())
                        .amount(order.getTotalAmount())
                        .currency("VND")
                        .status(PaymentStatus.PENDING)
                        .build();
            }

            Map<String, Object> metadata = payment.getMetadata();
            metadata.put("stripePaymentIntentId", paymentIntent.getId());
            metadata.put("clientSecret", paymentIntent.getClientSecret());
            payment = paymentRepository.save(payment);

            return StripePaymentResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(order.getId())
                    .orderCode(order.getOrderCode())
                    .clientSecret(paymentIntent.getClientSecret())
                    .paymentIntentId(paymentIntent.getId())
                    .amount(order.getTotalAmount())
                    .currency("VND")
                    .status(paymentIntent.getStatus())
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating PaymentIntent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment: " + e.getMessage());
        }
    }

    /**
     * Create a Checkout Session for Stripe hosted checkout page
     */
    @Transactional
    public StripePaymentResponse createCheckoutSession(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        try {
            // Build line items from order
            SessionCreateParams.LineItem.PriceData.ProductData productData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName("Đơn hàng " + order.getOrderCode())
                            .setDescription("Thanh toán đơn hàng PhanKid")
                            .build();

            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("vnd")
                            .setUnitAmount(order.getTotalAmount().longValue())
                            .setProductData(productData)
                            .build();

            SessionCreateParams.LineItem lineItem =
                    SessionCreateParams.LineItem.builder()
                            .setPriceData(priceData)
                            .setQuantity(1L)
                            .build();

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?code=" + order.getOrderCode() + "&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl + "?cancelled=true")
                    .addLineItem(lineItem)
                    .putMetadata("orderId", order.getId().toString())
                    .putMetadata("orderCode", order.getOrderCode())
                    .build();

            Session session = Session.create(params);
            log.info("Created Checkout Session: {} for order: {}", session.getId(), order.getOrderCode());

            // Create or update payment record
            Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
            if (payment == null) {
                payment = Payment.builder()
                        .order(order)
                        .transactionId(generateTransactionId())
                        .gateway(PaymentGateway.STRIPE)
                        .gatewayTransactionId(session.getId())
                        .amount(order.getTotalAmount())
                        .currency("VND")
                        .status(PaymentStatus.PENDING)
                        .build();
            } else {
                payment.setGatewayTransactionId(session.getId());
            }

            Map<String, Object> metadata = payment.getMetadata();
            metadata.put("stripeSessionId", session.getId());
            metadata.put("checkoutUrl", session.getUrl());
            payment = paymentRepository.save(payment);

            return StripePaymentResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(order.getId())
                    .orderCode(order.getOrderCode())
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .amount(order.getTotalAmount())
                    .currency("VND")
                    .status("pending")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating Checkout Session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
        }
    }

    /**
     * Handle Stripe webhook events
     */
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            throw new RuntimeException("Invalid webhook signature");
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            default:
                log.info("Unhandled event type: {}", event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        
        if (paymentIntent == null) {
            log.error("PaymentIntent is null in webhook");
            return;
        }

        log.info("PaymentIntent succeeded: {}", paymentIntent.getId());
        
        Payment payment = paymentRepository.findByGatewayTransactionId(paymentIntent.getId())
                .orElse(null);
        
        if (payment != null) {
            payment.markAsSuccess(paymentIntent.getId());
            payment.getOrder().setStatus(OrderStatus.PAID);
            paymentRepository.save(payment);
            orderRepository.save(payment.getOrder());
            log.info("Updated payment and order status for: {}", payment.getOrder().getOrderCode());
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        
        if (paymentIntent == null) return;

        log.info("PaymentIntent failed: {}", paymentIntent.getId());
        
        Payment payment = paymentRepository.findByGatewayTransactionId(paymentIntent.getId())
                .orElse(null);
        
        if (payment != null) {
            String failureMessage = paymentIntent.getLastPaymentError() != null 
                    ? paymentIntent.getLastPaymentError().getMessage() 
                    : "Payment failed";
            payment.markAsFailed(failureMessage);
            paymentRepository.save(payment);
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        
        if (session == null) {
            log.error("Session is null in webhook");
            return;
        }

        log.info("Checkout session completed: {}", session.getId());
        
        Payment payment = paymentRepository.findByGatewayTransactionId(session.getId())
                .orElse(null);
        
        if (payment != null && session.getPaymentStatus().equals("paid")) {
            payment.markAsSuccess(session.getPaymentIntent());
            payment.getOrder().setStatus(OrderStatus.PAID);
            paymentRepository.save(payment);
            orderRepository.save(payment.getOrder());
            log.info("Updated payment and order status for checkout session: {}", session.getId());
        }
    }

    /**
     * Verify payment status by PaymentIntent ID
     */
    @Transactional
    public StripePaymentResponse verifyPayment(String paymentIntentId) {
        try {
            log.info("Verifying payment for PaymentIntent: {}", paymentIntentId);
            
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            log.info("Stripe PaymentIntent status: {}", paymentIntent.getStatus());
            
            Payment payment = paymentRepository.findByGatewayTransactionId(paymentIntentId)
                    .orElseThrow(() -> new EntityNotFoundException("Payment not found for: " + paymentIntentId));

            // Fetch order separately to avoid lazy loading issues
            Order order = orderRepository.findById(payment.getOrder().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Order not found"));

            // Update status if successful
            if ("succeeded".equals(paymentIntent.getStatus()) && payment.getStatus() != PaymentStatus.SUCCESS) {
                log.info("Updating payment and order status to SUCCESS/PAID for order: {}", order.getOrderCode());
                
                payment.markAsSuccess(paymentIntentId);
                order.setStatus(OrderStatus.PAID);
                
                paymentRepository.save(payment);
                orderRepository.save(order);
                
                log.info("Successfully updated order {} to PAID status", order.getOrderCode());
            }

            return StripePaymentResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(order.getId())
                    .orderCode(order.getOrderCode())
                    .paymentIntentId(paymentIntentId)
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(paymentIntent.getStatus())
                    .build();

        } catch (StripeException e) {
            log.error("Error verifying payment: {}", e.getMessage());
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    private String generateTransactionId() {
        return "STRIPE-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
