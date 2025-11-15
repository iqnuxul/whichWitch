# Payment Flow & Revenue Distribution

## 💰 Where Users Pay License Fees

### Payment Entry Point: `AuthorizationManager.requestAuthorization()`

```solidity
// User calls this function with ETH payment
function requestAuthorization(uint256 workId) external payable {
    // 1. User sends ETH (msg.value) equal to license fee
    // 2. Contract validates payment amount
    // 3. Marks user as authorized
    // 4. Forwards payment to PaymentManager for distribution
}
```

**Example**:
```javascript
// Frontend code
const licenseFee = await creationManager.works(workId).licenseFee;
await authorizationManager.requestAuthorization(workId, {
  value: licenseFee // User pays here!
});
```

## 📊 New Revenue Distribution Rules

### License Fee Distribution

When a user pays for authorization, the money is split as follows:

| Recipient | Share | Description |
|-----------|-------|-------------|
| **Direct Creator** | 40% | The creator of the work being authorized |
| **Original Creator** | 40% | The first creator in the chain (original work) |
| **Middle Ancestors** | 20% | Split equally among creators between original and direct |

### Example 1: Simple Chain (A → B) - Only 2 People

```
Work A (Alice) - Original
  └─ Work B (Bob) - Derivative

User pays 1 ETH for Work B authorization:
- Bob (direct creator): 0.4 ETH (40%)
- Alice (original creator): 0.6 ETH (40% + 20% = 60%)
  └─ Gets the 20% middle pool since there are no middle ancestors
- Total: 1.0 ETH ✓
```

### Example 2: Medium Chain (A → B → C)

```
Work A (Alice) - Original
  └─ Work B (Bob)
      └─ Work C (Carol)

User pays 1 ETH for Work C authorization:
- Carol (direct creator): 0.4 ETH (40%)
- Alice (original creator): 0.4 ETH (40%)
- Bob (middle ancestor): 0.2 ETH (20%)
```

### Example 3: Long Chain (A → B → C → D → E)

```
Work A (Alice) - Original
  └─ Work B (Bob)
      └─ Work C (Carol)
          └─ Work D (Dave)
              └─ Work E (Eve)

User pays 1 ETH for Work E authorization:
- Eve (direct creator): 0.4 ETH (40%)
- Alice (original creator): 0.4 ETH (40%)
- Bob, Carol, Dave (middle ancestors): 0.0667 ETH each (20% ÷ 3)
```

### Example 4: Branching (A → B and A → C)

```
Work A (Alice) - Original
  ├─ Work B (Bob)
  └─ Work C (Carol)

User pays 1 ETH for Work B:
- Bob (direct): 0.4 ETH (40%)
- Alice (original): 0.6 ETH (40% + 20% = 60%, no middle ancestors)
- Total: 1.0 ETH ✓

User pays 1 ETH for Work C:
- Carol (direct): 0.4 ETH (40%)
- Alice (original): 0.6 ETH (40% + 20% = 60%, no middle ancestors)
- Total: 1.0 ETH ✓
```

## 💸 Withdrawal & Platform Fee

### User Withdrawal

When creators withdraw their earnings:

```solidity
function withdraw() external {
    // 1. Calculate 10% platform fee
    // 2. User receives 90% of their balance
    // 3. Platform receives 10% fee
}
```

**Example**:
```
Creator has 1 ETH balance
Calls withdraw():
- Creator receives: 0.9 ETH (90%)
- Platform receives: 0.1 ETH (10% fee)
```

### Platform Fee Withdrawal

Platform can withdraw accumulated fees:

```solidity
function withdrawPlatformFees() external {
    // Only platform wallet can call
    // Withdraws all accumulated platform fees
}
```

## 🔄 Complete Payment Flow

### Flow 1: License Fee Payment

```
1. User → AuthorizationManager.requestAuthorization() + 1 ETH
   ↓
2. AuthorizationManager validates and marks user as authorized
   ↓
3. AuthorizationManager → PaymentManager.distributeRevenue() + 1 ETH
   ↓
4. PaymentManager splits money:
   - Direct creator balance += 0.3 ETH
   - First ancestor balance += 0.3 ETH
   - Other ancestors balance += 0.4 ETH (split equally)
   ↓
5. Balances updated, event emitted
```

### Flow 2: Creator Withdrawal

```
1. Creator → PaymentManager.withdraw()
   ↓
2. PaymentManager calculates:
   - User amount = balance * 90%
   - Platform fee = balance * 10%
   ↓
3. Balances updated:
   - Creator balance = 0
   - Platform balance += fee
   ↓
4. Transfer user amount to creator
   ↓
5. Events emitted
```

### Flow 3: Tip Payment

```
1. User → PaymentManager.tipCreator(creator) + 1 ETH
   ↓
2. Creator balance += 1 ETH (100%, no split)
   ↓
3. Event emitted
```

## 📝 Smart Contract Functions

### PaymentManager

```solidity
// Revenue distribution (called by AuthorizationManager)
function distributeRevenue(
    uint256 workId,
    address directCreator,
    address[] calldata ancestors
) external payable

// User withdrawal (10% platform fee)
function withdraw() external

// Platform fee withdrawal
function withdrawPlatformFees() external

// Tip creator (100% to creator, no fee)
function tipCreator(address creator) external payable

// Check balance
function getBalance(address creator) external view returns (uint256)
```

### AuthorizationManager

```solidity
// User pays license fee here
function requestAuthorization(uint256 workId) external payable
```

## 💡 Key Points

1. **License fees** are paid in `AuthorizationManager.requestAuthorization()`
2. **Distribution** happens automatically in `PaymentManager.distributeRevenue()`
3. **Platform fee** (10%) is taken only on withdrawal, not on tips
4. **Tips** go 100% to creator (no platform fee, no splitting)
5. **Balances** are tracked internally, users withdraw when they want

## 🎯 Distribution Summary

| Payment Type | Direct Creator | Original Creator | Middle Ancestors | Platform Fee |
|--------------|----------------|------------------|------------------|--------------|
| **License Fee** | 40% | 40% | 20% (split) | 0% |
| **Withdrawal** | 90% of balance | - | - | 10% |
| **Tip** | 100% | 0% | 0% | 10% on withdrawal |

**Important Notes**:
- Tips go 100% to creator's balance (no splitting)
- Platform fee (10%) is taken when withdrawing, applies to both license fees and tips
- **If there are no middle ancestors (only 2 people), the 20% middle pool goes to the original creator (total 60%)**
- All percentages always add up to 100% - no money is lost

## 🔐 Security Features

- ✅ ReentrancyGuard on withdrawals
- ✅ Checks-effects-interactions pattern
- ✅ Balance tracking (pull payment pattern)
- ✅ Platform wallet can be updated
- ✅ All funds accounted for (no rounding errors)

## 📱 Frontend Integration

### Request Authorization
```javascript
const licenseFee = await creationManager.works(workId).licenseFee;
const tx = await authorizationManager.requestAuthorization(workId, {
  value: licenseFee
});
await tx.wait();
```

### Withdraw Earnings
```javascript
const balance = await paymentManager.getBalance(userAddress);
// User will receive 90% of balance
const userReceives = balance * 0.9;

const tx = await paymentManager.withdraw();
await tx.wait();
```

### Tip Creator
```javascript
const tipAmount = ethers.parseEther("0.1"); // 0.1 ETH
const tx = await paymentManager.tipCreator(creatorAddress, {
  value: tipAmount
});
await tx.wait();
```

---

**Questions?** Check the smart contracts or ask in team chat! 💬
