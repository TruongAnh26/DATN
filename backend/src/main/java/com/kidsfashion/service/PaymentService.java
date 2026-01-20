package com.kidsfashion.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.kidsfashion.dto.request.CreatePaymentRequest;
import com.kidsfashion.dto.response.PaymentResponse;
import com.kidsfashion.entity.Order;
import com.kidsfashion.entity.Payment;
import com.kidsfashion.entity.enums.PaymentGateway;
import com.kidsfashion.entity.enums.PaymentStatus;
import com.kidsfashion.repository.OrderRepository;
import com.kidsfashion.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${payment.vnpay.tmn-code:DEMO_TMN_CODE}")
    private String vnpayTmnCode;

    @Value("${payment.vnpay.hash-secret:DEMO_HASH_SECRET}")
    private String vnpayHashSecret;

    @Value("${payment.vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayUrl;

    @Value("${payment.vnpay.return-url:http://localhost:5173/payment/callback/vnpay?gateway=vnpay}")
    private String vnpayReturnUrl;

    @Value("${payment.momo.partner-code:DEMO_PARTNER_CODE}")
    private String momoPartnerCode;

    @Value("${payment.momo.access-key:DEMO_ACCESS_KEY}")
    private String momoAccessKey;

    @Value("${payment.momo.secret-key:DEMO_SECRET_KEY}")
    private String momoSecretKey;

    @Value("${payment.momo.url:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoUrl;

    @Value("${payment.momo.return-url:http://localhost:5173/payment/callback/momo?gateway=momo}")
    private String momoReturnUrl;

    @Value("${payment.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Test QR code generation (for debugging purposes)
     */
    public String testQRCodeGeneration() {
        log.info("=== Testing QR code generation ===");
        String testUrl = "https://test.example.com/pay?orderId=TEST123&amount=50000";
        return generateQRCode(testUrl);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found for order: " + orderId));
        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Determine gateway from order payment method
        PaymentGateway gateway = PaymentGateway.valueOf(order.getPaymentMethod());
        
        // Check if payment already exists
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        
        if (payment == null) {
            // Create new payment record
            String transactionId = generateTransactionId();
            payment = Payment.builder()
                    .order(order)
                    .transactionId(transactionId)
                    .gateway(gateway)
                    .amount(request.getAmount())
                    .currency("VND")
                    .status(PaymentStatus.PENDING)
                    .build();
            payment = paymentRepository.save(payment);
            log.info("Created new payment with ID: {}", payment.getId());
        } else {
            log.info("Found existing payment with ID: {}", payment.getId());
        }

        // Always generate payment URL and QR code (even for existing payments)
        String paymentUrl = null;
        String qrCode = null;

        try {
            // Generate payment URL based on gateway
            if (gateway == PaymentGateway.VNPAY) {
                paymentUrl = createVNPayPaymentUrl(payment, order);
                log.info("VNPay payment URL created, length: {}", paymentUrl != null ? paymentUrl.length() : 0);
            } else if (gateway == PaymentGateway.MOMO) {
                paymentUrl = createMoMoPaymentUrl(payment, order);
                log.info("MoMo payment URL created, length: {}", paymentUrl != null ? paymentUrl.length() : 0);
            }

            // Generate QR code from payment URL
            if (paymentUrl != null && !paymentUrl.isEmpty()) {
                log.info("Generating QR code for URL: {}", paymentUrl.substring(0, Math.min(100, paymentUrl.length())) + "...");
                qrCode = generateQRCode(paymentUrl);
                if (qrCode != null) {
                    log.info("QR code generated successfully, base64 length: {}", qrCode.length());
                } else {
                    log.error("QR code generation returned null");
                }
            } else {
                log.error("Payment URL is null or empty, cannot generate QR code");
            }
        } catch (Exception e) {
            log.error("Error creating payment URL or QR code: {}", e.getMessage(), e);
        }

        // Update payment metadata with URL and QR code
        Map<String, Object> metadata = payment.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
            log.warn("Payment metadata was null, initialized new HashMap");
        }
        if (paymentUrl != null) {
            metadata.put("paymentUrl", paymentUrl);
        }
        if (qrCode != null) {
            metadata.put("qrCode", qrCode);
            log.info("QR code stored in metadata, length: {}", qrCode.length());
        } else {
            log.warn("QR code is null, not storing in metadata");
        }
        payment = paymentRepository.save(payment);

        // Build and return response
        PaymentResponse response = mapToPaymentResponse(payment, paymentUrl, qrCode);
        log.info("Returning PaymentResponse - paymentUrl: {}, qrCode: {}", 
                response.getPaymentUrl() != null ? "Present" : "NULL",
                response.getQrCode() != null ? "Present (length: " + response.getQrCode().length() + ")" : "NULL");
        return response;
    }

    private String createVNPayPaymentUrl(Payment payment, Order order) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnpayTmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(new BigDecimal("100")).longValue()));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", payment.getTransactionId());
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

            // Sort params and create query string
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            boolean first = true;
            for (String fieldName : fieldNames) {
                String fieldValue = vnpParams.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    if (!first) {
                        hashData.append("&");
                        query.append("&");
                    }
                    hashData.append(fieldName).append("=").append(fieldValue);
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                         .append("=")
                         .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    first = false;
                }
            }

            // Create secure hash
            String vnpSecureHash = hmacSHA512(vnpayHashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(vnpSecureHash);

            return vnpayUrl + "?" + query.toString();
        } catch (Exception e) {
            log.error("Error creating VNPay URL", e);
            throw new RuntimeException("Failed to create VNPay payment URL", e);
        }
    }

    private String createMoMoPaymentUrl(Payment payment, Order order) {
        try {
            String requestId = payment.getTransactionId();
            String orderId = order.getOrderCode();
            long amount = payment.getAmount().longValue();
            String orderInfo = "Thanh toan don hang " + order.getOrderCode();
            String extraData = "";
            String ipnUrl = frontendUrl + "/api/payments/callback/momo";

            log.info("Creating MoMo payment - orderId: {}, amount: {}", orderId, amount);

            // Create raw signature (must be in alphabetical order)
            String rawSignature = "accessKey=" + momoAccessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + momoPartnerCode +
                    "&redirectUrl=" + momoReturnUrl +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";

            String signature = hmacSHA256(momoSecretKey, rawSignature);
            log.info("MoMo signature created");

            // Create request body
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("partnerCode", momoPartnerCode);
            requestBody.put("partnerName", "PhanKid");
            requestBody.put("storeId", "PhanKidStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", momoReturnUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", "captureWallet");
            requestBody.put("autoCapture", true);
            requestBody.put("signature", signature);

            // Check if we have real credentials
            if ("DEMO_PARTNER_CODE".equals(momoPartnerCode) || momoPartnerCode.startsWith("YOUR_") || momoPartnerCode.startsWith("DEMO")) {
                log.warn("Using demo MoMo credentials - returning demo payment URL");
                // For demo, return a simple URL that can be displayed as QR
                // In production, this should call the real MoMo API
                String demoUrl = frontendUrl + "/payment/momo-demo?orderId=" + orderId + 
                        "&amount=" + amount + 
                        "&orderInfo=" + URLEncoder.encode(orderInfo, StandardCharsets.UTF_8);
                log.info("Demo MoMo URL: {}", demoUrl);
                return demoUrl;
            }

            // Make actual API call to MoMo
            log.info("Calling MoMo API at: {}", momoUrl);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.info("MoMo request body: {}", jsonBody);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    momoUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            log.info("MoMo API response status: {}", response.getStatusCode());
            Map<String, Object> responseBody = response.getBody();
            log.info("MoMo API response: {}", responseBody);

            if (responseBody != null) {
                Integer resultCode = (Integer) responseBody.get("resultCode");
                if (resultCode != null && resultCode == 0) {
                    // Success - get payUrl
                    String payUrl = (String) responseBody.get("payUrl");
                    String qrCodeUrl = (String) responseBody.get("qrCodeUrl");
                    log.info("MoMo payUrl: {}, qrCodeUrl: {}", payUrl, qrCodeUrl);
                    
                    // Store gateway response
                    payment.setGatewayResponse(responseBody);
                    
                    // Prefer qrCodeUrl for QR scanning, fallback to payUrl
                    return qrCodeUrl != null ? qrCodeUrl : payUrl;
                } else {
                    String message = (String) responseBody.get("message");
                    log.error("MoMo API returned error: {} - {}", resultCode, message);
                    throw new RuntimeException("MoMo error: " + message);
                }
            }

            throw new RuntimeException("Empty response from MoMo API");
        } catch (Exception e) {
            log.error("Error creating MoMo URL: {}", e.getMessage(), e);
            // Fallback to demo URL on error
            String demoUrl = frontendUrl + "/payment/momo-demo?orderId=" + order.getOrderCode() + 
                    "&amount=" + payment.getAmount().longValue();
            log.info("Falling back to demo URL: {}", demoUrl);
            return demoUrl;
        }
    }

    private String generateQRCode(String data) {
        log.info("=== Starting QR code generation ===");
        try {
            if (data == null || data.isEmpty()) {
                log.error("Cannot generate QR code: data is null or empty");
                return null;
            }
            
            log.info("Input data length: {}", data.length());
            log.info("Input data preview: {}", data.substring(0, Math.min(100, data.length())));
            
            // Create QR code writer
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            log.info("QRCodeWriter created");
            
            // Set hints for better QR code
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);
            log.info("Hints set");

            // Generate QR code matrix
            int size = 250; // Fixed size for simplicity
            log.info("Encoding QR code with size: {}x{}", size, size);
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, size, size, hints);
            log.info("BitMatrix created: {}x{}", bitMatrix.getWidth(), bitMatrix.getHeight());
            
            // Convert to PNG bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] qrCodeBytes = outputStream.toByteArray();
            log.info("PNG bytes generated: {} bytes", qrCodeBytes.length);
            
            // Encode to Base64
            String base64 = Base64.getEncoder().encodeToString(qrCodeBytes);
            log.info("=== QR code generated successfully === Base64 length: {}", base64.length());
            
            return base64;
        } catch (WriterException e) {
            log.error("WriterException generating QR code: {}", e.getMessage());
            e.printStackTrace();
            return null;
        } catch (IOException e) {
            log.error("IOException generating QR code: {}", e.getMessage());
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            log.error("Unexpected error generating QR code: {} - {}", e.getClass().getName(), e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }

    private String hmacSHA256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating HMAC SHA256", e);
        }
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        String paymentUrl = (String) payment.getMetadata().get("paymentUrl");
        String qrCode = (String) payment.getMetadata().get("qrCode");
        return mapToPaymentResponse(payment, paymentUrl, qrCode);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment, String paymentUrl, String qrCode) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderCode(payment.getOrder().getOrderCode())
                .transactionId(payment.getTransactionId())
                .gateway(payment.getGateway())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentUrl(paymentUrl)
                .qrCode(qrCode)
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Transactional
    public PaymentResponse handleVNPayCallback(Map<String, String> params) {
        // Verify signature
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        
        for (String fieldName : fieldNames) {
            if (fieldName.startsWith("vnp_")) {
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append("=").append(fieldValue);
                    if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                        hashData.append("&");
                    }
                }
            }
        }

        String calculatedHash = hmacSHA512(vnpayHashSecret, hashData.toString());
        if (!calculatedHash.equals(vnpSecureHash)) {
            throw new RuntimeException("Invalid VNPay signature");
        }

        String transactionId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));

        if ("00".equals(responseCode)) {
            payment.markAsSuccess(params.get("vnp_TransactionNo"));
            payment.getOrder().setStatus(com.kidsfashion.entity.enums.OrderStatus.PAID);
        } else {
            payment.markAsFailed("VNPay response code: " + responseCode);
        }

        payment = paymentRepository.save(payment);
        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse handleMoMoCallback(Map<String, Object> params) {
        // TODO: Implement MoMo callback verification
        String orderId = (String) params.get("orderId");
        Integer resultCode = (Integer) params.get("resultCode");

        Payment payment = paymentRepository.findByOrderId(
                orderRepository.findByOrderCode(orderId)
                        .orElseThrow(() -> new EntityNotFoundException("Order not found"))
                        .getId())
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));

        if (resultCode != null && resultCode == 0) {
            payment.markAsSuccess((String) params.get("transId"));
            payment.getOrder().setStatus(com.kidsfashion.entity.enums.OrderStatus.PAID);
        } else {
            payment.markAsFailed("MoMo result code: " + resultCode);
        }

        payment = paymentRepository.save(payment);
        return mapToPaymentResponse(payment);
    }
}
