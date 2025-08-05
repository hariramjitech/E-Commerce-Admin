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
    public ResponseEntity<Order> create(@Valid @RequestBody OrderCreateRequest r) {
        return new ResponseEntity<>(service.createOrder(r), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Order> all() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public Order byId(@PathVariable Long id) {
        return service.getOrderById(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(service.updateStatus(id, req.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        service.deleteOrderById(id);
        return ResponseEntity.noContent().build();
    }
}
