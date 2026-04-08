package backend.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OAuth2UserProvisioner implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public OAuth2UserProvisioner(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth = new DefaultOAuth2UserService().loadUser(userRequest);
        Map<String, Object> attrs = oauth.getAttributes();

        String email = (String) attrs.get("email");
        String name = (String) attrs.getOrDefault("name", email);
        String picture = (String) attrs.getOrDefault("picture", null);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Missing email from OAuth provider");
        }

        AppUser user = users.findByEmail(email.toLowerCase())
                .orElseGet(() -> {
                    // Random password hash so local login is possible only after explicit password reset flow.
                    String random = UUID.randomUUID().toString();
                    AppUser created = new AppUser(name, email.toLowerCase(), encoder.encode(random), UserRole.USER);
                    created.setAvatarUrl(picture);
                    return users.save(created);
                });

        Collection<? extends GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        // Use "email" as the name attribute key
        return new DefaultOAuth2User(authorities, attrs, "email");
    }
}

