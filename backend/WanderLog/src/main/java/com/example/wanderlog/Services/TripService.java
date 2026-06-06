package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.Trip;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Repositories.JournalEntryRepo;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.dto.TripDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepo tripRepo;

    @Autowired
    private JournalEntryRepo journalEntryRepo;

    @Transactional
    public Trip savePlannedTrip(TripDTO tripDTO, User user) {
        Trip trip = new Trip();
        trip.setTitle(tripDTO.getTitle());
        trip.setUser(user);

        // אם יש לנו יומנים במסלול, נשלוף ונסדר אותם
        if (tripDTO.getJournalEntryIds() != null && !tripDTO.getJournalEntryIds().isEmpty()) {
            List<JournalEntry> existingEntries = journalEntryRepo.findAllById(tripDTO.getJournalEntryIds());
            List<JournalEntry> orderedEntries = new ArrayList<>();
            int orderIndex = 1;

            // עוברים על מספרי ה-ID בדיוק לפי הסדר שהלקוח (React) שלח
            for (Long id : tripDTO.getJournalEntryIds()) {
                for (JournalEntry entry : existingEntries) {
                    // התיקון כאן: שימוש ב- == במקום .equals()
                    if (entry.getId() == id) {
                        entry.setVisitOrder(orderIndex); // קובעים את מיקום התחנה (1, 2, 3...)
                        orderedEntries.add(entry);
                        orderIndex++;
                        break;
                    }
                }
            }

            // שומרים את היומנים עם הסדר החדש שלהם
            journalEntryRepo.saveAll(orderedEntries);
            trip.setJournalEntries(orderedEntries);
        }

        return tripRepo.save(trip);
    }

    @Transactional
    public Trip updateTrip(Long tripId, TripDTO tripDTO) {
        // מציאת הטיול הקיים
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("טיול לא נמצא"));

        // עדכון השם
        trip.setTitle(tripDTO.getTitle());

        // עדכון היעדים (JournalEntries) ושמירה על סדר התחנות
        if (tripDTO.getJournalEntryIds() != null && !tripDTO.getJournalEntryIds().isEmpty()) {
            List<JournalEntry> existingEntries = journalEntryRepo.findAllById(tripDTO.getJournalEntryIds());
            List<JournalEntry> orderedEntries = new ArrayList<>();
            int orderIndex = 1;

            // סידור מחדש בדיוק כמו בשמירה
            for (Long id : tripDTO.getJournalEntryIds()) {
                for (JournalEntry entry : existingEntries) {
                    // התיקון כאן: שימוש ב- == במקום .equals()
                    if (entry.getId() == id) {
                        entry.setVisitOrder(orderIndex);
                        orderedEntries.add(entry);
                        orderIndex++;
                        break;
                    }
                }
            }

            journalEntryRepo.saveAll(orderedEntries);
            trip.setJournalEntries(orderedEntries);
        } else {
            // אם המשתמש מחק את כל התחנות מהטיול
            trip.getJournalEntries().clear();
        }

        return tripRepo.save(trip);
    }
}