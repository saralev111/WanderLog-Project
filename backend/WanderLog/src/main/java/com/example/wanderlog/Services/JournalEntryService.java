package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.JournalEntry;
import com.example.wanderlog.Entities.Location; // הוספנו ייבוא
import com.example.wanderlog.Entities.TravelStatus;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Entities.UserRole;
import com.example.wanderlog.Repositories.JournalEntryRepo;
import com.example.wanderlog.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.UUID;
import java.time.LocalDate;
import java.util.ArrayList; // הוספנו ייבוא
import java.util.Comparator; // הוספנו ייבוא
import java.util.List;

@Service
public class JournalEntryService {

    @Autowired
    private UserService userService;

    @Autowired
    private JournalEntryRepo journalEntryRepo;

    @Autowired
    private AiRecommendationService aiRecommendationService;

    @Autowired
    private RouteOptimizationService routeOptimizationService; // הזרקת האלגוריתם!

    private final String uploadDir = "uploads/";

    public String saveImage(MultipartFile file) throws Exception {
        // 1. יצירת התיקייה אם היא לא קיימת
        Path copyLocation = Paths.get(uploadDir);
        if (!Files.exists(copyLocation)) {
            Files.createDirectories(copyLocation);
        }

        // 2. יצירת שם ייחודי לקובץ (למשל: a1b2-image.jpg)
        String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();

        // 3. שמירת הקובץ בתיקייה
        Path targetPath = copyLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 4. החזרת הנתיב (כדי לשמור אותו ב-DB)
        return "/uploads/" + fileName;
    }

    public JournalEntry addEntry(JournalEntry newJournalEntry) {
        User currentUser = userService.getCurrentUser();
        newJournalEntry.setUser(currentUser);
        if(newJournalEntry.getDate() == null) {
            newJournalEntry.setDate(LocalDate.now());
        }

        // הוספנו: חסימת יומן ציבורי אם הסטטוס אינו VISITED
        if (newJournalEntry.getStatus() != TravelStatus.VISITED) {
            newJournalEntry.setPublic(false);
        }

        return journalEntryRepo.save(newJournalEntry);
    }

    public Page<JournalEntry> getMyEntries(int page, int size) {
        long currentUserId = userService.getCurrentUser().getId();
        // עדכון: מיון קודם לפי סדר המסלול (visitOrder) ואז לפי החדש ביותר
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.ASC, "visitOrder").and(Sort.by(Sort.Direction.DESC, "id")));
        return journalEntryRepo.findByUserId(currentUserId, pageable);
    }

    public List<JournalEntry> searchByCountry(String country) {
        return journalEntryRepo.findByLocation_CountryIgnoreCase(country);
    }

    public List<JournalEntry> searchByMinRating(int rating) {
        return journalEntryRepo.findByRatingGreaterThanEqual(rating);
    }

    public List<JournalEntry> searchByKeyword(String keyword) {
        return journalEntryRepo.findByTitleContainingIgnoreCase(keyword);
    }

    public Page<JournalEntry> getPublicEntries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return journalEntryRepo.findByIsPublicTrue(pageable);
    }

    public JournalEntry updateEntry(Long id, JournalEntry details) {
        User currentUser = userService.getCurrentUser();

        JournalEntry existingEntry = journalEntryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("לא ניתן לעדכן: יומן עם מזהה " + id + " לא נמצא"));

        boolean isAdmin = currentUser.getRole() == UserRole.ROLE_ADMIN;
        boolean isOwner = existingEntry.getUser().getId()==(currentUser.getId());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("אין לך הרשאה לעדכן יומן זה.");
        }

        if (details.getTitle() != null) existingEntry.setTitle(details.getTitle());
        if (details.getDescription() != null) existingEntry.setDescription(details.getDescription());
        if (details.getRating() != 0) existingEntry.setRating(details.getRating());
        if (details.getStatus() != null) existingEntry.setStatus(details.getStatus());

        // עדכון: מאפשר שמירה ידנית של סדר המסלול אם המשתמש משנה אותו
        if (details.getVisitOrder() != null) existingEntry.setVisitOrder(details.getVisitOrder());

