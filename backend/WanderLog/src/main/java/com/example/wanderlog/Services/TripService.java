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

        // הקסם האמיתי: אנחנו לוקחים את מספרי ה-ID שה-React שלח,
        // מוצאים את היומנים המקוריים בדאטה-בייס, ומחברים אותם אל הטיול!
        if (tripDTO.getJournalEntryIds() != null && !tripDTO.getJournalEntryIds().isEmpty()) {
            List<JournalEntry> entries = journalEntryRepo.findAllById(tripDTO.getJournalEntryIds());
            trip.setJournalEntries(entries);
        }

        return tripRepo.save(trip);
    }
}