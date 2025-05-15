package E_Auction.platform.mappers;

import E_Auction.platform.dto.requests.AuctionRequestDto;
import E_Auction.platform.dto.response.AuctionResponseDto;
import E_Auction.platform.entities.Auction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuctionMapper
{

    @Mapping(source = "createdById",target = "createdBy.id")
    Auction toEntity(AuctionRequestDto auctionRequestDto);

    @Mapping(source = "createdBy.username", target = "createdByUsername")
    AuctionResponseDto toDto(Auction auction);

}
