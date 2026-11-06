<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (app()->environment() !== 'e2e' || ! getenv('E2E_PASSWORD')) {
    throw new RuntimeException('Run through npm run test:e2e.');
}
User::create(['name' => 'Petugas pengujian', 'email' => 'e2e@ruangrasa.test', 'password' => Hash::make(getenv('E2E_PASSWORD'))]);
