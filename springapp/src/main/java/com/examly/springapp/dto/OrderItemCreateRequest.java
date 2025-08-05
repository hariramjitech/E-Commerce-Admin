package com.examly.springapp.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemCreateRequest {
    @NotNull private Long productId;
    @Min(1) private int quantity;
}