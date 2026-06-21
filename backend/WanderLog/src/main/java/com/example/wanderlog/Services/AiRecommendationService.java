package com.example.wanderlog.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

// --- הייבוא שצריך להוסיף לקסם של נטפרי ---
import javax.net.ssl.*;
import java.security.cert.X509Certificate;

@Service
public class AiRecommendationService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiRecommendationService() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String generateRecommendation(String prompt) {
        System.out.println(">>> מתחיל ניסיון תקשורת עם ה-API של Gemini...");
        try {
            String fullUrl = apiUrl + apiKey;

            String requestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]\n" +
                    "  }]\n" +
                    "}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, request, String.class);
            System.out.println(">>> התקבלה תשובה בהצלחה. קוד סטטוס: " + response.getStatusCode());

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

        } catch (HttpClientErrorException.TooManyRequests e) {
            System.err.println("עומס פניות למודל ה-AI: " + e.getMessage());
            return "היועץ החכם קיבל הרבה פניות לאחרונה וצריך רגע לנשום 😅. אנא המתינו דקה ונסו שוב!";

        } catch (Exception e) {
            System.err.println(">>> שגיאה בתקשורת עם ה-AI: " + e.getMessage());
            e.printStackTrace();
            return "מצטערים, לא הצלחנו להפיק המלצות כרגע. נסו שוב מאוחר יותר.";
        }
    }
}