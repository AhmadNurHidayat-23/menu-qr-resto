<?php

namespace App\Services;

use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function place(DiningTable $table, array $data): Order
    {
        return DB::transaction(function () use ($table, $data) {
            if ($existing = Order::where('checkout_key', $data['checkout_key'])->first()) {
                return $existing;
            }
            if (! $table->fresh()->active) {
                throw ValidationException::withMessages(['cart' => 'Meja ini sedang tidak menerima pesanan.']);
            }
            $items = [];
            $total = 0;
            foreach ($data['items'] as $item) {
                $menu = Menu::find($item['menu_id']);
                $qty = (int) $item['quantity'];
                if (! $menu || ! $menu->active || ! Menu::whereKey($menu->id)->where('active', true)->where('stock', '>=', $qty)->decrement('stock', $qty)) {
                    throw ValidationException::withMessages(['cart' => 'Stok menu berubah. Muat ulang menu dan periksa keranjang Anda.']);
                }
                $items[] = ['menu_id' => $menu->id, 'name' => $menu->name, 'price' => $menu->price, 'quantity' => $qty];
                $total += $menu->price * $qty;
            }
            $order = Order::create(['number' => 'RR-'.strtoupper(Str::random(8)), 'tracking_token' => (string) Str::uuid(),
                'checkout_key' => $data['checkout_key'], 'dining_table_id' => $table->id, 'table_name' => $table->name,
                'customer_name' => $data['customer_name'], 'notes' => $data['notes'] ?? null, 'total' => $total]);
            $order->items()->createMany($items);
            $order->events()->create(['description' => 'Pesanan diterima dapur.']);

            return $order;
        }, 3);
    }
}
