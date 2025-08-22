package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @JsonProperty("id") // Expose as "id" in JSON, mapped from productId
    public Long getId() {
        return this.productId;
    }
    
    @JsonIgnore
    public Long getProductId() {
        return productId;
    }

    @NotBlank(message = "Product name must be 1-255 characters and cannot be empty")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Product description must be 1-2000 characters and cannot be empty")
    @Size(max = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01", message = "Price must be a positive number")
    private Double price;

    @NotBlank(message = "Category must be specified and cannot be empty")
    @Size(max = 100)
    private String category;

    @Min(value = 0, message = "Stock quantity must be a non-negative integer")
    private int stockQuantity;

    private String imageUrl;

    private String sku;

    private BigDecimal weight;

    private String dimensions;

    @JsonIgnore // Hide these fields from JSON serialization if not needed by clients
    private boolean isActive = true;

    @JsonIgnore
    private LocalDateTime createdDate = LocalDateTime.now();

    @JsonIgnore
    private LocalDateTime lastModified = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "createdBy")
    @JsonIgnore // Hide User details from JSON output for Product
    private User createdBy;
}
