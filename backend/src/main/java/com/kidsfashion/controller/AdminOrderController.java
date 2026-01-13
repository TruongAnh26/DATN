package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.entity.Order;
import com.kidsfashion.entity.enums.OrderStatus;
import com.kidsfashion.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOrderController {

    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status);
                orders = orderRepository.findByStatus(orderStatus, pageRequest);
            } catch (Exception e) {
                orders = orderRepository.findAll(pageRequest);
            }
        } else {
            orders = orderRepository.findAll(pageRequest);
        }
        
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        String statusStr = request.get("status");
        if (statusStr != null && !statusStr.isEmpty()) {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
                // Use updateStatus method to handle timestamps
                order.updateStatus(newStatus);
                orderRepository.save(order);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status: " + statusStr));
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating status: " + e.getMessage()));
            }
        } else {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Status is required"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}

