# Frontend/UI Tasks for whichWitch Platform

## 🎯 Core Features to Implement

### 1. Wallet Connection (Priority: HIGH)
**What**: Connect user's MetaMask wallet to the app

**Tasks**:
- [ ] Install RainbowKit + wagmi + ethers.js
- [ ] Create "Connect Wallet" button
- [ ] Show connected wallet address
- [ ] Add "Disconnect" button
- [ ] Handle wallet not installed error
- [ ] Check if user is on Sepolia network
- [ ] Prompt user to switch to Sepolia if wrong network

**Files to create**:
- `components/ConnectWallet.tsx`
- `lib/web3Config.ts`

---

### 2. Register Original Work (Priority: HIGH)
**What**: Form to register a new original artwork

**Tasks**:
- [ ] Create registration form with fields:
  - Title (text input)
  - Description (textarea)
  - Image upload
  - License fee (number input in ETH)
  - Allow derivatives? (checkbox)
- [ ] Upload image to storage (Supabase/IPFS)
- [ ] Call `registerOriginalWork()` smart contract function
- [ ] Show transaction status (pending/success/error)
- [ ] Display transaction hash and Etherscan link
- [ ] Redirect to work detail page after success

**Files to create**:
- `pages/register.tsx`
- `components/RegisterWorkForm.tsx`

---

### 3. Browse Works (Priority: HIGH)
**What**: Display all registered works in a grid/list

**Tasks**:
- [ ] Fetch works from backend API
- [ ] Display work cards showing:
  - Image
  - Title
  - Creator address (shortened)
  - License fee
  - "Derivatives allowed" badge
- [ ] Add pagination (10-20 works per page)
- [ ] Add loading skeleton
- [ ] Click card to go to work detail page

**Files to create**:
- `pages/explore.tsx`
- `components/WorkCard.tsx`
- `components/WorkGrid.tsx`

---

### 4. Work Detail Page (Priority: HIGH)
**What**: Show full details of a single work

**Tasks**:
- [ ] Display work information:
  - Large image
  - Title and description
  - Creator address
  - License fee
  - Creation date
  - Derivative count
- [ ] Show "Request Authorization" button (if derivatives allowed)
- [ ] Show "Tip Creator" button
- [ ] List all derivative works
- [ ] Show creation tree/chain visualization

**Files to create**:
- `pages/work/[id].tsx`
- `components/WorkDetail.tsx`
- `components/CreationTree.tsx`

---

### 5. Request Authorization (Priority: MEDIUM)
**What**: Pay license fee to get authorization

**Tasks**:
- [ ] Show license fee amount
- [ ] Add "Request Authorization" button
- [ ] Call `requestAuthorization()` with payment
- [ ] Show transaction status
- [ ] Update UI after authorization granted
- [ ] Show "Authorized ✓" badge if user has authorization

**Files to create**:
- `components/RequestAuthButton.tsx`
- `components/AuthorizationStatus.tsx`

---

### 6. Register Derivative Work (Priority: MEDIUM)
**What**: Register a work based on parent work

**Tasks**:
- [ ] Check if user has authorization for parent work
- [ ] Show parent work information
- [ ] Create form similar to original work registration
- [ ] Add parent work selector
- [ ] Call `registerDerivativeWork()` function
- [ ] Handle errors (not authorized, derivatives not allowed)

**Files to create**:
- `pages/register-derivative.tsx`
- `components/RegisterDerivativeForm.tsx`

---

### 7. Tip Creator (Priority: MEDIUM)
**What**: Send ETH tip to creator

**Tasks**:
- [ ] Add "Tip" button on work detail page
- [ ] Show modal with amount input
- [ ] Preset amounts (0.01, 0.05, 0.1 ETH)
- [ ] Custom amount option
- [ ] Call `tipCreator()` function
- [ ] Show success message with transaction

**Files to create**:
- `components/TipModal.tsx`
- `components/TipButton.tsx`

---

### 8. User Profile/Dashboard (Priority: MEDIUM)
**What**: Show user's works and earnings

**Tasks**:
- [ ] Display user's registered works
- [ ] Show works user is authorized for
- [ ] Display current balance
- [ ] Add "Withdraw" button
- [ ] Show earnings history
- [ ] Show tip history

**Files to create**:
- `pages/profile.tsx`
- `components/UserWorks.tsx`
- `components/BalanceCard.tsx`

---

### 9. Withdraw Balance (Priority: MEDIUM)
**What**: Withdraw accumulated earnings

