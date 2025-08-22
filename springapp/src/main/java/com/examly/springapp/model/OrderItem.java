package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore // Avoid full product serialization to prevent recursion and oversized payloads
    private Product product;

    @Transient // Not persisted, used only for JSON serialization/deserialization of productId
    private Long productId;

    private Integer quantity;

    private Double priceAtPurchase;

    @JsonProperty("productId") // Controls JSON property name for serialization/deserialization of productId
    public Long getProductId() {
        if (product != null) {
            return product.getProductId();
        }
        return productId;
    }

    @JsonProperty("productId")
    public void setProductId(Long productId) {
        this.productId = productId;
        // Clear product reference; will be set later in service layer after lookup by productId
        this.product = null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference // Paired with Order's @JsonManagedReference to handle bidirectional JSON serialization
    private Order order;

    public Long getId() {
        return id;
    }
}
