<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['number', 'tracking_token', 'checkout_key', 'dining_table_id', 'table_name', 'customer_name', 'notes', 'total', 'status', 'paid_at', 'completed_at'];

    protected $hidden = ['checkout_key'];

    protected function casts(): array
    {
        return ['paid_at' => 'datetime', 'completed_at' => 'datetime', 'total' => 'integer'];
    }

    public function diningTable()
    {
        return $this->belongsTo(DiningTable::class);
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function events()
    {
        return $this->hasMany(OrderEvent::class);
    }
}
