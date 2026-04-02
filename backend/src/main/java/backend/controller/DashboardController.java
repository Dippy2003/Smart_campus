package backend.controller;

import backend.repository.BookingRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        Map<String, Object> stats = Map.of(
            "totalResources", resourceRepository.count(),
            "totalBookings", bookingRepository.count(),
            "totalTickets", incidentTicketRepository.count()
        );
        return ResponseEntity.ok(stats);
    }
}
