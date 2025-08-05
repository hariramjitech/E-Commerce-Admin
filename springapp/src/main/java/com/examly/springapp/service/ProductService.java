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

    public Product create(Product product) {
        if (product.getName() == null || product.getName().isBlank()
            || product.getPrice() == null || product.getPrice() < 0) {
            throw new IllegalArgumentException("Invalid product data");
        }
        return productRepository.save(product);
    }

    public List<Product> getFiltered(String category, Double minPrice, Double maxPrice) {
        List<Product> all = productRepository.findAll();
        return all.stream().filter(p -> {
            boolean ok = true;
            if (category != null && !category.isBlank())
                ok &= p.getCategory() != null && p.getCategory().equalsIgnoreCase(category);
            if (minPrice != null)
                ok &= p.getPrice() != null && p.getPrice() >= minPrice;
            if (maxPrice != null)
                ok &= p.getPrice() != null && p.getPrice() <= maxPrice;
            return ok;
        }).toList();
    }

    public Product get(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void updateStock(Long productId, int quantityChange) {
        Product product = get(productId);
        int newStock = product.getStockQuantity() + quantityChange;
        if (newStock < 0) throw new RuntimeException("Insufficient stock");
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }
}
