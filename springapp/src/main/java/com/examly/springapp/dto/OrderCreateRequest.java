package com.examly.springapp.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {
    @NotBlank private String customerName;
    @Email @NotBlank private String customerEmail;
    @NotBlank private String shippingAddress;
    @NotEmpty private List<OrderItemCreateRequest> orderItems;
}