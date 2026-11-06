import { useForm } from "@inertiajs/react";
import { ShoppingBag, Minus, Plus, ArrowRight } from "lucide-react";
import { money, type MenuItem, type Table } from "../types";
export default function Cart({
    menus,
    cart,
    setQuantity,
    table,
    checkoutKey,
}: {
    menus: MenuItem[];
    cart: Record<number, number>;
    setQuantity: (id: number, n: number) => void;
    table: Table | null;
    checkoutKey: string;
}) {
    const form = useForm({
        customer_name: "",
        notes: "",
        checkout_key: checkoutKey,
        items: [] as { menu_id: number; quantity: number }[],
    });
    const items = menus.filter((m) => cart[m.id] > 0);
    const total = items.reduce((s, m) => s + m.price * cart[m.id], 0);
    return (
        <aside className="cart" id="keranjang">
            <div className="cart-title">
                <ShoppingBag size={20} />
                <h2>Pesanan Anda</h2>
                <span className="count">
                    {items.reduce((s, m) => s + cart[m.id], 0)}
                </span>
            </div>
            <div className="cart-table">
                {table ? table.name : "Belum terhubung ke meja"}
            </div>
            {!items.length ? (
                <div className="cart-empty">
                    <ShoppingBag size={34} strokeWidth={1} />
                    <h3>Mulai dari yang Anda suka.</h3>
                    <p>Pilih menu, lalu tambahkan ke pesanan Anda.</p>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!table) return;
                        form.transform((data) => ({
                            ...data,
                            checkout_key: checkoutKey,
                            items: items.map((m) => ({
                                menu_id: m.id,
                                quantity: cart[m.id],
                            })),
                        }));
                        form.post("/meja/" + table.token + "/pesan", {
                            preserveScroll: true,
                            onSuccess: () =>
                                items.forEach((m) => setQuantity(m.id, 0)),
                        });
                    }}
                >
                    <div className="cart-items">
                        {items.map((m) => (
                            <div className="cart-item" key={m.id}>
                                <div>
                                    <strong>{m.name}</strong>
                                    <small>{money(m.price)}</small>
                                </div>
                                <div className="quantity">
                                    <button
                                        type="button"
                                        aria-label={"Kurangi " + m.name}
                                        onClick={() =>
                                            setQuantity(m.id, cart[m.id] - 1)
                                        }
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span>{cart[m.id]}</span>
                                    <button
                                        type="button"
                                        aria-label={"Tambah " + m.name}
                                        disabled={cart[m.id] >= m.stock}
                                        onClick={() =>
                                            setQuantity(m.id, cart[m.id] + 1)
                                        }
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <label>
                        Nama pemesan
                        <input
                            required
                            maxLength={80}
                            autoComplete="given-name"
                            placeholder="Nama panggilan Anda"
                            value={form.data.customer_name}
                            onChange={(e) =>
                                form.setData("customer_name", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Catatan untuk dapur{" "}
                        <span className="optional">(opsional)</span>
                        <textarea
                            maxLength={500}
                            rows={2}
                            placeholder="Contoh: tidak pedas"
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData("notes", e.target.value)
                            }
                        />
                    </label>
                    <div className="cart-total">
                        <span>Total pesanan</span>
                        <strong>{money(total)}</strong>
                    </div>
                    <p className="fineprint">
                        Harga final, tanpa biaya tambahan. Bayar langsung kepada
                        petugas restoran.
                    </p>
                    <button
                        className="btn primary full"
                        disabled={!table || form.processing}
                    >
                        {form.processing
                            ? "Mengirim pesanan…"
                            : "Kirim ke dapur"}
                        <ArrowRight size={17} />
                    </button>
                </form>
            )}
            {!table && (
                <p className="scan-note">
                    Untuk memesan, pindai QR yang tersedia di meja Anda atau
                    minta bantuan petugas.
                </p>
            )}
        </aside>
    );
}
