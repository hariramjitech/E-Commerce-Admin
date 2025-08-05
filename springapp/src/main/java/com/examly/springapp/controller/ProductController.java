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
<<<<<<< HEAD
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
=======
    @Autowired
    private ProductService service;

    @PostMapping public Product create(@RequestBody Product p) {
        return service.create(p);
    }

    @GetMapping public List<Product> all() {
        return service.getAll();
    }

    @GetMapping("/{id}") public Product get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}") public Product update(@PathVariable Long id, @RequestBody Product p) {
        return service.update(id, p);
    }

    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) {
        service.delete(id);
    }
>>>>>>> 9042e3c80cea22a4c3ff8f71d49ba180d59f241a
}
