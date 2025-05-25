package E_Auction.platform.dto.webSocketResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BidUpdateDto
{
    private String username;
    private double price;
    private LocalDateTime timestamp;
}
