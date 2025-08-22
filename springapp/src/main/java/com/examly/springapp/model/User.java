package com.examly.springapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank(message = "Username cannot be blank")
    @Size(max = 50)
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Size(max = 15)
    private String phone;

    @Size(max = 50)
    private String department;

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime lastLogin;

    private boolean isActive = true;
    private boolean emailVerified = false;
}

