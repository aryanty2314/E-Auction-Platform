package E_Auction.platform.security.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils
{
    @Value("${jwt.secret}")
    private String secret_key;
    private final Long expiration_time= 86400000L;

    // Remove initialization here
    private Key key;

    // Add a PostConstruct method to initialize the key after properties are set
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret_key.getBytes());
    }


    public String generateToken(String email,String role)
    {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .setSubject(email)
                .addClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() +expiration_time))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token)
    {
       return extractClaims(token).getSubject();
    }

    public String extractRole(String token)
    {
        return (String) extractClaims(token).get("role");
    }

    public boolean validateToken(String token)
    {
     try {
         extractClaims(token);
         return true;
     }
     catch (JwtException e)
     {
         return false;
     }
    }

    private Claims extractClaims(String token)
    {
     return Jwts.parserBuilder()
             .setSigningKey(key)
             .build()
             .parseClaimsJws(token)
             .getBody();
    }
}
