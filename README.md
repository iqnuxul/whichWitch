# WhichWitch 🎨

> A decentralized creative works platform built on blockchain technology, enabling creators to share, remix, and monetize their work with transparent copyright protection.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8-orange)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Overview

WhichWitch is a Web3 platform that revolutionizes creative work sharing and derivative creation (remixing). Built on Ethereum blockchain with IPFS storage, it provides:

- 🔐 **Copyright Protection** - Immutable on-chain copyright records
- 🔄 **Legal Remixing** - Clear authorization mechanism for derivative works
- 💰 **Automated Revenue** - Smart contract-based profit distribution
- 🌐 **Decentralized Storage** - Permanent preservation via IPFS

## ✨ Key Features

### For Creators
- Upload original works with metadata (title, description, story, materials, tags)
- Set remix permissions and licensing fees
- Track derivative works and revenue
- Manage collections and favorites

### For Remixers
- Browse and discover creative works
- Request authorization for remixing
- Create derivative works with proper attribution
- Automatic royalty payments to original creators

### Platform Features
- Wallet integration (MetaMask, WalletConnect, etc.)
- IPFS-based permanent storage
- Smart contract automation
- Real-time work statistics
- User profiles and portfolios

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                    │
│         Next.js 14 + React + TypeScript              │
│         Tailwind CSS + shadcn/ui                     │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│Blockchain│  │ Storage  │  │ Database │
│ Ethereum │  │  Pinata  │  │ Supabase │
│ Sepolia  │  │   IPFS   │  │PostgreSQL│
└─────────┘  └──────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Alchemy API key (for RPC)
- Supabase account
- Pinata account (for IPFS)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/iqnuxul/whichWitch.git
cd whichWitch
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Smart Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0xE9e700df0e448F5DebE55A8B153aebf8988db0c8
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x182AF7db7B2928455900595506D94b26E173aeA1

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pinata IPFS
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret
PINATA_JWT=your_jwt_token
```

4. **Initialize database**

Run the SQL schema in your Supabase project:
```bash
# Copy content from src/backend/supabase/schema.sql
# Paste and execute in Supabase SQL Editor
```

5. **Start development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Components**: shadcn/ui
- **Web3**: wagmi 2.x, viem 2.x, RainbowKit 2.x

### Blockchain
- **Smart Contracts**: Solidity 0.8+
- **Network**: Ethereum Sepolia Testnet
- **RPC Provider**: Alchemy
- **Standards**: ERC-721 compatible

### Backend Services
- **Database**: Supabase (PostgreSQL)
- **Storage**: Pinata (IPFS)
- **API**: Next.js API Routes

### Deployment
- **Platform**: Vercel
- **CI/CD**: GitHub Actions
- **CDN**: Vercel Edge Network

## 🔗 Smart Contracts

Deployed on Ethereum Sepolia Testnet:

| Contract | Address | Purpose |
|----------|---------|---------|
| **CreationContract** | `0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF` | Work registration and metadata |
| **PaymentContract** | `0xE9e700df0e448F5DebE55A8B153aebf8988db0c8` | Payment processing and revenue distribution |
| **AuthorizationContract** | `0x182AF7db7B2928455900595506D94b26E173aeA1` | Remix authorization management |

## 📁 Project Structure

```
whichWitch/
├── src/
│   ├── ui/
│   │   ├── app/                    # Next.js app directory
│   │   │   ├── api/               # API routes
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Home page
│   │   ├── components/            # React components
│   │   │   └── whichwitch/       # Core business components
│   │   ├── lib/                   # Utilities and integrations
│   │   │   ├── supabase/         # Database client and services
│   │   │   └── web3/             # Web3 hooks and configs
│   │   └── public/               # Static assets
│   ├── backend/
│   │   └── supabase/             # Database schemas
│   └── contracts/                # Smart contract source code
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.ts           # Tailwind config
```

## 🗄️ Database Schema

### Core Tables

- **users** - User profiles and wallet addresses
- **works** - Creative works metadata and IPFS links
- **folders** - User collection folders
- **collections** - Work-folder relationships
- **authorization_requests** - Remix authorization tracking
- **work_stats** - View counts, likes, and derivatives

See `src/backend/supabase/schema.sql` for complete schema.

## 🔐 Security

- ✅ Smart contract security (OpenZeppelin standards)
- ✅ Environment variable isolation
- ✅ Service role key server-side only
- ✅ API route authentication
- ✅ Database Row Level Security (RLS)
- ✅ XSS and CSRF protection

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically

See `VERCEL_DEPLOY_STEPS.md` for detailed instructions.

## 📖 Documentation

- [Product Architecture (Chinese)](./WhichWitch_产品架构文档.md)
- [Application Architecture (Chinese)](./WhichWitch应用架构文档.md)
- [Supabase Setup](./SUPABASE_SETUP.md)
- [Pinata Setup](./PINATA_SETUP.md)
- [Vercel Deployment Guide (Chinese)](./Vercel部署指南.md)
- [Alchemy API Key Update Guide (Chinese)](./ALCHEMY_API_KEY_更新指南.md)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing

```bash
# Run tests (when available)
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [Supabase](https://supabase.com/) - Backend as a Service
- [Pinata](https://www.pinata.cloud/) - IPFS storage
- [Alchemy](https://www.alchemy.com/) - Blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📞 Contact

- **GitHub**: [@iqnuxul](https://github.com/iqnuxul)
- **Project Link**: [https://github.com/iqnuxul/whichWitch](https://github.com/iqnuxul/whichWitch)

## 🗺️ Roadmap

- [x] Core platform functionality
- [x] Work upload and IPFS storage
- [x] Smart contract integration
- [x] User authentication
- [x] Collection management
- [ ] Social features (follow, comment, like)
- [ ] Marketplace (buy/sell works)
- [ ] Advanced search and filtering
- [ ] Creator dashboard and analytics
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Web3 technologies**
