# Ancestor Chain Update - Important Changes

## 🔄 What Changed?

We updated how the platform tracks creation chains to properly handle **branching** (when one work has multiple derivatives).

### Old Approach (❌ Problem):
- Traversed parent links recursively
- **Failed with branches**: If Work A has derivatives B and C, and C has derivative D, the system couldn't correctly track D's full ancestry

### New Approach (✅ Solution):
- Each work stores its **complete ancestor array** at creation time
- One simple mapping: `workId => address[] ancestors`
- Works perfectly with any tree structure including branches

## 📊 Example

```
Original Work A (by Alice)
    ├─ Derivative B (by Bob) - ancestors: [Alice]
    └─ Derivative C (by Carol) - ancestors: [Alice]
        └─ Derivative D (by Dave) - ancestors: [Alice, Carol]
```

When D receives a license fee:
- Direct creator (Dave): 50%
- Ancestors (Alice, Carol): 25% each

## 🔧 Contract Changes

### CreationManager.sol

**Added**:
```solidity
mapping(uint256 => address[]) public workAncestors;
```

**Changed Functions**:
- `registerOriginalWork()` - Sets empty ancestor array
- `registerDerivativeWork()` - Builds ancestor array from parent's ancestors + parent creator
- `getAncestors(workId)` - Returns ancestor creator addresses
- `getCreatorChain(workId)` - Returns ancestors + current creator

**Removed**:
- `getWorkChain()` - No longer needed (was returning work IDs)

### AuthorizationManager.sol
- No changes needed - still works the same way

### PaymentManager.sol
- No changes needed - receives ancestor array from AuthorizationManager

## 📝 Updates Needed for Team

### Backend Team

**Database Schema** (`database/schema.sql`):
```sql
-- Add column to works table
ALTER TABLE works ADD COLUMN ancestors JSONB;

-- Example data:
-- ancestors: ["0x123...", "0x456..."]
```

**Event Indexer** (`src/indexers/creationManagerIndexer.js`):
```javascript
// When indexing DerivativeWorkRegistered event:
// 1. Get parent work's ancestors from database
// 2. Build new ancestors array: parent.ancestors + parent.creator
// 3. Store in database

const parentWork = await supabase
  .from('works')
  .select('creator_address, ancestors')
  .eq('work_id', parentId)
  .single();

const newAncestors = [
  ...(parentWork.ancestors || []),
  parentWork.creator_address
];

await supabase.from('works').insert({
  work_id: workId,
  ancestors: newAncestors,
  // ... other fields
});
```

**API Endpoints**:
```javascript
// GET /api/works/:id
// Response now includes:
{
  "work_id": 4,
  "creator": "0xDave...",
  "parent_id": 3,
  "ancestors": ["0xAlice...", "0xCarol..."],  // NEW
  // ... other fields
}
```

### Frontend Team

**Contract Calls**:
```javascript
// Get ancestors for a work
const ancestors = await creationManager.getAncestors(workId);
// Returns: ["0xAlice...", "0xCarol..."]

// Get full creator chain (ancestors + current creator)
const creatorChain = await creationManager.getCreatorChain(workId);
// Returns: ["0xAlice...", "0xCarol...", "0xDave..."]
```

**UI Display**:
```jsx
// Show creation chain
<div>
  <h3>Creation Chain:</h3>
  {work.ancestors.map((ancestor, i) => (
    <div key={i}>
      Level {i + 1}: {ancestor}
    </div>
  ))}
  <div>Current: {work.creator}</div>
</div>
```

**Tree Visualization**:
- Can now properly show branches
- Each work knows its complete ancestry
- No need to traverse recursively

## ✅ Benefits

1. **Handles branches correctly** - Multiple derivatives from same parent work fine
2. **Gas efficient** - Ancestors stored once at creation, no traversal needed
3. **Simple queries** - One mapping lookup gets all ancestors
4. **Accurate revenue distribution** - Always splits correctly across the chain
5. **Better for UI** - Easy to display creation trees

## 🚀 Migration Notes

If you already deployed contracts:
1. **Need to redeploy** - This is a breaking change
2. Old data won't have ancestor arrays
3. Recommend fresh deployment on testnet

## 📚 Updated Functions Reference

### CreationManager

```solidity
// Register original work (no ancestors)
function registerOriginalWork(
    uint256 licenseFee,
    bool derivativeAllowed,
    string calldata metadataURI
) external returns (uint256 workId)

// Register derivative (builds ancestor array)
function registerDerivativeWork(
    uint256 parentId,
    uint256 licenseFee,
    bool derivativeAllowed,
    string calldata metadataURI
) external returns (uint256 workId)

// Get ancestor creators (excluding current work's creator)
function getAncestors(uint256 workId) 
    external view returns (address[] memory)

// Get full creator chain (ancestors + current creator)
function getCreatorChain(uint256 workId) 
    external view returns (address[] memory)
```

## 🎯 Testing Checklist

- [ ] Original work has empty ancestors array
- [ ] First derivative has [original creator]
- [ ] Second level derivative has [original, parent]
- [ ] Branching works: A→B and A→C both have [A]
- [ ] Deep chain works: A→B→C→D has [A,B,C]
- [ ] Revenue distribution splits correctly
- [ ] UI displays chain correctly

---

**Questions?** Check the updated contracts or ask in team chat! 💬
