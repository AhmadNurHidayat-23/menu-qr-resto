import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import Layout from "../components/Layout";
import { type Order, type Status, labels, money, date } from "../types";
interface Filters {
    from: string;
    to: string;
    status?: string;
    search?: string;
}
export default function Reports({
    orders,
    summary,
    filters,
}: {
    orders: {
        data: Order[];
        prev_page_url: string | null;
        next_page_url: string | null;
        current_page: number;
        last_page: number;
    };
    summary: { count: number; paid: number; completed: number; unpaid: number };
    filters: Filters;
}) {
    const [f, setF] = useState({
        ...filters,
        status: filters.status || "",
        search: filters.search || "",
    });
    const query = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    return (
        <Layout title="Riwayat & penjualan" admin>
            <section className="admin-page">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">RUANG KERJA / LAPORAN</span>
                        <h1>Di balik hari yang ramai.</h1>
                        <p>
                            Riwayat pesanan dan pembayaran yang benar-benar
                            tercatat.
                        </p>
                    </div>
                    <a
                        className="btn secondary"
                        href={"/petugas/laporan?" + query + "&export=csv"}
                    >
                        <Download size={16} />
                        Ekspor CSV
                    </a>
                </div>
                <div className="stats-row">
                    {[
                        ["Pesanan", summary.count],
                        ["Pembayaran diterima", money(summary.paid)],
                        ["Penjualan selesai", money(summary.completed)],
                        ["Belum dibayar", money(summary.unpaid)],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                        </div>
                    ))}
                </div>
                <form
                    className="report-filters"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get("/petugas/laporan", f, {
                            preserveState: true,
                        });
                    }}
                >
                    <label>
                        Dari tanggal
                        <input
                            type="date"
                            required
                            value={f.from}
                            onChange={(e) =>
                                setF({ ...f, from: e.target.value })
                            }
                        />
                    </label>
                    <label>
                        Sampai tanggal
                        <input
                            type="date"
                            required
                            min={f.from}
                            value={f.to}
                            onChange={(e) => setF({ ...f, to: e.target.value })}
                        />
                    </label>
                    <label>
                        Status
                        <select
                            value={f.status}
                            onChange={(e) =>
                                setF({ ...f, status: e.target.value })
                            }
                        >
                            <option value="">Semua status</option>
                            {Object.entries(labels).map(([v, l]) => (
                                <option key={v} value={v}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Cari pesanan
                        <input
                            placeholder="Nomor / nama"
                            value={f.search}
                            maxLength={80}
                            onChange={(e) =>
                                setF({ ...f, search: e.target.value })
                            }
                        />
                    </label>
                    <button className="btn primary">
                        <Search size={16} />
                        Terapkan
                    </button>
                </form>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Pesanan / waktu</th>
                                <th>Pelanggan</th>
                                <th>Rincian</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Pembayaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((o) => (
                                <tr key={o.id}>
                                    <td>
                                        <strong>{o.number}</strong>
                                        <small>{date(o.created_at)}</small>
                                    </td>
                                    <td>
                                        {o.customer_name}
                                        <small>{o.table_name}</small>
                                    </td>
                                    <td>
                                        {o.items.map((i) => (
                                            <small key={i.id}>
                                                {i.quantity} × {i.name}
                                            </small>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={"badge " + o.status}>
                                            {labels[o.status as Status]}
                                        </span>
                                    </td>
                                    <td>{money(o.total)}</td>
                                    <td>
                                        {o.paid_at ? "Lunas" : "Belum lunas"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!orders.data.length && (
                        <div className="empty">
                            <h3>Belum ada pesanan pada periode ini.</h3>
                            <p>Coba rentang tanggal atau filter lain.</p>
                        </div>
                    )}
                </div>
                <div className="pagination">
                    <span>
                        Halaman {orders.current_page} dari {orders.last_page}
                    </span>
                    <div>
                        {orders.prev_page_url && (
                            <Link
                                className="btn secondary small"
                                href={orders.prev_page_url}
                            >
                                Sebelumnya
                            </Link>
                        )}
                        {orders.next_page_url && (
                            <Link
                                className="btn secondary small"
                                href={orders.next_page_url}
                            >
                                Berikutnya
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
