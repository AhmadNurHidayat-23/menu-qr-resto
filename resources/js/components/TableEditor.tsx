import { useDialog } from "./useDialog";
import { useForm } from "@inertiajs/react";
import { X } from "lucide-react";
import type { Table } from "../types";
export default function TableEditor({
    table,
    onClose,
}: {
    table: Table | null;
    onClose: () => void;
}) {
    const dialog = useDialog(onClose);
    const form = useForm({
        name: table?.name || "",
        active: table?.active ?? true,
    });
    return (
        <div className="modal-backdrop">
            <section
                ref={dialog}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="table-title"
            >
                <div className="section-heading">
                    <h2 id="table-title">
                        {table ? "Edit meja" : "Tambah meja"}
                    </h2>
                    <button
                        className="icon-btn"
                        aria-label="Tutup editor meja"
                        onClick={onClose}
                    >
                        <X />
                    </button>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(
                            "/petugas/meja" + (table ? "/" + table.id : ""),
                            { preserveScroll: true, onSuccess: onClose },
                        );
                    }}
                >
                    <label>
                        Nama meja
                        <input
                            autoFocus
                            required
                            maxLength={40}
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                        />
                    </label>
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={form.data.active}
                            onChange={(e) =>
                                form.setData("active", e.target.checked)
                            }
                        />
                        Aktif menerima pesanan
                    </label>
                    {Object.values(form.errors).map((e, i) => (
                        <p className="field-error" key={i}>
                            {e}
                        </p>
                    ))}
                    <button
                        className="btn primary full"
                        disabled={form.processing}
                    >
                        {form.processing ? "Menyimpan…" : "Simpan meja"}
                    </button>
                </form>
            </section>
        </div>
    );
}
