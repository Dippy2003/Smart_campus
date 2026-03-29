package backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private resourcesModel resource;

    private String bookedByEmail;
    private String purpose;
    private Integer attendees;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    private String adminReason;

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public resourcesModel getResource() { return resource; }
    public void setResource(resourcesModel resource) { this.resource = resource; }

    public String getBookedByEmail() { return bookedByEmail; }
    public void setBookedByEmail(String bookedByEmail) { this.bookedByEmail = bookedByEmail; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Integer getAttendees() { return attendees; }
    public void setAttendees(Integer attendees) { this.attendees = attendees; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getAdminReason() { return adminReason; }
    public void setAdminReason(String adminReason) { this.adminReason = adminReason; }
}
