package com.examly.springapp.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
public class OrderCreateRequest {
    @NotBlank
    private String customerName;

    @Email
    private String customerEmail;

    @NotBlank
    private String shippingAddress;

    @NotEmpty
    private List<OrderItemCreateRequest> orderItems;
}
