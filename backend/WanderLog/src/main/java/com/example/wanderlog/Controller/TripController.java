package com.example.wanderlog.Controller;

import com.example.wanderlog.Entities.Trip;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.Repositories.UserRepo;
import com.example.wanderlog.Services.TripService;
import com.example.wanderlog.dto.TripDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TripRepo tripRepo;

    @PostMapping("/save-planned")
    public ResponseEntity<?> savePlannedTrip(@RequestBody TripDTO tripDTO, Authentication authentication) {
        try {
            // 1. זיהוי המשתמש המחובר כרגע (לפי הטוקן שהוא שלח)
            User user = userRepo.findByUserName(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("משתמש לא נמצא"));

            // 2. שמירת הטיול ויצירת יומני המסע (דרך ה-Service שכתבנו קודם)
            Trip savedTrip = tripService.savePlannedTrip(tripDTO, user);

            // 3. החזרת תשובה מוצלחת ללקוח
            return ResponseEntity.ok("הטיול '" + savedTrip.getTitle() + "' נשמר בהצלחה עם " + savedTrip.getJournalEntries().size() + " תחנות במסלול!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("שגיאה בשמירת הטיול: " + e.getMessage());
        }
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllTrips() {
        // מביאים את כל הטיולים מהדאטה-בייס
        List<Trip> trips = tripRepo.findAll();

        // כדי למנוע שגיאות של JSON אינסופי, נמיר אותם ל-DTO פשוט:
        List<TripDTO> tripDTOs = trips.stream().map(trip -> {
            TripDTO dto = new TripDTO();
            dto.setId(trip.getId());
            dto.setTitle(trip.getTitle());
            // (בעתיד אפשר להוסיף כאן גם את רשימת היעדים/תמונות אם תרצי)
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(tripDTOs);
    }
}