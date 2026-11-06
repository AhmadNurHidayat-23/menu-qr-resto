import { router, usePoll } from "@inertiajs/react";
import { useState } from "react";
import { ChefHat, Check, Clock, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import { type Order, type Status, labels, money, date } from "../types";
export default function Kitchen({ orders }: { orders: Order[] }) {
    usePoll(5000, { only: ["orders"] });
    const [busy, setBusy] = useState<number | null>(null);
    const [confirm, setConfirm] = useState<number | null>(null);
    function update(id: number, action: string) {
        setBusy(id);
        router.patch(
            "/petugas/pesanan/" + id,
            { action },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBusy(null);
                    setConfirm(null);
                },
            },
        );
    }
    const columns: Status[] = ["accepted", "processing", "ready"];
    const next = {
        accepted: "processing",
        processing: "ready",
        ready: "completed",
    };
    return (
        <Layout title="Antrean dapur" admin>
            <section className="admin-page">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">RUANG KERJA / DAPUR</span>
                        <h1>Setiap pesanan, diperhatikan.</h1>
                        <p>
                            Antrean aktif · {orders.length} pesanan · Diperbarui
                            otomatis setiap 5 detik.
                        </p>
                    </div>
                    <button
                        className="btn secondary"
                        onClick={() => router.reload({ only: ["orders"] })}
                    >
                        <RefreshCw size={16} /> Muat ulang
                    </button>
                </div>
                <div className="kitchen-grid">
                    {columns.map((s) => (
                        <section className="kitchen-column" key={s}>
                            <div className="column-heading">
                                <span className={"dot " + s} />
                                <h2>{labels[s]}</h2>
                                <span className="count">
                                    {
                                        orders.filter((o) => o.status === s)
                                            .length
                                    }
                                </span>
                            </div>
                            {orders
                                .filter((o) => o.status === s)
                                .map((o) => (
                                    <article
                                        className="order-ticket"
                                        key={o.id}
                                    >
                                        <div className="ticket-top">
                                            <strong>{o.table_name}</strong>
                                            <span>{o.number}</span>
                                        </div>
                                        <h3>{o.customer_name}</h3>
                                        <p className="fineprint">
                                            <Clock size={13} />
                                            {date(o.created_at)}
                                        </p>
                                        <ul>
                                            {o.items.map((i) => (
                                                <li key={i.id}>
                                                    <strong>
                                                        {i.quantity}×
                                                    </strong>{" "}
                                                    {i.name}
                                                </li>
                                            ))}
                                        </ul>
                                        {o.notes && (
                                            <p className="notes">{o.notes}</p>
                                        )}
                                        <div className="ticket-total">
                                            <strong>{money(o.total)}</strong>
                                            <span
                                                className={
                                                    "badge " +
                                                    (o.paid_at
                                                        ? "completed"
                                                        : "accepted")
                                                }
                                            >
                                                {o.paid_at
                                                    ? "Lunas"
                                                    : "Belum dibayar"}
                                            </span>
                                        </div>
                                        {!o.paid_at &&
                                            (confirm === o.id ? (
                                                <div className="payment-confirm">
                                                    <p>
                                                        Pastikan{" "}
                                                        {money(o.total)} sudah
                                                        diterima untuk{" "}
                                                        {o.number}.
                                                    </p>
                                                    <button
                                                        className="btn primary full"
                                                        disabled={busy === o.id}
                                                        onClick={() =>
                                                            update(o.id, "paid")
                                                        }
                                                    >
                                                        Ya, pembayaran diterima
                                                    </button>
                                                    <button
                                                        className="text-btn"
                                                        onClick={() =>
                                                            setConfirm(null)
                                                        }
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn secondary full"
                                                    onClick={() =>
                                                        setConfirm(o.id)
                                                    }
                                                >
                                                    Konfirmasi pembayaran
                                                </button>
                                            ))}
                                        <button
                                            className="btn primary full"
                                            disabled={
                                                busy === o.id ||
                                                (s === "ready" && !o.paid_at)
                                            }
                                            onClick={() =>
                                                update(
                                                    o.id,
                                                    next[
                                                        s as keyof typeof next
                                                    ],
                                                )
                                            }
                                        >
                                            {busy === o.id
                                                ? "Menyimpan…"
                                                : s === "accepted"
                                                  ? "Mulai proses"
                                                  : s === "processing"
                                                    ? "Tandai siap"
                                                    : "Selesaikan pesanan"}
                                            <Check size={15} />
                                        </button>
                                    </article>
                                ))}
                            {!orders.some((o) => o.status === s) && (
                                <div className="column-empty">
                                    <ChefHat size={25} />
                                    <p>
                                        Belum ada pesanan{" "}
                                        {s === "accepted"
                                            ? "baru"
                                            : s === "processing"
                                              ? "yang diproses"
                                              : "siap disajikan"}
                                        .
                                    </p>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
