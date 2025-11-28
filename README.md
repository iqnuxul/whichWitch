# WhichWitch

> *Let creation be a tree that can see its own growth.*

**🌐 Live App**: [https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/](https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/)  
*Fully deployed with smart contracts, database, MetaMask wallet integration, and IPFS storage. Try it now!*

**📊 Presentation**: [View on Canva](https://www.canva.com/design/DAG5t6aAKIU/JLK99jHgZNk_ge5mS-qDsQ/view?utm_content=DAG5t6aAKIU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3a5cb0fa9a)

---

## 🎯 Mission

Build an on-chain creation platform for **recording**, **incentivizing**, and **tracing** every creation. Enable automatic authorization and revenue sharing for original works, safeguarding creators' income and fostering continuous creation and sharing.

---

## ✨ Core Features

### 🔗 On-Chain Creation Tracking
- Register original works on blockchain
- Create derivative works with parent-child relationships
- Build transparent creation genealogy

### 💰 Automatic Revenue Distribution
- Smart contract-based payment splitting
- Pull-based withdrawal pattern for gas efficiency
- Platform fee: 10% on withdrawal

### 🎨 Creator-Friendly Workflow
1. **Upload** - Register original artwork on-chain
2. **Authorize** - Request permission (pay for license)
3. **Remix** - Create and register derivative works
4. **Earn** - Automatic revenue sharing across creation chain
5. **Withdraw** - Pull earnings anytime

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Blockchain**: Ethereum (Sepolia Testnet), Solidity
- **Web3**: Wagmi, Viem
- **Database**: Supabase (PostgreSQL)
- **Storage**: IPFS (Pinata)
- **Deployment**: Vercel

### Smart Contracts

Three core contracts power the platform:

- **CreationManager** - Registers works and tracks creation relationships
- **AuthorizationManager** - Handles authorization requests and verifies permissions
- **PaymentManager** - Distributes payments and manages creator balances

### Contract Interaction Flow

```
User (Register Original) → CreationManager.registerOriginalWork()
                          └─ Store work info

User (Request Auth) → AuthorizationManager.requestAuthorization()
                    ├─ CreationManager.getWork() [Query work info]
                    ├─ CreationManager.getCreatorChain() [Get ancestors]
                    └─ PaymentManager.distributeRevenue() [Split payment]

User (Register Derivative) → CreationManager.registerDerivativeWork()
                            └─ AuthorizationManager.hasAuthorization() [Verify auth]

User (Withdraw) → PaymentManager.withdraw()
                └─ Transfer balance
```

### Revenue Distribution Rules

| Scenario | Direct Creator | Original Creator | Middle Ancestors |
|----------|---------------|------------------|------------------|
| **Original Work Authorization** | 40% | - | - |
| **1-Level Derivative** | 40% | 60% (40% + 20%) | - |
| **Multi-Level Derivative** | 40% | 40% | 20% (split) |

---

## 👥 Team

| Role | Member | Responsibilities |
|------|--------|------------------|
| **Project Management** | Xiaoyuan | Define scope, coordinate team, drive execution |
| **UI Design & Frontend** | Kekeke | Design interface, implement frontend |
| **Contract Development** | Xiaoguai | Write contracts, manage blockchain integration |
| **Database & Backend** | Jiajia | Setup database, provide APIs, implement data operations |
| **Project Coordination** | Relax | Logo design, documentation, coordinate meetings, testing |

---

## 🚀 Roadmap

### V1.0 (✅) - Foundation
**Goal**: Complete "Create → Authorize → Remix → Revenue Split → Withdraw" workflow

**Features**:
- Upload works and tip functionality
- Authorization request with automatic approval and status display
- Automatic revenue distribution across creation chain
- Creation system with tags and searchable categories

### V2.0 (Ongoing) - Ecosystem Expansion
**New Features**:
- Enhanced security (anti-plagiarism, frontend security optimization)
- NFT integration (mint, trade, secondary creation tracking)
- Advanced product features and optimization

### V3.0 (Future) - Community & Incentives
**Upcoming**:
- Creator reputation and reward pool
- DAO governance (voting on rules, revenue distribution)
- Creator leaderboards (history, reputation, earnings, collaborations)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Alchemy API key
- Supabase account
- Pinata account

### Installation

```bash
# Clone repository
git clone https://github.com/iqnuxul/whichWitch.git
cd whichWitch

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
# Run src/backend/supabase/schema.sql in Supabase SQL Editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
whichWitch/
├── src/
│   ├── ui/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   └── lib/             # Utilities and integrations
│   ├── backend/
│   │   └── supabase/        # Database schemas
│   └── contracts/           # Smart contract source code
├── .env.example             # Environment template
└── README.md               # This file
```

---

## 🤝 Partners

*Coming soon*

---

## 📬 Contact

For inquiries, please reach out through [GitHub Issues](https://github.com/iqnuxul/whichWitch/issues).
Email: mluxunqi@gamil.com

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

**Built with ❤️ by the WhichWitch Team**
