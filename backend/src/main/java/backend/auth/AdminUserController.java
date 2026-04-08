package backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final AppUserRepository users;

    public AdminUserController(AppUserRepository users) {
        this.users = users;
    }

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
}

