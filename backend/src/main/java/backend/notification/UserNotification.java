package backend.notification;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1500)
    private String message;

    // `read` is a MySQL reserved keyword, so map it to a safe column name.
    @Column(nullable = false, name = "is_read")
    private boolean read = false;

    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(nullable = false, name = "recipient_email")
    private String recipientEmail;

    public UserNotification() {}

    public UserNotification(NotificationType type, String title, String message, String recipientEmail) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.recipientEmail = recipientEmail;
    }

    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
}

