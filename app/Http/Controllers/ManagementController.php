<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Menu;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Manage', ['menus' => Menu::orderBy('id')->get(), 'tables' => DiningTable::orderBy('id')->get()]);
    }

    public function saveMenu(Request $r, ?Menu $menu = null)
    {
        $data = $r->validate(['name' => 'required|string|max:100', 'category' => 'required|in:Menu utama,Camilan,Minuman',
            'description' => 'required|string|max:350', 'price' => 'required|integer|min:1000|max:10000000',
            'stock' => 'required|integer|min:0|max:100000', 'active' => 'required|boolean', 'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072']);
        if ($r->hasFile('photo')) {
            $data['image'] = '/storage/'.$r->file('photo')->store('menus', 'public');
        }
        unset($data['photo']);
        if (! $menu && ! isset($data['image'])) {
            $data['image'] = '/images/restaurant.jpg';
        }
        if ($menu) {
            $menu->update($data);
        } else {
            Menu::create($data);
        }

        return back()->with('success', 'Menu berhasil disimpan.');
    }

    public function saveTable(Request $r, ?DiningTable $table = null)
    {
        $data = $r->validate(['name' => 'required|string|max:40|unique:dining_tables,name,'.($table?->id ?? 'NULL'), 'active' => 'required|boolean']);
        if ($table) {
            $table->update($data);
        } else {
            DiningTable::create([...$data, 'token' => (string) Str::uuid()]);
        }

        return back()->with('success', 'Meja berhasil disimpan.');
    }

    public function qr(DiningTable $table)
    {
        $writer = new Writer(new ImageRenderer(new RendererStyle(360, 4), new SvgImageBackEnd));

        return response($writer->writeString(rtrim(config('app.url'), '/').route('table.menu', $table->token, false)))->header('Content-Type', 'image/svg+xml')->header('Content-Disposition', 'inline; filename="meja-'.$table->id.'.svg"');
    }
}
