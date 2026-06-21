package com.example.wanderlog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isPublic")
    private boolean isPublic;
    private UserDTO user;
    private LocationDTO location;
    private String imageUrl;
}