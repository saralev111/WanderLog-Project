package com.example.wanderlog.Controller;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Services.AiRecommendationService;
import com.example.wanderlog.Services.JournalEntryService;
import com.example.wanderlog.dto.EntityMapper;
import com.example.wanderlog.dto.JournalEntryDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.wanderlog.dto.RouteRequest;


import java.util.List;

@RestController
@RequestMapping("/journals")
public class JournalEntryController {

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private EntityMapper entityMapper;

    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JournalEntryDTO> createWithImage(
            @RequestPart("entry") String entryJson,
            @RequestPart("image") MultipartFile image) throws Exception { // הוספת throws Exception

        //  הפיכת ה-JSON לאובייקט
        ObjectMapper objectMapper = new ObjectMapper();
        // חשוב: אם יש לך תאריכים (LocalDate), צריך לרשום מודול מתאים ב-ObjectMapper
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        JournalEntry entry = objectMapper.readValue(entryJson, JournalEntry.class);

        //  שמירת התמונה וקבלת הנתיב
        String imagePath = journalEntryService.saveImage(image);
        entry.setImageUrl(imagePath);

        //  שמירת היומן
        JournalEntry savedEntry = journalEntryService.addEntry(entry);

        return ResponseEntity.ok(entityMapper.toDTO(savedEntry));
    }

    @PostMapping
    public ResponseEntity<?> addEntry(@Valid @RequestBody JournalEntry journalEntry){
        JournalEntry savedEntry=journalEntryService.addEntry(journalEntry);
        return ResponseEntity.status(HttpStatus.CREATED).body(entityMapper.toDTO(savedEntry));

    }

    @GetMapping("/public")
    public ResponseEntity<Page<JournalEntryDTO>> getPublicEntries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<JournalEntryDTO> dtos = journalEntryService.getPublicEntries(page, size)
                .map(entityMapper::toDTO);

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my-entries")
    public ResponseEntity<List<JournalEntryDTO>> getMyEntries() {

        List<JournalEntryDTO> dtos = journalEntryService.getMyEntries()
                .stream()
                .map(entityMapper::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntry(@PathVariable Long id,@Valid @RequestBody JournalEntry details) {
        JournalEntry updated = journalEntryService.updateEntry(id, details);
        return ResponseEntity.ok(entityMapper.toDTO(updated));
    }

    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateEntryWithImage(
            @PathVariable Long id,
            @RequestPart("entry") String entryJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {

        //  הפיכת ה-JSON לאובייקט
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        JournalEntry details = objectMapper.readValue(entryJson, JournalEntry.class);

        //  אם המשתמש בחר תמונה חדשה, נשמור אותה ונעדכן את הנתיב
        if (image != null && !image.isEmpty()) {
            String imagePath = journalEntryService.saveImage(image);
            details.setImageUrl(imagePath);
        }

        // 3. שליחה לשירות שיעדכן את היומן
        JournalEntry updated = journalEntryService.updateEntry(id, details);
        return ResponseEntity.ok(entityMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        journalEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/country")
    public ResponseEntity<List<JournalEntryDTO>> searchByCountry(@RequestParam String country) {
        List<JournalEntryDTO> dtos = journalEntryService.searchByCountry(country)
                .stream().map(entityMapper::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search/rating")
    public ResponseEntity<List<JournalEntryDTO>> searchByRating(@RequestParam int minRating) {
        List<JournalEntryDTO> dtos = journalEntryService.searchByMinRating(minRating)
                .stream().map(entityMapper::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search/keyword")
    public ResponseEntity<List<JournalEntryDTO>> searchByKeyword(@RequestParam String q) {
        List<JournalEntryDTO> dtos = journalEntryService.searchByKeyword(q)
                .stream().map(entityMapper::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }


    @PostMapping("/optimize-route")
    public ResponseEntity<List<JournalEntryDTO>> optimizeRoute(@RequestBody RouteRequest request) {

        // קריאה לאלגוריתם שכתבנו - עכשיו מעביר רשימה אחת בלבד!
        List<JournalEntry> optimizedEntries = journalEntryService.optimizeAndSaveRoute(
                request.getEntryIds()
        );

        // המרה ל-DTO והחזרה למשתמש
        List<JournalEntryDTO> dtos = optimizedEntries.stream()
                .map(entityMapper::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    @Autowired
    private AiRecommendationService aiService;

    @PostMapping("/ai-advice")
    public ResponseEntity<String> getAiAdvice(@RequestBody List<Long> ids) {
        String coolAdvice = journalEntryService.getAiTravelAdvice(ids);
        return ResponseEntity.ok(coolAdvice);
    }
}
