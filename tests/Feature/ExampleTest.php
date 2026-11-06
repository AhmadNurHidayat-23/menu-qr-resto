<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_menu_loads(): void
    {
        $this->withoutVite()->get('/')->assertOk();
    }
}
