package com.examly.springapp.controller;

import com.examly.springapp.dto.OrderCreateRequest;
import com.examly.springapp.model.Order;
import com.examly.springapp.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService service;

    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<Order>> all() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> byId(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        String status = req.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        service.deleteOrderById(id);
        return ResponseEntity.noContent().build();
    }
}
