package backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Sends incident reply emails to the requester when SMTP is configured.
 * If {@code spring.mail.host} is not set, {@link JavaMailSender} is absent and
 * the message is logged instead (development-friendly).
 */
@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final Optional<JavaMailSender> mailSender;

    /** Used as From when sending; typically same as {@code spring.mail.username}. */
    @Value("${spring.mail.from:${spring.mail.username:}}")
    private String fromAddress;

    public EmailNotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = Optional.ofNullable(mailSender);
    }

    public void sendIncidentReplyToRequester(String toEmail, String ticketTitle, long ticketId, String replyBody) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send reply email: no requester email for ticket #{}", ticketId);
            return;
        }
        String subject = "Ticket #" + ticketId + " — New reply from maintenance";
        String body = "Hello,\n\n"
                + "You have a new reply about your incident ticket:\n\n"
                + "Ticket: " + (ticketTitle != null ? ticketTitle : "(no title)") + "\n"
                + "Ticket ID: #" + ticketId + "\n\n"
                + "---\n"
                + replyBody.trim()
                + "\n---\n\n"
                + "You can also track updates in the app under My Tickets.\n\n"
                + "— Smart Campus Incidents";

        if (mailSender.isEmpty()) {
            log.info("[Email not configured — would send to {}]\nSubject: {}\n{}", toEmail, subject, body);
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                msg.setFrom(fromAddress);
            }
            msg.setTo(toEmail);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.get().send(msg);
            log.debug("Sent incident reply email to {} for ticket #{}", toEmail, ticketId);
        } catch (Exception e) {
            log.warn("Failed to send reply email to {} for ticket #{}: {}", toEmail, ticketId, e.getMessage());
        }
    }
}
