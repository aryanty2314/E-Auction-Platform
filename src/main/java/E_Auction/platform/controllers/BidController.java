package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.BidRequestDto;
import E_Auction.platform.dto.response.BidResponseDto;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidBidException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.exceptions.UserNotFoundException;
import E_Auction.platform.repositories.BidRepository;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.services.impl.BidServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidServiceImpl bidService;
    private final UserRepository userRepository; // Add this

    @PostMapping()
    @PreAuthorize("hasAnyRole('ADMIN','BIDDER','SELLER')")
    public ResponseEntity<BidResponseDto> newBid(
            @RequestBody BidRequestDto bidRequestDto,
            Principal principal) throws UserNotFoundException, InvalidBidException, ResourceNotFoundException {

        // Get user from JWT token instead of request body
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User Not Found"));

        // Set the userId in the request DTO
        bidRequestDto.setUserId(user.getId());

        BidResponseDto bidResponseDto = bidService.placeBid(bidRequestDto, email);
        return new ResponseEntity<>(bidResponseDto, HttpStatus.CREATED);
    }

    @GetMapping(path = "/auction/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<List<BidResponseDto>> getAllBids(@PathVariable Long id) {
        List<BidResponseDto> allBids = bidService.getBidsForAuction(id);
        return new ResponseEntity<>(allBids, HttpStatus.OK);
    }
}