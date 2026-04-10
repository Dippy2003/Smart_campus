package backend.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

    @Bean
    CommandLineRunner seedUsers(AppUserRepository users, TechnicianRepository techs, PasswordEncoder encoder) {
        return args -> {
            seed(users, encoder, "admin@paf.com", "Admin User", "Admin123", UserRole.ADMIN);
            seed(users, encoder, "tech@paf.com", "Tech User", "Tech1234", UserRole.TECHNICIAN);
            seed(users, encoder, "electrician@campus.lk", "Campus Electrician", "Tech1234", UserRole.TECHNICIAN);
            seed(users, encoder, "plumber@campus.lk", "Campus Plumber", "Tech1234", UserRole.TECHNICIAN);
            seed(users, encoder, "engineer@campus.lk", "Building Engineer", "Tech1234", UserRole.TECHNICIAN);
            seed(users, encoder, "student@paf.com", "Student User", "Student1A", UserRole.USER);

            users.findByEmail("tech@paf.com").ifPresent(u -> {
                techs.findByUserEmail(u.getEmail()).orElseGet(() -> techs.save(new TechnicianProfile(u)));
            });
            users.findByEmail("electrician@campus.lk").ifPresent(u -> {
                techs.findByUserEmail(u.getEmail()).orElseGet(() -> techs.save(new TechnicianProfile(u)));
            });
            users.findByEmail("plumber@campus.lk").ifPresent(u -> {
                techs.findByUserEmail(u.getEmail()).orElseGet(() -> techs.save(new TechnicianProfile(u)));
            });
            users.findByEmail("engineer@campus.lk").ifPresent(u -> {
                techs.findByUserEmail(u.getEmail()).orElseGet(() -> techs.save(new TechnicianProfile(u)));
            });
        };
    }

    private void seed(AppUserRepository users, PasswordEncoder encoder, String email, String name, String pw, UserRole role) {
        users.findByEmail(email).orElseGet(() -> {
            AppUser u = new AppUser(name, email, encoder.encode(pw), role);
            u.setAvatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8));
            return users.save(u);
        });
    }
}

