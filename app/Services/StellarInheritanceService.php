<?php

namespace App\Services;

use DateTime;
use Exception;
use InvalidArgumentException;

/**
 * Service for handling Stellar Inheritance logic.
 */
class StellarInheritanceService
{
    /**
     * Parses a natural language timeframe into Unix seconds.
     *
     * @param string $timeframe
     * @return int
     * @throws InvalidArgumentException
     */
    public function parseTimeframeToSeconds(string $timeframe): int
    {
        $timeframe = strtolower(trim($timeframe));
        
        // Simple regex-based parsing for common patterns
        if (preg_match('/^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/', $timeframe, $matches)) {
            $amount = (int)$matches[1];
            $unit = $matches[2];
            
            switch ($unit) {
                case 'minute':
                case 'minutes':
                    return $amount * 60;
                case 'hour':
                case 'hours':
                    return $amount * 3600;
                case 'day':
                case 'days':
                    return $amount * 86400;
                case 'week':
                case 'weeks':
                    return $amount * 604800;
                case 'month':
                case 'months':
                    return $amount * 2592000; // Approximated 30 days
                case 'year':
                case 'years':
                    return $amount * 31536000; // Approximated 365 days
            }
        }

        throw new InvalidArgumentException("Invalid timeframe format: $timeframe");
    }

    /**
     * Builds a CreateClaimableBalance operation for multiple heirs.
     * 
     * @param string $sourceAccount
     * @param array $assetData ['code' => 'USDC', 'issuer' => '...'] or native
     * @param float $amount
     * @param array $heirs Array of ['address' => '...', 'grace_period' => '1 year']
     * @return array Mocked operation structure for this example
     */
    public function buildClaimableBalanceOp(string $sourceAccount, array $assetData, float $amount, array $heirs): array
    {
        $claimants = [];

        foreach ($heirs as $heir) {
            $seconds = $this->parseTimeframeToSeconds($heir['grace_period']);
            
            // Predicate: Claimable if NOT before relative time (meaning claimable AFTER the period)
            $claimants[] = [
                'destination' => $heir['address'],
                'predicate' => [
                    'not' => [
                        'beforeRelativeTime' => $seconds
                    ]
                ]
            ];
        }

        return [
            'type' => 'create_claimable_balance',
            'source' => $sourceAccount,
            'asset' => $assetData,
            'amount' => $amount,
            'claimants' => $claimants
        ];
    }

    /**
     * Builds a "ping" operation to refresh the claimable balance or similar logic.
     * For this context, we'll assume it's an operation that identifies the balance ID.
     *
     * @param string $balanceId 72-char hex string
     * @return array
     * @throws Exception
     */
    public function buildPingOperation(string $balanceId): array
    {
        if (strlen($balanceId) !== 72) {
            throw new Exception("Invalid Balance ID length. Expected 72 characters.");
        }

        return [
            'type' => 'ping_claimable_balance',
            'balance_id' => $balanceId,
            'timestamp' => time()
        ];
    }

    /**
     * Queries Horizon for the status of a claimable balance.
     *
     * @param string $balanceId
     * @return array
     */
    public function checkBalanceStatus(string $balanceId): array
    {
        $horizonUrl = config('stellar.horizon_url');
        $url = "{$horizonUrl}/claimable_balances/{$balanceId}";

        try {
            // Using file_get_contents for simplicity in this mock-like environment, 
            // but Guzzle or Http client is preferred in real Laravel apps.
            $response = @file_get_contents($url);
            
            if ($response === false) {
                return [
                    'balance_found' => false,
                    'heir_can_claim' => false,
                    'seconds_remaining' => 0,
                    'heir_unlocks_at' => null
                ];
            }

            $data = json_decode($response, true);
            $now = time();
            $heirUnlocksAt = null;
            $secondsRemaining = 0;
            $heirCanClaim = false;

            // In our implementation, we use predicateNot beforeRelativeTime or beforeAbsoluteTime.
            // Horizon returns predicates in a structured format.
            foreach ($data['claimants'] as $claimant) {
                $unlockTime = null;

                if (isset($claimant['predicate']['not']['before_relative_time'])) {
                    $relativeSeconds = (int)$claimant['predicate']['not']['before_relative_time'];
                    $createdAt = strtotime($data['last_modified_time']); // This is an approximation
                    $unlockTime = $createdAt + $relativeSeconds;
                } elseif (isset($claimant['predicate']['not']['before_absolute_time'])) {
                    $unlockTime = strtotime($claimant['predicate']['not']['before_absolute_time']);
                }

                if ($unlockTime !== null) {
                    $heirUnlocksAt = date('c', $unlockTime);
                    $secondsRemaining = max(0, $unlockTime - $now);
                    $heirCanClaim = $now >= $unlockTime;
                    break;
                }
            }

            return [
                'balance_found' => true,
                'heir_can_claim' => $heirCanClaim,
                'seconds_remaining' => $secondsRemaining,
                'heir_unlocks_at' => $heirUnlocksAt
            ];

        } catch (Exception $e) {
            return [
                'balance_found' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
