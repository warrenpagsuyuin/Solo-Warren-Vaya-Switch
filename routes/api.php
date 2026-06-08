<?php

use App\Http\Controllers\StellarController;
use App\Http\Controllers\VayaSwitchController;
use Illuminate\Support\Facades\Route;

Route::prefix('stellar')->group(function () {
    Route::post('/create-inheritance', [StellarController::class, 'createInheritance']);
    Route::post('/ping', [StellarController::class, 'ping']);
    Route::post('/parse', [StellarController::class, 'parse']);
});

Route::prefix('vaya')->group(function () {
    Route::get('/status', [VayaSwitchController::class, 'status']);
});
