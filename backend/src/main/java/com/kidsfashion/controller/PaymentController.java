package com.kidsfashion.controller;

import com.kidsfashion.dto.request.CreatePaymentRequest;
import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.dto.response.PaymentResponse;
import com.kidsfashion.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create payment for an order
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

    /**
     * VNPay payment callback
     */
    @GetMapping("/callback/vnpay")
    public ResponseEntity<ApiResponse<PaymentResponse>> vnpayCallback(
            @RequestParam Map<String, String> params) {
        PaymentResponse payment = paymentService.handleVNPayCallback(params);
        return ResponseEntity.ok(ApiResponse.success("Payment processed", payment));
    }

    /**
     * MoMo payment callback (IPN)
     */
    @PostMapping("/callback/momo")
    public ResponseEntity<ApiResponse<PaymentResponse>> momoCallback(
            @RequestBody Map<String, Object> params) {
        PaymentResponse payment = paymentService.handleMoMoCallback(params);
        return ResponseEntity.ok(ApiResponse.success("Payment processed", payment));
    }

    /**
     * Test QR code generation (for debugging)
     */
    @GetMapping("/test-qr")
    public ResponseEntity<ApiResponse<Map<String, String>>> testQRCode() {
        String qrCode = paymentService.testQRCodeGeneration();
        Map<String, String> result = new java.util.HashMap<>();
        result.put("qrCode", qrCode);
        result.put("status", qrCode != null ? "SUCCESS" : "FAILED");
        return ResponseEntity.ok(ApiResponse.success("QR code test", result));
    }
}
