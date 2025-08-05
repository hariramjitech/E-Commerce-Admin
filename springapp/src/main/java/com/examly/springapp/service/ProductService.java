package com.examly.springapp.service;

import com.examly.springapp.model.Product;
import com.examly.springapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        if (product.getPrice() < 0 || product.getName() == null || product.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product data");
        }
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // public List<Product> getFilteredProducts(String category, Double minPrice, Double maxPrice) {
    //     return productRepository.findAll().stream().filter(p -> {
    //         boolean matches = true;
    //         if (category != null) matches &= p.getCategory().equalsIgnoreCase(category);
    //         if (minPrice != null) matches &= p.getPrice() >= minPrice;
    //         if (maxPrice != null) matches &= p.getPrice() <= maxPrice;
    //         return matches;
    //     }).toList();
    // }
    public List<Product> getFilteredProducts(String category, Double minPrice, Double maxPrice) {
    List<Product> all = productRepository.findAll();
    return all.stream().filter(p ->
        (category == null || p.getCategory().equalsIgnoreCase(category)) &&
        (minPrice == null || p.getPrice() >= minPrice) &&
        (maxPrice == null || p.getPrice() <= maxPrice)
    ).toList();
}


    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setCategory(updatedProduct.getCategory());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        existing.setImageUrl(updatedProduct.getImageUrl());

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}
