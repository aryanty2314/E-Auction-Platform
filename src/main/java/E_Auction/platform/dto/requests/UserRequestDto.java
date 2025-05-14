package E_Auction.platform.dto.requests;

import E_Auction.platform.roles.role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDto
{
    private String username;
    private String password;
    private String email;
    private role role;
}
