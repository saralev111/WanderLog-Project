package com.example.wanderlog.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // הגדרת הגישה לתמונות (מה שכבר היה לך)
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    // הוספת הגדרות ה-CORS כדי שהריאקט יוכל להתחבר
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // מאשר את כל הנתיבים בשרת
                .allowedOrigins("http://localhost:8080") // הכתובת של הריאקט
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // כל סוגי הבקשות
                .allowedHeaders("*") // מאשר את כל ה-Headers (חשוב לטוקן של ה-JWT)
                .allowCredentials(true); // מאשר שליחת פרטי זיהוי
    }
}