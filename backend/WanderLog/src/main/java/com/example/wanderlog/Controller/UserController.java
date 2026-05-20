package com.example.wanderlog.Controller;

import com.example.wanderlog.Entities.User;
import com.example.wanderlog.Services.UserService;
import com.example.wanderlog.dto.EntityMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.wanderlog.security.JwtUtil;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EntityMapper entityMapper;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user){
            User savedUser=userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(entityMapper.toDTO(savedUser));
    }

    public static class LoginRequest{
        public String userName;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest){
            User user=userService.loginUser(loginRequest.userName,loginRequest.password);
            String token=jwtUtil.generateToken(user.getUserName(), user.getRole().name());
            return ResponseEntity.ok(Map.of("token",token));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id){
            User user=userService.getByUserId(id);
            return ResponseEntity.ok(entityMapper.toDTO(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,@Valid @RequestBody User details){
            User user=userService.updateUser(id, details);
            return ResponseEntity.ok(entityMapper.toDTO(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser (@PathVariable Long id){
            userService.delete(id);
            return ResponseEntity.ok("המשתמש נמחק בהצלחה");
    }
}
