package backend.controller;

import backend.model.Booking;
import backend.model.BookingStatus;
import backend.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BookingController — Member 2 (Bathiya)
 * REST API endpoints for Booking Management (Module B).
 *
 * Endpoints:
 *   POST   /api/bookings              - create booking
 *   GET    /api/bookings/my           - user's own bookings
 *   GET    /api/bookings              - all bookings (admin)
 *   GET    /api/bookings/{id}         - single booking
 *   GET    /api/bookings/stats        - booking statistics
 *   PATCH  /api/bookings/{id}         - update booking (user edits PENDING booking)
 *   PUT    /api/bookings/{id}/approve - approve booking
 *   PUT    /api/bookings/{id}/reject  - reject booking
 *   PUT    /api/bookings/{id}/cancel  - cancel booking
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings — create new booking (status: PENDING)
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking created = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings/my?email=xxx — get user's own bookings
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(@RequestParam String email) {
        try {
            return ResponseEntity.ok(bookingService.getMyBookings(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings — all bookings, optional ?status= filter (admin)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/stats — booking counts by status
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getBookingStats() {
        return ResponseEntity.ok(bookingService.getBookingStats());
    }

    // GET /api/bookings/{id} — get single booking by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PATCH /api/bookings/{id} — user updates their PENDING booking
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        try {
            return ResponseEntity.ok(bookingService.updateBooking(id, updates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/approve — admin approves booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = (body != null) ? body.getOrDefault("reason", "") : "";
            return ResponseEntity.ok(bookingService.approveBooking(id, reason));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/reject — admin rejects booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = (body != null) ? body.getOrDefault("reason", "") : "";
            return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/cancel — user cancels their own booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, body.get("email")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
