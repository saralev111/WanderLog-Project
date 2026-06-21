package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.Location;
import com.example.wanderlog.Repositories.LocationRepo;
import com.example.wanderlog.exception.ResourceNotFoundException; // הוספת ייבוא
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    @Autowired
    private LocationRepo locationRepo;

    public List<Location> getAllLocations(){
        List<Location> list = locationRepo.findAll();
        if (list.isEmpty()){
            throw new RuntimeException("עדיין לא הוזנו מיקומים במערכת");
        }
        return list;
    }

    public Location addLocation(Location location){
        if(locationRepo.existsByGooglePlaceId(location.getGooglePlaceId())){
            throw new RuntimeException("המיקום הזה כבר קיים במערכת");
        }
        return locationRepo.save(location);
    }

    public Location updateLocation(Long id, Location details) {
        Location loc = locationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("שגיאה: מיקום עם ID " + id + " לא נמצא"));

        if (details.getName() != null) loc.setName(details.getName());
        if (details.getAddress() != null) loc.setAddress(details.getAddress());
        if (details.getCountry() != null) loc.setCountry(details.getCountry());

        return locationRepo.save(loc);
    }

    public void deleteLocation(Long id) {
        if(!locationRepo.existsById(id)) {
            // שינוי: 404
            throw new ResourceNotFoundException("לא ניתן למחוק: מיקום עם ID " + id + " לא נמצא");
        }
        locationRepo.deleteById(id);
    }
}