package backend.controller;

import backend.dto.*;
import backend.model.*;
import backend.service.IncidentTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin("http://localhost:3000")
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    // POST /api/incidents
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody IncidentTicketCreateRequest req) {
        try {
            TicketCategory category = TicketCategory.valueOf(req.getCategory().toUpperCase());
            TicketPriority priority = TicketPriority.valueOf(req.getPriority().toUpperCase());

            IncidentTicket created = incidentTicketService.createTicket(
                    req.getRequesterEmail(),
                    req.getTitle(),
                    req.getDescription(),
                    category,
                    req.getLocation(),
                    priority
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/incidents/my?email=xxx
    @GetMapping("/my")
    public ResponseEntity<List<IncidentTicket>> getMyTickets(@RequestParam String email) {
        return ResponseEntity.ok(incidentTicketService.getMyTickets(email));
    }

    // GET /api/incidents — admin view (all tickets)
    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getAllTickets() {
        return ResponseEntity.ok(incidentTicketService.getAllTickets());
    }

    // GET /api/incidents/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(incidentTicketService.getTicketById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/incidents/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody IncidentTicketStatusUpdateRequest req
    ) {
        try {
            TicketStatus status = TicketStatus.valueOf(req.getStatus().toUpperCase());
            return ResponseEntity.ok(incidentTicketService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/incidents/{id}/reply
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToTicket(
            @PathVariable Long id,
            @RequestBody IncidentTicketReplyRequest req
    ) {
        try {
            boolean sendNotification = req.getSendNotification() != null && req.getSendNotification();
            return ResponseEntity.ok(
                    incidentTicketService.replyAndMaybeNotify(id, req.getReplyMessage(), sendNotification)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/incidents/{id}/notifications/read
    @PutMapping("/{id}/notifications/read")
    public ResponseEntity<?> markNotificationsRead(
            @PathVariable Long id,
            @RequestBody IncidentTicketNotificationReadRequest req
    ) {
        try {
            return ResponseEntity.ok(incidentTicketService.markNotificationsRead(id, req.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

