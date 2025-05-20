package E_Auction.platform.services;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;

import java.util.List;

public interface UserService
{

    UserResponseDto createUser(UserRequestDto userRequestDto);
    List<UserResponseDto> getUsers();
    UserResponseDto saveAdmin(UserRequestDto user);

}
