<?php

namespace App\Http\Controllers;

use App\Services\StellarInheritanceService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class VayaSwitchController extends Controller
{
    protected $stellarService;

    public function __construct(StellarInheritanceService $stellarService)
    {
        $this->stellarService = $stellarService;
    }

    /**
     * Check the status of a claimable balance.
     */
    public function status(Request $request)
    {
        $validated = $request->validate([
            'balance_id' => 'required|string|size:72',
        ]);

        $status = $this->stellarService->checkBalanceStatus($validated['balance_id']);

        return response()->json($status);
    }
}
