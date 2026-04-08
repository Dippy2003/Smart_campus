package backend.dto;

public class IncidentTicketStatusUpdateRequest {
    private String status;
    private String assignedTechnician;
    private String solutionNote;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getSolutionNote() {
        return solutionNote;
    }

    public void setSolutionNote(String solutionNote) {
        this.solutionNote = solutionNote;
    }
}

