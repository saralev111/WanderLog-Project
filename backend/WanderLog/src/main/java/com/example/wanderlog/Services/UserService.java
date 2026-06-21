package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.Trip;
import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Entities.UserRole;
import com.example.wanderlog.Repositories.TripRepo;
import com.example.wanderlog.Repositories.UserRepo;
import com.example.wanderlog.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TripRepo tripRepo;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = authentication.getName();
        return userRepo.findByUserName(currentUserName)
                .orElseThrow(() -> new ResourceNotFoundException("משתמש לא נמצא או לא מחובר"));
    }

    //מחיקת טיול עם טיפול בניתוק המסלולים המחוברים אליו
    @Transactional
    public void delete(Long userId) {
        if (!userRepo.existsById(userId)) {
            throw new ResourceNotFoundException("לא ניתן למחוק: משתמש עם ID " + userId + " לא קיים");
        }

        // ניקוי טיולים משויכים למשתמש
        List<Trip> userTrips = tripRepo.findByUserId(userId);
        if (userTrips != null && !userTrips.isEmpty()) {
            tripRepo.deleteAll(userTrips);
        }

        userRepo.deleteById(userId);
    }


    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User registerUser(User newUser) {
        if (userRepo.existsByUserName(newUser.getUserName())) {
            throw new RuntimeException("השם משתמש כבר קיים במערכת");
        }
        if (userRepo.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("האימייל כבר קיים במערכת");
        }
        if (newUser.getRole() == null) {
            newUser.setRole(UserRole.ROLE_USER);
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        return userRepo.save(newUser);
    }

    public User GetUserByUserName(String userName) {
        return userRepo.findByUserName(userName)
                .orElseThrow(() -> new ResourceNotFoundException("שם המשתמש " + userName + " לא נמצא"));
    }

    public User loginUser(String userName, String password) {
        User user = userRepo.findByUserName(userName)
                .orElseThrow(() -> new ResourceNotFoundException("שם המשתמש לא נמצא"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("סיסמה שגויה");
        }
        return user;
    }

    public User getByUserId(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("לא נמצא משתמש עם ה-ID: " + userId));
    }

    public User updateUser(Long id, User details) {
        User user = getByUserId(id);
        if (details.getUserName() != null && !details.getUserName().isEmpty()) {
            user.setUserName(details.getUserName());
        }
        if (details.getEmail() != null && !details.getEmail().isEmpty()) {
            user.setEmail(details.getEmail());
        }
        return userRepo.save(user);
    }
}