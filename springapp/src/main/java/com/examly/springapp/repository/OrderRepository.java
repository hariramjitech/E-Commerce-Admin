package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examly.springapp.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
