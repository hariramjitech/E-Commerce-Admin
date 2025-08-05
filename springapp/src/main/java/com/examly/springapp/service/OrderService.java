<<<<<<< HEAD
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
            order.setStatus("PLACED"); // changed from PENDING to PLACED (as per test)
            order.setOrderDate(LocalDateTime.now());

            List<OrderItem> items = request.getOrderItems().stream().map(i -> {
                Product product = productRepo.findById(i.getProductId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));

                if (product.getStockQuantity() < i.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
                }

                product.setStockQuantity(product.getStockQuantity() - i.getQuantity());
                productRepo.save(product);

                return new OrderItem(
                        null,
                        product.getId(),
                        i.getQuantity(),
                        product.getPrice(),
                        order
                );
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
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        }

        public Order updateStatus(Long id, String status) {
            Order order = orderRepo.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

            List<String> validStatuses = List.of("PLACED", "SHIPPED", "DELIVERED", "CANCELLED");
            if (!validStatuses.contains(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
=======
package com.examly.springapp.service;

import com.examly.springapp.dto.OrderCreateRequest;
import com.examly.springapp.dto.OrderItemCreateRequest;
import com.examly.springapp.model.Order;
import com.examly.springapp.model.OrderItem;
import com.examly.springapp.model.Product;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order createOrder(OrderCreateRequest request) {
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (OrderItemCreateRequest item : request.getOrderItems()) {
            Optional<Product> optionalProduct = productRepository.findById(item.getProductId());
            if (optionalProduct.isEmpty()) {
                throw new RuntimeException("Product not found");
            }
            Product product = optionalProduct.get();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock");
            }
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
            orderItems.add(orderItem);
            total += product.getPrice() * item.getQuantity();
        }

        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .status("PENDING")
                .totalAmount(total)
                .orderDate(LocalDateTime.now())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }

    public Order updateStatus(Long id, String status) {
        List<String> validStatuses = Arrays.asList("PENDING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status)) {
            throw new RuntimeException("Invalid status");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
>>>>>>> 7fb70bff8daee48d13d2bd12785c87f71f44df63

            order.setStatus(status);
            return orderRepo.save(order);
        }

<<<<<<< HEAD
        public void deleteOrderById(Long id) {
            if (!orderRepo.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
            }
            orderRepo.deleteById(id);
        }
=======
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
>>>>>>> 7fb70bff8daee48d13d2bd12785c87f71f44df63
    }
