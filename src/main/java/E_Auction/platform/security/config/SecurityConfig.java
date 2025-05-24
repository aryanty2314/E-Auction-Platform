package E_Auction.platform.security.config;

import E_Auction.platform.security.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig
{
    private final JwtAuthFilter jwtAuthFilter;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/user/**",
            "/api/auctions",
            "/api/auctions/{id}",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private static final String[] SELLER_ENDPOINTS = {
            "/api/v1/auctions/**"
    };

    private static final String[] BIDDER_ENDPOINTS = {
            "/api/v1/bids/**"
    };

    private static final String[] ADMIN_ENDPOINTS = {
            "/api/v1/admin/**"
    };


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {

        return http.
                csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(SELLER_ENDPOINTS).hasAnyRole("SELLER","ADMIN")
                        .requestMatchers(BIDDER_ENDPOINTS).hasAnyRole("BIDDER","ADMIN")
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception
    {
     return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder()
    {
        return new BCryptPasswordEncoder();
    }
}
