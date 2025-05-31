package E_Auction.platform.services;


import E_Auction.platform.dto.requests.AuctionRequestDto;
import E_Auction.platform.dto.response.AuctionResponseDto;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.ResourceNotFoundException;

import java.util.List;

public interface AuctionService
{
AuctionResponseDto createAuction(AuctionRequestDto auctionRequestDto);
List<AuctionResponseDto> getAllAuctions();
AuctionResponseDto getAuctionById(Long id);
void endInactiveAuctions();
void activateAuction(Long auctionId) throws ResourceNotFoundException, InvalidOperationException;
}
