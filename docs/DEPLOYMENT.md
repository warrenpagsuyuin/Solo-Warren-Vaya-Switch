# Deployment & Integration Guide

This guide covers the setup, configuration, and integration of the Vaya Switch Stellar inheritance backend.

## 1. Prerequisites
- PHP 8.2 or higher
- Composer
- A Stellar account (for `STELLAR_SOURCE_SEED`)

## 2. Laravel 11 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Vaya-Switch
   ```

2. **Install dependencies:**
   ```bash
   composer install
   ```

3. **Setup environment file:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Start the development server:**
   ```bash
   php artisan serve
   ```

## 3. Environment Configuration (`.env`)

Configure the following variables in your `.env` file based on your target network.

### Testnet (Default)
```env
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOURCE_SEED=S... # Your Testnet Secret Key
```

### Mainnet
```env
STELLAR_NETWORK=public
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_SOURCE_SEED=S... # Your Mainnet Secret Key
```

## 4. Running the Test Suite

The project includes PHPUnit tests for the core Stellar inheritance logic.

```bash
php artisan test docs/StellarInheritanceServiceTest.php
```

## 5. Frontend Integration: Signing with Freighter

The `/api/stellar/create-inheritance` endpoint returns a JSON payload containing the operation data. To submit this to the Stellar network, the user must sign the transaction using a wallet like Freighter.

### Implementation Steps

1. **Install Freighter API:**
   ```bash
   npm install @stellar/freighter-api
   ```

2. **Sign the Operation:**
   The backend returns an operation object. You need to wrap this in a Transaction on the frontend using the `stellar-sdk`.

   ```javascript
   import { TransactionBuilder, Account, Server, Networks } from '@stellar/stellar-sdk';
   import { signTransaction } from '@stellar/freighter-api';

   async function signAndSubmit(operationPayload) {
     const server = new Server("https://horizon-testnet.stellar.org");
     const publicKey = "G..."; // User's public key from Freighter
     
     // 1. Fetch current account sequence
     const account = await server.loadAccount(publicKey);
     
     // 2. Build the transaction
     const transaction = new TransactionBuilder(account, {
       fee: '1000',
       networkPassphrase: Networks.TESTNET
     })
     .addOperation(operationPayload) // Operation returned by our API
     .setTimeout(600)
     .build();

     // 3. Sign with Freighter
     const xdr = transaction.toXDR();
     const signedXdr = await signTransaction(xdr, {
       network: "TESTNET"
     });

     // 4. Submit to Horizon
     const result = await server.submitTransaction(signedXdr);
     console.log("Success:", result);
   }
   ```

## 6. Endpoints Overview

Refer to `docs/openapi.yaml` for full API details.
- `POST /api/stellar/create-inheritance`: Generate inheritance op.
- `POST /api/stellar/ping`: Generate "keep-alive" op.
- `POST /api/stellar/parse`: Parse natural language to seconds.
- `GET /api/vaya/status`: Check on-chain balance status.
