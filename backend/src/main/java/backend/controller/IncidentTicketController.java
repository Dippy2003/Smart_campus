package backend.controller;

import backend.dto.*;
import backend.model.*;
import backend.service.IncidentTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(
        origins = "http://localhost:3000",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS,
                RequestMethod.PATCH
        }
)
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    // POST /api/incidents
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody IncidentTicketCreateRequest req, Authentication auth) {
        try {
            TicketCategory category = TicketCategory.valueOf(req.getCategory().toUpperCase());
            TicketType ticketType = TicketType.valueOf(req.getTicketType().toUpperCase());
            TicketPriority priority = TicketPriority.valueOf(req.getPriority().toUpperCase());

            IncidentTicket created = incidentTicketService.createTicket(
                    (auth != null ? auth.getName() : req.getRequesterEmail()),
                    req.getTitle(),
                    req.getDescription(),
                    ticketType,
                    category,
                    req.getLocation(),
                    priority,
                    req.getAttachments()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/incidents/my?email=xxx
    @GetMapping("/my")
    public ResponseEntity<List<IncidentTicket>> getMyTickets(@RequestParam(required = false) String email, Authentication auth) {
        return ResponseEntity.ok(incidentTicketService.getMyTickets(auth != null ? auth.getName() : email));
    }

    // GET /api/incidents/technician?email=tech@campus.lk
    @GetMapping("/technician")
    public ResponseEntity<List<IncidentTicket>> getTechnicianTickets(@RequestParam String email) {
        return ResponseEntity.ok(incidentTicketService.getTechnicianTickets(email));
    }

    // GET /api/incidents/technicians
    @GetMapping("/technicians")
    public ResponseEntity<List<Map<String, String>>> getRegisteredTechnicians() {
        return ResponseEntity.ok(incidentTicketService.getRegisteredTechnicians());
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
            return ResponseEntity.ok(
                    incidentTicketService.updateStatus(
                            id,
                            status,
                            req.getAssignedTechnician(),
                            req.getSolutionNote()
                    )
            );
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

    // DELETE /api/incidents/{id} — resolved / closed / rejected only; staff or requester
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean staff = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_TECHNICIAN".equals(a));
        try {
            incidentTicketService.deleteResolvedTicket(id, auth.getName(), staff);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            String reason = e.getReason() != null ? e.getReason() : e.getStatusCode().toString();
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", reason));
        }
    }
}

