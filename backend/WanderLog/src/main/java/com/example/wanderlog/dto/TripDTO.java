package com.example.wanderlog.dto;

import lombok.Data;
import java.util.List;

@Data
public class TripDTO {
    private Long id;
    private String title;

    private List<Long> journalEntryIds;
    private List<JournalEntryDTO> journalEntries;
}