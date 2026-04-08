package backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    @Query(value = """
            select date(u.created_at) as day, count(*) as count
            from app_users u
            where u.created_at >= :since
            group by date(u.created_at)
            order by day asc
            """, nativeQuery = true)
    List<DailySignupRow> countDailySignups(@Param("since") Instant since);

    interface DailySignupRow {
        java.sql.Date getDay();
        long getCount();
    }
}

