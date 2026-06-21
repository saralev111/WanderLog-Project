package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.TravelStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface JournalEntryRepo extends JpaRepository<JournalEntry,Long> {

    List<JournalEntry> findAllByUserId(long userId, Sort sort);

    Page<JournalEntry> findByIsPublicTrue(Pageable pageable);

    List<JournalEntry> findByLocationId(Long locationId);


    List<JournalEntry> findByLocation_CountryIgnoreCase(String country);

    List<JournalEntry> findByRatingGreaterThanEqual(int rating);


    List<JournalEntry> findByTitleContainingIgnoreCase(String keyWord);

}
