/**
 * Inheritance Service
 * Core logic for creating and managing Stellar claimable balances with time predicates
 */

import * as StellarSDK from '@stellar/stellar-sdk';
import { parseTimeframe } from './timeframeParser.js';

export class InheritanceService {
  constructor(networkType = 'testnet') {
    this.networkType = networkType;
    this.server = null;
    this.network = null;
    this.setupNetwork();
  }

  /**
   * Initialize Stellar network connection
   */
  setupNetwork() {
    if (this.networkType === 'testnet') {
      this.server = new StellarSDK.Horizon.Server('https://horizon-testnet.stellar.org');
      this.network = StellarSDK.Networks.TESTNET;
    } else if (this.networkType === 'public') {
      this.server = new StellarSDK.Horizon.Server('https://horizon.stellar.org');
      this.network = StellarSDK.Networks.PUBLIC;
    } else {
      throw new Error('Invalid network type. Use "testnet" or "public"');
    }
  }

  toTransactionSource(accountRecord, fallbackAccountId) {
    return new StellarSDK.Account(
      accountRecord.account_id || accountRecord.id || fallbackAccountId,
      accountRecord.sequence
    );
  }

  validatePublicKey(publicKey, label) {
    if (!StellarSDK.StrKey.isValidEd25519PublicKey(publicKey)) {
      throw new Error(`${label} must be a valid Stellar public key (G...)`);
    }
  }

