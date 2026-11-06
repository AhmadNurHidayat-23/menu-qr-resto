import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowUpRight, ChefHat, LogOut, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
export default function Layout({
    title,
    children,
    admin = false,
}: {
    title: string;
    children: ReactNode;
    admin?: boolean;
}) {
    const { props, url } = usePage();
    const errors = props.errors as Record<string, string>;
    const flash = props.flash as { success?: string };
    return (
        <>
            <Head title={title} />
            <header className="site-header">
                <Link href="/" className="brand">
                    <span className="brand-mark">
                        <UtensilsCrossed size={22} />
                    </span>
                    <span>
                        ruang rasa
                        <span className="brand-sub">DAPUR & CERITA</span>
                    </span>
                </Link>
                <nav aria-label="Navigasi utama">
                    {admin ? (
                        <>
                            <Link
                                className={
                                    url.includes("dapur") ? "selected" : ""
                                }
                                href="/petugas/dapur"
                            >
                                Dapur
                            </Link>
                            <Link
                                className={
                                    url.includes("kelola") ? "selected" : ""
                                }
                                href="/petugas/kelola"
                            >
                                Menu & meja
                            </Link>
                            <Link
                                className={
                                    url.includes("laporan") ? "selected" : ""
                                }
                                href="/petugas/laporan"
                            >
                                Laporan
                            </Link>
                            <button
                                className="icon-btn"
                                aria-label="Keluar"
                                onClick={() => router.post("/petugas/keluar")}
                            >
                                <LogOut size={19} />
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="/#menu">Jelajahi menu</a>
                            <Link className="staff-link" href="/petugas/masuk">
                                <ChefHat size={16} /> Area petugas{" "}
                                <ArrowUpRight size={15} />
                            </Link>
                        </>
                    )}
                </nav>
            </header>
            {flash?.success && (
                <div className="notice success" role="status">
                    {flash.success}
                </div>
            )}
            {Object.keys(errors || {}).length > 0 && (
                <div className="notice error" role="alert">
                    {Object.values(errors).map((e, i) => (
                        <p key={i}>{e}</p>
                    ))}
                </div>
            )}
            <main>{children}</main>
            <footer>
                <span className="footer-brand">ruang rasa.</span>
                <p>Masakan yang dekat. Momen yang hangat.</p>
                <small>
                    Menu QR Resto · Pembayaran dikonfirmasi langsung oleh
                    petugas.
                </small>
            </footer>
        </>
    );
}
