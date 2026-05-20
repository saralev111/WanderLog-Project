package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.Location;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteOptimizationService {

    // הפונקציה המשודרגת שמקבלת "עוגנים" ונקודות גמישות
    public List<Location> optimizeDynamicRoute(List<Location> fixedStops, List<Location> flexibleStops) {

        // הרשימה הסופית תתחיל קודם כל מהמקומות שהמשתמש קבע מראש (העוגנים)
        List<Location> finalRoute = new ArrayList<>(fixedStops);

        if (flexibleStops == null || flexibleStops.isEmpty()) {
            return finalRoute; // אם אין מה לסדר, מחזירים מה שיש
        }

        List<Location> unvisited = new ArrayList<>(flexibleStops);
        Location current;

        // מאיפה מתחילים את החישוב?
        if (!fixedStops.isEmpty()) {
            // אם המשתמש קבע עוגנים, נתחיל את החישוב מהתחנה *האחרונה* שהוא קבע
            current = fixedStops.get(fixedStops.size() - 1);
        } else {
            // אם הוא לא קבע כלום, נתחיל מהמקום הראשון ברשימה הגמישה
            current = unvisited.remove(0);
            finalRoute.add(current);
        }

        // עכשיו - האלגוריתם החמדן (Greedy) שרץ מאותה נקודת התחלה
        while (!unvisited.isEmpty()) {
            Location nearest = null;
            double minDistance = Double.MAX_VALUE;

            for (Location loc : unvisited) {
                if (current.getLatitude() != null && current.getLongitude() != null &&
                        loc.getLatitude() != null && loc.getLongitude() != null) {

                    double distance = calculateDistance(
                            current.getLatitude(), current.getLongitude(),
                            loc.getLatitude(), loc.getLongitude()
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = loc;
                    }
                }
            }

            if (nearest != null) {
                current = nearest;
                finalRoute.add(current);
                unvisited.remove(current);
            } else {
                finalRoute.addAll(unvisited);
                break;
            }
        }

        return finalRoute; // מחזירים את המסלול המושלם!
    }

    // נוסחת הברסיין (נשארת אותו דבר)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}