package com.example.wanderlog.dto;

import java.util.List;

public class RouteRequest {

    private List<Long> entryIds;

    // קונסטרקטור ריק (חשוב ל-Spring Boot כדי שיוכל לאתחל את האובייקט מה-JSON)
    public RouteRequest() {
    }

    // קונסטרקטור עם פרמטרים
    public RouteRequest(List<Long> entryIds) {
        this.entryIds = entryIds;
    }

    // Getters and Setters
    public List<Long> getEntryIds() {
        return entryIds;
    }

    public void setEntryIds(List<Long> entryIds) {
        this.entryIds = entryIds;
    }
}