// עדכון: מאפשר שמירה ידנית של סדר המסלול אם המשתמש משנה אותו
        if (details.getVisitOrder() != null) existingEntry.setVisitOrder(details.getVisitOrder());

        // הוספנו: וידוא סטטוס עבור פרסום פומבי בעת עדכון
        if (existingEntry.getStatus() != TravelStatus.VISITED) {
            existingEntry.setPublic(false);
        } else {
            existingEntry.setPublic(details.isPublic());
        }

        return journalEntryRepo.save(existingEntry);
    }

    public void deleteEntry(long id) {
        User currentUser = userService.getCurrentUser();

        JournalEntry entry = journalEntryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("לא נמצא יומן למחיקה במזהה: " + id));

        boolean isAdmin = currentUser.getRole() == UserRole.ROLE_ADMIN;
        boolean isOwner = entry.getUser().getId() == currentUser.getId();

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("אין לך הרשאה למחוק יומן זה.");
        }

        journalEntryRepo.delete(entry);
    }

    public List<JournalEntry> getEntriesByStatus(Long userId, TravelStatus status) {
        // שליפת כל היומנים של המשתמש שיש להם סטטוס מסוים
        return journalEntryRepo.findByUserIdAndStatus(userId, status);
    }

    public Page<JournalEntry> getEntriesByUserId(long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return journalEntryRepo.findByUserId(userId, pageable);
    }

    // ---------------------------------------------------------
    // פונקציות חדשות לאלגוריתם הניתוב
    // ---------------------------------------------------------

    public List<JournalEntry> optimizeAndSaveRoute(List<Long> fixedEntryIds, List<Long> flexibleEntryIds) {
        // 1. שליפת היומנים מהדאטה-בייס (תוך שמירה על הסדר שהמשתמש שלח)
        List<JournalEntry> fixedEntries = getEntriesInOrder(fixedEntryIds);
        List<JournalEntry> flexibleEntries = getEntriesInOrder(flexibleEntryIds);

        // 2. חילוץ המיקומים מתוך היומנים כדי לשלוח לאלגוריתם
        List<Location> fixedLocs = fixedEntries.stream().map(JournalEntry::getLocation).toList();
        List<Location> flexibleLocs = flexibleEntries.stream().map(JournalEntry::getLocation).toList();

        // 3. הרצת האלגוריתם! קבלת המיקומים מסודרים
        List<Location> optimizedLocs = routeOptimizationService.optimizeDynamicRoute(fixedLocs, flexibleLocs);

        // 4. חיבור בחזרה: עדכון ה-visitOrder ביומנים לפי הסדר שהאלגוריתם קבע
        List<JournalEntry> optimizedEntries = new ArrayList<>();
        List<JournalEntry> allEntriesPool = new ArrayList<>();
        allEntriesPool.addAll(fixedEntries);
        allEntriesPool.addAll(flexibleEntries);

        int currentOrder = 1;

        for (Location loc : optimizedLocs) {
            // מציאת היומן ששייך למיקום הזה (שעוד לא שיבצנו)
            JournalEntry matchedEntry = allEntriesPool.stream()
                    .filter(e -> e.getLocation().getId() == loc.getId() && !optimizedEntries.contains(e))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("שגיאה במיפוי היומן למיקום"));

            // עדכון הסדר החדש!
            matchedEntry.setVisitOrder(currentOrder++);
            optimizedEntries.add(matchedEntry);
        }

        // 5. שמירת כל היומנים המעודכנים לדאטה-בייס
        return journalEntryRepo.saveAll(optimizedEntries);
    }

    // פונקציית עזר: שולפת יומנים ושומרת על הסדר המדויק של רשימת ה-IDs שהתקבלה
    private List<JournalEntry> getEntriesInOrder(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new ArrayList<>();
        List<JournalEntry> entries = journalEntryRepo.findAllById(ids);
        // מיון הרשימה שתחזור בדיוק לפי הסדר שבו ה-IDs הועברו אלינו
        entries.sort(Comparator.comparingInt(e -> ids.indexOf(e.getId())));
        return entries;
    }

    // בתוך JournalEntryService.java

    public String getAiTravelAdvice(List<Long> entryIds) {
        // 1. שליפת היומנים מהדאטה-בייס
        List<JournalEntry> entries = journalEntryRepo.findAllById(entryIds);

        // הגנה: אם הרשימה ריקה (למשל IDs שלא קיימים ב-H2), נחזיר הודעה מסודרת במקום לקרוס
        if (entries == null || entries.isEmpty()) {
            return "אופס! לא מצאתי את המקומות האלו במסלול שלך. כדאי לוודא שהיומנים קיימים בדאטה-בייס.";
        }

        // 2. מיון "בטוח": אם visitOrder הוא null, נשים את היומן בסוף (999) כדי למנוע קריסה
        entries.sort(Comparator.comparingInt(e -> e.getVisitOrder() != null ? e.getVisitOrder() : 999));

        // 3. בניית רשימת המקומות בצורה בטוחה
        StringBuilder locationsList = new StringBuilder();
        for (JournalEntry e : entries) {
            // אם אין מיקום או שם למיקום, נשתמש בכותרת של היומן כברירת מחדל
            String placeName = (e.getLocation() != null && e.getLocation().getName() != null)
                    ? e.getLocation().getName()
                    : e.getTitle();

            locationsList.append("- ").append(placeName).append("\n");
        }

        String dynamicPrompt = String.format(
                "אתה יועץ טיולים מקצועי, קליל וידידותי. " +
                        "המשתמש מתכנן טיול בסטטוס %s בתאריך %s. " +
                        "זה המסלול: \n%s\n" +
                        "החזר תגובה קצרה, פרקטית ונעימה בפורמט הבא:\n" +
                        "1. משפט פתיחה קצר (עד 2 משפטים) שמתייחס ליעדים.\n" +
                        "2. ציוד חובה: 3-4 פריטים פרקטיים (שורות קצרות ולעניין).\n" +
                        "3. טיפ קצר (עד 2 משפטים) על אחד המקומות. \n" +
                        "הערה: שמור על טון ענייני ונעים, ללא הגזמות דרמטיות או מילים מפוצצות.",
                entries.get(0).getStatus(),
                entries.get(0).getDate(),
                locationsList.toString()
        );

        // 5. שליחה ל-AI והחזרת התשובה המיוחלת
        return aiRecommendationService.generateRecommendation(dynamicPrompt);
    }
}