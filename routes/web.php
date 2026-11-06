<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StorefrontController::class, 'index'])->name('home');
Route::get('/meja/{token}', [StorefrontController::class, 'index'])->name('table.menu');
Route::post('/meja/{token}/pesan', [StorefrontController::class, 'checkout'])->middleware('throttle:15,1');
Route::get('/pesanan/{token}', [StorefrontController::class, 'show'])->name('order.show');
Route::get('/petugas/masuk', [AuthController::class, 'create'])->middleware('guest')->name('login');
Route::post('/petugas/masuk', [AuthController::class, 'store'])->middleware(['guest', 'throttle:5,1']);
Route::middleware('auth')->prefix('petugas')->group(function () {
    Route::post('/keluar', [AuthController::class, 'destroy']);
    Route::get('/dapur', [KitchenController::class, 'index']);
    Route::patch('/pesanan/{order}', [KitchenController::class, 'update']);
    Route::get('/kelola', [ManagementController::class, 'index']);
    Route::post('/menu/{menu?}', [ManagementController::class, 'saveMenu']);
    Route::post('/meja/{table?}', [ManagementController::class, 'saveTable']);
    Route::get('/meja/{table}/qr', [ManagementController::class, 'qr'])->name('table.qr');
    Route::get('/laporan', [ReportController::class, 'index']);
});
