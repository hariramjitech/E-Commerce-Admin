package com.examly.springapp.controller;

import com.examly.springapp.model.Product;
import com.examly.springapp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {
    @Autowired private ProductService service;

    @PostMapping public ResponseEntity<Product> create(@Valid @RequestBody Product p) {
        return new ResponseEntity<>(service.createProduct(p), HttpStatus.CREATED);
    }

    @GetMapping public List<Product> all() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}") public Product byId(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @PutMapping("/{id}") public Product update(@PathVariable Long id, @RequestBody Product p) {
        return service.updateProduct(id, p);
    }

    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}