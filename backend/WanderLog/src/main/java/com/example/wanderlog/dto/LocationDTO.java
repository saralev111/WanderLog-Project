package com.example.wanderlog.dto;

import lombok.Data;

@Data
public class LocationDTO {
    private Long id;
    private String name;
    private String address;
    private String country;
    private Double latitude;
    private Double longitude;
    private String googlePlaceId;
}