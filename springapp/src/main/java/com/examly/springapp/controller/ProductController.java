package com.examly.springapp.controller;

import com.examly.springapp.model.Product;
import com.examly.springapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {
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
}
