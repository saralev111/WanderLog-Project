package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepo extends JpaRepository<Trip, Long> {

    List<Trip> findByUserId(Long userId);

    List<Trip> findByJournalEntriesContaining(JournalEntry entry);
}