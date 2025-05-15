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
public class AuctionResponseDto
{

    private Long id;
    private String title;
    private String description;
    private String startPrice;
    private Long currentPrice;
    private LocalDateTime lastBidTime;
    private String imageUrl;
    private String createdByUsername;
    private boolean active;

}
