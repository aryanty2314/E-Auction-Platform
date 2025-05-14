package E_Auction.platform.dto.response;


import E_Auction.platform.roles.role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserResponseDto
{

    private Long id;
    private String username;
    private String email;
    private role role;

}
