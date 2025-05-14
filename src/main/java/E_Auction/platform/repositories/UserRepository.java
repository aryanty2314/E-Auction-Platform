package E_Auction.platform.repositories;

import E_Auction.platform.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
