package E_Auction.platform.repositories;

import E_Auction.platform.entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bid, Long>
{

}
