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
import lombok.SneakyThrows;
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
    @SneakyThrows
    public AuctionResponseDto createAuction(AuctionRequestDto dto)
    {
        if (dto.getCreatedById()==null)
        {
            throw new ResourceNotFoundException("Inable to find");

        }
        User user = userRepository.findById(dto.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        Auction auction = auctionMapper.toEntity(dto);

        auction.setCreatedBy(user);
        auction.setTitle(dto.getTitle());
        auction.setDescription(dto.getDescription());
        auction.setStartPrice(dto.getStartPrice());
        auction.setCurrentPrice(dto.getStartPrice());
        auction.setLastBidTime(LocalDateTime.now());
        auction.setActive(false); // Default inactive

        return auctionMapper.toDto(auctionRepository.save(auction));
    }

    @Override
    public List<AuctionResponseDto> getAllAuctions() {
        return auctionRepository.findAll()
                .stream()
                .map(auctionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @SneakyThrows
    public AuctionResponseDto getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction Not Found"));
        return auctionMapper.toDto(auction);
    }

    @Override
    @Scheduled(fixedRate = 300000) // Every 5 min
    public void endInactiveAuctions() {
        List<Auction> activeAuctions = auctionRepository.findByActiveTrue();
        for (Auction auction : activeAuctions) {
            if (auction.getLastBidTime() != null &&
                    Duration.between(auction.getLastBidTime(), LocalDateTime.now()).toMinutes() >= 6)
            {

                auction.setActive(false);
                auction.setCompleted(true);
                auctionRepository.save(auction);
            }
        }
    }

    @Override
    @SneakyThrows
    public void activateAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction Not Found"));

        if (auction.isActive()) {
            throw new InvalidOperationException("Auction is already live");
        }
        if(auction.isCompleted())
        {
            throw new InvalidOperationException("Auction is already completed");
        }

        auction.setActive(true);
        auction.setLastBidTime(LocalDateTime.now());
        auctionRepository.save(auction);
    }
}