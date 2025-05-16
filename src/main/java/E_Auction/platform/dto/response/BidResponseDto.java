package E_Auction.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BidResponseDto
{

    private Long id;
    private Double amount;
    private String username;
    private Long auctionId;
    private LocalDateTime timestamp;
}
