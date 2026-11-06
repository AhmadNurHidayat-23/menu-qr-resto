export interface MenuItem {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    active: boolean;
}
export interface Table {
    id: number;
    name: string;
    token: string;
    active: boolean;
}
export type Status = "accepted" | "processing" | "ready" | "completed";
export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}
export interface Order {
    id: number;
    number: string;
    tracking_token: string;
    table_name: string;
    customer_name: string;
    notes: string | null;
    total: number;
    status: Status;
    paid_at: string | null;
    created_at: string;
    items: OrderItem[];
    events?: { id: number; description: string; created_at: string }[];
}
export const money = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);
export const date = (s: string) =>
    new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(s));
export const labels: Record<Status, string> = {
    accepted: "Diterima",
    processing: "Diproses",
    ready: "Siap disajikan",
    completed: "Selesai",
};
