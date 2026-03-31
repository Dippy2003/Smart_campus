package backend.service;

import backend.model.*;
import backend.repository.IncidentTicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
    }

    public IncidentTicket createTicket(
            String requesterEmail,
            String title,
            String description,
            TicketCategory category,
            String location,
            TicketPriority priority
    ) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setRequesterEmail(normalizeEmail(requesterEmail));
        ticket.setTitle(title.trim());
        ticket.setDescription(description.trim());
        ticket.setCategory(category);
        ticket.setLocation(location.trim());
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());

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
        IncidentTicket ticket = getTicketById(id);
        ticket.setStatus(newStatus);

        TicketUpdate adminUpdate = new TicketUpdate();
        adminUpdate.setAuthorType("ADMIN");
        adminUpdate.setMessage("Status changed to " + newStatus + ".");
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

        return incidentTicketRepository.save(ticket);
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
}

