<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dining_tables', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->uuid('token')->unique();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('menus', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('category');
            $t->text('description');
            $t->unsignedInteger('price');
            $t->unsignedInteger('stock');
            $t->string('image');
            $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->string('number')->unique();
            $t->uuid('tracking_token')->unique();
            $t->uuid('checkout_key')->unique();
            $t->foreignId('dining_table_id')->constrained()->restrictOnDelete();
            $t->string('table_name');
            $t->string('customer_name');
            $t->text('notes')->nullable();
            $t->unsignedInteger('total');
            $t->string('status')->default('accepted')->index();
            $t->timestamp('paid_at')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('order_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('menu_id')->constrained()->restrictOnDelete();
            $t->string('name');
            $t->unsignedInteger('price');
            $t->unsignedInteger('quantity');
        });
        Schema::create('order_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('description');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['order_events', 'order_items', 'orders', 'menus', 'dining_tables'] as $name) {
            Schema::dropIfExists($name);
        }
    }
};
