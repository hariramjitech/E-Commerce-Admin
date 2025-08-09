package com.examly.springapp.controller;

import com.examly.springapp.dto.OrderCreateRequest;
import com.examly.springapp.dto.OrderStatusUpdateRequest;
import com.examly.springapp.model.Order;
import com.examly.springapp.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        Order created = orderService.createOrder(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}
