package com.example.wanderlog.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException; // <-- הוספנו את הייבוא הזה
import org.springframework.web.client.RestTemplate;

@Service
public class AiRecommendationService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateRecommendation(String prompt) {
        try {
            // 1. הכנת הכתובת המלאה עם המפתח
            String fullUrl = apiUrl + apiKey;

            // 2. בניית גוף הבקשה (ה-JSON שגוגל דורש)
            String requestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]\n" +
                    "  }]\n" +
                    "}";

            // 3. הגדרת ההדרים (כדי להגיד לגוגל שאנחנו שולחים JSON)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            // 4. שליחת הבקשה לשרתים של גוגל
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, request, String.class);

            // 5. חילוץ הטקסט מתוך התשובה המסובכת שגוגל מחזירה
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String aiText = rootNode
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

            return aiText;

        } catch (HttpClientErrorException.TooManyRequests e) {
            // <-- הוספנו את הבלוק הזה שיתפוס את השגיאה המכוערת ויהפוך אותה לטקסט נעים
            System.err.println("עומס פניות למודל ה-AI: " + e.getMessage());
            return "היועץ החכם קיבל הרבה פניות לאחרונה וצריך רגע לנשום 😅. אנא המתינו דקה ונסו שוב!";

        } catch (Exception e) {
            System.err.println("שגיאה בתקשורת עם ה-AI: " + e.getMessage());
            return "מצטערים, לא הצלחנו להפיק המלצות כרגע. נסו שוב מאוחר יותר.";
        }
    }
}