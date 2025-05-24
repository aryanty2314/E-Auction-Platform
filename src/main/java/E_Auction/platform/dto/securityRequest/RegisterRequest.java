package E_Auction.platform.dto.securityRequest;

import E_Auction.platform.roles.role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class RegisterRequest
{
    private String username;
    private String email;
    private String password;
    private role role;
}
