package E_Auction.platform.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuctionRequestDto
{

private String title;

private String description;

private Double startPrice;

private Long createdById;

private String imageUrl;

}
