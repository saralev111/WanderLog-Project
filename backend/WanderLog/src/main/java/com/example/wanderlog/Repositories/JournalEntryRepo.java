package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.TravelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface JournalEntryRepo extends JpaRepository<JournalEntry,Long> {
    // שליפת כל הרשומות ששייכות למשתמש מסוים לפי ה-ID שלו
    Page<JournalEntry> findByUserId(long userId, Pageable pageable);
    // שליפת כל הרשומות שהמשתמש בחר לשתף כציבוריות (למשל עבור "פיד" קהילתי)
    Page<JournalEntry> findByIsPublicTrue(Pageable pageable);
    // שליפת כל הרשומות שנכתבו על מיקום מסוים
    List<JournalEntry> findByLocationId(Long locationId);

    // אופציונלי: שליפת כל הרשומות של משתמש מסוים בסטטוס ספציפי (למשל רק מה שהוא "ביקר" בו)
    List<JournalEntry> findByUserIdAndStatus(Long userId, TravelStatus status);

    List<JournalEntry> findByLocation_CountryIgnoreCase(String country);

    List<JournalEntry> findByRatingGreaterThanEqual(int rating);

    List<JournalEntry> findByTitleContainingIgnoreCase(String keyWord);

}
