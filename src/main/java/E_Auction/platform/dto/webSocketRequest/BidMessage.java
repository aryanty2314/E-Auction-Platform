package E_Auction.platform.dto.webSocketRequest;

import lombok.*;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class BidMessage
{
    private Long auctionId;
    private double price;
}
