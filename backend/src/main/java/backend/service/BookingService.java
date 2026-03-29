package backend.service;

import backend.model.Booking;
import backend.model.BookingStatus;
import backend.model.resourcesModel;
import backend.repository.BookingRepository;
import backend.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    // CREATE — with conflict check
    public Booking createBooking(Booking booking) {
        resourcesModel resource = resourceRepository
                .findById(booking.getResource().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Resource not found"));

        booking.setResource(resource);

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

    // GET user's own bookings
    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByBookedByEmail(email);
    }

    // GET all bookings (admin)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET by status filter
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    // GET single
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));
    }

    // APPROVE
    public Booking approveBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(reason);
        return bookingRepository.save(booking);
    }

    // REJECT
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        return bookingRepository.save(booking);
    }

    // CANCEL (user only)
    public Booking cancelBooking(Long id, String email) {
        Booking booking = getBookingById(id);
        if (!booking.getBookedByEmail().equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only cancel your own bookings.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
