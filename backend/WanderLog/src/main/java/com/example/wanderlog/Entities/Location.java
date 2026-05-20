package com.example.wanderlog.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name="location")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true,nullable = false)
    private String googlePlaceId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;
    private String country;

    //קו רוחב
    private Double latitude;
    //קו אורך
    private Double longitude;

    @OneToMany(mappedBy = "location")
    @ToString.Exclude
    private List<JournalEntry>entries;


}
