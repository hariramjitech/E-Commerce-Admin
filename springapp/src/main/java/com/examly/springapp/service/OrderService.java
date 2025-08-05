package com.examly.springapp.service;

import com.examly.springapp.dto.*;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {
    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductService productService;

    public Order create(OrderCreateRequest request) {
        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        for (OrderItemCreateRequest item : request.getOrderItems()) {
            Product p = productService.get(item.getProductId());
            productService.reduceStock(p.getId(), item.getQuantity());
            items.add(OrderItem.builder()
                    .product(p)
                    .order(order)
                    .quantity(item.getQuantity())
                    .priceAtPurchase(p.getPrice())
                    .build());
            total += p.getPrice() * item.getQuantity();
        }
        order.setOrderItems(items);
        order.setTotalAmount(total);
        return orderRepo.save(order);
    }

    public List<Order> getAll() {
        return orderRepo.findAll();
    }

    public Order get(Long id) {
        return orderRepo.findById(id).orElseThrow();
    }

    public Order updateStatus(Long id, String status) {
        Order order = get(id);
        order.setStatus(status);
        return orderRepo.save(order);
    }

    public void delete(Long id) {
        orderRepo.deleteById(id);
    }
}
