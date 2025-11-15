# Backend Tasks for whichWitch Platform

## 🎯 Core Features to Implement

### 1. Setup Supabase Database (Priority: HIGH)
**What**: Create and configure the database

**Tasks**:
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (choose region close to users)
- [ ] Run the SQL schema from `database/schema.sql`
- [ ] Verify all tables created successfully
- [ ] Get API keys (anon key and service role key)
- [ ] Set up `.env` file with credentials
- [ ] Test database connection

**Files to use**:
- `database/schema.sql` (already created)

**Deliverable**: Database ready with all tables

---

### 2. Event Indexer - CreationManager (Priority: HIGH)
**What**: Listen to smart contract events and store in database

**Tasks**:
- [ ] Install dependencies: `ethers`, `@supabase/supabase-js`
- [ ] Create event listener for `WorkRegistered` event
- [ ] Parse event data (workId, creator, licenseFee, derivativeAllowed, metadataURI)
- [ ] Insert into `works` table
- [ ] Create event listener for `DerivativeWorkRegistered` event
- [ ] Insert derivative works into `works` table
- [ ] Handle duplicate events (check if already exists)
- [ ] Update `sync_status` table with last synced block
- [ ] Add error handling and retry logic
- [ ] Log all events for debugging

**Files to create**:
- `src/indexers/creationManagerIndexer.js`
- `src/utils/supabaseClient.js`
- `src/utils/contractHelpers.js`

**Smart Contract Events to Listen**:
```javascript
event WorkRegistered(
    uint256 indexed workId,
    address indexed creator,
    uint256 licenseFee,
    bool derivativeAllowed,
    string metadataURI,
    uint256 timestamp
);

event DerivativeWorkRegistered(
    uint256 indexed workId,
    uint256 indexed parentId,
    address indexed creator,
    uint256 licenseFee,
    bool derivativeAllowed,
    string metadataURI,
    uint256 timestamp
);
```

**Deliverable**: Works automatically sync to database

---

### 3. Event Indexer - AuthorizationManager (Priority: HIGH)
**What**: Track authorization events

**Tasks**:
- [ ] Create event listener for `AuthorizationGranted` event
- [ ] Parse event data (workId, user, licenseFee, timestamp)
- [ ] Insert into `authorizations` table
- [ ] Handle duplicate authorizations
- [ ] Update sync status

**Files to create**:
- `src/indexers/authorizationManagerIndexer.js`

**Smart Contract Event**:
```javascript
event AuthorizationGranted(
    uint256 indexed workId,
    address indexed user,
    uint256 licenseFee,
    uint256 timestamp
);
```

**Deliverable**: Authorizations automatically sync to database

---

### 4. Event Indexer - PaymentManager (Priority: MEDIUM)
**What**: Track tips, revenue distributions, and withdrawals

**Tasks**:
- [ ] Create event listener for `TipReceived` event
- [ ] Insert into `tips` table
- [ ] Create event listener for `RevenueDistributed` event
- [ ] Parse recipients array and amounts
- [ ] Insert into `revenue_distributions` table
- [ ] Create event listener for `Withdrawal` event
- [ ] Insert into `withdrawals` table
- [ ] Update sync status

**Files to create**:
- `src/indexers/paymentManagerIndexer.js`

**Smart Contract Events**:
```javascript
event TipReceived(
    address indexed tipper,
    address indexed creator,
    uint256 amount,
    uint256 timestamp
);

event RevenueDistributed(
    uint256 indexed workId,
    address[] recipients,
    uint256[] amounts,
    uint256 totalAmount,
    uint256 timestamp
);

event Withdrawal(
    address indexed creator,
    uint256 amount,
    uint256 timestamp
);
```

**Deliverable**: All payment events tracked in database

---

### 5. REST API - Works Endpoints (Priority: HIGH)
**What**: API to query works data

**Tasks**:
- [ ] Install Express.js
- [ ] Set up basic Express server
- [ ] Add CORS middleware
- [ ] Create endpoint: `GET /api/works` (get all works with pagination)
- [ ] Create endpoint: `GET /api/works/:id` (get single work)
- [ ] Create endpoint: `GET /api/works/creator/:address` (get works by creator)
- [ ] Create endpoint: `GET /api/works/:id/derivatives` (get derivative works)
- [ ] Add query parameters for filtering (derivativeAllowed, minFee, maxFee)
- [ ] Add sorting (by date, by fee)
- [ ] Return proper HTTP status codes
- [ ] Add error handling

