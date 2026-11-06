import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Plus, Pencil, Download, ExternalLink } from "lucide-react";
import Layout from "../components/Layout";
import MenuEditor from "../components/MenuEditor";
import TableEditor from "../components/TableEditor";
import { money, type MenuItem, type Table } from "../types";
export default function Manage({
    menus,
    tables,
}: {
    menus: MenuItem[];
    tables: Table[];
}) {
    const [editMenu, setEditMenu] = useState<MenuItem | null | undefined>();
    const [editTable, setEditTable] = useState<Table | null | undefined>();
    const [tab, setTab] = useState("menu");
    return (
        <Layout title="Menu & meja" admin>
            <section className="admin-page">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            RUANG KERJA / PENGELOLAAN
                        </span>
                        <h1>Dapur siap. Meja tertata.</h1>
                        <p>
                            Perbarui harga dan stok, atau unduh QR untuk setiap
                            meja.
                        </p>
                    </div>
                    <button
                        className="btn primary"
                        onClick={() =>
                            tab === "menu"
                                ? setEditMenu(null)
                                : setEditTable(null)
                        }
                    >
                        <Plus size={17} />
                        {tab === "menu" ? "Tambah menu" : "Tambah meja"}
                    </button>
                </div>
                <div className="tabs management-tabs">
                    <button
                        className={tab === "menu" ? "active" : ""}
                        onClick={() => setTab("menu")}
                    >
                        Menu restoran ({menus.length})
                    </button>
                    <button
                        className={tab === "meja" ? "active" : ""}
                        onClick={() => setTab("meja")}
                    >
                        Meja & QR ({tables.length})
                    </button>
                </div>
                {tab === "menu" ? (
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Menu</th>
                                    <th>Kategori</th>
                                    <th>Harga</th>
                                    <th>Stok</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menus.map((m) => (
                                    <tr key={m.id}>
                                        <td>
                                            <div className="menu-cell">
                                                <img src={m.image} alt="" />
                                                <strong>{m.name}</strong>
                                            </div>
                                        </td>
                                        <td>{m.category}</td>
                                        <td>{money(m.price)}</td>
                                        <td>{m.stock} porsi</td>
                                        <td>
                                            <span
                                                className={
                                                    "badge " +
                                                    (m.active
                                                        ? "completed"
                                                        : "accepted")
                                                }
                                            >
                                                {m.active
                                                    ? "Aktif"
                                                    : "Diarsipkan"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn secondary small"
                                                onClick={() => setEditMenu(m)}
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!menus.length && (
                            <div className="empty">
                                Belum ada menu. Tambahkan hidangan pertama.
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="notice">
                            QR memakai alamat APP_URL restoran. Gunakan alamat
                            yang dapat dijangkau ponsel sebelum mencetak QR.
                        </p>
                        <div className="table-grid">
                            {tables.map((t) => (
                                <article className="table-card" key={t.id}>
                                    <div className="section-heading">
                                        <h2>{t.name}</h2>
                                        <button
                                            className="icon-btn"
                                            aria-label={"Edit " + t.name}
                                            onClick={() => setEditTable(t)}
                                        >
                                            <Pencil size={17} />
                                        </button>
                                    </div>
                                    <img
                                        className="qr-image"
                                        src={"/petugas/meja/" + t.id + "/qr"}
                                        alt={"QR pemesanan " + t.name}
                                    />
                                    <span
                                        className={
                                            "badge " +
                                            (t.active
                                                ? "completed"
                                                : "accepted")
                                        }
                                    >
                                        {t.active ? "Aktif" : "Nonaktif"}
                                    </span>
                                    <div className="table-actions">
                                        <a
                                            className="btn secondary small"
                                            href={
                                                "/petugas/meja/" + t.id + "/qr"
                                            }
                                            download={
                                                "qr-meja-" + t.id + ".svg"
                                            }
                                        >
                                            <Download size={14} />
                                            Unduh QR
                                        </a>
                                        <Link
                                            className="btn secondary small"
                                            href={"/meja/" + t.token}
                                        >
                                            <ExternalLink size={14} />
                                            Buka menu
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                        {!tables.length && (
                            <div className="empty">
                                Belum ada meja. Buat meja untuk mendapatkan QR.
                            </div>
                        )}
                    </>
                )}
                {editMenu !== undefined && (
                    <MenuEditor
                        key={editMenu?.id || "new-menu"}
                        menu={editMenu}
                        onClose={() => setEditMenu(undefined)}
                    />
                )}
                {editTable !== undefined && (
                    <TableEditor
                        key={editTable?.id || "new-table"}
                        table={editTable}
                        onClose={() => setEditTable(undefined)}
                    />
                )}
            </section>
        </Layout>
    );
}
