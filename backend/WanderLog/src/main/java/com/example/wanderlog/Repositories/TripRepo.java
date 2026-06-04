package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepo extends JpaRepository<Trip, Long> {
    // פונקציה שתעזור לנו בעתיד להציג לכל משתמש רק את הטיולים שלו
    List<Trip> findByUserId(Long userId);
}