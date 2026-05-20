package com.example.wanderlog.Controller;

import com.example.wanderlog.Entities.Location;
import com.example.wanderlog.Services.LocationService;
import com.example.wanderlog.dto.EntityMapper;
import com.example.wanderlog.dto.LocationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @Autowired
    private EntityMapper entityMapper;
    // בדיקה שהכל עובד - GET /locations/hello
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello from WanderLog locations!";
    }

    // שליפת כל המיקומים - GET /locations
    @GetMapping
    public ResponseEntity<?> getLocations(){
        List<LocationDTO> locations = locationService.getAllLocations()
                .stream().map(entityMapper::toDTO).toList();
        return ResponseEntity.ok(locations);
    }

    // הוספת מיקום חדש - POST /locations/add
    // (השארתי את ה-/add כפי שכתבת, אבל שתדעי שנהוג להוריד אותו בפרויקטים גדולים)
    @PostMapping
    public ResponseEntity<?> addLocation(@RequestBody Location location) {
        Location savedLocation=locationService.addLocation(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(entityMapper.toDTO(savedLocation));
    }


    // עדכון מיקום - PUT /locations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @RequestBody Location details) {
        Location updatedLocation = locationService.updateLocation(id, details);
        return ResponseEntity.ok(entityMapper.toDTO(updatedLocation));
    }

    // מחיקת מיקום - DELETE /locations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok("המיקום נמחק בהצלחה");

    }
}