**Files to create**:
- `src/index.js` (main server file)
- `src/routes/works.js`
- `src/controllers/worksController.js`

**Example Endpoints**:
```
GET /api/works?page=1&limit=20&sort=newest
GET /api/works/1
GET /api/works/creator/0x123...
GET /api/works/1/derivatives
```

**Deliverable**: Frontend can query works data

---

### 6. REST API - Authorizations Endpoints (Priority: MEDIUM)
**What**: API to query authorization data

**Tasks**:
- [ ] Create endpoint: `GET /api/authorizations/:address` (get user's authorizations)
- [ ] Create endpoint: `GET /api/authorizations/work/:workId` (get all users authorized for a work)
- [ ] Create endpoint: `GET /api/authorizations/check/:address/:workId` (check if user has authorization)

**Files to create**:
- `src/routes/authorizations.js`
- `src/controllers/authorizationsController.js`

**Example Endpoints**:
```
GET /api/authorizations/0x123...
GET /api/authorizations/work/1
GET /api/authorizations/check/0x123.../1
```

**Deliverable**: Frontend can check authorization status

---

### 7. REST API - Analytics Endpoints (Priority: LOW)
**What**: API for statistics and analytics

**Tasks**:
- [ ] Create endpoint: `GET /api/stats/creator/:address` (creator stats)
  - Total works created
  - Total earnings
  - Total tips received
  - Derivative count
- [ ] Create endpoint: `GET /api/stats/work/:workId` (work stats)
  - Total tips received
  - Total revenue generated
  - Number of derivatives
  - Number of authorizations
- [ ] Create endpoint: `GET /api/stats/platform` (platform-wide stats)
  - Total works
  - Total creators
  - Total volume (ETH)

**Files to create**:
- `src/routes/stats.js`
- `src/controllers/statsController.js`

**Deliverable**: Dashboard can show statistics

---

### 8. Metadata Storage API (Priority: MEDIUM)
**What**: Handle metadata and image uploads

**Tasks**:
- [ ] Set up Supabase Storage bucket for images
- [ ] Create endpoint: `POST /api/metadata/upload-image`
  - Accept image file upload
  - Validate file type (jpg, png, gif)
  - Validate file size (max 10MB)
  - Upload to Supabase Storage
  - Return image URL
- [ ] Create endpoint: `POST /api/metadata/create`
  - Accept metadata JSON (title, description, imageUrl)
  - Generate metadata URI
  - Store in Supabase or return IPFS hash
  - Return metadata URI
- [ ] Add rate limiting to prevent abuse

**Files to create**:
- `src/routes/metadata.js`
- `src/controllers/metadataController.js`
- `src/utils/storageHelper.js`

**Deliverable**: Frontend can upload images and metadata

---

### 9. Sync Service (Priority: HIGH)
**What**: Continuously sync blockchain events

**Tasks**:
- [ ] Create main sync service that runs all indexers
- [ ] Implement polling mechanism (check for new blocks every 10 seconds)
- [ ] Get last synced block from database
- [ ] Fetch events from last synced block to current block
- [ ] Process events in batches (100 blocks at a time)
- [ ] Handle blockchain reorganizations (reorgs)
- [ ] Add graceful shutdown
- [ ] Add health check endpoint
- [ ] Log sync progress

**Files to create**:
- `src/services/syncService.js`
- `src/index.js` (start sync service)

**Deliverable**: Events automatically sync in real-time

---

### 10. Error Handling & Logging (Priority: MEDIUM)
**What**: Proper error handling and logging

**Tasks**:
- [ ] Set up logging library (winston or pino)
- [ ] Log all API requests
- [ ] Log all blockchain events processed
- [ ] Log errors with stack traces
- [ ] Create error middleware for Express
- [ ] Return consistent error format
- [ ] Add request ID for tracing
- [ ] Set up log rotation

**Files to create**:
- `src/middleware/errorHandler.js`
- `src/utils/logger.js`

**Deliverable**: Easy to debug issues

---

### 11. Testing (Priority: LOW)
**What**: Test critical functionality

**Tasks**:
- [ ] Write tests for event parsing
- [ ] Write tests for API endpoints
- [ ] Write tests for database queries
- [ ] Test error scenarios
- [ ] Test with mock blockchain data

**Files to create**:
- `src/__tests__/indexers.test.js`
- `src/__tests__/api.test.js`

**Deliverable**: Confidence that code works

---

### 12. Deployment (Priority: MEDIUM)
**What**: Deploy backend service

**Tasks**:
- [ ] Choose hosting (Railway, Render, or Vercel)
- [ ] Set up environment variables on hosting platform
- [ ] Deploy sync service
- [ ] Deploy API server
- [ ] Set up monitoring/alerts
- [ ] Test deployed endpoints
- [ ] Document API endpoints

**Deliverable**: Backend running in production

---

## 📦 Tech Stack

```json
{
  "runtime": "Node.js 18+",
  "database": "Supabase (PostgreSQL)",
  "blockchain": "ethers.js v6",
  "api": "Express.js",
  "storage": "Supabase Storage",
  "logging": "winston or pino",
  "testing": "jest or vitest"
}
```

---

## 🚀 Priority Order for Hackathon

### Phase 1 (MVP - Must Have)
1. ✅ Setup Supabase database
2. ✅ Event indexer for CreationManager
3. ✅ Event indexer for AuthorizationManager
4. ✅ REST API for works
5. ✅ Sync service

### Phase 2 (Core Features)
6. ✅ REST API for authorizations
7. ✅ Metadata storage API
8. ✅ Event indexer for PaymentManager

### Phase 3 (Nice to Have)
9. ✅ Analytics endpoints
10. ✅ Error handling & logging
11. ✅ Testing

### Phase 4 (If Time Allows)
12. ✅ Deployment
13. ✅ Documentation

---

## 📝 Environment Variables

Create `.env` file:
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CREATION_MANAGER_ADDRESS=0x...
AUTHORIZATION_MANAGER_ADDRESS=0x...
PAYMENT_MANAGER_ADDRESS=0x...
START_BLOCK=0

# Server
PORT=3001
NODE_ENV=development
```

---

## 📚 Code Examples

### Example: Event Indexer Structure
```javascript
// src/indexers/creationManagerIndexer.js
import { ethers } from 'ethers';
import { supabase } from '../utils/supabaseClient.js';

export async function indexCreationManager(fromBlock, toBlock) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const contract = new ethers.Contract(
    process.env.CREATION_MANAGER_ADDRESS,
    ABI,
    provider
  );

  // Listen to WorkRegistered events
  const filter = contract.filters.WorkRegistered();
  const events = await contract.queryFilter(filter, fromBlock, toBlock);

  for (const event of events) {
    const { workId, creator, licenseFee, derivativeAllowed, metadataURI, timestamp } = event.args;
    
    // Insert into database
    await supabase.from('works').insert({
      work_id: workId.toString(),
      creator_address: creator,
      license_fee: licenseFee.toString(),
      derivative_allowed: derivativeAllowed,
      metadata_uri: metadataURI,
      created_at: new Date(Number(timestamp) * 1000),
      tx_hash: event.transactionHash,
      block_number: event.blockNumber
    });
  }
}
```

### Example: API Endpoint
```javascript
// src/routes/works.js
import express from 'express';
import { supabase } from '../utils/supabaseClient.js';

