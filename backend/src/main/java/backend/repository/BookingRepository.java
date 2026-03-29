package backend.repository;

import backend.model.Booking;
import backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBookedByEmail(String email);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceId(Long resourceId);

    // Conflict check — overlapping time on same resource/date
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
