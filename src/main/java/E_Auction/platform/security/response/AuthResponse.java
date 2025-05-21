package E_Auction.platform.security.response;

import E_Auction.platform.roles.role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class AuthResponse
{
private String token;
private String username;
private role role;
}
