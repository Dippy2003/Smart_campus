package backend.notification;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final UserNotificationRepository repo;

    public NotificationService(UserNotificationRepository repo) {
        this.repo = repo;
    }

    public void notify(String recipientEmail, NotificationType type, String title, String message) {
        if (recipientEmail == null || recipientEmail.isBlank()) return;
        repo.save(new UserNotification(type, title, message, recipientEmail.trim().toLowerCase()));
    }
}

