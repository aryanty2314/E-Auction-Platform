package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.AuctionRequestDto;
import E_Auction.platform.dto.response.AuctionResponseDto;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.services.impl.AuctionServiceImpl;
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
public class AuctionController
{

    private final AuctionServiceImpl auctionServiceimpl;

    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<AuctionResponseDto>> getAllAuctions()
    {
      List<AuctionResponseDto> auctions = auctionServiceimpl.getAllAuctions();
      if (auctions.isEmpty())
      {
          return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }
      return new ResponseEntity<>(auctions, HttpStatus.OK);
    }

    @GetMapping(path = "/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<AuctionResponseDto> getAuctionById(@PathVariable Long id)
    {
        AuctionResponseDto auction = auctionServiceimpl.getAuctionById(id);
        return new ResponseEntity<>(auction, HttpStatus.OK);
    }

    @PostMapping()
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<AuctionResponseDto> createAuction(@Valid @RequestBody AuctionRequestDto auctionRequestDto)
    {
       AuctionResponseDto auctionResponseDto = auctionServiceimpl.createAuction(auctionRequestDto);
       return new ResponseEntity<>(auctionResponseDto, HttpStatus.CREATED);
    }

    @PostMapping(path = "/activate/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<String> activateAuction(@PathVariable Long id) throws InvalidOperationException, ResourceNotFoundException {

     auctionServiceimpl.activateAuction(id);
     return new ResponseEntity<>("Auction is now Live ! ", HttpStatus.OK);
    }

}
