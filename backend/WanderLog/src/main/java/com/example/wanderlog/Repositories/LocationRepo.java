package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocationRepo extends JpaRepository<Location, Long> {
    boolean existsByGooglePlaceId(String googlePlaceId);
    Optional<Location> findByGooglePlaceId(String googlePlaceId);
}
