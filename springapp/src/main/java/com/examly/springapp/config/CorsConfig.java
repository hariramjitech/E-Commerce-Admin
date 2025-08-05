package com.examly.springapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                            "http://localhost:8081", 
                            "https://8081-becabbbccbbfdfebebacdbf.premiumproject.examly.io"
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true); // Optional but good for cookies/auth
            }
        };
    }
}
