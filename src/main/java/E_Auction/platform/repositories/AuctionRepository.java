package E_Auction.platform.repositories;

import E_Auction.platform.entities.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
}
