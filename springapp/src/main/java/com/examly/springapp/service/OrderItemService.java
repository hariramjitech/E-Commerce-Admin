// OrderItemService.java

package com.examly.springapp.service;

import com.examly.springapp.model.OrderItem;
import com.examly.springapp.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public Optional<OrderItem> getOrderItemById(Long id) {
        return orderItemRepository.findById(id);
    }

    public OrderItem addOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    public OrderItem updateOrderItem(Long id, OrderItem updatedOrderItem) {
        Optional<OrderItem> optionalItem = orderItemRepository.findById(id);
        if (optionalItem.isPresent()) {
            OrderItem item = optionalItem.get();
            item.setProduct(updatedOrderItem.getProduct());
            item.setQuantity(updatedOrderItem.getQuantity());
            item.setPriceAtPurchase(updatedOrderItem.getPriceAtPurchase());
            item.setOrder(updatedOrderItem.getOrder());
            return orderItemRepository.save(item);
        }
        return null;
    }

    public boolean deleteOrderItem(Long id) {
        if (orderItemRepository.existsById(id)) {
            orderItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
