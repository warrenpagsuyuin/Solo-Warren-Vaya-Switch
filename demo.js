/**
 * Demo: Cross-Wallet Inheritance Beacon
 * Shows complete workflow for creating, resetting, and claiming inheritance
 */

import * as StellarSDK from '@stellar/stellar-sdk';
import { InheritanceService } from './src/inheritanceService.js';
import { parseTimeframe, secondsToHumanReadable } from './src/timeframeParser.js';

/**
 * Demo workflow
 */
async function runDemo() {
  console.log('🌟 Vaya-Switch: Cross-Wallet Inheritance Beacon Demo\n');
  console.log('=' .repeat(60));

  try {
    // Initialize service (testnet)
    const inheritanceService = new InheritanceService('testnet');
    console.log('✓ Connected to Stellar testnet\n');

    // Generate test accounts for demo
    console.log('📝 Generating demo accounts...');
    const primaryKeypair = StellarSDK.Keypair.random();
    const heirKeypair = StellarSDK.Keypair.random();

    console.log(`Primary Account: ${primaryKeypair.publicKey()}`);
    console.log(`Heir Account: ${heirKeypair.publicKey()}\n`);

    // Demo 1: Parse timeframe
    console.log('=' .repeat(60));
    console.log('Demo 1: Timeframe Parsing');
    console.log('=' .repeat(60));

    const timeframes = ['6 months', '2 years', '90 days', '1 week'];

    for (const tf of timeframes) {
      try {
        const seconds = parseTimeframe(tf);
        console.log(`✓ "${tf}" = ${seconds} seconds = ${secondsToHumanReadable(seconds)}`);
      } catch (error) {
        console.log(`✗ Error parsing "${tf}": ${error.message}`);
      }
    }

    // Demo 2: Create Inheritance Beacon (would need funded accounts on testnet)
    console.log('\n' + '=' .repeat(60));
    console.log('Demo 2: Creating Inheritance Beacon');
    console.log('=' .repeat(60));
    console.log(`
Note: To actually create an inheritance beacon, you need:
1. Primary account with XLM balance on testnet
2. Fund testnet account via: https://laboratory.stellar.org/#account-creator?network=test

Example call:
  const result = await inheritanceService.createInheritanceBeacon({
    primaryAccountSecret: '${primaryKeypair.secret()}',
    heirAccountPublic: '${heirKeypair.publicKey()}',
    timeframe: '6 months',
    amount: '1000',
    assetCode: 'native',
  });

This creates a claimable balance where:
  • The heir can only claim after 6 months pass
  • If primary user doesn't "reset" the timer, funds transfer to heir
  • Uses Stellar's native time predicates (no smart contract needed)
    `);

    // Demo 3: Show predicate logic
    console.log('=' .repeat(60));
    console.log('Demo 3: Understanding Time Predicates');
    console.log('=' .repeat(60));
    console.log(`
The predicate uses: predicate_not(predicate_before_absolute_time(timestamp))

This means:
  ✓ NOT before timestamp = can only claim AT or AFTER timestamp
  ✓ Automatically enforced by Stellar ledger
  ✓ No smart contract risk
  ✓ Zero gas fees beyond base operation costs

Timeline Example (6 months):
  Day 0: Primary user creates beacon
  Day 30: Primary user can reset timer (extends deadline)
  Day 150: Deadline reached → Heir can now claim
  Day 151+: Funds transfer to heir (unclaimed)
    `);

    // Demo 4: Reset mechanism
    console.log('=' .repeat(60));
    console.log('Demo 4: Timer Reset Mechanism');
    console.log('=' .repeat(60));
    console.log(`
Primary user "stays alive" by creating a new inheritance beacon:

  1. Create initial beacon (6 months timeout)
  2. Month 3 → Primary user resets timer (creates new beacon)
  3. New deadline: 6 months from NOW (Month 9)
  4. Repeat as needed

This is the "dead man's switch":
  • If primary user stops resetting → heir eventually gets funds
  • Simple, non-custodial, immutable
    `);

    // Demo 5: Claim workflow
    console.log('=' .repeat(60));
    console.log('Demo 5: Inheritance Claim Workflow');
    console.log('=' .repeat(60));
    console.log(`
Once deadline passes and primary user doesn't reset:

  1. Heir calls: inheritanceService.claimInheritance({
       heirAccountSecret: '${heirKeypair.secret()}',
       balanceId: 'encoded-balance-id'
     })
  
  2. Stellar ledger validates:
     - Current timestamp >= deadline
     - Heir is authorized claimant
  
  3. If valid → Funds transferred to heir immediately
  4. If not yet → Transaction rejected

Example scenarios:
  ✓ Primary user passes away → Heir claims funds (goal achieved!)
  ✓ Primary user loses keys → Heir claims after timeout (safety net)
  ✓ Primary user stays active → Keeps resetting, heir never claims
    `);

    // Demo 6: API endpoint examples
    console.log('=' .repeat(60));
    console.log('Demo 6: Server API Examples');
    console.log('=' .repeat(60));
    console.log(`
REST Endpoint Examples:

POST /api/create-beacon
{
  "primaryAccountSecret": "SBUK...",
  "heirAccountPublic": "GDZA...",
  "timeframe": "6 months",
  "amount": "10000",
  "assetCode": "native"
}

POST /api/reset-timer
{
  "primaryAccountSecret": "SBUK...",
  "heirAccountPublic": "GDZA...",
  "timeframe": "6 months",
  "amount": "10000"
}

POST /api/claim-inheritance
{
  "heirAccountSecret": "SBKA...",
  "balanceId": "000000..."
}

GET /api/check-balance/{balanceId}
  Returns claimable balance details & predicate status
    `);

    console.log('\n' + '=' .repeat(60));
    console.log('✓ Demo complete!');
    console.log('=' .repeat(60));
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

runDemo();
