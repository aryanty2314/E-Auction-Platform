package E_Auction.platform.security.controller;

import E_Auction.platform.security.request.LoginRequest;
import E_Auction.platform.security.request.RegisterRequest;
import E_Auction.platform.security.response.AuthResponse;
import E_Auction.platform.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController
{

    private final AuthService authService;

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

}
