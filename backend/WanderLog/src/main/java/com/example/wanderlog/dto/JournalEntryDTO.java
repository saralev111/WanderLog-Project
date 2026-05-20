package com.example.wanderlog.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class JournalEntryDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private Integer rating;
    private String status;
    private Integer visitOrder;
    private UserDTO user;      // משתמש ב-DTO ולא ב-Entity!
    private LocationDTO location; // משתמש ב-DTO ולא ב-Entity!
}