package backend.repository;

import backend.model.Booking;
import backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * BookingRepository — Member 2 (Bathiya)
 * Data access layer for Booking entity.
 * Includes conflict detection query to prevent double bookings.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find all bookings by user email
    List<Booking> findByBookedByEmail(String email);

    // Find all bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find all bookings for a specific resource
    List<Booking> findByResourceId(Long resourceId);

    // Find bookings by date range (for admin reports)
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    // Count bookings by status (for dashboard)
    long countByStatus(BookingStatus status);

    // Conflict detection — finds overlapping bookings for same resource/date/time
    // Prevents double booking of the same resource
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
