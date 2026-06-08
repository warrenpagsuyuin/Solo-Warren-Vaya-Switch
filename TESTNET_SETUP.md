# 🚀 Testnet Setup Guide

## Quick Start - Get Your Test Accounts in 2 Minutes

### Step 1: Create Account A (Primary Owner)
1. Go to: https://laboratory.stellar.org/#account-creator?network=test
2. Click **"Generate keypair"**
3. Copy the **Secret Key** (starts with `S`)
   - Example: `SBUK4H7RMOUQ4E5VEG3FJYL4A2RXAAZAEZVM5PQHTJSTX4BJFAAFBQX`
4. Click **"Fund with test network lumens"**
5. **Save this secret key** - paste into "Primary Account Secret" field

### Step 2: Create Account B (Heir)
1. Go to: https://laboratory.stellar.org/#account-creator?network=test
2. Click **"Generate keypair"** (again)
3. Copy the **Public Key** (starts with `G`)
   - Example: `GDZA4QYGB45RNBGEFFT4PY5OK4ZOPKRXC5FPYC34KDMSV5VJNUGVGVV`
4. **Save this public key** - paste into "Heir Account Public" field

### Step 3: Fund Account B  
1. Go back to Step 1's page (still open)
2. In the "Create Test Network Account" section, paste Account B's **public key** into the "Account ID" field
3. Click **"Fund with test network lumens"**
4. ✅ Both accounts are now funded with test XLM!

---

## Dashboard Fields Explained

| Field | What to Paste | Example |
|-------|---------------|---------|
| **Primary Account Secret** | Account A's **Secret Key** | `SBUK...` (starts with S) |
| **Heir Account Public** | Account B's **Public Key** | `GDZA...` (starts with G) |
| **Timeframe** | How long until heir can claim | `1 minute`, `2 hours`, `6 months` |
| **Amount** | How much XLM to lock | `100` |

---

## Common Errors & Fixes

### ❌ "invalid version byte. expected 144, got 48"
**You pasted a MAINNET key instead of TESTNET**
- ✅ Fix: Go back to the link above and make sure `?network=test` is in the URL
- ✅ Regenerate keys - copy them fresh
- ✅ Don't use real keys!

### ❌ "Public key must start with G"
**You swapped the fields**
- ✅ Fix: Put the key starting with `S` in "Primary Account Secret"
- ✅ Fix: Put the key starting with `G` in "Heir Account Public"

### ❌ "Account not found on testnet"
**The account wasn't funded**
- ✅ Fix: Go to https://laboratory.stellar.org/#account-creator?network=test
- ✅ Fix: Click "Fund with test network lumens"
- ✅ Wait a few seconds, try again

---

## How It Works

1. **Create Beacon**: Lock XLM until timestamp using Account A's secret
2. **Wait**: After the timeframe passes, deadline is unlocked
3. **Claim**: Account B uses their secret key to claim the locked XLM
4. **Verify**: Transaction appears on https://horizon-testnet.stellar.org

---

## Test Workflow

1. Paste Account A's **secret** into "Primary Account Secret"
2. Paste Account B's **public key** into "Heir Account Public"
3. Set "Timeframe" to `1 minute` (for quick testing)
4. Set "Amount" to `10` (small amount for testing)
5. Click **"Create Beacon"**
6. ✅ Copy the **"claimableBalanceId"** from the output
7. Wait 60 seconds
8. Go to "Claim" tab, paste the Balance ID + Account B's **secret**
9. Click **"Claim Now"**
10. ✅ Success! Funds transferred!

---

## Verify on Blockchain

1. After "Create Beacon", copy the **"transactionHash"**
2. Go to: https://horizon-testnet.stellar.org
3. Search for the hash
4. ✅ You'll see your transaction confirmed!

---

**Questions?** Check the output messages - they're designed to help debug issues!
