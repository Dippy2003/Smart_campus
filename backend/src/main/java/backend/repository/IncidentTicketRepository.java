package backend.repository;

import backend.model.IncidentTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findByRequesterEmailIgnoreCase(String email);
}

