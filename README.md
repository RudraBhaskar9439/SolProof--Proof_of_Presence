# 🎫 SolProof - Proof of Presence

> Blockchain-based event attendance verification and NFT badge system on Solana

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat&logo=solana)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com)

---

## 📖 Overview

**SolProof** is a decentralized event attendance verification platform that issues NFT badges as proof of presence. Built on Solana blockchain, it provides cryptographically secure check-ins, eliminates attendance fraud, and creates a verifiable on-chain reputation system.

### 🎯 Problem We Solve

- ❌ **Event Attendance Fraud** - Traditional check-ins can be faked
- ❌ **No Permanent Records** - Certificates can be lost or forged
- ❌ **Centralized Control** - Data locked in proprietary platforms
- ❌ **No Verification** - Employers can't verify attendance claims
- ❌ **Manual Processes** - Time-consuming manual check-ins

### ✅ Our Solution

- ✅ **Blockchain Verification** - Immutable proof on Solana
- ✅ **NFT Badges** - Permanent, transferable credentials
- ✅ **Decentralized** - User-owned data and reputation
- ✅ **Instant Verification** - Anyone can verify on-chain
- ✅ **Automated** - QR code-based check-in system
<i<img width="1549" height="1114" alt="Screenshot 2025-10-30 at 8 31 33 AM" src="https://github.com/user-attachments/assets/46487fdb-85cb-49ef-bd1d-a58904781962" />
mg width="1529" height="1092" alt="Screenshot 2025-10-30 at 8 31 12 AM" src="https://github.com/user-attachments/assets/865e7f7d-7ba2-4e28-9059-efe474daa4c0" />

<img width="1549<img width="1794" height="376" alt="Screenshot 2025-10-30 at 11 14 19 PM" src="https://github.com/user-attachments/assets/e07586a4-aa48-46fb-a716 4190af2d8d87" />
<img width="1549" height="1114" alt="Screenshot 2025-10-30 at 8 31 33 AM" src="https://github.com/user-attachments/assets/019ec4ab-2284-426b-a1b9-10472b7ca820" />


---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Solana wallet (Phantom/Solflare)
- Supabase account

### 1. Setup Database

```bash
# Go to Supabase dashboard
# Run backend/supabase-setup.sql in SQL Editor
```

### 2. Start Backend

```bash
cd proof-of-presence/backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### 3. Start Frontend

```bash
cd proof-of-presence/frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 4. Open Application

Navigate to **http://localhost:3000**

📚 **Detailed Setup**: See [QUICK_START.md](./proof-of-presence/QUICK_START.md)

---

## ✨ Features

### 🎫 Event Management
- Create events with metadata (name, date, location, capacity)
- Generate secure QR codes for check-in
- Real-time attendance tracking
- Close events when complete

### 👤 User Profiles
- View badges and reputation score
- Track attended events
- Build verifiable history
- Compete on leaderboard

### 🏆 Reputation System
- Earn 10 XP per event attended
- Bonus XP for achievements
- Global leaderboard rankings
- Level progression system

### 🔐 Security
- Cryptographically signed QR codes
- Nonce-based replay protection
- Time-limited validity (24 hours)
- One-time use enforcement
- Blockchain verification

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js 15 + React 19
│  (Port 3000)│  TailwindCSS + Radix UI
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │  Express.js + Node.js
│  (Port 4000)│  Joi Validation
└──────┬──────┘
       │ SQL
       ▼
┌─────────────┐
│  Supabase   │  PostgreSQL Database
│  Database   │  RLS + Triggers + Views
└─────────────┘
       │
       ▼
