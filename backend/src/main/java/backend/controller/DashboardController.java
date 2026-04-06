package backend.controller;

import backend.model.ResourceType;
import backend.repository.BookingRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("http://localhost:3000")
public class DashboardController {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    public DashboardController(ResourceRepository resourceRepository, 
                              BookingRepository bookingRepository,
                              IncidentTicketRepository incidentTicketRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.incidentTicketRepository = incidentTicketRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = Map.of(
            "totalResources", resourceRepository.count(),
            "totalBookings", bookingRepository.count(),
            "totalTickets", incidentTicketRepository.count()
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
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalTickets", incidentTicketRepository.count());
        stats.put("resourceBreakdown", resourceBreakdown);
        stats.put("topResources", topResources);
        stats.put("monthlyTrends", monthlyTrends);
        
        return ResponseEntity.ok(stats);
    }
}
