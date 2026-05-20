package com.example.wanderlog.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String userName;
    private String email;
    private String role;
}