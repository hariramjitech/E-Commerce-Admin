package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examly.springapp.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
