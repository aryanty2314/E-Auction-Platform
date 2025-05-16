package E_Auction.platform.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class BidRequestDto
{

    private Double amount;
    private Long userId;
    private Long auctionId;
}
