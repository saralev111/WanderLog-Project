package com.example.wanderlog.dto;

import com.example.wanderlog.Entities.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserName(user.getUserName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }

    public LocationDTO toDTO(Location location) {
        if (location == null) return null;
        LocationDTO dto = new LocationDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setAddress(location.getAddress());
        dto.setCountry(location.getCountry());
        dto.setLatitude(location.getLatitude());
        dto.setLongitude(location.getLongitude());
        dto.setGooglePlaceId(location.getGooglePlaceId());
        return dto;
    }

    public JournalEntryDTO toDTO(JournalEntry entry) {
        if (entry == null) return null;
        JournalEntryDTO dto = new JournalEntryDTO();
        dto.setId(entry.getId());
        dto.setTitle(entry.getTitle());
        dto.setDescription(entry.getDescription());
        dto.setDate(entry.getDate());
        dto.setRating(entry.getRating());
        dto.setStatus(entry.getStatus().name());
        dto.setImageUrl(entry.getImageUrl());
        dto.setVisitOrder(entry.getVisitOrder());
        dto.setPublic(entry.isPublic());
        // כאן הקסם קורה - אנחנו ממירים גם את האובייקטים הפנימיים
        dto.setUser(toDTO(entry.getUser()));
        dto.setLocation(toDTO(entry.getLocation()));

        return dto;
    }
}