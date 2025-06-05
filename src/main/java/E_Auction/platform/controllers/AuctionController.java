package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.AuctionRequestDto;
import E_Auction.platform.dto.response.AuctionResponseDto;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.services.impl.AuctionServiceImpl;
import E_Auction.platform.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionServiceImpl auctionServiceimpl;
    private final JwtUtils jwtUtils;

    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<AuctionResponseDto>> getAllAuctions() {
        List<AuctionResponseDto> auctions = auctionServiceimpl.getAllAuctions();
        if (auctions.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(auctions, HttpStatus.OK);
    }

    @GetMapping(path = "/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<AuctionResponseDto> getAuctionById(@PathVariable Long id) {
        AuctionResponseDto auction = auctionServiceimpl.getAuctionById(id);
        return new ResponseEntity<>(auction, HttpStatus.OK);
    }

    @PostMapping()
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<AuctionResponseDto> createAuction(
            @Valid @RequestBody AuctionRequestDto auctionRequestDto,
            HttpServletRequest request) {
        try {
            // Extract user ID from JWT token
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Long userId = jwtUtils.extractId(token);
            if (userId == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            auctionRequestDto.setCreatedById(userId);

            AuctionResponseDto auctionResponseDto = auctionServiceimpl.createAuction(auctionRequestDto);
            return new ResponseEntity<>(auctionResponseDto, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(path = "/activate/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<String> activateAuction(@PathVariable Long id) {
        auctionServiceimpl.activateAuction(id);
        return new ResponseEntity<>("Auction is now Live ! ", HttpStatus.OK);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @GetMapping("/winner/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<String> getWinner(@PathVariable Long id) {
        String winner = auctionServiceimpl.getAuctionWinner(id);
        return ResponseEntity.ok("🏆 Winner: " + winner);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<?> getAuctionsByUser(@PathVariable Long userId) {
        try {
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body("Invalid user ID provided");
            }

            List<AuctionResponseDto> auctions = auctionServiceimpl.getAuctionsByUser(userId);
            return ResponseEntity.ok(auctions);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body("User ID must be a valid number");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving auctions: " + e.getMessage());
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<AuctionResponseDto> updateAuction(
            @PathVariable Long id,
            @Valid @RequestBody AuctionRequestDto dto) {

        AuctionResponseDto updated = auctionServiceimpl.updateAuction(id, dto);
        return ResponseEntity.ok(updated);
    }


}