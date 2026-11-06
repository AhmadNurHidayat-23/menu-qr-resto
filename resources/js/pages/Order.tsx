import { Link, usePoll } from "@inertiajs/react";
import { Check, CheckCircle2, Clock, ReceiptText } from "lucide-react";
import Layout from "../components/Layout";
import {
    type Order as OrderType,
    type Status,
    labels,
    money,
    date,
} from "../types";
export default function Order({ order }: { order: OrderType }) {
    usePoll(5000, { only: ["order"] });
    const steps: Status[] = ["accepted", "processing", "ready", "completed"];
    const current = steps.indexOf(order.status);
    return (
        <Layout title={"Pesanan " + order.number}>
            <section className="tracking">
                <div className="tracking-intro">
                    <CheckCircle2 size={38} />
                    <span className="eyebrow">PESANAN TERKIRIM</span>
                    <h1>
                        {order.status === "completed"
                            ? "Terima kasih sudah mampir."
                            : "Kami siapkan dengan hati."}
                    </h1>
                    <p>
                        {order.customer_name}, pesanan Anda untuk{" "}
                        {order.table_name} sudah diterima. Halaman ini
                        diperbarui otomatis setiap 5 detik.
                    </p>
                </div>
                <div className="steps">
                    {steps.map((s, i) => (
                        <div
                            key={s}
                            className={i <= current ? "step done" : "step"}
                        >
                            <span>
                                {i < current ? <Check size={16} /> : i + 1}
                            </span>
                            <strong>{labels[s]}</strong>
                        </div>
                    ))}
                </div>
                <div className="receipt">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">{order.table_name}</span>
                            <h2>
                                <ReceiptText size={22} /> {order.number}
                            </h2>
                        </div>
                        <span
                            className={
                                "badge " +
                                (order.paid_at ? "completed" : "accepted")
                            }
                        >
                            {order.paid_at
                                ? "Pembayaran lunas"
                                : "Bayar ke petugas"}
                        </span>
                    </div>
                    <p className="fineprint">{date(order.created_at)}</p>
                    {order.items.map((i) => (
                        <div className="receipt-row" key={i.id}>
                            <span>
                                {i.quantity} × {i.name}
                            </span>
                            <strong>{money(i.price * i.quantity)}</strong>
                        </div>
                    ))}
                    <div className="cart-total">
                        <strong>Total pesanan</strong>
                        <strong>{money(order.total)}</strong>
                    </div>
                    {order.notes && (
                        <p className="notes">Catatan: {order.notes}</p>
                    )}
                    <p className="fineprint">
                        Pembayaran manual dicatat oleh petugas setelah
                        pembayaran diterima. Simpan tautan ini untuk memantau
                        pesanan Anda.
                    </p>
                </div>
                <div className="timeline">
                    <h3>
                        <Clock size={17} /> Aktivitas pesanan
                    </h3>
                    {order.events?.map((e) => (
                        <div key={e.id}>
                            <p>{e.description}</p>
                            <small>{date(e.created_at)}</small>
                        </div>
                    ))}
                </div>
                <Link className="btn secondary" href="/">
                    Kembali ke katalog
                </Link>
            </section>
        </Layout>
    );
}
