package com.example.wanderlog.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "journalEntry")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "כותרת היומן לא יכולה להיות ריקה")
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    private String imageUrl;

    @Min(value = 1,message = "דירוג מינימלי הוא 1")
    @Max(value = 5,message = "דירוג מקסימלי הוא 5")
    private int rating;

    @Enumerated(EnumType.STRING)
    private TravelStatus status;
    
    @JsonProperty("isPublic")
    private boolean isPublic;

    @Column(name = "visit_order")
    private Integer visitOrder;

    @ManyToOne
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    @ManyToOne(cascade = jakarta.persistence.CascadeType.ALL)
    @JoinColumn(name = "location_id",nullable = false)
    private Location location;
}
