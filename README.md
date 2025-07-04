# 🛒 E-Auction Platform

A complete **Online Auction System** where users can register as sellers or buyers, list products for bidding, and place competitive bids in real-time. Built with **Spring Boot**, **MongoDB**, and other modern technologies, the platform ensures seamless product listing, bid tracking, and secure authentication.

---

## 📌 Features

### ✅ Buyer & Seller Functionality
- 👤 **User Roles:** Separate dashboards for Buyer and Seller.
- 🛍️ **Seller:**
  - Add new products for auction.
  - Set starting price and auction duration.
  - Manage listed products and bids.
- 💸 **Buyer:**
  - Browse available auctions.
  - Place bids on active products.
  - View bidding history and wins.

### 🔐 Authentication & Authorization
- JWT-based secured login for both Buyer and Seller.
- Role-based access control (RBAC).
- Spring Security integration.

### 🧠 Backend Stack
- Spring Boot (RESTful APIs)
- Spring Data MongoDB
- Spring Security with JWT
- Redis for caching or token blacklisting (if used)
- ModelMapper, DTOs for clean data handling

### 🌐 Frontend (if applicable)
- HTML/CSS or React.js for UI
- Thymeleaf (if server-side rendered)
- Axios/Fetch for API communication

---

## 🗂️ Project Structure

E-Auction-Platform/
│
├── src/
│ ├── main/
│ │ ├── java/
│ │ │ └── com.aryan.eauction/
│ │ │ ├── config/ → Security Configurations
│ │ │ ├── controller/ → REST Controllers
│ │ │ ├── dto/ → Data Transfer Objects
│ │ │ ├── model/ → MongoDB Document Models
│ │ │ ├── repository/ → MongoDB Repositories
│ │ │ ├── service/ → Business Logic
│ │ │ ├── util/ → Utility Classes
│ │ │ └── EauctionApplication.java
│ │ └── resources/
│ │ ├── application.properties
│ │ └── static/ or templates/ → (if using frontend in same repo)
│
├── pom.xml → Maven Dependencies
└── README.md

---

## 🛠️ Technologies Used

| Category       | Technology                    |
|----------------|-------------------------------|
| Backend        | Spring Boot, Spring Security  |
| Database       | MongoDB, Redis (optional)     |
| API Security   | JWT Authentication            |
| Frontend       | HTML/CSS, Thymeleaf or React  |
| Build Tool     | Maven                         |
| Version Control| Git & GitHub                  |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven
- MongoDB installed or Atlas URI
- Redis (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryanty2314/E-Auction-Platform.git
cd E-Auction-Platform

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

📬 API Endpoints
Here’s a quick overview of major endpoints (details in Postman Collection):

POST /api/auth/signup

POST /api/auth/login

GET /api/auctions/all

POST /api/auctions/create (Seller)

POST /api/bid/place (Buyer)

GET /api/bid/my-bids (Buyer)

✍️ Author
Aryan Tyagi
🔗 Gitub: https://www.github.com/aryanty2314 | 📧 Email :- aryantyagi22447@gmail.com 

🤝 Contribution
Contributions are welcome!
Please open issues or submit a pull request for suggestions and fixes.
Backend id Working fine if anyone want to contribute in frontend you are welcome

