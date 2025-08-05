package com.examly.springapp.service;

import com.examly.springapp.model.Product;
import com.examly.springapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public Product create(Product p) {
        return productRepository.save(p);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product get(Long id) {
        return productRepository.findById(id).orElseThrow();
    }

    public Product update(Long id, Product p) {
        p.setId(id);
        return productRepository.save(p);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    public void reduceStock(Long id, int qty) {
        Product p = get(id);
        if (p.getStockQuantity() < qty) throw new RuntimeException("Out of stock");
        p.setStockQuantity(p.getStockQuantity() - qty);
        productRepository.save(p);
    }
}
