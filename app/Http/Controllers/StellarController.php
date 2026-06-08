<?php

namespace App\Http\Controllers;

use App\Services\StellarInheritanceService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class StellarController extends Controller
{
    protected $stellarService;

    public function __construct(StellarInheritanceService $stellarService)
    {
        $this->stellarService = $stellarService;
    }

    /**
     * Create an inheritance claimable balance.
     */
    public function createInheritance(Request $request)
    {
        $validated = $request->validate([
            'source_account' => 'required|string',
            'asset' => 'required|array',
            'amount' => 'required|numeric',
            'heirs' => 'required|array',
            'heirs.*.address' => 'required|string',
            'heirs.*.grace_period' => 'required|string',
        ]);

        try {
            $op = $this->stellarService->buildClaimableBalanceOp(
                $validated['source_account'],
                $validated['asset'],
                $validated['amount'],
                $validated['heirs']
            );

            return response()->json([
                'status' => 'success',
                'operation' => $op
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Ping a balance to "reset" the inheritance (hypothetical).
     */
    public function ping(Request $request)
    {
        $validated = $request->validate([
            'balance_id' => 'required|string|size:72',
        ]);

        try {
            $op = $this->stellarService->buildPingOperation($validated['balance_id']);

            return response()->json([
                'status' => 'success',
                'operation' => $op
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Parse a natural language timeframe into seconds.
     */
    public function parse(Request $request)
    {
        $validated = $request->validate([
            'timeframe' => 'required|string',
        ]);

        try {
            $seconds = $this->stellarService->parseTimeframeToSeconds($validated['timeframe']);

            return response()->json([
                'status' => 'success',
                'seconds' => $seconds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
