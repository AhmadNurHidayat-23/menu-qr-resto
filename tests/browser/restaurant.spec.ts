import { test, expect, type Page } from "@playwright/test";
import jsQR from "jsqr";
async function login(page: Page) {
    await page.goto("/petugas/masuk");
    await page.getByLabel("Email", { exact: true }).fill("e2e@ruangrasa.test");
    await page
        .getByLabel("Kata sandi", { exact: true })
        .fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Masuk ke dapur" }).click();
    await expect(page).toHaveURL(/petugas\/dapur/);
}
async function noOverflow(page: Page) {
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
    ).toBe(true);
}
test("Pemesanan meja, dapur, QR, pengelolaan, dan laporan berfungsi", async ({
    page,
    browser,
}) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await login(page);
    await page.getByRole("link", { name: "Menu & meja", exact: true }).click();
    await page.getByRole("button", { name: /Meja & QR/ }).click();
    const table = page.locator(".table-card").first();
    await expect(table.locator("img")).toBeVisible();
    const pixels = await table
        .locator("img")
        .evaluate(async (img: HTMLImageElement) => {
            await img.decode();
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            return {
                width: canvas.width,
                height: canvas.height,
                data: Array.from(
                    ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                ),
            };
        });
    const decoded = jsQR(
        new Uint8ClampedArray(pixels.data),
        pixels.width,
        pixels.height,
    );
    expect(decoded).not.toBeNull();
    const tableUrl = await table
        .getByRole("link", { name: "Buka menu" })
        .getAttribute("href");
    expect(decoded!.data).toBe("http://127.0.0.1:8012" + tableUrl);
    await page.getByRole("link", { name: "Dapur", exact: true }).click();
    const customer = await browser.newContext({
        viewport: { width: 390, height: 844 },
    });
    const guest = await customer.newPage();
    guest.on("pageerror", (e) => errors.push(e.message));
    await guest.goto(tableUrl!);
    await expect(guest.locator(".table-indicator")).toHaveText("Meja 01");
    await noOverflow(guest);
    await guest
        .getByRole("button", {
            name: "Tambahkan Nasi Goreng Kampung",
            exact: true,
        })
        .click();
    await guest.getByLabel("Nama pemesan").fill("Pelanggan Browser");
    await guest.getByLabel(/Catatan untuk dapur/).fill("Tidak pedas");
    await guest.getByRole("button", { name: "Kirim ke dapur" }).click();
    await expect(guest).toHaveURL(/pesanan\//);
    await expect(
        guest.getByText("RR-", { exact: false }).first(),
    ).toBeVisible();
    await expect(
        guest.getByText("Total pesanan", { exact: true }),
    ).toBeVisible();
    await noOverflow(guest);
    const tracking = guest.url();
    await guest.screenshot({
        path: "test-results/tracking-mobile.png",
        fullPage: true,
    });
    const ticket = page
        .locator(".order-ticket")
        .filter({ hasText: "Pelanggan Browser" });
    await expect(ticket).toBeVisible();
    await expect(ticket).toContainText("Tidak pedas");
    await ticket.getByRole("button", { name: "Mulai proses" }).click();
    await expect(
        ticket.getByRole("button", { name: "Tandai siap" }),
    ).toBeVisible();
    await ticket.getByRole("button", { name: "Tandai siap" }).click();
    await expect(
        ticket.getByRole("button", { name: "Selesaikan pesanan" }),
    ).toBeDisabled();
    await ticket.getByRole("button", { name: "Konfirmasi pembayaran" }).click();
    await ticket
        .getByRole("button", { name: "Ya, pembayaran diterima" })
        .click();
    await expect(
        ticket.getByRole("button", { name: "Selesaikan pesanan" }),
    ).toBeEnabled();
    await ticket.getByRole("button", { name: "Selesaikan pesanan" }).click();
    await expect(ticket).toHaveCount(0);
    await guest.goto(tracking);
    await expect(
        guest.getByText("Pembayaran lunas", { exact: true }),
    ).toBeVisible();
    await expect(
        guest.getByRole("heading", { name: "Terima kasih sudah mampir." }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Laporan", exact: true }).click();
    await expect(page.locator("tbody")).toContainText("Pelanggan Browser");
    await expect(page.locator(".stats-row")).toContainText("32.000");
    const dl = page.waitForEvent("download");
    await page.getByRole("link", { name: "Ekspor CSV" }).click();
    expect((await dl).suggestedFilename()).toBe("penjualan.csv");
    await page.getByRole("link", { name: "Menu & meja", exact: true }).click();
    await page
        .getByRole("button", { name: "Tambah menu", exact: true })
        .click();
    await page
        .getByLabel("Nama menu", { exact: true })
        .fill("Sup Sayur Harian");
    await page
        .getByLabel("Deskripsi", { exact: true })
        .fill("Sayuran segar dengan kaldu rumahan.");
    await page.getByLabel("Stok porsi").fill("12");
    await page.getByRole("button", { name: "Simpan menu" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("tbody")).toContainText("Sup Sayur Harian");
    const row = page.locator("tr").filter({ hasText: "Sup Sayur Harian" });
    await row.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Harga (Rp)", { exact: true }).fill("28000");
    await page.getByLabel("Tampilkan menu di katalog").uncheck();
    await page.getByRole("button", { name: "Simpan menu" }).click();
    await expect(row).toContainText("Diarsipkan");
    await page.getByRole("button", { name: /Meja & QR/ }).click();
    await page
        .getByRole("button", { name: "Tambah meja", exact: true })
        .click();
    await page.getByLabel("Nama meja").fill("Teras Uji");
    await page.getByRole("button", { name: "Simpan meja" }).click();
    await expect(
        page.locator(".table-card").filter({ hasText: "Teras Uji" }),
    ).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow(page);
    await page.getByRole("link", { name: "Dapur", exact: true }).click();
    await noOverflow(page);
    await page.getByRole("link", { name: "Laporan", exact: true }).click();
    await noOverflow(page);
    expect(errors).toEqual([]);
    await customer.close();
});
test("Katalog responsif, pencarian, filter, dan stok terlihat", async ({
    page,
}) => {
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(
            page.getByRole("heading", { name: "Rasa rumahan. Cerita baru." }),
        ).toBeVisible();
        await noOverflow(page);
        await page.locator("img").evaluateAll(async (images) => {
            await Promise.all(
                images.map(async (image) => {
                    const img = image as HTMLImageElement;
                    img.loading = "eager";
                    await img.decode();
                }),
            );
        });
        expect(
            await page
                .locator("img")
                .evaluateAll((images) =>
                    images.every(
                        (img) => (img as HTMLImageElement).naturalWidth > 0,
                    ),
                ),
        ).toBe(true);
        await page.screenshot({
            path: "test-results/catalog-" + width + ".png",
            fullPage: true,
        });
    }
    await page.getByRole("button", { name: "Minuman", exact: true }).click();
    await expect(page.locator(".menu-card")).toHaveCount(2);
    await page.getByLabel("Cari menu").fill("Tidak ada menu ini");
    await expect(page.getByText("Belum menemukan yang dicari?")).toBeVisible();
    await page.getByRole("button", { name: "Tampilkan semua menu" }).click();
    await expect(page.locator(".menu-card")).toHaveCount(6);
});
