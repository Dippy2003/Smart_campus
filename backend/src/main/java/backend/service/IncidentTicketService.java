package backend.service;

import backend.model.*;
import backend.repository.IncidentTicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final EmailNotificationService emailNotificationService;

    public IncidentTicketService(
            IncidentTicketRepository incidentTicketRepository,
            EmailNotificationService emailNotificationService
    ) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.emailNotificationService = emailNotificationService;
    }

    public IncidentTicket createTicket(
            String requesterEmail,
            String title,
            String description,
            TicketType ticketType,
            TicketCategory category,
            String location,
            TicketPriority priority,
            List<String> attachments
    ) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setRequesterEmail(normalizeEmail(requesterEmail));
        ticket.setTitle(title.trim());
        ticket.setDescription(description.trim());
        ticket.setTicketType(ticketType);
        ticket.setCategory(category);
        ticket.setLocation(location.trim());
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setAttachments(cleanAttachmentList(attachments));

        TicketUpdate firstUpdate = new TicketUpdate();
        firstUpdate.setAuthorType("REQUESTER");
        firstUpdate.setMessage("Ticket submitted successfully.");
        firstUpdate.setCreatedAt(LocalDateTime.now());
        firstUpdate.setTicket(ticket);

        ticket.getUpdates().add(firstUpdate);

        TicketNotification notif = new TicketNotification();
        notif.setMessage("We received your ticket. You can track updates from My Tickets.");
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRead(false);
        notif.setRecipientEmail(ticket.getRequesterEmail());
        notif.setTicket(ticket);
        ticket.getNotifications().add(notif);

        return incidentTicketRepository.save(ticket);
    }

    public List<IncidentTicket> getMyTickets(String email) {
        return incidentTicketRepository.findByRequesterEmailIgnoreCase(email);
    }

    public List<IncidentTicket> getTechnicianTickets(String technicianEmail) {
        return incidentTicketRepository.findByAssignedTechnicianIgnoreCase(normalizeEmail(technicianEmail));
    }

    public List<IncidentTicket> getAllTickets() {
        List<IncidentTicket> tickets = incidentTicketRepository.findAll();
        tickets.sort(Comparator.comparing(IncidentTicket::getCreatedAt).reversed());
        return tickets;
    }

    public IncidentTicket getTicketById(Long id) {
        return incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public IncidentTicket updateStatus(Long id, TicketStatus newStatus) {
        return updateStatus(id, newStatus, null, null);
    }

    public IncidentTicket updateStatus(
            Long id,
            TicketStatus newStatus,
            String assignedTechnician,
            String solutionNote
    ) {
        IncidentTicket ticket = getTicketById(id);
        ticket.setStatus(newStatus);
        String assignedEmail = normalizeEmail(trimToNull(assignedTechnician));
        if (!assignedEmail.isEmpty()) {
            if (!isRegisteredTechnician(assignedEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned technician must be a registered technician account.");
            }
            ticket.setAssignedTechnician(assignedEmail);
        }
        ticket.setSolutionNote(trimToNull(solutionNote));

        TicketUpdate adminUpdate = new TicketUpdate();
        adminUpdate.setAuthorType("ADMIN");
        StringBuilder message = new StringBuilder("Status changed to " + newStatus + ".");
        if (!assignedEmail.isEmpty()) {
            message.append(" Technician assigned: ").append(assignedEmail).append(".");
        }
        if (trimToNull(solutionNote) != null) {
            message.append(" Solution: ").append(trimToNull(solutionNote));
        }
        adminUpdate.setMessage(message.toString());
        adminUpdate.setCreatedAt(LocalDateTime.now());
        adminUpdate.setTicket(ticket);
        ticket.getUpdates().add(adminUpdate);

        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket replyAndMaybeNotify(
            Long id,
            String replyMessage,
            boolean sendNotification
    ) {
        IncidentTicket ticket = getTicketById(id);

        TicketUpdate adminUpdate = new TicketUpdate();
        adminUpdate.setAuthorType("ADMIN");
        adminUpdate.setMessage(replyMessage.trim());
        adminUpdate.setCreatedAt(LocalDateTime.now());
        adminUpdate.setTicket(ticket);
        ticket.getUpdates().add(adminUpdate);

        if (sendNotification) {
            TicketNotification notif = new TicketNotification();
            notif.setMessage("Update on your ticket #" + ticket.getId() + ": " + replyMessage.trim());
            notif.setCreatedAt(LocalDateTime.now());
            notif.setRead(false);
            notif.setRecipientEmail(ticket.getRequesterEmail());
            notif.setTicket(ticket);
            ticket.getNotifications().add(notif);
        }

        IncidentTicket saved = incidentTicketRepository.save(ticket);
        emailNotificationService.sendIncidentReplyToRequester(
                ticket.getRequesterEmail(),
                ticket.getTitle(),
                ticket.getId(),
                replyMessage.trim()
        );
        return saved;
    }

    public IncidentTicket markNotificationsRead(Long id, String email) {
        IncidentTicket ticket = getTicketById(id);
        String norm = normalizeEmail(email);

        boolean changed = false;
        for (TicketNotification n : ticket.getNotifications()) {
            if (n.getRecipientEmail() != null
                    && n.getRecipientEmail().equalsIgnoreCase(norm)
                    && !n.isRead()) {
                n.setRead(true);
                changed = true;
            }
        }

        if (changed) {
            return incidentTicketRepository.save(ticket);
        }
        return ticket;
    }

    private String normalizeEmail(String email) {
        if (email == null) return "";
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<String> cleanAttachmentList(List<String> attachments) {
        List<String> cleaned = new ArrayList<>();
        if (attachments == null) return cleaned;
        for (String a : attachments) {
            String trimmed = trimToNull(a);
            if (trimmed != null) {
                cleaned.add(trimmed);
            }
            if (cleaned.size() == 3) {
                break;
            }
        }
        return cleaned;
    }

    public List<Map<String, String>> getRegisteredTechnicians() {
        return List.of(
                Map.of("email", "electrician@campus.lk", "name", "Campus Electrician", "specialty", "ELECTRICAL", "accountType", "TECHNICIAN"),
                Map.of("email", "plumber@campus.lk", "name", "Campus Plumber", "specialty", "PLUMBING", "accountType", "TECHNICIAN"),
                Map.of("email", "engineer@campus.lk", "name", "Building Engineer", "specialty", "CONSTRUCTION", "accountType", "TECHNICIAN")
        );
    }

    private boolean isRegisteredTechnician(String email) {
        return getRegisteredTechnicians()
                .stream()
                .anyMatch(t -> email.equalsIgnoreCase(t.get("email")));
    }
}

