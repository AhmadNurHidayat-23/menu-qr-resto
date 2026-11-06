<?php

namespace Database\Seeders;

use App\Models\DiningTable;
use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (range(1, 8) as $n) {
            DiningTable::firstOrCreate(['name' => 'Meja '.str_pad($n, 2, '0', STR_PAD_LEFT)], ['token' => (string) Str::uuid()]);
        }
        $menus = [
            ['Nasi Goreng Kampung', 'Menu utama', 'Nasi goreng bumbu rumahan, telur mata sapi, dan kerupuk.', 32000, 'nasi.jpg'],
            ['Ayam Panggang Rempah', 'Menu utama', 'Ayam panggang dengan bumbu rempah, nasi, dan sambal.', 42000, 'ayam.jpg'],
            ['Mie Goreng Jawa', 'Menu utama', 'Mie goreng gurih dengan sayuran segar dan telur.', 30000, 'mie.jpg'],
            ['Kentang Renyah', 'Camilan', 'Kentang goreng hangat dengan saus sambal dan mayones.', 22000, 'kentang.jpg'],
            ['Es Kopi Susu', 'Minuman', 'Espresso, susu segar, dan gula aren. Disajikan dingin.', 24000, 'kopi.jpg'],
            ['Teh Lemon Segar', 'Minuman', 'Teh hitam dengan perasan lemon dan es batu.', 18000, 'lemon.jpg'],
        ];
        foreach ($menus as [$name,$category,$description,$price,$image]) {
            Menu::firstOrCreate(['name' => $name], compact('category', 'description', 'price') + ['stock' => 25, 'image' => '/images/'.$image]);
        }
    }
}
