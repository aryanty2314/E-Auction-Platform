package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;
import E_Auction.platform.repositories.AuctionRepository;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@EnableMethodSecurity
public class AdminController {

    private final UserService userService;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

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
    public ResponseEntity<UserResponseDto> createAdmin(@RequestBody UserRequestDto user) {
        UserResponseDto newAdmin = userService.saveAdmin(user);
        return new ResponseEntity<>(newAdmin, HttpStatus.CREATED);

    }

    @DeleteMapping(path = "/delete/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<?> deleteAuction(@PathVariable Long id) {
        auctionRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }

    @DeleteMapping(path = "/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
