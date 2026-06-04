package com.example.wanderlog.Services;

import com.example.wanderlog.Entities.Location;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteOptimizationService {

    public List<Location> optimizeDynamicRoute(List<Location> fixedStops, List<Location> flexibleStops) {

        if (flexibleStops == null || flexibleStops.isEmpty()) {
            return new ArrayList<>(fixedStops != null ? fixedStops : new ArrayList<>());
        }

        // מצב 1: יש עוגנים - נתחיל מהעוגן האחרון ונמשיך משם (לפי שכן קרוב)
        if (fixedStops != null && !fixedStops.isEmpty()) {
            Location startPoint = fixedStops.get(fixedStops.size() - 1);
            return buildGreedyRoute(fixedStops, flexibleStops, startPoint);
        }

        // מצב 2: אין עוגנים (מצב קלאסי של סל יעדים)
        // במקום לבחור שרירותית את הנקודה הראשונה, נבדוק את כל אפשרויות ההתחלה!
        List<Location> bestRoute = null;
        double minTotalDistance = Double.MAX_VALUE;

        for (int i = 0; i < flexibleStops.size(); i++) {
            List<Location> candidateStartList = new ArrayList<>();
            Location startNode = flexibleStops.get(i);
            candidateStartList.add(startNode);

            // מכינים רשימה של שאר היעדים (ללא נקודת ההתחלה הנוכחית)
            List<Location> remaining = new ArrayList<>(flexibleStops);
            remaining.remove(i);

            // בונים את המסלול האפשרי מהנקודה הזו
            List<Location> candidateRoute = buildGreedyRoute(candidateStartList, remaining, startNode);

            // מחשבים מה המרחק הכולל של כל המסלול הזה מהתחלה עד סוף
            double currentTotalDistance = calculateTotalRouteDistance(candidateRoute);

            // אם מצאנו מסלול קצר יותר ממה שהכרנו עד כה - נשמור אותו!
            if (currentTotalDistance < minTotalDistance) {
                minTotalDistance = currentTotalDistance;
                bestRoute = candidateRoute;
            }
        }

        return bestRoute;
    }

    // --- פונקציית העזר שבונה מסלול מנקודה מסוימת (הלוגיקה שלך ששודרגה) ---
    private List<Location> buildGreedyRoute(List<Location> baseRoute, List<Location> remainingStops, Location current) {
        List<Location> route = new ArrayList<>(baseRoute);
        List<Location> unvisited = new ArrayList<>(remainingStops);
        Location curr = current;

        while (!unvisited.isEmpty()) {
            Location nearest = null;
            double minDistance = Double.MAX_VALUE;

            for (Location loc : unvisited) {
                if (curr.getLatitude() != null && curr.getLongitude() != null &&
                        loc.getLatitude() != null && loc.getLongitude() != null) {

                    double distance = calculateDistance(
                            curr.getLatitude(), curr.getLongitude(),
                            loc.getLatitude(), loc.getLongitude()
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = loc;
                    }
                }
            }

            if (nearest != null) {
                curr = nearest;
                route.add(curr);
                unvisited.remove(curr);
            } else {
                route.addAll(unvisited);
                break;
            }
        }
        return route;
    }

    // --- פונקציית עזר לחישוב המרחק המצטבר של כל הטיול ---
    private double calculateTotalRouteDistance(List<Location> route) {
        double totalDistance = 0;
        for (int i = 0; i < route.size() - 1; i++) {
            Location l1 = route.get(i);
            Location l2 = route.get(i + 1);
            if (l1.getLatitude() != null && l2.getLatitude() != null) {
                totalDistance += calculateDistance(
                        l1.getLatitude(), l1.getLongitude(),
                        l2.getLatitude(), l2.getLongitude()
                );
            }
        }
        return totalDistance;
    }

    // נוסחת הברסיין למרחק (מצוינת, לא נגענו)
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