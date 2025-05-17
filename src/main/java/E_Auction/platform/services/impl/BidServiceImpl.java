package E_Auction.platform.services.impl;

import E_Auction.platform.dto.requests.BidRequestDto;
import E_Auction.platform.dto.response.BidResponseDto;
import E_Auction.platform.entities.Auction;
import E_Auction.platform.entities.Bid;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidBidException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.exceptions.UserNotFoundException;
import E_Auction.platform.mappers.BidMapper;
import E_Auction.platform.repositories.AuctionRepository;
import E_Auction.platform.repositories.BidRepository;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.services.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final BidMapper bidMapper;


    @Override

    public BidResponseDto placeBid(BidRequestDto bidRequestDto) throws UserNotFoundException, InvalidBidException, ResourceNotFoundException {

        Auction auction = auctionRepository.findById(bidRequestDto.getAuctionId())
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.isActive()) {
            throw new ResourceNotFoundException("Auction not found");
        }

        if (bidRequestDto.getAmount() <= auction.getCurrentPrice()) {
            throw new InvalidBidException("Bid is Invalid");
        }

        User user = userRepository.findById(bidRequestDto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User Not Found !! "));


        Bid bid = bidMapper.toEntity(bidRequestDto);
        bid.setTimestamp(LocalDateTime.now());
        bid.setUser(user);
        bid.setAuction(auction);

        Bid savedBid = bidRepository.save(bid);

        auction.setCurrentPrice(bidRequestDto.getAmount());
        auction.setLastBidTime(LocalDateTime.now());
        auctionRepository.save(auction);

        return bidMapper.toDto(savedBid);
    }

    @Override
    public List<BidResponseDto> getBidsForAuction(Long auctionId)
    {
        return bidRepository.findByAuctionIdOrderByTimestampDesc(auctionId)
                .stream().map(bidMapper::toDto)
                .collect(Collectors.toList());
    }
}
