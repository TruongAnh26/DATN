package com.kidsfashion.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderRequest {

    // For guest orders
    @Email(message = "Invalid email format")
    private String guestEmail;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 150)
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    @Size(max = 20)
    private String recipientPhone;

    @NotBlank(message = "Province is required")
    @Size(max = 100)
    private String shippingProvince;

    @NotBlank(message = "District is required")
    @Size(max = 100)
    private String shippingDistrict;

    @NotBlank(message = "Ward is required")
    @Size(max = 100)
    private String shippingWard;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String shippingAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String shippingMethod;

    @Size(max = 500)
    private String notes;

    // Optional: use saved address
    private Long addressId;
}

