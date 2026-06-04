package com.example.wanderlog.Entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ התיקון: קשר של רבים לרבים! הטיול אוסף יומנים קיימים
    @ManyToMany
    @JoinTable(
            name = "trip_journal_entries",
            joinColumns = @JoinColumn(name = "trip_id"),
            inverseJoinColumns = @JoinColumn(name = "journal_entry_id")
    )
    private List<JournalEntry> journalEntries = new ArrayList<>();
}