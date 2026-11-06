<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

Artisan::command('staff:create', function () {
    $name = $this->ask('Nama petugas');
    $email = $this->ask('Email petugas');
    $password = $this->secret('Kata sandi (minimal 12 karakter)');
    $v = Validator::make(compact('name', 'email', 'password'), ['name' => 'required|string|max:80', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:12']);
    if ($v->fails()) {
        foreach ($v->errors()->all() as $e) {
            $this->error($e);
        }

        return 1;
    }
    User::create(['name' => $name, 'email' => $email, 'password' => Hash::make($password)]);
    $this->info('Akun petugas dibuat.');
})->purpose('Membuat akun petugas restoran tanpa kata sandi bawaan');
