package E_Auction.platform.services;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;

import java.util.List;

public interface UserService
{

    UserResponseDto createUser(UserRequestDto userRequestDto);
    List<UserResponseDto> getUsers();

}
