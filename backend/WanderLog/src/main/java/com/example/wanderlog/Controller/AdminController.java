package com.example.wanderlog.Controller;


import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Services.JournalEntryService;
import com.example.wanderlog.Services.UserService;
import com.example.wanderlog.dto.EntityMapper;
import com.example.wanderlog.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private EntityMapper entityMapper;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();

        // הפיכת רשימת ה-Entities לרשימה של DTOs
        List<UserDTO> userDTOs = users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setUserName(user.getUserName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole().name());
            return dto;
        }).toList();

        return ResponseEntity.ok(userDTOs);
    }

    // 2. מחיקת יומן של כל משתמש (למשל אם יש תוכן פוגעני)
    @DeleteMapping("/entry/{id}")
    public ResponseEntity<String> deleteAnyEntry(@PathVariable Long id) {
        journalEntryService.deleteEntry(id);
        return ResponseEntity.ok("היומן נמחק בהצלחה על ידי המנהל.");
    }

    // 3. חסימת/מחיקת משתמש
    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok("המשתמש הוסר מהמערכת.");
    }
}