  /**
   * Create a claimable balance with time predicate (inheritance beacon)
   * @param {Object} params
   * @param {string} params.primaryAccountSecret - Primary user's secret key (optional if public key provided)
   * @param {string} params.primaryAccountPublic - Primary user's public key (required if secret missing)
   * @param {string} params.heirAccountPublic - Heir's public key
   * @param {string} params.timeframe - Natural language timeframe (e.g., "6 months")
   * @param {string} params.amount - Amount to claim (e.g., "1000")
   * @param {string} params.assetCode - Asset code (default: "native")
   * @param {string} params.assetIssuer - Asset issuer (only for non-native assets)
   * @returns {Promise<Object>} Transaction details or unsigned XDR
   */
  async createInheritanceBeacon(params) {
    const {
      primaryAccountSecret,
      primaryAccountPublic,
      heirAccountPublic,
      timeframe,
      amount,
      assetCode = 'native',
      assetIssuer = '',
    } = params;

    // Determine source address
    let sourcePublic = primaryAccountPublic;
    if (primaryAccountSecret && primaryAccountSecret.startsWith('S')) {
      try {
        const kp = StellarSDK.Keypair.fromSecret(primaryAccountSecret);
        sourcePublic = kp.publicKey();
      } catch (e) {
        // Fallback to primaryAccountPublic if secret is invalid
      }
    }

    if (!sourcePublic) {
      throw new Error('❌ Missing Primary Account Address (Public Key or Secret Key)');
    }

    // Validate inputs
    if (!heirAccountPublic || !timeframe || !amount) {
      throw new Error('Missing required parameters');
    }

    try {
      // Validate keys format
      this.validatePublicKey(sourcePublic, 'Primary Account');
      this.validatePublicKey(heirAccountPublic, 'Heir Account');

      // Parse timeframe to seconds
      const timeframeSeconds = parseTimeframe(timeframe);

      // Get primary account
      let primaryAccountRecord;
      try {
        primaryAccountRecord = await this.server.accounts().accountId(sourcePublic).call();
      } catch (error) {
        throw new Error('Primary Account was not found on Stellar testnet. Fund it first with Friendbot or Stellar Laboratory.');
      }
      const primaryAccount = this.toTransactionSource(primaryAccountRecord, sourcePublic);

      // Build claimable balance with time predicate
      const predicateTimestamp = Math.floor(Date.now() / 1000) + timeframeSeconds;

      // Create the claimant (heir) with time predicate
      // Use NOT before relative time (meaning: can claim after the timeframe seconds have passed since creation)
      const predicateWithTime = new StellarSDK.Claimant(
        heirAccountPublic,
        StellarSDK.Claimant.predicateNot(
          StellarSDK.Claimant.predicateBeforeRelativeTime(timeframeSeconds.toString())
        )
      );

      // Determine asset
      let asset;
      if (assetCode === 'native') {
        asset = StellarSDK.Asset.native();
      } else {
        asset = new StellarSDK.Asset(assetCode, assetIssuer);
      }

      // Create transaction builder
      const transaction = new StellarSDK.TransactionBuilder(primaryAccount, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: this.network,
      })
        .addOperation(
          StellarSDK.Operation.createClaimableBalance({
            asset,
            amount,
            claimants: [predicateWithTime],
          })
        )
        .setTimeout(StellarSDK.TimeoutInfinite)
        .build();

      // Mode: Server-side signing or return XDR for wallet
      if (primaryAccountSecret && primaryAccountSecret.startsWith('S')) {
        const primaryKeypair = StellarSDK.Keypair.fromSecret(primaryAccountSecret);
        transaction.sign(primaryKeypair);
        const result = await this.server.submitTransaction(transaction);

        return {
          success: true,
          signed: true,
          transactionHash: result.hash,
          claimableBalanceId: this.extractClaimableBalanceId(result),
          predicateTimestamp,
          timeframeSeconds,
          heirAccount: heirAccountPublic,
          amount,
          asset: assetCode === 'native' ? 'XLM' : assetCode,
          message: `Inheritance beacon created. Heir can claim after ${new Date(predicateTimestamp * 1000).toISOString()}`,
        };
      } else {
        // Return unsigned XDR for wallet
        return {
          success: true,
          signed: false,
          xdr: transaction.toXDR(),
          network: this.networkType,
          message: 'Transaction built. Please sign with your wallet and submit.',
        };
      }
    } catch (error) {
      throw new Error(`Failed to create inheritance beacon: ${error.message}`);
    }
  }

  /**
   * Reset the inheritance timer by creating a new claimable balance
   * This updates the timeout for the heir to claim
   * @param {Object} params
   * @param {string} params.primaryAccountSecret - Primary user's secret key
   * @param {string} params.heirAccountPublic - Heir's public key
   * @param {string} params.timeframe - New timeframe
   * @param {string} params.amount - Amount to claim
   * @returns {Promise<Object>} Transaction details
   */
  async resetInheritanceTimer(params) {
    const { primaryAccountSecret, heirAccountPublic, timeframe, amount } = params;

    if (!primaryAccountSecret || !heirAccountPublic || !timeframe || !amount) {
      throw new Error('Missing required parameters');
    }

    try {
      // The reset is simply creating a new claimable balance with extended timeframe
      // The primary user can manage this as an extension or replacement strategy
      const result = await this.createInheritanceBeacon({
        ...params,
        assetCode: 'native',
      });

      return {
        ...result,
        message: `Inheritance timer reset. New claim deadline: ${new Date(result.predicateTimestamp * 1000).toISOString()}`,
      };
    } catch (error) {
      throw new Error(`Failed to reset inheritance timer: ${error.message}`);
    }
  }

  /**
   * Claim claimable balance as heir
   * @param {Object} params
   * @param {string} params.heirAccountSecret - Heir's secret key
   * @param {string} params.balanceId - Claimable balance ID
   * @returns {Promise<Object>} Claim details
   */
  async claimInheritance(params) {
    const { heirAccountSecret, balanceId } = params;

    if (!heirAccountSecret || !balanceId) {
      throw new Error('Missing required parameters');
    }

    try {
      const heirKeypair = StellarSDK.Keypair.fromSecret(heirAccountSecret);
      const heirPublic = heirKeypair.publicKey();
      const heirAccountRecord = await this.server.accounts().accountId(heirPublic).call();
      const heirAccount = this.toTransactionSource(heirAccountRecord, heirPublic);

      const transaction = new StellarSDK.TransactionBuilder(heirAccount, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: this.network,
      })
        .addOperation(
          StellarSDK.Operation.claimClaimableBalance({
            balanceId,
          })
        )
        .setTimeout(StellarSDK.TimeoutInfinite)
        .build();

      transaction.sign(heirKeypair);

      const result = await this.server.submitTransaction(transaction);

      return {
        success: true,
        transactionHash: result.hash,
        message: 'Inheritance claimed successfully!',
      };
    } catch (error) {
      throw new Error(`Failed to claim inheritance: ${error.message}`);
    }
  }

  /**
   * Extract claimable balance ID from transaction result
   * @private
   */
  extractClaimableBalanceId(result) {
    try {
      if (result.result_xdr) {
        const resultXDR = StellarSDK.xdr.TransactionResult.fromXDR(result.result_xdr, 'base64');
        const results = resultXDR.result().results();
        if (results.length > 0) {
          const opResult = results[0].tr().createClaimableBalanceResult();
          if (opResult.arm() === 'success') {
            return opResult.success().toXDR('hex');
          }
        }
      }
    } catch (e) {
      // Fallback if parsing fails
    }
    return 'Check transaction details for balance ID';
  }

  /**
   * Get claimable balance details
   * @param {string} balanceId - Claimable balance ID
   * @returns {Promise<Object>} Balance details
   */
  async getClaimableBalance(balanceId) {
    try {
      const balance = await this.server.claimableBalances().claimableBalance(balanceId).call();
      return balance;
    } catch (error) {
      throw new Error(`Failed to fetch claimable balance: ${error.message}`);
    }
  }

  /**
   * List all claimable balances for an account
   * @param {string} accountId - Account public key
   * @returns {Promise<Array>} List of claimable balances
   */
  async getClaimableBalancesForAccount(accountId) {
    try {
      const balances = await this.server.claimableBalances().claimant(accountId).call();
      return balances.records;
    } catch (error) {
      throw new Error(`Failed to fetch claimable balances: ${error.message}`);
    }
  }
}
