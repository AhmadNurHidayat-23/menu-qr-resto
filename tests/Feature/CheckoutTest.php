<?php

namespace Tests\Feature;

use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private DiningTable $table;

    private Menu $menu;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
        $this->table = DiningTable::first();
        $this->menu = Menu::first();
    }

    private function data(): array
    {
        return ['customer_name' => 'Tamu uji', 'checkout_key' => (string) Str::uuid(), 'items' => [['menu_id' => $this->menu->id, 'quantity' => 2]], 'total' => 1];
    }

    public function test_checkout_persists_table_items_and_server_price(): void
    {
        $d = $this->data();
        $this->withSession(['checkout_key' => $d['checkout_key']])->post('/meja/'.$this->table->token.'/pesan', $d)->assertRedirect();
        $o = Order::first();
        $this->assertSame($this->menu->price * 2, $o->total);
        $this->assertSame($this->table->id, $o->dining_table_id);
        $this->assertSame(23, $this->menu->fresh()->stock);
        $this->assertSame(2, $o->items->first()->quantity);
        $this->assertCount(1, $o->events);
    }

    public function test_retry_is_idempotent(): void
    {
        $d = $this->data();
        $service = new CheckoutService;
        $a = $service->place($this->table, $d);
        $b = $service->place($this->table, $d);
        $this->assertSame($a->id, $b->id);
        $this->assertSame(1, Order::count());
        $this->assertSame(23, $this->menu->fresh()->stock);
    }

    public function test_insufficient_stock_rolls_back_every_item(): void
    {
        $other = Menu::skip(1)->first();
        $other->update(['stock' => 0]);
        $d = $this->data();
        $d['items'][] = ['menu_id' => $other->id, 'quantity' => 1];
        try {
            (new CheckoutService)->place($this->table, $d);
            $this->fail('Checkout should fail.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('cart', $e->errors());
        }
        $this->assertSame(25, $this->menu->fresh()->stock);
        $this->assertSame(0, Order::count());
    }

    public function test_second_customer_cannot_take_last_portion(): void
    {
        $this->menu->update(['stock' => 1]);
        $d = $this->data();
        $d['items'][0]['quantity'] = 1;
        (new CheckoutService)->place($this->table, $d);
        $d['checkout_key'] = (string) Str::uuid();
        $this->withSession(['checkout_key' => $d['checkout_key']])->post('/meja/'.$this->table->token.'/pesan', $d)->assertSessionHasErrors('cart');
        $this->assertSame(0, $this->menu->fresh()->stock);
        $this->assertSame(1, Order::count());
    }

    public function test_inactive_meja_cannot_accept_order(): void
    {
        $this->table->update(['active' => false]);
        $this->get('/meja/'.$this->table->token)->assertNotFound();
        $d = $this->data();
        $this->withSession(['checkout_key' => $d['checkout_key']])->post('/meja/'.$this->table->token.'/pesan', $d)->assertSessionHasErrors('cart');
    }

    public function test_duplicate_menu_and_negative_quantity_are_rejected(): void
    {
        $d = $this->data();
        $d['items'][] = $d['items'][0];
        $d['items'][0]['quantity'] = -1;
        $this->withSession(['checkout_key' => $d['checkout_key']])->post('/meja/'.$this->table->token.'/pesan', $d)->assertSessionHasErrors(['items.0.menu_id', 'items.0.quantity']);
        $this->assertSame(0, Order::count());
    }

    public function test_checkout_key_must_match_session(): void
    {
        $d = $this->data();
        $this->post('/meja/'.$this->table->token.'/pesan', $d)->assertStatus(419);
    }

    public function test_unknown_tracking_token_cannot_disclose_order(): void
    {
        $this->get('/pesanan/'.Str::uuid())->assertNotFound();
    }

    public function test_tracking_does_not_expose_checkout_key(): void
    {
        $o = (new CheckoutService)->place($this->table, $this->data());
        $this->get('/pesanan/'.$o->tracking_token)->assertInertia(fn ($p) => $p->component('Order')->where('order.number', $o->number)->missing('order.checkout_key'));
    }
}
