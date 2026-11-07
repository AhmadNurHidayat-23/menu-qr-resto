<?php

namespace Tests\Unit;

use App\Models\DiningTable;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_table_relation_and_paid_status(): void
    {
        $table = DiningTable::create([
            'name' => 'Meja 01',
            'token' => 'token-meja-01',
            'active' => true,
        ]);

        $order = Order::create([
            'number' => 'ORD-001',
            'tracking_token' => 'track-001',
            'checkout_key' => 'key-001',
            'dining_table_id' => $table->id,
            'table_name' => $table->name,
            'customer_name' => 'Pelanggan Meja 1',
            'total' => 50000,
            'status' => 'received',
        ]);

        $this->assertTrue($order->diningTable->is($table));
        $this->assertTrue($table->orders->contains($order));
        $this->assertFalse($order->isPaid());

        $order->paid_at = now();
        $order->save();
        $this->assertTrue($order->isPaid());
    }
}
