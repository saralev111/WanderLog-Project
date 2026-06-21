package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.*;
import com.example.wanderlog.Repositories.JournalEntryRepo;
import com.example.wanderlog.Repositories.LocationRepo;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
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
    private LocationRepo locationRepo ;

    @Autowired
    private TripRepo tripRepo;

    @Autowired
    private AiRecommendationService aiRecommendationService;

    @Autowired
    private RouteOptimizationService routeOptimizationService;

    private final String uploadDir = "uploads/";

    public String saveImage(MultipartFile file) throws Exception {
        //  יצירת התיקייה אם היא לא קיימת
        Path copyLocation = Paths.get(uploadDir);
        if (!Files.exists(copyLocation)) {
            Files.createDirectories(copyLocation);
        }

        //  יצירת שם ייחודי לקובץ
        String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();

        //  שמירת הקובץ בתיקייה
        Path targetPath = copyLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        //  החזרת הנתיב (כדי לשמור אותו ב-DB)
        return "/uploads/" + fileName;
    }

    public JournalEntry addEntry(JournalEntry newJournalEntry) {
        User currentUser = userService.getCurrentUser();
        newJournalEntry.setUser(currentUser);
        if(newJournalEntry.getDate() == null) {
            newJournalEntry.setDate(LocalDate.now());
        }

        //  חסימת יומן ציבורי אם הסטטוס אינו VISITED
        if (newJournalEntry.getStatus() != TravelStatus.VISITED) {
            newJournalEntry.setPublic(false);
        }

        return journalEntryRepo.save(newJournalEntry);
    }

    public List<JournalEntry> getMyEntries() {
        long currentUserId = userService.getCurrentUser().getId();

        Sort sort = Sort.by(Sort.Direction.ASC, "visitOrder")
                .and(Sort.by(Sort.Direction.DESC, "id"));

        return journalEntryRepo.findAllByUserId(currentUserId, sort);
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

    @Transactional
    public JournalEntry updateEntry(Long id, JournalEntry details) {
        User currentUser = userService.getCurrentUser();

        JournalEntry existingEntry = journalEntryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("לא ניתן לעדכן: יומן עם מזהה " + id + " לא נמצא"));

        boolean isAdmin = currentUser.getRole() == UserRole.ROLE_ADMIN;
        boolean isOwner = existingEntry.getUser().getId() == currentUser.getId();

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("אין לך הרשאה לעדכן יומן זה.");
        }

        // עדכון שדות טקסטואליים
        if (details.getTitle() != null) existingEntry.setTitle(details.getTitle());
        if (details.getDescription() != null) existingEntry.setDescription(details.getDescription());
        if (details.getRating() != 0) existingEntry.setRating(details.getRating());
        if (details.getStatus() != null) existingEntry.setStatus(details.getStatus());
        if (details.getVisitOrder() != null) existingEntry.setVisitOrder(details.getVisitOrder());
        if (details.getImageUrl() != null) existingEntry.setImageUrl(details.getImageUrl());

        if (details.getLocation() != null) {
            String placeId = details.getLocation().getGooglePlaceId();
            Location newLocation = locationRepo.findByGooglePlaceId(placeId)
                    .orElseGet(() -> {
                        Location loc = new Location();
                        loc.setGooglePlaceId(placeId);
                        loc.setName(details.getLocation().getName());
                        loc.setAddress(details.getLocation().getAddress());
                        loc.setCountry(details.getLocation().getCountry());
                        loc.setLatitude(details.getLocation().getLatitude());
                        loc.setLongitude(details.getLocation().getLongitude());
                        return locationRepo.save(loc);
                    });
            existingEntry.setLocation(newLocation);
        }

        // וידוא סטטוס עבור פרסום פומבי
        if (existingEntry.getStatus() != TravelStatus.VISITED) {
            existingEntry.setPublic(false);
        } else {
            existingEntry.setPublic(details.isPublic());
        }

        return journalEntryRepo.save(existingEntry);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteEntry(long id) {
        User currentUser = userService.getCurrentUser();

        JournalEntry entry = journalEntryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("לא נמצא יומן למחיקה במזהה: " + id));

        boolean isAdmin = currentUser.getRole() == UserRole.ROLE_ADMIN;
        boolean isOwner = entry.getUser().getId() == currentUser.getId();

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("אין לך הרשאה למחוק יומן זה.");
        }

        //   ניתוק היומן מכל הטיולים שהוא מקושר אליהם
        List<Trip> relatedTrips = tripRepo.findByJournalEntriesContaining(entry);
        for (Trip trip : relatedTrips) {
            trip.getJournalEntries().remove(entry);
            tripRepo.save(trip);
        }
        journalEntryRepo.delete(entry);
    }


    //אלגוריתם הניתוב
    public List<JournalEntry> optimizeAndSaveRoute(List<Long> entryIds) {
        List<JournalEntry> entries = getEntriesInOrder(entryIds);

        // חילוץ המיקומים מתוך היומנים כדי לשלוח לאלגוריתם
        List<Location> locs = entries.stream()
                .map(JournalEntry::getLocation)
                .filter(loc -> loc != null)
                .toList();

        List<Location> optimizedLocs = routeOptimizationService.optimizeRoute(locs);

        //  עדכון ה-visitOrder ביומנים לפי הסדר שהאלגוריתם קבע
        List<JournalEntry> optimizedEntries = new ArrayList<>();
        int currentOrder = 1;

        for (Location loc : optimizedLocs) {
            // מציאת היומן ששייך למיקום הזה
            JournalEntry matchedEntry = entries.stream()
                    .filter(e -> e.getLocation() != null && e.getLocation().getId() == loc.getId() && !optimizedEntries.contains(e))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("שגיאה במיפוי היומן למיקום"));

            // עדכון הסדר החדש
            matchedEntry.setVisitOrder(currentOrder++);
            optimizedEntries.add(matchedEntry);
        }

        //  שמירת כל היומנים המעודכנים לדאטה-בייס
        return journalEntryRepo.saveAll(optimizedEntries);
    }
    // פונקציית עזר: שולפת יומנים ושומרת על הסדר המדויק של רשימת ה-IDs שהתקבלה
    private List<JournalEntry> getEntriesInOrder(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new ArrayList<>();
        List<JournalEntry> entries = journalEntryRepo.findAllById(ids);
        entries.sort(Comparator.comparingInt(e -> ids.indexOf(e.getId())));
        return entries;
    }


    public String getAiTravelAdvice(List<Long> entryIds) {

        List<JournalEntry> entries = journalEntryRepo.findAllById(entryIds);

        if (entries == null || entries.isEmpty()) {
            return "אופס! לא מצאתי את המקומות האלו במסלול שלך. כדאי לוודא שהיומנים קיימים בדאטה-בייס.";
        }

        entries.sort(Comparator.comparingInt(e -> e.getVisitOrder() != null ? e.getVisitOrder() : 999));

        //  בניית רשימת המקומות בצורה בטוחה
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

        return aiRecommendationService.generateRecommendation(dynamicPrompt);
    }
}