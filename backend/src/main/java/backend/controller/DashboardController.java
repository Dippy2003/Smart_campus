package backend.controller;

import backend.model.ResourceType;
import backend.auth.AppUserRepository;
import backend.repository.BookingRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("http://localhost:3000")
public class DashboardController {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final AppUserRepository appUserRepository;

    public DashboardController(ResourceRepository resourceRepository, 
                              BookingRepository bookingRepository,
                              IncidentTicketRepository incidentTicketRepository,
                              AppUserRepository appUserRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.incidentTicketRepository = incidentTicketRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = Map.of(
            "totalResources", resourceRepository.count(),
            "totalBookings", bookingRepository.count(),
            "totalTickets", incidentTicketRepository.count(),
            "totalUsers", appUserRepository.count()
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/detailed")
    public ResponseEntity<Map<String, Object>> getDetailedStats() {
        // Get resource counts by type
        List<Object[]> resourceCounts = resourceRepository.countByType();
        List<Map<String, Object>> resourceBreakdown = new ArrayList<>();
        
        // Define colors for each resource type
        Map<ResourceType, String> typeColors = Map.of(
            ResourceType.LECTURE_HALL, "#6366f1",
            ResourceType.LAB, "#22d3ee",
            ResourceType.MEETING_ROOM, "#a855f7",
            ResourceType.EQUIPMENT, "#f59e0b"
        );
        
        // Convert resource counts to breakdown format
        for (Object[] count : resourceCounts) {
            ResourceType type = (ResourceType) count[0];
            Long countValue = (Long) count[1];
            
            Map<String, Object> resourceData = new HashMap<>();
            resourceData.put("name", type.name().replace("_", " "));
            resourceData.put("value", countValue);
            resourceData.put("color", typeColors.getOrDefault(type, "#6b7280"));
            resourceBreakdown.add(resourceData);
        }
        
        // Get top booked resources
        List<Object[]> topBooked = bookingRepository.findTopBookedResources();
        List<Map<String, Object>> topResources = new ArrayList<>();
        
        for (Object[] result : topBooked) {
            String name = (String) result[0];
            ResourceType type = (ResourceType) result[1];
            Long bookingCount = (Long) result[2];
            
            Map<String, Object> resourceData = new HashMap<>();
            resourceData.put("name", name);
            resourceData.put("type", type.name());
            resourceData.put("bookings", bookingCount);
            topResources.add(resourceData);
        }
        
        // Get monthly trend data for the last 6 months
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        LocalDateTime sixMonthsAgoDateTime = sixMonthsAgo.atStartOfDay();
        
        // Get all bookings for monthly trends
        List<Object[]> allMonthlyBookings = bookingRepository.findMonthlyBookings();
        List<Object[]> allMonthlyTickets = incidentTicketRepository.findMonthlyTickets();
        
        // Create month map for bookings
        Map<String, Long> bookingMap = new HashMap<>();
        for (Object[] result : allMonthlyBookings) {
            String month = (String) result[0];
            Long count = (Long) result[1];
            bookingMap.put(month, count);
        }
        
        // Create month map for tickets
        Map<String, Long> ticketMap = new HashMap<>();
        for (Object[] result : allMonthlyTickets) {
            String month = (String) result[0];
            Long count = (Long) result[1];
            ticketMap.put(month, count);
        }
        
        // Generate monthly trend data for the last 6 months including current month
        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        String[] months = {"October", "November", "December", "January", "February", "March", "April"};
        
        for (String month : months) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month.substring(0, 3)); // Use first 3 letters for display
            monthData.put("bookings", bookingMap.getOrDefault(month, 0L));
            monthData.put("tickets", ticketMap.getOrDefault(month, 0L));
            monthlyTrends.add(monthData);
        }

        // Build weekly activity from real records (bookings + tickets) for last 7 days
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        Map<LocalDate, Long> bookingByDay = new HashMap<>();
        for (Object[] row : bookingRepository.findDailyBookingsBetween(weekStart, today)) {
            LocalDate day = (LocalDate) row[0];
            Long count = (Long) row[1];
            bookingByDay.put(day, count);
        }

        Map<LocalDate, Long> ticketByDay = new HashMap<>();
        for (Object[] row : incidentTicketRepository.findDailyTicketsBetween(weekStart, today)) {
            Object rawDay = row[0];
            LocalDate day;
            if (rawDay instanceof LocalDate localDate) {
                day = localDate;
            } else {
                day = java.sql.Date.valueOf(String.valueOf(rawDay)).toLocalDate();
            }
            Long count = (Long) row[1];
            ticketByDay.put(day, count);
        }

        List<Map<String, Object>> weeklyActivity = new ArrayList<>();
        long maxActive = 0L;
        for (int i = 0; i < 7; i++) {
            LocalDate day = weekStart.plusDays(i);
            long active = bookingByDay.getOrDefault(day, 0L) + ticketByDay.getOrDefault(day, 0L);
            maxActive = Math.max(maxActive, active);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", day.toString());
            dayData.put("day", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            dayData.put("active", active);
            weeklyActivity.add(dayData);
        }
        for (Map<String, Object> dayData : weeklyActivity) {
            long active = ((Number) dayData.get("active")).longValue();
            dayData.put("idle", Math.max(0L, maxActive - active));
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalTickets", incidentTicketRepository.count());
        stats.put("totalUsers", appUserRepository.count());
        stats.put("resourceBreakdown", resourceBreakdown);
        stats.put("topResources", topResources);
        stats.put("monthlyTrends", monthlyTrends);
        stats.put("weeklyActivity", weeklyActivity);
        
        return ResponseEntity.ok(stats);
    }
}
