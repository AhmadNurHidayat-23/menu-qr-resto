<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index(Request $request, ?string $token = null)
    {
        $table = $token ? DiningTable::where('token', $token)->where('active', true)->firstOrFail() : null;
        if (! $request->session()->has('checkout_key')) {
            $request->session()->put('checkout_key', (string) Str::uuid());
        }

        return Inertia::render('Menu', ['menus' => Menu::where('active', true)->orderBy('id')->get(),
            'table' => $table?->only('id', 'name', 'token'), 'checkoutKey' => $request->session()->get('checkout_key')]);
    }

    public function checkout(Request $request, string $token, CheckoutService $service)
    {
        $data = $request->validate(['customer_name' => 'required|string|max:80', 'notes' => 'nullable|string|max:500',
            'checkout_key' => 'required|uuid', 'items' => 'required|array|min:1|max:30', 'items.*.menu_id' => 'required|integer|distinct',
            'items.*.quantity' => 'required|integer|min:1|max:50']);
        abort_unless(hash_equals((string) $request->session()->get('checkout_key', ''), $data['checkout_key']), 419);
        $table = DiningTable::where('token', $token)->firstOrFail();
        $order = $service->place($table, $data);

        return to_route('order.show', $order->tracking_token);
    }

    public function show(Request $request, string $token)
    {
        $order = Order::where('tracking_token', $token)->with(['items', 'events' => fn ($q) => $q->orderBy('id')])->firstOrFail();
        if ($request->session()->get('checkout_key') === $order->checkout_key) {
            $request->session()->forget('checkout_key');
        }

        return Inertia::render('Order', ['order' => $order]);
    }
}
