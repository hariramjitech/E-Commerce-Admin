package com.examly.springapp.service;

import com.examly.springapp.dto.*;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    private static final Set<String> VALID_STATUSES = Set.of(
        "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
    );

    // CREATE ORDER
    public Order createOrder(OrderCreateRequest request) {
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        for (OrderItemCreateRequest itemReq : request.getOrderItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ValidationException("Product not found"));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new ValidationException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            orderItems.add(item);
            total += product.getPrice() * itemReq.getQuantity();
        }

        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(total)
                .orderItems(orderItems)
                .build();

        return orderRepository.save(order);
    }

    // GET ALL ORDERS
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // GET ORDER BY ID
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // UPDATE STATUS
    public Order updateStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = getOrderById(id);
        String newStatus = request.getStatus().toUpperCase();

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new ValidationException("Invalid status. Allowed values: " + VALID_STATUSES);
        }

        // Prevent invalid transitions
        if (order.getStatus().equals("DELIVERED")) {
            throw new ValidationException("Cannot change status of delivered order");
        }

        if (newStatus.equals("CANCELLED") && 
            !Set.of("PENDING", "PROCESSING").contains(order.getStatus())) {
            throw new ValidationException("Can only cancel PENDING or PROCESSING orders");
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // CANCEL ORDER (Dedicated method)
    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);
        String currentStatus = order.getStatus().toUpperCase();

        if (!Set.of("PENDING", "PROCESSING").contains(currentStatus)) {
            throw new ValidationException(
                "Order cannot be cancelled in status: " + currentStatus + 
                ". Only PENDING/PROCESSING orders can be cancelled."
            );
        }

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    // DELETE ORDER
    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}