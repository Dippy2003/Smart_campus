package backend.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final Environment env;

    public AuthController(AppUserRepository users, PasswordEncoder encoder, AuthenticationManager authManager, Environment env) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
        this.env = env;
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 80) String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 200) String password
    ) {}

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.ok(null);
        }
        AppUser u = users.findByEmail(auth.getName().toLowerCase()).orElse(null);
        if (u == null) return ResponseEntity.ok(null);
        return ResponseEntity.ok(safeUser(u));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password())
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

        AppUser u = users.findByEmail(req.email().toLowerCase()).orElseThrow();
        return ResponseEntity.ok(safeUser(u));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest request
    ) {
        String email = req.email().toLowerCase().trim();
        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists."));
        }
        if (!req.password().matches(".*[A-Z].*") || !req.password().matches(".*\\d.*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain at least one uppercase letter and one number."));
        }

        AppUser created = new AppUser(req.name().trim(), email, encoder.encode(req.password()), UserRole.USER);
        created.setAvatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + java.net.URLEncoder.encode(created.getName(), java.nio.charset.StandardCharsets.UTF_8));
        users.save(created);

        // Auto-login
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.password())
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

        return ResponseEntity.ok(safeUser(created));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/google/enabled")
    public ResponseEntity<?> googleEnabled() {
        String clientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id", "");
        boolean enabled =
                clientId != null
                        && !clientId.isBlank()
                        && !clientId.equals("placeholder-client-id");
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    private Map<String, Object> safeUser(AppUser u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "avatar", u.getAvatarUrl()
        );
    }
}

