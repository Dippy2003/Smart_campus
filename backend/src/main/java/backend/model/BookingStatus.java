package backend.model;

/**
 * BookingStatus enum — Member 2 (Bathiya)
 * Defines all possible states of a booking request.
 *
 * Flow:
 *   PENDING   -> booking submitted, waiting for admin review
 *   APPROVED  -> admin approved the booking
 *   REJECTED  -> admin rejected the booking with reason
 *   CANCELLED -> user cancelled an existing booking
 */
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED;

    public String getDescription() {
        switch (this) {
            case PENDING:   return "Waiting for admin approval";
            case APPROVED:  return "Booking has been approved";
            case REJECTED:  return "Booking was rejected by admin";
            case CANCELLED: return "Booking was cancelled by user";
            default:        return "Unknown status";
        }
    }

    public boolean isActive() {
        return this == PENDING || this == APPROVED;
    }
}
