package com.examly.springapp.service;

import com.examly.springapp.dto.OrderCreateRequest;
import com.examly.springapp.dto.OrderItemCreateRequest;
import com.examly.springapp.dto.OrderStatusUpdateRequest;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ProductRepository;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

    public Order createOrder(OrderCreateRequest request) {
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        // Check and update stock for each item
        for (OrderItemCreateRequest itemReq : request.getOrderItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ValidationException("Product not found"));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new ValidationException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            double price = product.getPrice();
            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .priceAtPurchase(price)
                    .build();

            orderItems.add(item);
            total += price * itemReq.getQuantity();
        }

        // Save order first
        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(total)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Assign order reference to each item and save final order
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
        }

        savedOrder.setOrderItems(orderItems);
        return orderRepository.save(savedOrder);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateStatus(Long id, OrderStatusUpdateRequest statusRequest) {
        Order order = getOrderById(id);
        String newStatus = statusRequest.getStatus().toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new ValidationException("Invalid status");
        }
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);
        
        // Check if order can be cancelled
        if (!Set.of("PENDING", "PROCESSING").contains(order.getStatus())) {
            throw new ValidationException("Order cannot be cancelled in " + order.getStatus() + " status");
        }

        // Restore stock for each item
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        // Update order status to CANCELLED
        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}