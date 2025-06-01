package E_Auction.platform.services;

import E_Auction.platform.dto.requests.BidRequestDto;
import E_Auction.platform.dto.response.BidResponseDto;
import E_Auction.platform.entities.Bid;
import E_Auction.platform.exceptions.InvalidBidException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.exceptions.UserNotFoundException;

import java.util.List;

public interface BidService
{
BidResponseDto placeBid(BidRequestDto bidRequestDto,String email) throws InvalidBidException, ResourceNotFoundException, UserNotFoundException;
BidResponseDto placeBid(BidRequestDto bidRequestDto);
List<BidResponseDto> getBidsForAuction(Long auctionId);
}
