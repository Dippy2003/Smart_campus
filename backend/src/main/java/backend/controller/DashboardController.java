package backend.controller;

import backend.model.ResourceType;
import backend.repository.BookingRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalTickets", incidentTicketRepository.count());
        stats.put("resourceBreakdown", resourceBreakdown);
        
        return ResponseEntity.ok(stats);
    }
}
