import { useState, useEffect } from "react";
import {
    ArrowDown,
    ArrowUpRight,
    MapPin,
    Plus,
    Search,
    ShoppingBag,
} from "lucide-react";
import Layout from "../components/Layout";
import Cart from "../components/Cart";
import { money, type MenuItem, type Table } from "../types";
export default function Menu({
    menus,
    table,
    checkoutKey,
}: {
    menus: MenuItem[];
    table: Table | null;
    checkoutKey: string;
}) {
    const [category, setCategory] = useState("Semua menu");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<Record<number, number>>({});
    const storageKey = "ruang-rasa:cart:" + (table?.token || "browse");
    useEffect(() => {
        try {
            const data = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
            const valid: Record<number, number> = {};
            for (const m of menus) {
                const n = Number(data[m.id]);
                if (Number.isInteger(n) && n > 0)
                    valid[m.id] = Math.min(n, m.stock);
            }
            setCart(valid);
        } catch {
            setCart({});
        }
    }, [storageKey]);
    function setQuantity(id: number, n: number) {
        setCart((c) => {
            const next = {
                ...c,
                [id]: Math.max(
                    0,
                    Math.min(n, menus.find((m) => m.id === id)?.stock || 0),
                ),
            };
            sessionStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    }
    const filtered = menus.filter(
        (m) =>
            (category === "Semua menu" || m.category === category) &&
            (m.name + " " + m.description)
                .toLowerCase()
                .includes(search.toLowerCase()),
    );
    return (
        <Layout title="Menu & pemesanan">
            <section className="hero">
                <div className="hero-copy">
                    <div className="eyebrow">
                        <span /> DARI DAPUR KAMI, UNTUK MEJA ANDA
                    </div>
                    <h1>
                        Rasa rumahan.
                        <br />
                        Cerita <em>baru.</em>
                    </h1>
                    <p>
                        Hidangan favorit, bahan pilihan, dan waktu yang baik
                        untuk duduk lebih lama.
                    </p>
                    <a className="btn primary" href="#menu">
                        Temukan favorit Anda <ArrowDown size={17} />
                    </a>
                    <div className="hero-meta">
                        <span>
                            <MapPin size={15} /> Nikmati langsung di restoran
                        </span>
                        <span>Diracik dengan sepenuh hati</span>
                    </div>
                </div>
                <div className="hero-image">
                    <img
                        src="/images/restaurant.jpg"
                        alt="Ruang makan restoran yang hangat dan nyaman"
                    />
                    <div className="image-caption">
                        <span>RUANG UNTUK BERSANTAI</span>
                        <ArrowUpRight size={21} />
                    </div>
                </div>
            </section>
            <section className="menu-section" id="menu">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">PILIH, PESAN, NIKMATI</span>
                        <h2>Yang enak, ada di sini.</h2>
                    </div>
                    <span className="table-indicator">
                        <span className={table ? "dot" : "dot muted"} />
                        {table ? table.name : "Katalog restoran"}
                    </span>
                </div>
                <div className="ordering-layout">
                    <div>
                        <div className="menu-toolbar">
                            <div
                                className="tabs"
                                role="group"
                                aria-label="Kategori menu"
                            >
                                {[
                                    "Semua menu",
                                    "Menu utama",
                                    "Camilan",
                                    "Minuman",
                                ].map((c) => (
                                    <button
                                        key={c}
                                        aria-pressed={category === c}
                                        className={
                                            category === c ? "active" : ""
                                        }
                                        onClick={() => setCategory(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <label className="search">
                                <Search size={17} />
                                <input
                                    aria-label="Cari menu"
                                    placeholder="Cari menu…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="menu-grid">
                            {filtered.map((m, i) => (
                                <article className="menu-card" key={m.id}>
                                    <div className="food-image">
                                        <img
                                            src={m.image}
                                            alt={m.name}
                                            loading="lazy"
                                        />
                                        <span className="food-category">
                                            {m.category}
                                        </span>
                                        {m.stock === 0 && (
                                            <span className="sold-out">
                                                Habis hari ini
                                            </span>
                                        )}
                                    </div>
                                    <div className="food-body">
                                        <span className="menu-index">
                                            {String(i + 1).padStart(2, "0")} /
                                            DARI DAPUR
                                        </span>
                                        <h3>{m.name}</h3>
                                        <p>{m.description}</p>
                                        <div className="food-bottom">
                                            <div>
                                                <strong>
                                                    {money(m.price)}
                                                </strong>
                                                <small>
                                                    {m.stock > 0
                                                        ? m.stock +
                                                          " porsi tersedia"
                                                        : "Kembali segera"}
                                                </small>
                                            </div>
                                            <button
                                                className="add-btn"
                                                aria-label={
                                                    "Tambahkan " + m.name
                                                }
                                                disabled={
                                                    m.stock === 0 ||
                                                    (cart[m.id] || 0) >= m.stock
                                                }
                                                onClick={() =>
                                                    setQuantity(
                                                        m.id,
                                                        (cart[m.id] || 0) + 1,
                                                    )
                                                }
                                            >
                                                <Plus size={19} />
                                                {cart[m.id] > 0 && (
                                                    <span>{cart[m.id]}</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        {!filtered.length && (
                            <div className="empty">
                                <Search />
                                <h3>Belum menemukan yang dicari?</h3>
                                <p>Coba kata kunci atau kategori lain.</p>
                                <button
                                    className="btn secondary"
                                    onClick={() => {
                                        setCategory("Semua menu");
                                        setSearch("");
                                    }}
                                >
                                    Tampilkan semua menu
                                </button>
                            </div>
                        )}
                    </div>
                    <Cart
                        menus={menus}
                        cart={cart}
                        setQuantity={setQuantity}
                        table={table}
                        checkoutKey={checkoutKey}
                    />
                </div>
            </section>
            {Object.values(cart).some((n) => n > 0) && (
                <a className="mobile-cart btn primary" href="#keranjang">
                    <ShoppingBag size={18} />
                    Lihat pesanan ·{" "}
                    {money(
                        menus.reduce(
                            (s, m) => s + m.price * (cart[m.id] || 0),
                            0,
                        ),
                    )}
                </a>
            )}
        </Layout>
    );
}
