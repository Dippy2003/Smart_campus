package backend.service;

import backend.model.Booking;
import backend.model.BookingStatus;
import backend.model.resourcesModel;
import backend.repository.BookingRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BookingService — Member 2 (Bathiya)
 * Business logic for booking management.
 * Handles create, update, approve, reject, cancel, delete operations
 * with conflict detection and capacity validation.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    // CREATE booking with full validation, capacity check and conflict check
    public Booking createBooking(Booking booking) {

        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Start time and end time are required.");
        }
        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Start time must be before end time.");
        }
        if (booking.getAttendees() != null && booking.getAttendees() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Attendees must be at least 1.");
        }

        resourcesModel resource = resourceRepository
                .findById(booking.getResource().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Resource not found."));

        booking.setResource(resource);

        // Capacity check
        if (booking.getAttendees() != null
                && resource.getCapacity() != null
                && booking.getAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Number of attendees (" + booking.getAttendees() +
                    ") exceeds resource capacity (" + resource.getCapacity() + ").");
        }

        // Conflict check
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource.getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Booking conflict: this resource is already booked for that time.");
        }

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    // UPDATE booking — only PENDING bookings can be edited
    public Booking updateBooking(Long id, Map<String, String> updates) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only PENDING bookings can be edited.");
        }

        if (updates.containsKey("purpose") && !updates.get("purpose").isBlank()) {
            booking.setPurpose(updates.get("purpose"));
        }
        if (updates.containsKey("attendees") && !updates.get("attendees").isBlank()) {
            int newAttendees = Integer.parseInt(updates.get("attendees"));
            resourcesModel resource = booking.getResource();
            if (resource.getCapacity() != null && newAttendees > resource.getCapacity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Number of attendees (" + newAttendees +
                        ") exceeds resource capacity (" + resource.getCapacity() + ").");
            }
            booking.setAttendees(newAttendees);
        }
        if (updates.containsKey("bookingDate") && !updates.get("bookingDate").isBlank()) {
            booking.setBookingDate(LocalDate.parse(updates.get("bookingDate")));
        }
        if (updates.containsKey("startTime") && !updates.get("startTime").isBlank()) {
            booking.setStartTime(LocalTime.parse(updates.get("startTime")));
        }
        if (updates.containsKey("endTime") && !updates.get("endTime").isBlank()) {
            booking.setEndTime(LocalTime.parse(updates.get("endTime")));
        }

        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Start time must be before end time.");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        List<Booking> otherConflicts = conflicts.stream()
                .filter(c -> !c.getId().equals(id))
                .toList();
        if (!otherConflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Booking conflict: this resource is already booked for that time.");
        }

        return bookingRepository.save(booking);
    }

    // DELETE booking — admin permanently removes a booking record
    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }

    // GET user's own bookings by email
    public List<Booking> getMyBookings(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is required.");
        }
        return bookingRepository.findByBookedByEmail(email);
    }

    // GET all bookings (admin)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET bookings filtered by status
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    // GET single booking by ID
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found."));
    }

    // APPROVE booking (admin only)
    public Booking approveBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only PENDING bookings can be approved.");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(reason);
        return bookingRepository.save(booking);
    }

    // REJECT booking (admin only)
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only PENDING bookings can be rejected.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        return bookingRepository.save(booking);
    }

    // CANCEL booking (user only)
    public Booking cancelBooking(Long id, String email) {
        Booking booking = getBookingById(id);
        if (!booking.getBookedByEmail().equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only cancel your own bookings.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Booking is already cancelled.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // GET booking statistics
    public Map<String, Long> getBookingStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", bookingRepository.count());
        stats.put("pending", bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.put("approved", bookingRepository.countByStatus(BookingStatus.APPROVED));
        stats.put("rejected", bookingRepository.countByStatus(BookingStatus.REJECTED));
        stats.put("cancelled", bookingRepository.countByStatus(BookingStatus.CANCELLED));
        return stats;
    }
}
