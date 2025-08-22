package com.examly.springapp.service;

import com.examly.springapp.model.Order;
import com.examly.springapp.model.OrderItem;
import com.examly.springapp.model.Product;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ProductRepository;
import jakarta.transaction.Transactional;
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

    private static final Set<String> VALID_STATUSES = new HashSet<>(Arrays.asList(
            "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"
    ));

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order createOrder(Map<String, Object> orderPayload) {
        String customerName = (String) orderPayload.get("customerName");
        String customerEmail = (String) orderPayload.get("customerEmail");
        String shippingAddress = (String) orderPayload.get("shippingAddress");
        List<Map<String, Object>> orderItemsData = (List<Map<String, Object>>) orderPayload.get("orderItems");

        Order order = new Order();
        order.setCustomerName(customerName);
        order.setCustomerEmail(customerEmail);
        order.setShippingAddress(shippingAddress);
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (Map<String, Object> itemData : orderItemsData) {
            Long productId = ((Number) itemData.get("productId")).longValue();
            int quantity = ((Number) itemData.get("quantity")).intValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            if (product.getStockQuantity() < quantity) {
                throw new IllegalArgumentException("Insufficient stock");
            }

            OrderItem item = new OrderItem();
            item.setProductId(productId);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPriceAtPurchase(product.getPrice());
            item.setOrder(order);
            orderItems.add(item);

            totalAmount += product.getPrice() * quantity;
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    @Transactional
    public Order addOrder(Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");

        if (order.getOrderItems() != null) {
            // First, validate stock for all items
            for (OrderItem item : order.getOrderItems()) {
                Long productId = item.getProductId();
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock");
                }
            }

            // If all validations pass, then update stock and build the order
            double total = 0.0;
            for (OrderItem item : order.getOrderItems()) {
                Long productId = item.getProductId();
                Product product = productRepository.findById(productId).get(); // We know it exists from the first loop

                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);

                double price = product.getPrice();
                item.setPriceAtPurchase(price);
                item.setOrder(order);
                item.setProduct(product);

                total += price * item.getQuantity();
            }

            order.setTotalAmount(total);
        } else {
            order.setTotalAmount(0.0);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrder(Long id, Order updatedOrder) {
        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();

            order.setCustomerName(updatedOrder.getCustomerName());
            order.setCustomerEmail(updatedOrder.getCustomerEmail());
            order.setShippingAddress(updatedOrder.getShippingAddress());
            order.setStatus(updatedOrder.getStatus());
            order.setOrderDate(updatedOrder.getOrderDate());

            // Handle order items update
            if (updatedOrder.getOrderItems() != null) {
                // Clear old items
                order.getOrderItems().clear();
                double total = 0.0;
                for (OrderItem item : updatedOrder.getOrderItems()) {
                    Long productId = item.getProductId();
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    item.setProduct(product);
                    item.setOrder(order);
                    if (item.getPriceAtPurchase() == null) {
                        item.setPriceAtPurchase(item.getProduct().getPrice());
                    }
                    order.getOrderItems().add(item);
                    total += item.getPriceAtPurchase() * item.getQuantity();
                }
                order.setTotalAmount(total);
            }

            return orderRepository.save(order);
        }
        return null;
    }

    public boolean deleteOrder(Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status");
        }

        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
}