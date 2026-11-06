import { Link } from "@inertiajs/react";
import Layout from "../components/Layout";
export default function Error({ status }: { status: number }) {
    const messages: Record<number, [string, string]> = {
        403: [
            "Akses terbatas.",
            "Halaman ini hanya dapat diakses oleh pengguna yang berwenang.",
        ],
        404: [
            "Halaman tidak ditemukan.",
            "Tautan meja mungkin sudah nonaktif. Minta QR terbaru kepada petugas.",
        ],
        419: [
            "Sesi Anda sudah berakhir.",
            "Buka ulang menu meja dan periksa pesanan sebelum mengirim kembali.",
        ],
        429: ["Terlalu banyak permintaan.", "Tunggu sebentar, lalu coba lagi."],
        500: [
            "Ada kendala di dapur digital.",
            "Kami belum dapat memproses permintaan. Silakan coba lagi sebentar.",
        ],
        503: ["Kami segera kembali.", "Aplikasi sedang dalam pemeliharaan."],
    };
    const [title, description] = messages[status] || messages[500];
    return (
        <Layout title={String(status)}>
            <section className="empty">
                <span className="eyebrow">{status}</span>
                <h1>{title}</h1>
                <p>{description}</p>
                <Link className="btn primary" href="/">
                    Kembali ke katalog
                </Link>
            </section>
        </Layout>
    );
}
