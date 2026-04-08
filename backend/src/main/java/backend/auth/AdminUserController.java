package backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public AdminUserController(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    public record CreateUserRequest(String name, String email, String password, String role) {}
    public record UpdateUserRequest(String name, String email, String role) {}

    @GetMapping("/signups/daily")
    public ResponseEntity<List<Map<String, Object>>> dailySignups(@RequestParam(defaultValue = "30") int days) {
        if (days < 1) days = 1;
        if (days > 365) days = 365;

        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return ResponseEntity.ok(
                users.countDailySignups(since).stream()
                        .map(r -> Map.<String, Object>of(
                                "day", r.getDay().toString(),
                                "count", r.getCount()
                        ))
                        .toList()
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> allUsers = users.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "avatar", u.getAvatarUrl() == null ? "" : u.getAvatarUrl(),
                        "createdAt", u.getCreatedAt() == null ? "" : u.getCreatedAt().toString()
                ))
                .toList();
        return ResponseEntity.ok(allUsers);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        String name = req.name() == null ? "" : req.name().trim();
        String email = req.email() == null ? "" : req.email().trim().toLowerCase();
        String password = req.password() == null ? "" : req.password();
        String role = req.role() == null ? "" : req.role().trim().toUpperCase();

        if (name.isBlank() || email.isBlank() || password.isBlank() || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email, password and role are required."));
        }
        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters."));
        }
        if (!password.matches(".*[A-Z].*") || !password.matches(".*\\d.*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain at least one uppercase letter and one number."));
        }

        UserRole parsedRole;
        try {
            parsedRole = UserRole.valueOf(role);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Use USER, ADMIN or TECHNICIAN."));
        }

        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists."));
        }

        AppUser created = new AppUser(name, email, encoder.encode(password), parsedRole);
        created.setAvatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8));
        users.save(created);

        return ResponseEntity.status(201).body(Map.of(
                "id", created.getId(),
                "name", created.getName(),
                "email", created.getEmail(),
                "role", created.getRole().name(),
                "avatar", created.getAvatarUrl() == null ? "" : created.getAvatarUrl(),
                "createdAt", created.getCreatedAt() == null ? "" : created.getCreatedAt().toString()
        ));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        AppUser user = users.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        String nextName = req.name() == null ? "" : req.name().trim();
        String nextEmail = req.email() == null ? "" : req.email().trim().toLowerCase();
        String nextRole = req.role() == null ? "" : req.role().trim().toUpperCase();

        if (nextName.isBlank() || nextEmail.isBlank() || nextRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email and role are required."));
        }

        UserRole parsedRole;
        try {
            parsedRole = UserRole.valueOf(nextRole);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Use USER, ADMIN or TECHNICIAN."));
        }

        AppUser existingByEmail = users.findByEmail(nextEmail).orElse(null);
        if (existingByEmail != null && !existingByEmail.getId().equals(user.getId())) {
            return ResponseEntity.status(409).body(Map.of("message", "Another user already uses this email."));
        }

        user.setName(nextName);
        user.setEmail(nextEmail);
        user.setRole(parsedRole);
        users.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "avatar", user.getAvatarUrl() == null ? "" : user.getAvatarUrl(),
                "createdAt", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString()
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        AppUser user = users.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        String currentEmail = auth != null && auth.getName() != null ? auth.getName().toLowerCase() : "";
        if (!currentEmail.isBlank() && currentEmail.equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete your own account."));
        }

        users.delete(user);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

