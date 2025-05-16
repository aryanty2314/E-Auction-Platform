package E_Auction.platform.mappers;

import E_Auction.platform.dto.requests.BidRequestDto;
import E_Auction.platform.dto.response.BidResponseDto;
import E_Auction.platform.entities.Bid;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BidMapper
{
   @Mapping(source = "userId",target = "user.id")
   @Mapping(source = "auctionId",target = "auction.id")
   Bid toEntity(BidRequestDto bidRequestDto);

   @Mapping(source = "user.username",target = "username")
   @Mapping(source = "auction.id",target = "auctionId")
    BidResponseDto toDto(Bid bid);

}
