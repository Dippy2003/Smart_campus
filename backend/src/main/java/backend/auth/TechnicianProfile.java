package backend.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "technicians")
public class TechnicianProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(name = "department")
    private String department;

    @Column(name = "phone")
    private String phone;

    public TechnicianProfile() {}

    public TechnicianProfile(AppUser user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}

