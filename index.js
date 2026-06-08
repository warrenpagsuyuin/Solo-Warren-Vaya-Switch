/**
 * Vaya-Switch: Cross-Wallet Inheritance Beacon
 * Main server entry point with API endpoints
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { InheritanceService } from './src/inheritanceService.js';
import { parseTimeframe, secondsToHumanReadable } from './src/timeframeParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Stellar service
const inheritanceService = new InheritanceService('testnet');

// ==================== API Endpoints ====================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Vaya-Switch Inheritance Beacon',
    network: 'testnet',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Parse natural language timeframe to seconds
 * POST /api/parse
 * Body: { timeframe: "6 months" }
 */
app.post('/api/parse', (req, res) => {
  try {
    const { timeframe } = req.body;

    if (!timeframe) {
      return res.status(400).json({
        error: 'Missing "timeframe" parameter',
        example: { timeframe: '6 months' },
      });
    }

    const seconds = parseTimeframe(timeframe);
    const readable = secondsToHumanReadable(seconds);

    res.json({
      input: timeframe,
      seconds,
      readable,
      timestamp: Math.floor(Date.now() / 1000) + seconds,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Create inheritance beacon (claimable balance with time predicate)
 * POST /api/create-beacon
 * Body: {
 *   primaryAccountSecret: "SBUK...",
 *   heirAccountPublic: "GDZA...",
 *   timeframe: "6 months",
 *   amount: "1000",
 *   assetCode: "native"
 * }
 */
app.post('/api/create-beacon', async (req, res) => {
  try {
    const { primaryAccountSecret, primaryAccountPublic, heirAccountPublic, timeframe, amount, assetCode } = req.body;

    if ((!primaryAccountSecret && !primaryAccountPublic) || !heirAccountPublic || !timeframe || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['primaryAccountSecret OR primaryAccountPublic', 'heirAccountPublic', 'timeframe', 'amount'],
        example: {
          primaryAccountPublic: 'GDEAY...',
          heirAccountPublic: 'GDJD...',
          timeframe: '6 months',
          amount: '10',
          assetCode: 'native',
        },
      });
    }

    const result = await inheritanceService.createInheritanceBeacon({
      primaryAccountSecret,
      primaryAccountPublic,
      heirAccountPublic,
      timeframe,
      amount,
      assetCode: assetCode || 'native',
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reset inheritance timer (create new beacon with extended deadline)
 * POST /api/reset-timer
 * Body: {
 *   primaryAccountSecret: "SBUK...",
 *   heirAccountPublic: "GDZA...",
 *   timeframe: "6 months",
 *   amount: "1000"
 * }
 */
app.post('/api/reset-timer', async (req, res) => {
  try {
    const { primaryAccountSecret, heirAccountPublic, timeframe, amount } = req.body;

    if (!primaryAccountSecret || !heirAccountPublic || !timeframe || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['primaryAccountSecret', 'heirAccountPublic', 'timeframe', 'amount'],
      });
    }

    const result = await inheritanceService.resetInheritanceTimer({
      primaryAccountSecret,
      heirAccountPublic,
      timeframe,
      amount,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Claim inheritance as heir
 * POST /api/claim-inheritance
 * Body: {
 *   heirAccountSecret: "SBKA...",
 *   balanceId: "000000..."
 * }
 */
app.post('/api/claim-inheritance', async (req, res) => {
  try {
    const { heirAccountSecret, balanceId } = req.body;

    if (!heirAccountSecret || !balanceId) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['heirAccountSecret', 'balanceId'],
      });
    }

    const result = await inheritanceService.claimInheritance({
      heirAccountSecret,
      balanceId,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get claimable balance details
 * GET /api/balance/:balanceId
 */
app.get('/api/balance/:balanceId', async (req, res) => {
  try {
    const { balanceId } = req.params;

    if (!balanceId) {
      return res.status(400).json({ error: 'Missing balanceId parameter' });
    }

    const balance = await inheritanceService.getClaimableBalance(balanceId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all claimable balances for an account
 * GET /api/balances/:accountId
 */
app.get('/api/balances/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({ error: 'Missing accountId parameter' });
    }

    const balances = await inheritanceService.getClaimableBalancesForAccount(accountId);
    res.json({
      account: accountId,
      count: balances.length,
      balances,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Root endpoint - API info
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Vaya-Switch: Cross-Wallet Inheritance Beacon',
    description: 'Non-custodial dead man\'s switch using Stellar claimable balances with time predicates',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      parseTimeframe: 'POST /api/parse',
      createBeacon: 'POST /api/create-beacon',
      resetTimer: 'POST /api/reset-timer',
      claimInheritance: 'POST /api/claim-inheritance',
      getBalance: 'GET /api/balance/:balanceId',
      getBalances: 'GET /api/balances/:accountId',
    },
    docs: 'See index.js or run: npm run demo',
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

/**
 * Start server
 */
app.listen(port, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🌟 Vaya-Switch: Inheritance Beacon                 ║
║  Cross-Wallet Inheritance with Stellar              ║
╚══════════════════════════════════════════════════════╝

Server running on http://localhost:${port}

Quick Start:
  • GET  http://localhost:${port}/api/health
  • POST http://localhost:${port}/api/parse
  • RUN   npm run demo

Docs: See index.js for all endpoints
  `);
});
