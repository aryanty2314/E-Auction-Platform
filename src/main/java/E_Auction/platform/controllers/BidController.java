package E_Auction.platform.controllers;

import E_Auction.platform.dto.requests.BidRequestDto;
import E_Auction.platform.dto.response.BidResponseDto;
import E_Auction.platform.entities.Bid;
import E_Auction.platform.exceptions.InvalidBidException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.exceptions.UserNotFoundException;
import E_Auction.platform.repositories.BidRepository;
import E_Auction.platform.services.impl.BidServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/bids")
@RequiredArgsConstructor
public class BidController
{

    private final BidServiceImpl bidService;

    @PostMapping()
    public ResponseEntity<BidResponseDto> newBid(@RequestBody BidRequestDto bidRequestDto) throws UserNotFoundException, InvalidBidException, ResourceNotFoundException {

        BidResponseDto bidResponseDto = bidService.placeBid(bidRequestDto);
        return new ResponseEntity<>(bidResponseDto, HttpStatus.CREATED);
    }

    @GetMapping(path = "/auction/{id}")
    public ResponseEntity<List<BidResponseDto>> getAllBids(@PathVariable Long id)
    {

        List<BidResponseDto> allBids = bidService.getBidsForAuction(id);
        return new ResponseEntity<>(allBids,HttpStatus.OK);
    }
}