const router = express.Router();

router.get('/works', async (req, res) => {
  const { page = 1, limit = 20, sort = 'newest' } = req.query;
  
  let query = supabase
    .from('works')
    .select('*')
    .range((page - 1) * limit, page * limit - 1);
  
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ works: data, page, limit });
});

export default router;
```

---

## 🎯 Success Criteria

- [ ] Database has all tables and indexes
- [ ] Events sync automatically from blockchain
- [ ] API returns works data correctly
- [ ] API returns authorization data correctly
- [ ] Metadata upload works
- [ ] No data loss during sync
- [ ] API responds in < 500ms
- [ ] Error handling works properly
- [ ] Logs are readable and helpful

---

## 📚 Helpful Resources

- [Supabase Docs](https://supabase.com/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🔗 Contract ABIs

You'll need the contract ABIs to interact with smart contracts. Get them from:
- `artifacts/contracts/CreationManager.sol/CreationManager.json`
- `artifacts/contracts/AuthorizationManager.sol/AuthorizationManager.json`
- `artifacts/contracts/PaymentManager.sol/PaymentManager.json`

Extract the `abi` field from each JSON file.

---

## 💡 Tips

1. **Start simple**: Get one indexer working first, then add others
2. **Test locally**: Use Hardhat local network before Sepolia
3. **Log everything**: You'll need logs to debug
4. **Handle errors**: Blockchain can be unreliable, add retries
5. **Batch operations**: Don't insert one row at a time
6. **Use transactions**: For multiple related database operations
7. **Monitor sync lag**: Alert if sync falls behind

---

**Questions?** Ask in the team chat! 💬
