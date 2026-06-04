package com.example.wanderlog.dto;

import lombok.Data;
import java.util.List;

@Data
public class TripDTO {
    private Long id;
    private String title;

    // ✅ פשוט נקבל מה-React רשימה של מספרי ID של היומנים
    private List<Long> journalEntryIds;
    private List<JournalEntryDTO> journalEntries; // תוסיפי את זה
}