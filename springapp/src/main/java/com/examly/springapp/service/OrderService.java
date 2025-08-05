package com.examly.springapp.service;

import com.examly.springapp.dto.OrderCreateRequest;
import com.examly.springapp.dto.OrderItemCreateRequest;
import com.examly.springapp.model.Order;
import com.examly.springapp.model.OrderItem;
import com.examly.springapp.model.Product;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    public Order createOrder(OrderCreateRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        List<OrderItem> items = request.getOrderItems().stream().map(i -> {
            Product product = productRepo.findById(i.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product ID " + i.getProductId() + " not found"));

            if (product.getStockQuantity() < i.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for product: " + product.getName());
            }

            // Reduce product stock
            product.setStockQuantity(product.getStockQuantity() - i.getQuantity());
            productRepo.save(product);

            return OrderItem.builder()
                    .product(product)
                    .quantity(i.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .order(order)
                    .build();
        }).collect(Collectors.toList());

        double total = items.stream()
                .mapToDouble(i -> i.getPriceAtPurchase() * i.getQuantity())
                .sum();

        order.setTotalAmount(total);
        order.setOrderItems(items);

        return orderRepo.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order ID " + id + " not found"));
    }

    public Order updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order ID " + id + " not found"));

        List<String> validStatuses = List.of("PENDING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        order.setStatus(status.toUpperCase());
        return orderRepo.save(order);
    }

    public void deleteOrderById(Long id) {
        if (!orderRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order ID " + id + " not found");
        }
        orderRepo.deleteById(id);
    }
}
