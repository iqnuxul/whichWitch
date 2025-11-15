# Revenue Distribution Examples

## 💰 Distribution Rule

**License Fee Split**: 40% Direct + 40% Original + 20% Middle

## 📊 Examples

### Example 1: A → B (2 levels)
```
Alice (Original) → Bob (Direct)

User pays 1 ETH for Bob's work:
├─ Bob (Direct): 0.4 ETH (40%)
├─ Alice (Original): 0.6 ETH (40% + 20% = 60%, no middle)
└─ Total: 1.0 ETH
```

### Example 2: A → B → C (3 levels)
```
Alice (Original) → Bob (Middle) → Carol (Direct)

User pays 1 ETH for Carol's work:
├─ Carol (Direct): 0.4 ETH (40%)
├─ Alice (Original): 0.4 ETH (40%)
├─ Bob (Middle): 0.2 ETH (20%)
└─ Total: 1.0 ETH
```

### Example 3: A → B → C → D (4 levels)
```
Alice (Original) → Bob (Middle) → Carol (Middle) → Dave (Direct)

User pays 1 ETH for Dave's work:
├─ Dave (Direct): 0.4 ETH (40%)
├─ Alice (Original): 0.4 ETH (40%)
├─ Bob (Middle): 0.1 ETH (20% ÷ 2)
├─ Carol (Middle): 0.1 ETH (20% ÷ 2)
└─ Total: 1.0 ETH
```

### Example 4: A → B → C → D → E (5 levels)
```
Alice (Original) → Bob → Carol → Dave → Eve (Direct)

User pays 1 ETH for Eve's work:
├─ Eve (Direct): 0.4 ETH (40%)
├─ Alice (Original): 0.4 ETH (40%)
├─ Bob (Middle): 0.0667 ETH (20% ÷ 3)
├─ Carol (Middle): 0.0667 ETH (20% ÷ 3)
├─ Dave (Middle): 0.0666 ETH (20% ÷ 3 + remainder)
└─ Total: 1.0 ETH
```

## 💸 Withdrawal with Platform Fee

When creators withdraw their balance:

```
Creator has 1 ETH balance
Calls withdraw():
├─ Creator receives: 0.9 ETH (90%)
├─ Platform fee: 0.1 ETH (10%)
└─ Total: 1.0 ETH
```

**This applies to ALL balance sources**:
- License fees
- Tips
- Any accumulated earnings

## 🎁 Tips

Tips go 100% to the creator's balance (no splitting):

```
User tips Bob 1 ETH:
├─ Bob's balance: +1 ETH
├─ No splitting to ancestors
└─ Platform fee taken on withdrawal (10%)
```

## 🔢 Smart Contract Constants

```solidity
DIRECT_CREATOR_SHARE = 4000;    // 40%
ORIGINAL_CREATOR_SHARE = 4000;  // 40%
MIDDLE_ANCESTORS_POOL = 2000;   // 20%
PLATFORM_FEE = 1000;            // 10%
PERCENTAGE_BASE = 10000;        // 100%
```

## 🎯 Key Points

1. **Direct creator** always gets 40%
2. **Original creator** always gets 40%
3. **Middle ancestors** split 20% equally
4. If no middle ancestors, original gets 60% total (40% + 20%)
5. **Platform fee** (10%) only on withdrawal
6. **Tips** don't split, but still subject to withdrawal fee

---

**Questions?** Check `docs/PAYMENT_FLOW.md` for complete details! 💬
