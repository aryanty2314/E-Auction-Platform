package E_Auction.platform.security.service;

import E_Auction.platform.entities.RefreshToken;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.repositories.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService
{

    private final RefreshTokenRepository repository;

    @Transactional
    public RefreshToken createToken(User user) {
        Optional<RefreshToken> existingTokenOpt = repository.findByUser(user);

        if (existingTokenOpt.isPresent()) {
            RefreshToken existing = existingTokenOpt.get();
            existing.setToken(UUID.randomUUID().toString());
            existing.setExpiryTime(LocalDateTime.now().plusDays(3));
            return repository.save(existing);
        } else {
            RefreshToken newToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryTime(LocalDateTime.now().plusDays(3))
                    .build();
            return repository.save(newToken);
        }
    }

    public RefreshToken verifyToken(String token) throws InvalidOperationException
    {
        return repository.findByToken(token)
                .filter(rt->rt.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElseThrow(()->new InvalidOperationException("UNABLE TO VERIFY !!"));
    }

    @Transactional
    public void deleteToken(User user)
    {
        repository.deleteByUser(user);
    }

}
