package com.example.wanderlog.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Entity
@Table(name="users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "שם משתמש הוא חובה")
    @Size(min = 3,max = 20,message = "שם משתמש חייב להיות בין 3 ל20 תוים")
    @Column(unique = true,nullable = false)
    private String userName;

    @NotBlank(message = "כתובת אמייל היא חובה")
    @Email(message = "פורמט אמייל לא תקין")
    @Column(unique = true,nullable = false)
    private String email;

    @NotBlank(message = "סיסמה היא חובה")
    @Size(min = 6, max = 255, message = "סיסמה חייבת להכיל לפחות 6 תווים")
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<JournalEntry> myEntries;


}
