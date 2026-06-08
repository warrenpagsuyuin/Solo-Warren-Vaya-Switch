<?php

namespace Tests;

use App\Services\StellarInheritanceService;
use PHPUnit\Framework\TestCase;

class StellarInheritanceServiceTest extends TestCase
{
    protected $service;

    protected function setUp(): void
    {
        $this->service = new StellarInheritanceService();
    }

    /**
     * Test parsing natural language timeframes to seconds.
     */
    public function test_parse_timeframe_to_seconds()
    {
        // Edge cases
        $this->assertEquals(1800, $this->service->parseTimeframeToSeconds('30 minutes'));
        $this->assertEquals(63072000, $this->service->parseTimeframeToSeconds('2 years'));
        
        // Standard cases
        $this->assertEquals(86400, $this->service->parseTimeframeToSeconds('1 day'));
        $this->assertEquals(604800, $this->service->parseTimeframeToSeconds('1 week'));
        $this->assertEquals(2592000, $this->service->parseTimeframeToSeconds('1 month'));
    }

    /**
     * Test building a claimable balance operation with multiple heirs and staggered grace periods.
     */
    public function test_build_claimable_balance_op_with_multiple_heirs()
    {
        $source = 'GABCD...';
        $asset = [
            'code' => 'USDC',
            'issuer' => 'GBBD...'
        ];
        $amount = 100.0;
        $heirs = [
            ['address' => 'GHEIR1...', 'grace_period' => '1 year'],
            ['address' => 'GHEIR2...', 'grace_period' => '2 years']
        ];

        $op = $this->service->buildClaimableBalanceOp($source, $asset, $amount, $heirs);

        $this->assertEquals('create_claimable_balance', $op['type']);
        $this->assertEquals($asset, $op['asset']);
        $this->assertCount(2, $op['claimants']);

        // Check first heir (1 year)
        $this->assertEquals('GHEIR1...', $op['claimants'][0]['destination']);
        $this->assertEquals(31536000, $op['claimants'][0]['predicate']['not']['beforeRelativeTime']);

        // Check second heir (2 years)
        $this->assertEquals('GHEIR2...', $op['claimants'][1]['destination']);
        $this->assertEquals(63072000, $op['claimants'][1]['predicate']['not']['beforeRelativeTime']);
    }

    /**
     * Test building a ping operation with a valid 72-char balance ID.
     */
    public function test_build_ping_operation_with_valid_id()
    {
        $validId = str_repeat('a', 72);
        $op = $this->service->buildPingOperation($validId);

        $this->assertEquals('ping_claimable_balance', $op['type']);
        $this->assertEquals($validId, $op['balance_id']);
    }

    /**
     * Test buildPingOperation throws exception for invalid ID length.
     */
    public function test_build_ping_operation_invalid_id()
    {
        $this->expectException(\Exception::class);
        $this->service->buildPingOperation('too-short');
    }
}
