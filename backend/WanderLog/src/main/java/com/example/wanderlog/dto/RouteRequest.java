package com.example.wanderlog.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class RouteRequest {
    // אתחול הרשימות כדי למנוע שגיאות Null
    private List<Long> fixedEntryIds = new ArrayList<>();
    private List<Long> flexibleEntryIds = new ArrayList<>();
}