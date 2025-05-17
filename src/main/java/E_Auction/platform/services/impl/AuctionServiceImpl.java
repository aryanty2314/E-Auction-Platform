package E_Auction.platform.services.impl;

import E_Auction.platform.dto.requests.AuctionRequestDto;
import E_Auction.platform.dto.response.AuctionResponseDto;
import E_Auction.platform.entities.Auction;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.mappers.AuctionMapper;
import E_Auction.platform.repositories.AuctionRepository;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.services.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionMapper auctionMapper;
    private final UserRepository userRepository;


    @Override
    public AuctionResponseDto createAuction(AuctionRequestDto auctionRequestDto) {
        User user = userRepository.findById(auctionRequestDto.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Auction auction = auctionMapper.toEntity(auctionRequestDto);
        auction.setStartPrice(auctionRequestDto.getStartPrice());
        auction.setCreatedBy(user);
        auction.setTitle(auctionRequestDto.getTitle());
        auction.setDescription(auctionRequestDto.getDescription());
        auction.setLastBidTime(LocalDateTime.now());
        auction.setActive(true);
        Auction saved = auctionRepository.save(auction);

        return auctionMapper.toDto(saved);
    }

    @Override
    public List<AuctionResponseDto> getAllAuctions() {
        return auctionRepository.findByActiveTrue()
                .stream().map(auctionMapper::toDto).
                collect(Collectors.toList());
    }

    @Override
    public AuctionResponseDto getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction Not Found"));
        return auctionMapper.toDto(auction);
    }

    @Override
    @Scheduled(fixedRate = 60000)
    public void endInactiveAuctions() {
        List<Auction> activeAuctions = auctionRepository.findByActiveTrue();
        for (Auction auction : activeAuctions) {
            if (auction.getLastBidTime() != null &&
                    Duration.between(auction.getLastBidTime(), LocalDateTime.now()).toMinutes() >= 2) {
                auction.setActive(false);
                auctionRepository.save(auction);
            }
        }

    }

    @Override
    public void activateAuction(Long auctionId) throws ResourceNotFoundException, InvalidOperationException {
    Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(()-> new ResourceNotFoundException("Auction Not Found"));

    if (auction.isActive())
    {
        throw new InvalidOperationException("Auction is Live");
    }

    auction.setActive(true);
    auction.setLastBidTime(LocalDateTime.now());
    auctionRepository.save(auction);
    }
}
