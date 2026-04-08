package backend.repository;

import backend.model.IncidentTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findByRequesterEmailIgnoreCase(String email);
    List<IncidentTicket> findByAssignedTechnicianIgnoreCase(String assignedTechnician);

    // Get monthly ticket counts for the last 6 months
    @Query("SELECT MONTHNAME(t.createdAt) as month, COUNT(t) as count " +
           "FROM IncidentTicket t " +
           "GROUP BY MONTHNAME(t.createdAt), YEAR(t.createdAt), MONTH(t.createdAt) " +
           "ORDER BY YEAR(t.createdAt), MONTH(t.createdAt)")
    List<Object[]> findMonthlyTickets();

    @Query("""
           SELECT DATE(t.createdAt) as day, COUNT(t) as count
           FROM IncidentTicket t
           WHERE DATE(t.createdAt) BETWEEN :startDate AND :endDate
           GROUP BY DATE(t.createdAt)
           ORDER BY DATE(t.createdAt)
           """)
    List<Object[]> findDailyTicketsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

