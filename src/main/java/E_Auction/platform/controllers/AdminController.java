package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;
import E_Auction.platform.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@EnableMethodSecurity
public class AdminController
{

    private final UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")

    public ResponseEntity<List<UserResponseDto>> allUsers() {
        List<UserResponseDto> users = userService.getUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }


    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createAdmin(@RequestBody UserRequestDto user)
    {
       UserResponseDto newAdmin = userService.saveAdmin(user);
        return new ResponseEntity<>(newAdmin,HttpStatus.CREATED);

    }
}
