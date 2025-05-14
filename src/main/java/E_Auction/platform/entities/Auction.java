package E_Auction.platform.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "auctions")
@Builder
public class Auction
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column()
    private String title;

    private String description;

    private double startPrice;

    private double currentPrice;

    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @OneToMany(mappedBy = "auction")
    private List<Bid> bids;

}
