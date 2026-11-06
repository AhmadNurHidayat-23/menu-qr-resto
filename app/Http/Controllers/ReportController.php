<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $r)
    {
        $filters = $r->validate(['from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'status' => 'nullable|in:accepted,processing,ready,completed', 'search' => 'nullable|string|max:80', 'export' => 'nullable|in:csv']);
        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->toDateString();
        $query = Order::with('items')->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to)
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where(fn ($q) => $q->where('number', 'like', '%'.$s.'%')->orWhere('customer_name', 'like', '%'.$s.'%')));
        if ($r->input('export') === 'csv') {
            return response()->streamDownload(function () use ($query) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['Nomor', 'Meja', 'Pelanggan', 'Status', 'Total IDR', 'Pembayaran', 'Waktu'], ',', '"', '');
                foreach ($query->orderBy('id')->cursor() as $o) {
                    fputcsv($out, [$o->number, $this->safe($o->table_name), $this->safe($o->customer_name), $o->status, $o->total, $o->paid_at ? 'Lunas' : 'Belum lunas', $o->created_at->toIso8601String()], ',', '"', '');
                }fclose($out);
            }, 'penjualan.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
        }
        $count = (clone $query)->count();
        $paid = (clone $query)->whereNotNull('paid_at')->sum('total');
        $completed = (clone $query)->where('status', 'completed')->whereNotNull('paid_at')->sum('total');
        $unpaid = (clone $query)->whereNull('paid_at')->sum('total');

        return Inertia::render('Reports', ['orders' => $query->latest()->paginate(20)->withQueryString(),
            'summary' => compact('count', 'paid', 'completed', 'unpaid'), 'filters' => [...$filters, 'from' => $from, 'to' => $to]]);
    }

    private function safe(string $value): string
    {
        return preg_match('/^[=+@\-\t\r\n]/', $value) ? "'".$value : $value;
    }
}
