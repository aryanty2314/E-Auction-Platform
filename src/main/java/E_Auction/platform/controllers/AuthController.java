package E_Auction.platform.controllers;

import E_Auction.platform.entities.RefreshToken;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.UserNotFoundException;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.dto.securityRequest.LoginRequest;
import E_Auction.platform.dto.securityRequest.RegisterRequest;
import E_Auction.platform.dto.securityRequest.TokenRefreshRequest;
import E_Auction.platform.dto.securityResponse.AuthResponse;
import E_Auction.platform.services.securityService.AuthService;
import E_Auction.platform.services.securityService.RefreshTokenService;
import E_Auction.platform.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin()
public class AuthController
{

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping(path = "/register")
    @SneakyThrows
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request)
    {
        AuthResponse authResponse = authService.register(request);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping(path = "/login")
    @SneakyThrows
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request)
    {
        AuthResponse authResponse = authService.login(request);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @PostMapping(path = "/refresh")
    @SneakyThrows
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody TokenRefreshRequest request)
    {
        RefreshToken refreshToken = refreshTokenService.verifyToken(request.getRefreshToken());

        User user = refreshToken.getUser();

        String newAccessToken = jwtUtils.generateToken(user.getEmail(), user.getRole().toString());

        return ResponseEntity.ok(
                AuthResponse.builder()
                        .token(newAccessToken)
                        .refreshToken(refreshToken.getToken())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .build()
        );
    }

    @PostMapping(path = "/logout")
    @SneakyThrows
    public ResponseEntity<String> logout(@RequestBody LoginRequest request)
    {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new UserNotFoundException("User Not Found"));

        refreshTokenService.deleteToken(user);
     return ResponseEntity.ok("User Logged Out Successfully");
    }

}
