package backend.controller;

import backend.model.Booking;
import backend.model.BookingStatus;
import backend.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings — create booking
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

    // GET /api/bookings/my?email=xxx — user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    // GET /api/bookings — all bookings, optional ?status= filter
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = (body != null) ? body.getOrDefault("reason", "") : "";
            return ResponseEntity.ok(bookingService.approveBooking(id, reason));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = (body != null) ? body.getOrDefault("reason", "") : "";
            return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/cancel
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
