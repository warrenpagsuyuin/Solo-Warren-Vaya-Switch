# 🌟 Vaya-Switch: Cross-Wallet Inheritance Beacon

> **A non-custodial, blockchain-based inheritance system using Stellar claimable balances — enabling secure wealth transfer for the 1.7 billion unbanked, especially in the Philippines.**

## 🚀 Quick Start (5 Minutes)

### 1. Install & Run
```bash
npm install
npm start
```

### 2. Open Dashboard
Navigate to: **http://localhost:3000**

### 3. Get Testnet Keys
Visit: https://laboratory.stellar.org/#account-creator?network=test
- Generate 2 keypairs
- Fund both with test lumens
- Use in dashboard

### 4. Create Beacon
Paste Account A's secret key, Account B's public key, set timeframe to "1 minute", click Create

### 5. Wait & Claim
After 60 seconds, go to Claim tab and claim the inheritance

**✅ That's it! Your funds are on the Stellar blockchain!**

---

## 📋 Complete Documentation

**For Judges & Competition:** [README_SUBMISSION.md](README_SUBMISSION.md)
- Project overview & problem statement
- Stellar primitives used
- Network configuration
- API endpoints
- Complete setup instructions

**For Setup:** [TESTNET_SETUP.md](TESTNET_SETUP.md)
- Step-by-step testnet account creation
- Common errors & fixes
- Wallet integration guide

**For Full Usage:** [HOW_TO_USE.md](HOW_TO_USE.md)
- All features explained
- Workflow examples
- Troubleshooting guide

---

## ⭐ What This Does

**Problem:** Inheritance systems require expensive intermediaries (lawyers, banks, executors). Billions can't access them. OFW remittances in the Philippines often vanish without clear inheritance paths.

**Solution:** Vaya-Switch uses Stellar's claimable balances with time predicates to create automatic, non-custodial inheritance. Lock XLM now. Heirs claim after a deadline automatically. No intermediaries. No fees (except network). Works anywhere with internet.

**How:** 
- Owner deposits XLM into a Stellar claimable balance
- Locks it with a time predicate (e.g., "release after 6 months of inactivity")
- Only the heir's key can claim it
- Blockchain enforces everything — no trust needed

---

## 🛠️ Stack

- **Frontend:** HTML/CSS/Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **Blockchain:** Stellar SDK v15.1.0
- **Network:** Stellar Testnet
- **Wallet:** Freighter integration ready

---

## 📁 Project Structure

```
├── index.js                    # Express API server
├── public/index.html           # Dashboard UI
├── src/
│   ├── inheritanceService.js   # Stellar SDK wrapper
│   └── timeframeParser.js      # Timeframe parser
├── package.json
├── README_SUBMISSION.md        # Full competition submission
├── TESTNET_SETUP.md           # Account setup guide
├── HOW_TO_USE.md              # Detailed usage
└── demo.js                    # Demo script
```

---

## 🌍 Why This Matters (Philippines Context)

- **1.7 billion unbanked globally** — 37% of Philippines
- **$30B in OFW remittances annually** — needs inheritance path
- **Land disputes common** — inheritance records needed
- **No lawyer access in rural areas** — decentralized solution critical
- **Family-centric culture** — inheritance protection is cultural priority

Vaya-Switch solves all of these with a simple, on-chain solution.

---

## 💰 Network Details

```
Network:        Stellar Testnet
Asset:          XLM (Native)
RPC:            https://horizon-testnet.stellar.org
Fee:            100 stroops (~0.00001 XLM)
Consensus:      ~5 seconds
Contract Type:  None (uses native claimable balance primitive)
```

---

## 🎯 Stellar Primitives Used

| Primitive | Usage |
|-----------|-------|
| **Claimable Balances** | Lock inheritance funds with conditions |
| **Time Predicates** | Enforce deadline with `predicate_before_absolute_time()` |
| **Keypair Cryptography** | Sign transactions securely |
| **Testnet** | Risk-free development & testing |
| **Native XLM** | No custom asset issuers needed |

---

## 🧪 Test It Now

### Terminal 1: Start Server
```bash
npm start
# Output: Server running on http://localhost:3000
```

### Browser: Open Dashboard
```
http://localhost:3000
```

### Get Test Accounts
- Visit: https://laboratory.stellar.org/#account-creator?network=test
- Generate 2 keypairs
- Fund both

### Full Test Flow
```
1. Create tab: Paste Account A secret + Account B public + "1 minute" timeframe
2. Create Beacon → Get claimableBalanceId
3. Wait 60 seconds
4. Claim tab: Paste Account B secret + claimableBalanceId
5. Claim Now → ✅ Success!
```

### Verify on Blockchain
```
1. Copy transactionHash from Create response
2. Go to: https://horizon-testnet.stellar.org
3. Search the hash
4. See your transaction confirmed! 🎉
```

---

## 📚 API Endpoints

```
GET  /api/health                    # Server status
POST /api/parse                     # Parse timeframe to seconds
POST /api/create-beacon             # Create inheritance beacon
POST /api/claim-inheritance         # Claim after deadline
GET  /api/balance/{balanceId}       # Check balance status
```

---

## 🔐 Security

- ✅ Non-custodial — you hold your keys
- ✅ No intermediaries — blockchain enforces rules
- ✅ Testnet only — use real keys at own risk
- ✅ Time-locked — heir can't claim before deadline
- ✅ Transparent — all transactions verified on-chain

---

## 🚀 Run Demo

```bash
npm run demo
```

Shows:
- Timeframe parsing
- Beacon creation
- Claim workflow
- Full example walkthrough

---

## 📖 Full Submission Guide

**👉 For judges:** Read [README_SUBMISSION.md](README_SUBMISSION.md)

It contains:
- ✅ Project name & one-line description
- ✅ Problem statement & Philippines relevance
- ✅ Track (Financial Inclusion / Social Good)
- ✅ Stellar primitives & protocols used
- ✅ Complete setup instructions
- ✅ Network details (testnet URLs, asset info)
- ✅ API documentation
- ✅ End-to-end test flow
- ✅ Wallet integration (Freighter)
- ✅ Judging criteria checklist

---

## ⚠️ Testnet Only

This is **testnet-only** code:
- Uses test XLM (fake money)
- For development & demonstration
- Don't use with real funds on mainnet without audit

---

## 🎓 Learn More

- [Stellar Documentation](https://developers.stellar.org)
- [Claimable Balances Guide](https://developers.stellar.org/docs/tutorials/claimable-balances)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [Freighter Wallet](https://www.freighter.app)

---

## 📞 Questions?

Check these in order:
1. **Dashboard errors?** → See dashboard UI error messages
2. **Setup problems?** → Read [TESTNET_SETUP.md](TESTNET_SETUP.md)
3. **Usage questions?** → Check [HOW_TO_USE.md](HOW_TO_USE.md)
4. **Competition info?** → See [README_SUBMISSION.md](README_SUBMISSION.md)

---

## 📝 License

Open source — MIT License

---

**Version:** 1.0.0  
**Status:** Production-Ready for Testnet  
**Last Updated:** June 8, 2026  

🌟 **Vaya-Switch: Let Your Legacy Go On** 🌟