package backend.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import backend.repository.TicketNotificationRepository;
import backend.model.TicketNotification;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final UserNotificationRepository repo;
    private final TicketNotificationRepository ticketRepo;

    public NotificationController(UserNotificationRepository repo, TicketNotificationRepository ticketRepo) {
        this.repo = repo;
        this.ticketRepo = ticketRepo;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(Authentication auth) {
        String email = auth.getName().toLowerCase();
        List<Map<String, Object>> out = new ArrayList<>();

        out.addAll(
                repo.findByRecipientEmailOrderByCreatedAtDesc(email).stream()
                        .map(n -> Map.<String, Object>of(
                                "id", n.getId(),
                                "type", n.getType().name(),
                                "title", n.getTitle(),
                                "message", n.getMessage(),
                                "read", n.isRead(),
                                "createdAt", n.getCreatedAt().toString()
                        ))
                        .toList()
        );

        out.addAll(
                ticketRepo.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(email).stream()
                        .map(n -> Map.<String, Object>of(
                                "id", "T-" + n.getId(),
                                "type", "TICKET_UPDATED",
                                "title", "Ticket Update",
                                "message", n.getMessage(),
                                "read", n.isRead(),
                                "createdAt", n.getCreatedAt().toString()
                        ))
                        .toList()
        );

        // Best-effort ordering: newest first (createdAt is ISO string)
        out.sort((a, b) -> String.valueOf(b.get("createdAt")).compareTo(String.valueOf(a.get("createdAt"))));
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id, Authentication auth) {
        String email = auth.getName().toLowerCase();
        try {
            if (id.startsWith("T-")) {
                long tid = Long.parseLong(id.substring(2));
                TicketNotification n = ticketRepo.findById(tid).orElseThrow();
                if (n.getRecipientEmail() == null || !n.getRecipientEmail().equalsIgnoreCase(email)) {
                    return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
                }
                n.setRead(true);
                ticketRepo.save(n);
                return ResponseEntity.ok(Map.of("success", true));
            }

            long nid = Long.parseLong(id);
            UserNotification n = repo.findById(nid).orElseThrow();
            if (!email.equalsIgnoreCase(n.getRecipientEmail())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }
            n.setRead(true);
            repo.save(n);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid notification id"));
        }
    }
}

