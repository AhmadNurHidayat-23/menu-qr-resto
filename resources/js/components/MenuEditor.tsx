import { useDialog } from "./useDialog";
import { useForm } from "@inertiajs/react";
import { X } from "lucide-react";
import type { MenuItem } from "../types";
export default function MenuEditor({
    menu,
    onClose,
}: {
    menu: MenuItem | null;
    onClose: () => void;
}) {
    const dialog = useDialog(onClose);
    const form = useForm({
        name: menu?.name || "",
        category: menu?.category || "Menu utama",
        description: menu?.description || "",
        price: menu?.price || 30000,
        stock: menu?.stock || 0,
        active: menu?.active ?? true,
        photo: null as File | null,
    });
    return (
        <div className="modal-backdrop">
            <section
                ref={dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editor-title"
                className="modal"
            >
                <div className="section-heading">
                    <h2 id="editor-title">
                        {menu ? "Edit menu" : "Tambah menu"}
                    </h2>
                    <button
                        className="icon-btn"
                        aria-label="Tutup editor"
                        onClick={onClose}
                    >
                        <X />
                    </button>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(
                            "/petugas/menu" + (menu ? "/" + menu.id : ""),
                            {
                                forceFormData: true,
                                preserveScroll: true,
                                onSuccess: onClose,
                            },
                        );
                    }}
                >
                    <label>
                        Nama menu
                        <input
                            autoFocus
                            required
                            maxLength={100}
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Kategori
                        <select
                            value={form.data.category}
                            onChange={(e) =>
                                form.setData("category", e.target.value)
                            }
                        >
                            {["Menu utama", "Camilan", "Minuman"].map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Deskripsi
                        <textarea
                            required
                            maxLength={350}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                        />
                    </label>
                    <div className="form-grid">
                        <label>
                            Harga (Rp)
                            <input
                                type="number"
                                required
                                min={1000}
                                max={10000000}
                                value={form.data.price}
                                onChange={(e) =>
                                    form.setData(
                                        "price",
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </label>
                        <label>
                            Stok porsi
                            <input
                                type="number"
                                required
                                min={0}
                                max={100000}
                                value={form.data.stock}
                                onChange={(e) =>
                                    form.setData(
                                        "stock",
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </label>
                    </div>
                    <label>
                        Foto menu
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                                form.setData(
                                    "photo",
                                    e.target.files?.[0] || null,
                                )
                            }
                        />
                        <small>JPG, PNG, atau WebP · Maksimal 3 MB.</small>
                    </label>
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={form.data.active}
                            onChange={(e) =>
                                form.setData("active", e.target.checked)
                            }
                        />
                        Tampilkan menu di katalog
                    </label>
                    {Object.values(form.errors).map((e, i) => (
                        <p className="field-error" role="alert" key={i}>
                            {e}
                        </p>
                    ))}
                    <button
                        className="btn primary full"
                        disabled={form.processing}
                    >
                        {form.processing ? "Menyimpan…" : "Simpan menu"}
                    </button>
                </form>
            </section>
        </div>
    );
}
