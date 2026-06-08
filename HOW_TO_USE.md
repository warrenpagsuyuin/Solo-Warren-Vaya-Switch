# 🌟 Vaya-Switch: Cross-Wallet Inheritance Beacon

## Quick Start

### Prerequisites
- Node.js installed
- 2 Stellar testnet accounts (create at https://laboratory.stellar.org)
- Both accounts funded with test XLM
- (Optional) Freighter wallet: https://www.freighter.app

### Installation & Run

```bash
cd Vaya-Switch
npm install
npm start
```

Server runs on: **http://localhost:3000**

---

## 📋 How to Use

### Step 1: Create 2 Testnet Accounts
1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Create Account A (Primary Owner)
3. Create Account B (Heir)
4. Fund both with ~10 XLM each using the faucet

### Step 2: Setup Freighter (Optional)
1. Install [Freighter Wallet](https://www.freighter.app)
2. Import Account B's secret key
3. Click "🔗 Connect Freighter" in the dashboard
4. Your Heir account will auto-populate

### Step 3: Create Inheritance Beacon
1. Fill in the "🔐 Create Inheritance Beacon" form:
   - **Primary Secret:** Account A's secret key (SBUK...)
   - **Heir Public:** Account B's public key (auto-fills if Freighter connected)
   - **Timeframe:** e.g., "6 months", "1 hour", "10 seconds"
   - **Amount:** e.g., "100" (XLM to lock)

2. Click "Create Beacon"

3. **⚠️ IMPORTANT:** Save the **Claimable Balance ID** from the response!

### Step 4: Wait for Deadline
- The funds are now locked until the deadline passes
- Primary user can call "🔄 Reset Inheritance Timer" to extend it
- If primary doesn't reset, deadline approaches...

### Step 5: Claim as Heir (After Deadline)
1. Go to "💰 Claim Inheritance" section
2. **Option 1 (Recommended):** Use Freighter
   - Paste the Claimable Balance ID
   - Click "Claim with Connected Freighter"
3. **Option 2:** Use secret key manually
   - Paste Account B's secret key + Balance ID
   - Click "Claim Inheritance"

---

## 🧪 Testing Tips

### Quick Test Timeline
- `"10 seconds"` → Instant test
- `"1 minute"` → Wait 1 min
- `"5 minutes"` → Coffee break test
- `"1 hour"` → Full session test

### Workflow Example
```
Day 0: Create beacon (6 months timeout)
  → Transaction: CreateClaimableBalance (Amount: 100 XLM)
  → Response: Claimable Balance ID = 0000...

Day 60: Primary user resets
  → Creates NEW beacon with new 6-month timeout

Day 180: Deadline reached (6 months from Day 0)
  → Heir account can NOW claim

Day 181: Heir claims
  → Transaction: ClaimClaimableBalance
  → Funds transferred to Heir! ✓
```

---

## 🔑 API Endpoints

All endpoints are available at `http://localhost:3000/api/`

### 1. Parse Timeframe
```bash
POST /api/parse
Content-Type: application/json

{
  "timeframe": "6 months"
}

Response: {
  "input": "6 months",
  "seconds": 15552000,
  "readable": "6 months",
  "timestamp": 1234567890
}
```

### 2. Create Inheritance Beacon
```bash
POST /api/create-beacon
Content-Type: application/json

{
  "primaryAccountSecret": "SBUK...",
  "heirAccountPublic": "GDZA...",
  "timeframe": "6 months",
  "amount": "100",
  "assetCode": "native"
}

Response: {
  "success": true,
  "transactionHash": "...",
  "claimableBalanceId": "0000...",
  "predicateTimestamp": 1234567890,
  "message": "Inheritance beacon created. Heir can claim after ..."
}
```

### 3. Reset Inheritance Timer
```bash
POST /api/reset-timer
(Same as create-beacon, extends the deadline)
```

### 4. Claim Inheritance
```bash
POST /api/claim-inheritance
Content-Type: application/json

{
  "heirAccountSecret": "SBKA...",
  "balanceId": "0000..."
}

Response: {
  "success": true,
  "transactionHash": "...",
  "message": "Inheritance claimed successfully!"
}
```

### 5. Check Claimable Balance
```bash
GET /api/balance/0000...
GET /api/balances/GDZA...
```

---

## 🔐 Security Notes

### ✅ Safe to Use
- ✓ Freighter wallet (never exposes secret keys)
- ✓ Testnet only (use test XLM, no real value)
- ✓ Localhost (no internet exposure)

### ⚠️ Never Do This
- ✗ Paste secret keys on untrusted machines
- ✗ Use on mainnet without proper security setup
- ✗ Share your Claimable Balance ID publicly (anyone can view it)
- ✗ Leave browser dev tools open with secrets visible

### For Production
- Use hardware wallets or key management services
- Deploy API securely (not localhost)
- Use environment variables for secrets
- Implement proper authentication/authorization
- Audit smart contract logic (if using advanced features)

---

## 📚 Understanding the Mechanism

### What is a Claimable Balance?
A locked amount of XLM/tokens that can only be claimed when specific conditions are met.

### What is a Time Predicate?
A condition that says "this balance can only be claimed at/after a specific timestamp"

### The Inheritance Beacon
```
Primary User creates:
├── Claimable Balance: 100 XLM
├── Claimant: Heir (public key)
└── Predicate: NOT (before 2026-12-08)
    └── = Can claim ON or AFTER 2026-12-08

Result:
- Balance locked until deadline
- Heir is authorized claimant
- Ledger automatically enforces time constraint
- No smart contract needed
- No centralized custodian
```

### The Reset Mechanism
```
If Primary User is "alive":
├── Day 60: Create NEW beacon
├── Balance 1: Expires 2026-12-08 (old)
├── Balance 2: Expires 2027-06-08 (new)
└── Can keep resetting indefinitely

If Primary User goes silent:
├── Deadline 2026-12-08 passes
├── No new beacon created
├── Heir can now claim original balance
└── Funds transferred → inheritance complete ✓
```

---

## 🚀 Next Steps

1. **Test locally** with the interactive dashboard
2. **Understand the timeframe** before going live
3. **For production:**
   - Use real testnet accounts with meaningful amounts
   - Document the inheritance process for your heirs
   - Consider legal documentation (this is technical, not legal binding)
   - Test claim process thoroughly
   - Use mainnet only after extensive testing

---

## 🐛 Troubleshooting

### "Cannot find package 'express'"
```bash
npm install express
```

### "Freighter not detected"
- Install [Freighter Wallet](https://www.freighter.app)
- Refresh the page

### "Account not funded"
- Go to [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator?network=test)
- Each account needs 10+ XLM

### "Balance not claimable yet"
- The deadline hasn't passed
- Wait until the timeframe expires
- Check the predicateTimestamp in the response

### "Claimable balance not found"
- Wrong balance ID (copy exactly)
- Balance already claimed
- Check on [Horizon](https://horizon-testnet.stellar.org) testnet explorer

---

## 📖 Learn More

- [Stellar Documentation](https://developers.stellar.org)
- [Stellar SDK (JavaScript)](https://github.com/stellar/js-stellar-sdk)
- [Claimable Balances](https://developers.stellar.org/learn/fundamentals/transactions/list-of-operations#create-claimable-balance)
- [Freighter Wallet](https://www.freighter.app/docs)

---

## 📝 License

MIT - Open source for blockchain inheritance research

---

**Made with ❤️ by the Vaya-Switch team**
