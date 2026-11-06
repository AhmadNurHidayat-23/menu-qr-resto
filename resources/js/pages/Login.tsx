import { useForm } from "@inertiajs/react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Layout from "../components/Layout";
export default function Login() {
    const form = useForm({ email: "", password: "" });
    return (
        <Layout title="Masuk petugas">
            <section className="login-layout">
                <div>
                    <span className="eyebrow">DI BALIK SETIAP HIDANGAN</span>
                    <h1>
                        Dapur yang rapi.
                        <br />
                        <em>Pelayanan sepenuh hati.</em>
                    </h1>
                    <p>
                        Ruang kerja untuk tim restoran. Kelola pesanan, menu,
                        dan meja dari satu tempat.
                    </p>
                    <img src="/images/restaurant.jpg" alt="Interior restoran" />
                </div>
                <form
                    className="login-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post("/petugas/masuk", {
                            onFinish: () => form.reset("password"),
                        });
                    }}
                >
                    <LockKeyhole size={27} />
                    <h2>Selamat datang kembali.</h2>
                    <p>Masuk menggunakan akun petugas restoran.</p>
                    <label>
                        Email
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData("email", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Kata sandi
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData("password", e.target.value)
                            }
                        />
                    </label>
                    <button
                        className="btn primary full"
                        disabled={form.processing}
                    >
                        {form.processing ? "Memeriksa akun…" : "Masuk ke dapur"}
                        <ArrowRight size={17} />
                    </button>
                    <p className="fineprint">
                        Akses khusus petugas. Hubungi pengelola restoran untuk
                        pembuatan akun.
                    </p>
                </form>
            </section>
        </Layout>
    );
}
