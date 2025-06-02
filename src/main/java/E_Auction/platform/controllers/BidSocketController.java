package E_Auction.platform.controllers;

import E_Auction.platform.dto.webSocketRequest.BidMessage;
import E_Auction.platform.dto.webSocketResponse.BidUpdateDto;
import E_Auction.platform.entities.Auction;
import E_Auction.platform.entities.Bid;
import E_Auction.platform.entities.User;
import E_Auction.platform.repositories.AuctionRepository;
import E_Auction.platform.repositories.BidRepository;
import E_Auction.platform.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class BidSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;

    @MessageMapping("/bid")
    public void handleBid(@Payload BidMessage message, Principal userPrincipal) {
        String email = userPrincipal.getName();
        User user = userRepository.findByEmail(email).get();
        Auction auction = auctionRepository.findById(message.getAuctionId()).get();

        if (!auction.isActive() || message.getPrice() <= auction.getCurrentPrice()) {
            return;
        }
        Bid bid = new Bid();
        bid.setAmount(message.getPrice());
        bid.setUser(user);
        bid.setAuction(auction);
        bid.setTimestamp(LocalDateTime.now());
        bidRepository.save(bid);

        auction.setCurrentPrice(message.getPrice());
        auction.setLastBidTime(LocalDateTime.now());
        auctionRepository.save(auction);

        BidUpdateDto update = new BidUpdateDto(user.getUsername(), message.getPrice(), LocalDateTime.now());

        messagingTemplate.convertAndSend(
                "/topic/auction/" + message.getAuctionId(),
                update
        );
    }
}
