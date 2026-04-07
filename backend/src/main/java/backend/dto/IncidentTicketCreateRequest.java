package backend.dto;

public class IncidentTicketCreateRequest {
    private String requesterEmail;
    private String title;
    private String description;
    private String ticketType;
    private String category;
    private String location;
    private String priority;
    private java.util.List<String> attachments;

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(String ticketType) {
        this.ticketType = ticketType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public java.util.List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(java.util.List<String> attachments) {
        this.attachments = attachments;
    }
}

