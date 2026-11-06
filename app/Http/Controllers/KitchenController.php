<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        return Inertia::render('Kitchen', ['orders' => Order::where('status', '!=', 'completed')->with('items')->oldest()->get()]);
    }

    public function update(Request $r, Order $order)
    {
        $data = $r->validate(['action' => 'required|in:processing,ready,completed,paid']);
        DB::transaction(function () use ($order, $data, $r) {
            $current = Order::lockForUpdate()->findOrFail($order->id);
            $action = $data['action'];
            if ($action === 'paid') {
                if ($current->paid_at) {
                    throw ValidationException::withMessages(['action' => 'Pembayaran sudah tercatat.']);
                }
                $current->update(['paid_at' => now()]);
                $description = 'Pembayaran manual dikonfirmasi petugas.';
            } else {
                $next = ['accepted' => 'processing', 'processing' => 'ready', 'ready' => 'completed'];
                if (($next[$current->status] ?? null) !== $action) {
                    throw ValidationException::withMessages(['action' => 'Urutan status tidak valid. Muat ulang antrean.']);
                }
                if ($action === 'completed' && ! $current->paid_at) {
                    throw ValidationException::withMessages(['action' => 'Konfirmasikan pembayaran sebelum menyelesaikan pesanan.']);
                }
                $current->update(['status' => $action, 'completed_at' => $action === 'completed' ? now() : null]);
                $description = 'Status pesanan: '.['processing' => 'diproses', 'ready' => 'siap', 'completed' => 'selesai'][$action].'.';
            }
            $current->events()->create(['user_id' => $r->user()->id, 'description' => $description]);
        }, 3);

        return back()->with('success', 'Pesanan berhasil diperbarui.');
    }
}
