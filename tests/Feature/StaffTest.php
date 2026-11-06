<?php

namespace Tests\Feature;

use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
        $this->staff = User::factory()->create();
        $this->order = (new CheckoutService)->place(DiningTable::first(), ['customer_name' => '=FORMULA', 'checkout_key' => (string) Str::uuid(), 'items' => [['menu_id' => Menu::first()->id, 'quantity' => 1]]]);
    }

    private function action(string $action)
    {
        return $this->patch('/petugas/pesanan/'.$this->order->id, compact('action'));
    }

    public function test_guests_cannot_access_staff_routes(): void
    {
        foreach (['/petugas/dapur', '/petugas/kelola', '/petugas/laporan', '/petugas/meja/1/qr'] as $url) {
            $this->get($url)->assertRedirect('/petugas/masuk');
        }
        $this->action('paid')->assertRedirect('/petugas/masuk');
        $this->assertNull($this->order->fresh()->paid_at);
    }

    public function test_only_legal_transitions_are_allowed(): void
    {
        $this->actingAs($this->staff);
        $this->action('ready')->assertSessionHasErrors('action');
        $this->action('processing')->assertSessionHasNoErrors();
        $this->action('ready')->assertSessionHasNoErrors();
        $this->action('completed')->assertSessionHasErrors('action');
        $this->assertSame('ready', $this->order->fresh()->status);
        $this->action('paid')->assertSessionHasNoErrors();
        $this->action('completed')->assertSessionHasNoErrors();
        $this->assertNotNull($this->order->fresh()->completed_at);
        $this->assertCount(5, $this->order->fresh()->events);
    }

    public function test_manual_payment_cannot_be_recorded_twice(): void
    {
        $this->actingAs($this->staff);
        $this->action('paid');
        $at = $this->order->fresh()->paid_at;
        $this->action('paid')->assertSessionHasErrors('action');
        $this->assertTrue($at->equalTo($this->order->fresh()->paid_at));
        $this->assertCount(2, $this->order->fresh()->events);
    }

    public function test_menu_image_stock_and_archival(): void
    {
        Storage::fake('public');
        $menu = Menu::first();
        $this->actingAs($this->staff)->post('/petugas/menu/'.$menu->id, ['name' => 'Menu baru', 'category' => 'Camilan', 'description' => 'Renyah dan hangat', 'price' => 15000, 'stock' => 4, 'active' => false, 'photo' => UploadedFile::fake()->image('menu.jpg')])->assertSessionHasNoErrors();
        $menu->refresh();
        $this->assertSame(15000, $menu->price);
        $this->assertFalse($menu->active);
        Storage::disk('public')->assertExists(substr($menu->image, 9));
        $this->assertSame(32000, $this->order->items->first()->price);
    }

    public function test_invalid_menu_data_cannot_be_saved(): void
    {
        $this->actingAs($this->staff)->post('/petugas/menu', ['price' => -1, 'stock' => -1, 'photo' => UploadedFile::fake()->create('script.php', 1, 'application/x-php')])->assertSessionHasErrors(['name', 'price', 'stock', 'photo']);
    }

    public function test_tables_have_unique_qr_destinations(): void
    {
        $this->actingAs($this->staff)->post('/petugas/meja', ['name' => 'Teras 01', 'active' => true])->assertSessionHasNoErrors();
        $t = DiningTable::where('name', 'Teras 01')->firstOrFail();
        $this->assertNotSame(DiningTable::first()->token, $t->token);
        $this->get('/meja/'.$t->token)->assertInertia(fn ($p) => $p->component('Menu')->where('table.name', 'Teras 01'));
        $this->get('/petugas/meja/'.$t->id.'/qr')->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
    }

    public function test_report_excludes_unpaid_from_sales_and_filters_dates(): void
    {
        $this->actingAs($this->staff);
        $url = '/petugas/laporan?from='.now()->toDateString().'&to='.now()->toDateString();
        $this->get($url)->assertInertia(fn ($p) => $p->where('summary.paid', 0)->where('summary.completed', 0)->where('summary.count', 1));
        foreach (['processing', 'ready', 'paid', 'completed'] as $a) {
            $this->action($a);
        }
        $this->get($url)->assertInertia(fn ($p) => $p->where('summary.paid', 32000)->where('summary.completed', 32000)->where('summary.unpaid', 0));
        $this->get('/petugas/laporan?from=2000-01-01&to=2000-01-02')->assertInertia(fn ($p) => $p->where('summary.count', 0));
    }

    public function test_csv_escapes_spreadsheet_formulas(): void
    {
        $r = $this->actingAs($this->staff)->get('/petugas/laporan?export=csv');
        $r->assertDownload('penjualan.csv');
        $this->assertStringContainsString("'=FORMULA", $r->streamedContent());
    }

    public function test_login_invalid_password_does_not_authenticate(): void
    {
        $this->post('/petugas/masuk', ['email' => $this->staff->email, 'password' => Str::random(30)])->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
