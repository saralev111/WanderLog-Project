package com.example.wanderlog.Controller;

import com.example.wanderlog.Entities.Trip;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.Repositories.UserRepo;
import com.example.wanderlog.Services.TripService;
import com.example.wanderlog.dto.TripDTO;
import com.example.wanderlog.dto.EntityMapper; // ✅ הוספת ייבוא של המאפר
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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

    @Autowired
    private EntityMapper entityMapper; // ✅ הזרקת המאפר כדי להמיר יומנים ל-DTO

    @PostMapping("/save-planned")
    public ResponseEntity<?> savePlannedTrip(@RequestBody TripDTO tripDTO, Authentication authentication) {
        try {
            User user = userRepo.findByUserName(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("משתמש לא נמצא"));

            Trip savedTrip = tripService.savePlannedTrip(tripDTO, user);

            return ResponseEntity.ok(Map.of(
                    "message", "הטיול '" + savedTrip.getTitle() + "' נשמר בהצלחה עם " + savedTrip.getJournalEntries().size() + " תחנות במסלול!"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "שגיאה בשמירת הטיול: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllTrips(Authentication authentication) {
        // 1. מוצאים מי המשתמש שמחובר כרגע למערכת לפי הטוקן שלו
        User currentUser = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("משתמש לא נמצא"));

        // 2. התיקון: שולפים מהדאטה-בייס רק את הטיולים ששייכים למשתמש הספציפי הזה!
        List<Trip> trips = tripRepo.findByUserId(currentUser.getId());

        // 3. ממירים את הטיולים ל-DTO כפי שהיה קודם
        List<TripDTO> tripDTOs = trips.stream().map(trip -> {
            TripDTO dto = new TripDTO();
            dto.setId(trip.getId());
            dto.setTitle(trip.getTitle());

            // ממירים ומחזירים את כל היומנים/התחנות המשויכים לטיול הזה
            if (trip.getJournalEntries() != null) {
                dto.setJournalEntries(trip.getJournalEntries().stream()
                        .map(entityMapper::toDTO)
                        .collect(Collectors.toList()));
            }
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(tripDTOs);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @RequestBody TripDTO tripDTO, Authentication authentication) {
        try {
            // (אופציונלי: אפשר לבדוק כאן שהטיול שייך למשתמש הנוכחי)
            Trip updatedTrip = tripService.updateTrip(id, tripDTO);

            return ResponseEntity.ok(Map.of(
                    "message", "הטיול '" + updatedTrip.getTitle() + "' עודכן בהצלחה!"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "שגיאה בעדכון הטיול: " + e.getMessage()));
        }
    }
}