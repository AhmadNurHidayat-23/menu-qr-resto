<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = ['menu_id', 'name', 'price', 'quantity'];

    public $timestamps = false;
}
