package E_Auction.platform.repositories;

import E_Auction.platform.entities.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByActiveTrue();

    List<Auction> findByCreatedById(Long userId);


}
