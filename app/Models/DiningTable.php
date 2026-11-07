<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiningTable extends Model
{
    protected $fillable = ['name', 'token', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
