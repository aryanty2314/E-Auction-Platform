package E_Auction.platform.dto.requests;

import jakarta.validation.constraints.NotNull;
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

@NotNull
private Long createdById;

private String imageUrl;

}
