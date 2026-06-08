<?php

return [
    'network' => env('STELLAR_NETWORK', 'testnet'), // 'public' or 'testnet'
    'source_seed' => env('STELLAR_SOURCE_SEED'),
    'horizon_url' => env('STELLAR_HORIZON_URL', 'https://horizon-testnet.stellar.org'),
];