┌─────────────┐
│   Solana    │  Smart Contract (Rust)
│ Blockchain  │  NFT Badges + Reputation
└─────────────┘
```

📐 **Full Architecture**: See [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)

---

## 📊 Database Schema

### Tables

- **events** - Event information and metadata
- **user_profiles** - User reputation and badges
- **attendances** - Check-in records with NFT data
- **qr_tokens** - Secure QR code tokens
- **notifications** - User notifications

### Views

- **leaderboard_view** - Ranked users by reputation
- **events_with_attendance** - Events with attendance counts
- **user_profiles_with_events** - Profiles with attended events

🗄️ **Database Details**: See [backend/SUPABASE_SETUP_GUIDE.md](./proof-of-presence/backend/SUPABASE_SETUP_GUIDE.md)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Wallet**: Solana Wallet Adapter
- **HTTP**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Crypto**: HMAC-SHA256

### Blockchain
- **Network**: Solana (Devnet)
- **Framework**: Anchor
- **Language**: Rust
- **Token**: SPL Token (NFT)

---

## 📱 Pages

### 🏠 Home Page
Landing page with feature overview and wallet connection

### 🎫 Events Page
- Browse all events in grid layout
- Create new events with modal form
- View event details (date, location, attendance)
- Active/Closed status badges

### 👤 Profile Page
- User profile with avatar
- Stats cards (Badges, Reputation, Level)
- Event badges grid
- Edit profile functionality

### 🏆 Leaderboard Page
- Top 3 users with medals 🥇🥈🥉
- Full rankings table
- User stats (rank, reputation, badges, level)

---

## 🔌 API Endpoints

### Events
```
GET  /api/events              - List all events
POST /api/events              - Create new event
POST /api/events/mint-badge   - Record badge minting
```

### QR Codes
```
POST /api/events/generate-qr  - Generate secure QR code
POST /api/events/verify-qr    - Verify QR code validity
```

### Profile
```
GET /api/profile/:wallet      - Get user profile
GET /api/profile/:wallet/badges - Get user's badges
```

### Leaderboard
```
GET /api/leaderboard          - Get top users
```

---

## 🎨 Screenshots

### Home Page
Beautiful landing page with feature cards and wallet connection

### Events Page
Grid layout with event cards showing all details and create event modal

### Profile Page
User stats, badges, and attended events in a clean card-based UI

### Leaderboard Page
Top 3 podium with medals and full rankings table

---

## 🔐 Security Features

### Smart Contract Level
- Program Derived Addresses (PDAs)
- Account validation with Anchor
- Event capacity enforcement
- Duplicate attendance prevention

### Backend Level
- Cryptographic QR signatures
- Nonce-based replay protection
- QR expiration (24-hour validity)
- Rate limiting (100 req/15min)
- Input validation (Joi schemas)
- Helmet security headers

### Database Level
- Row Level Security (RLS)
- SQL injection prevention
- Foreign key constraints
- Unique constraints
- Indexed queries

---

## 📈 Use Cases

### 🎓 Educational Institutions
- Lecture attendance tracking
- Workshop participation certificates
- Graduation credentials
- Student achievement badges

### 🏢 Corporate Events
- Company town halls
- Training sessions
- Team building events
- Professional development tracking

### 💻 Tech Conferences
- Conference attendance (Solana Breakpoint, ETHGlobal)
- Developer meetups
- Hackathons
- Networking events

### 🎮 Community Events
- Gaming tournaments
- Art exhibitions
- Music festivals
- Community contributions

---

## 🚀 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Event creation and management
- [x] QR-based check-in system
- [x] NFT badge minting
- [x] Reputation system
- [x] Leaderboard

### Phase 2: Enhanced Features 🔄 (Q2 2025)
- [ ] Multi-signature events (co-organizers)
- [ ] Tiered badges (VIP, Speaker, Attendee)
- [ ] Event series/collections
- [ ] Social features (feed, comments)
- [ ] Advanced filtering

### Phase 3: Scale 📅 (Q3-Q4 2025)
- [ ] Dynamic NFT metadata
- [ ] Cross-chain bridge (Ethereum, Polygon)
- [ ] DAO governance
- [ ] NFT marketplace for badges
- [ ] AI-powered recommendations
- [ ] Mobile app (React Native)

---

## 📚 Documentation

- 📖 [Quick Start Guide](./proof-of-presence/QUICK_START.md) - Get started in 5 steps
- 📘 [Complete Setup Guide](./proof-of-presence/COMPLETE_SETUP_GUIDE.md) - Detailed instructions
- 🗄️ [Supabase Setup](./proof-of-presence/backend/SUPABASE_SETUP_GUIDE.md) - Database setup
- 🏗️ [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) - System architecture
- 📊 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - What was built
- 🎤 [Presentation Outline](./PRESENTATION_OUTLINE.md) - For presentations
- 📝 [Project Summary](./PROJECT_SUMMARY.md) - Comprehensive overview

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Anchor Framework** - For making Solana development easier
- **Supabase** - For the excellent database platform
- **Next.js Team** - For the powerful React framework
- **Radix UI** - For accessible UI components

---

## 📞 Contact & Support

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the `/docs` folder
- **Community**: Join our Discord (coming soon)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 📊 Project Stats

- **Smart Contract**: 266 lines of Rust
- **Backend**: 15+ API endpoints
- **Frontend**: 4 complete pages
- **Database**: 5 tables + 3 views
- **Documentation**: 2000+ lines

---

## 🎯 Key Differentiators

### vs Traditional Systems
| Feature | SolProof | Traditional |
|---------|----------|-------------|
| Fraud Prevention | ✅ Blockchain | ❌ Easily faked |
| Permanent Records | ✅ Immutable | ❌ Can be deleted |
| Verification | ✅ Instant | ❌ Manual |
| Ownership | ✅ User owns NFT | ❌ Platform owns |
| Interoperability | ✅ Cross-platform | ❌ Siloed |

### vs Other Blockchain Solutions
- **100x cheaper** than Ethereum
- **30x faster** confirmations
- **Better UX** with low fees
- **Lower environmental impact**

---

## 💡 Innovation Highlights

1. **Cryptographic QR Codes** - HMAC-SHA256 signed, nonce-based, time-limited
2. **PDA-Based Authority** - No private keys in smart contract
3. **Dual Storage** - On-chain verification + off-chain metadata
4. **Gamified Reputation** - XP system encourages participation
5. **Real-Time Verification** - Instant on-chain proof

---

## 🎓 Learning Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://www.anchor-lang.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## 🏆 Built With

- ❤️ **Passion** for blockchain technology
- 🚀 **Innovation** in event management
- 🔐 **Security** as a top priority
- 🎨 **Design** for great user experience
- 📚 **Documentation** for easy onboarding

---

<div align="center">

**Made with ❤️ for the Solana community**

[⭐ Star this repo](https://github.com/yourusername/solproof) • [🐛 Report Bug](https://github.com/yourusername/solproof/issues) • [💡 Request Feature](https://github.com/yourusername/solproof/issues)

</div>

---

## 🚀 Get Started Now!

```bash
# Clone the repository
git clone https://github.com/yourusername/solproof.git

# Follow the Quick Start guide
cd solproof
cat QUICK_START.md
```

**Your journey to blockchain-verified events starts here! 🎫**
