package backend.repository;

import backend.model.TicketNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketNotificationRepository extends JpaRepository<TicketNotification, Long> {
    List<TicketNotification> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientEmail);
}

