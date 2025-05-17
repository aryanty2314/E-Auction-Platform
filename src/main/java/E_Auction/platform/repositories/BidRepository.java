package E_Auction.platform.repositories;
import E_Auction.platform.entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long>
{
List<Bid> findByAuctionIdOrderByTimestampDesc(Long auctionId);
}
