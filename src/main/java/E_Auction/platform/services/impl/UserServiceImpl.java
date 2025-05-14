package E_Auction.platform.services.impl;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;
import E_Auction.platform.mappers.UserMapper;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.services.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class UserServiceImpl implements UserService
{
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    public UserResponseDto createUser(UserRequestDto userRequestDto)
    {

        User user = userMapper.toEntity(userRequestDto);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);

    }

    @Override
    public List<UserResponseDto> getUsers()
    {

        List<User> users = userRepository.findAll();
        return users.stream().map(userMapper::toDto).collect(Collectors.toList());
    }


}