**Tasks**:
- [ ] Show current balance
- [ ] Add "Withdraw All" button
- [ ] Call `withdraw()` function
- [ ] Show transaction status
- [ ] Update balance after withdrawal

**Files to create**:
- `components/WithdrawButton.tsx`

---

### 10. Search & Filter (Priority: LOW)
**What**: Find specific works

**Tasks**:
- [ ] Add search bar (search by title)
- [ ] Filter by creator address
- [ ] Filter by "allows derivatives"
- [ ] Sort by date (newest/oldest)
- [ ] Sort by license fee (low/high)

**Files to create**:
- `components/SearchBar.tsx`
- `components/FilterPanel.tsx`

---

### 11. Creation Tree Visualization (Priority: LOW)
**What**: Visual graph showing work relationships

**Tasks**:
- [ ] Use library like react-flow or d3.js
- [ ] Show nodes for each work in chain
- [ ] Connect nodes with lines
- [ ] Highlight current work
- [ ] Click node to navigate to that work
- [ ] Show creator addresses on nodes

**Files to create**:
- `components/CreationTreeGraph.tsx`

---

## 🎨 UI/UX Design Tasks

### Design System
- [ ] Choose color palette (Web3/creative theme)
- [ ] Define typography (fonts, sizes)
- [ ] Create button styles
- [ ] Design card components
- [ ] Create loading states
- [ ] Design error states
- [ ] Create success animations

### Pages to Design
- [ ] Landing page / Home
- [ ] Explore works page
- [ ] Work detail page
- [ ] Register work page
- [ ] User profile page
- [ ] About page (optional)

### Components to Design
- [ ] Navigation bar
- [ ] Footer
- [ ] Work cards
- [ ] Modal dialogs
- [ ] Toast notifications
- [ ] Loading spinners
- [ ] Empty states

---

## 📦 Tech Stack Recommendations

```json
{
  "framework": "Next.js 14",
  "styling": "TailwindCSS",
  "web3": [
    "wagmi",
    "viem", 
    "RainbowKit",
    "ethers.js"
  ],
  "ui-library": "shadcn/ui or Chakra UI",
  "state": "React hooks + Context",
  "forms": "react-hook-form",
  "notifications": "react-hot-toast"
}
```

---

## 🚀 Priority Order for Hackathon

### Phase 1 (MVP - Must Have)
1. ✅ Wallet connection
2. ✅ Register original work
3. ✅ Browse works
4. ✅ Work detail page

### Phase 2 (Core Features)
5. ✅ Request authorization
6. ✅ Register derivative work
7. ✅ Tip creator

### Phase 3 (Nice to Have)
8. ✅ User profile
9. ✅ Withdraw balance
10. ✅ Search & filter

### Phase 4 (If Time Allows)
11. ✅ Creation tree visualization
12. ✅ Advanced UI polish

---

## 📝 Notes for Frontend Developer

### Smart Contract Functions to Call:

**CreationManager**:
```javascript
registerOriginalWork(licenseFee, derivativeAllowed, metadataURI)
registerDerivativeWork(parentId, licenseFee, derivativeAllowed, metadataURI)
getWork(workId)
getWorkChain(workId)
getDerivatives(workId)
```

**AuthorizationManager**:
```javascript
requestAuthorization(workId) // payable
hasAuthorization(user, workId)
getUserAuthorizations(user)
```

**PaymentManager**:
```javascript
tipCreator(creator) // payable
withdraw()
getBalance(creator)
```

### Contract Addresses (After Deployment):
```
CreationManager: 0x...
AuthorizationManager: 0x...
PaymentManager: 0x...
```

### Backend API Endpoints (When Ready):
```
GET  /api/works              - Get all works
GET  /api/works/:id          - Get work details
GET  /api/works/creator/:address - Get works by creator
GET  /api/authorizations/:address - Get user authorizations
POST /api/metadata           - Upload metadata
```

---

## 🎯 Success Criteria

- [ ] User can connect wallet
- [ ] User can register original work
- [ ] User can browse all works
- [ ] User can request authorization
- [ ] User can register derivative work
- [ ] User can tip creators
- [ ] User can withdraw earnings
- [ ] All transactions show proper feedback
- [ ] UI is responsive (mobile + desktop)
- [ ] Error handling works properly

---

## 📚 Helpful Resources

- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [wagmi Docs](https://wagmi.sh/)
- [ethers.js Docs](https://docs.ethers.org/)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

**Questions?** Ask in the team chat! 💬
