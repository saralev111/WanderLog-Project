package com.example.wanderlog.Repositories;

import com.example.wanderlog.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    //חיפוש משתמש על פי שם משתמש
    Optional<User> findByUserName(String userName);

    //חיפוש משתמש על פי אימייל
    Optional<User> findByEmail(String email);

    //האם קיים משתמש על פי שם משתמש
    boolean existsByUserName(String userName);

    //האם קיים משתמש על פי אימייל
    boolean existsByEmail(String email);

}
