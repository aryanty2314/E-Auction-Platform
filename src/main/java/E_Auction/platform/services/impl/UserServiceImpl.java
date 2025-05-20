package E_Auction.platform.services.impl;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;
import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.mappers.UserMapper;
import E_Auction.platform.repositories.UserRepository;
import E_Auction.platform.roles.role;
import E_Auction.platform.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @SneakyThrows
    @Override
    public UserResponseDto createUser(UserRequestDto userRequestDto) {
        if (userRequestDto.getRole() == role.ADMIN) {
            throw new InvalidOperationException("Cannot self-register as ADMIN.");
        }

        userRequestDto.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));

        User user = userMapper.toEntity(userRequestDto);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public List<UserResponseDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto saveAdmin(UserRequestDto user) {
        user.setRole(role.ADMIN);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User user1 = userMapper.toEntity(user);
        return userMapper.toDto(userRepository.save(user1));
    }
}
