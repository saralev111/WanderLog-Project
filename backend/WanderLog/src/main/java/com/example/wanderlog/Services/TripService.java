package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.Trip;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.Repositories.JournalEntryRepo;
import com.example.wanderlog.dto.TripDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TripService {
    @Autowired private TripRepo tripRepo;
    @Autowired private JournalEntryRepo journalEntryRepo;

    public Trip savePlannedTrip(TripDTO tripDTO, User currentUser) {
        Trip trip = new Trip();
        trip.setTitle(tripDTO.getTitle());
        trip.setUser(currentUser);

        // ✅ שולפים את כל היומנים הקיימים שהמשתמש בחר לפי ה-ID שלהם!
        // ככה אנחנו לא מייצרים שום עותק ולא נוגעים להם בסטטוס המקורי
        List<JournalEntry> existingEntries = journalEntryRepo.findAllById(tripDTO.getJournalEntryIds());

        trip.setJournalEntries(existingEntries);
        return tripRepo.save(trip);
    }
}