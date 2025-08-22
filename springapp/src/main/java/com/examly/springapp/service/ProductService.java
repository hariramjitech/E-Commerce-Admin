// ProductService.java

package com.examly.springapp.service;

import com.examly.springapp.model.Product;
import com.examly.springapp.repository.ProductRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final Validator validator;

    public Product createProduct(Product product) {
        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Product product) {
        if (!productRepository.existsById(product.getProductId())) {
            throw new RuntimeException("Product not found");
        }
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Filtering with Double type minPrice and maxPrice as in test cases
    public List<Product> getFilteredProducts(String category, Double minPrice, Double maxPrice) {
        List<Product> allProducts = productRepository.findAll();

        return allProducts.stream()
                .filter(p -> category == null || p.getCategory().equalsIgnoreCase(category))
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .toList();
    }
}
