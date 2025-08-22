package com.examly.springapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @NotBlank(message = "Category name must be specified and cannot be empty")
    @Size(max = 100)
    @Column(unique = true)
    private String categoryName;

    @ManyToOne
    @JoinColumn(name = "parentCategoryId")
    private Category parentCategory;

    @Size(max = 2000)
    private String description;

    private String imageUrl;

    private Integer sortOrder = 0;

    private boolean isActive = true;

    private LocalDateTime createdDate = LocalDateTime.now();
}
