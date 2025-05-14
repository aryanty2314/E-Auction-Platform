package E_Auction.platform.mappers;

import E_Auction.platform.dto.requests.UserRequestDto;
import E_Auction.platform.dto.response.UserResponseDto;
import E_Auction.platform.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
@Component
public interface UserMapper
{
    User toEntity(UserRequestDto dto);

    UserResponseDto toDto(User user);

}
