package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examly.springapp.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
