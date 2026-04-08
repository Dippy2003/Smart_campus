package backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<TechnicianProfile, Long> {
    Optional<TechnicianProfile> findByUserEmail(String email);
}

