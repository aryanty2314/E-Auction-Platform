package E_Auction.platform.security.service;

import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.UserNotFoundException;
import E_Auction.platform.mappers.UserMapper;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.roles.role;
import E_Auction.platform.security.request.LoginRequest;
import E_Auction.platform.security.request.RegisterRequest;
import E_Auction.platform.security.response.AuthResponse;
import E_Auction.platform.security.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService
{

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;



    public AuthResponse register(RegisterRequest register) throws InvalidOperationException
    {
        if (register.getRole() == role.ADMIN)
        {
            throw new InvalidOperationException("Unable to register as ADMIN");
        }

        if (userRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new InvalidOperationException("Email already exists!");
        }

        User user = User.builder()
                .username(register.getUsername())
                .password(passwordEncoder.encode(register.getPassword()))
                .email(register.getEmail())
                .role(register.getRole())
                .build();

        User savedUser = userRepository.save(user);
        String jwtToken = jwtUtils.generateToken(user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .token(jwtToken)
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest login) throws UserNotFoundException
    {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        login.getEmail(),
                        login.getPassword()
                )
        );

        User user = userRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Unable to find the user"));

        String jwtToken = jwtUtils.generateToken(user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
