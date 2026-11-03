# WastraNusa - Indonesian Traditional Clothing Encyclopedia & Marketplace

A web-based digital encyclopedia of Indonesian traditional clothing combined with an online store selling authentic traditional garments. We maintain inventory sourced from local artisans, enabling customers to explore cultural knowledge and purchase curated products while supporting cultural preservation and sustainable development (SDG 11.4).

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Database:** PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- **Auth:** Better Auth (email & password, Google OAuth)
- **Pembayaran:** Midtrans (sandbox) · **Email:** Nodemailer (SMTP) · **Chatbot:** Google Gemini
- **Hosting:** Vercel · **Database cloud:** Neon (PostgreSQL)
- **Paket:** pnpm · **Test:** Vitest

## Gambaran Lingkungan

Project ini berjalan di tiga lingkungan. Masing-masing punya **database terpisah**, sehingga data satu lingkungan tidak muncul di lingkungan lain.

| | Local | Dev (server) | Production |
|---|---|---|---|
| Alamat | `http://localhost:3000` | `https://<alamat-branch-dev>.vercel.app` | domain production di Vercel |
| Branch Git | branch apa pun | `dev` | `main` |
| Database | PostgreSQL di Docker | Neon project `wastranusa-dev` | Neon project `wastranusa-prod` |
| Konfigurasi env | file `.env` | Vercel → scope **Preview** | Vercel → scope **Production** |
| Cara jalan | `pnpm dev` | push ke `dev` | push / merge ke `main` |

> Alamat dev dan production tiap anggota tim bisa dilihat di Vercel → Settings → Domains. Alamat dev biasanya berbentuk `wastra-nusa-git-dev-<akun>.vercel.app` dan dilindungi **Vercel Authentication** (harus login Vercel untuk membukanya).

## Prasyarat

- Node.js **24** (sama dengan [Dockerfile dev](docker/dev/Dockerfile); minimal 20.9)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) untuk database lokal
- Akun Neon dan Vercel jika bekerja dengan server dev / production

## Variabel Environment

Salin `.env.example` menjadi `.env`, lalu isi. File `.env` **jangan pernah di-commit** (hanya file bernama persis `.env` yang di-ignore oleh git, jadi jangan membuat salinan seperti `.env.neon` di dalam repo).

| Variabel | Fungsi | Catatan |
|---|---|---|
| `DATABASE_URL` | Koneksi database untuk aplikasi | Di Neon pakai URL **pooled** (host ada `-pooler`) |
| `DIRECT_URL` | Koneksi database untuk migrasi Prisma | Di Neon pakai URL **unpooled** (host tanpa `-pooler`) |
| `BETTER_AUTH_SECRET` | Kunci penanda sesi | String acak, wajib ada |
| `BETTER_AUTH_URL` | Alamat situs | Persis alamat situs, **tanpa path dan tanpa `/` di akhir** |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login Google | Alamat situs harus didaftarkan di Google Cloud Console |
| `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY` | Pembayaran | Key **sandbox** |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Email verifikasi dan reset password | |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `LLM_PROVIDER` | Chatbot ensiklopedia | `LLM_FALLBACK_PROVIDER` opsional |
| `LOG_LEVEL` | Tingkat log | Default `info` |

`BETTER_AUTH_URL` berbeda di tiap lingkungan: `http://localhost:3000`, alamat dev, dan alamat production.

## Setup Database

### 1. Database lokal (Docker)

```bash
docker compose -f docker/dev/docker-compose.yml up -d database
```

Di `.env`, host database untuk `pnpm dev` adalah `localhost`:

```env
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/wastranusa-db'
DIRECT_URL='postgresql://postgres:postgres@localhost:5432/wastranusa-db'
```

Host `database` (di `.env.example`) hanya dikenali **di dalam** jaringan Docker Compose, bukan dari `pnpm dev` di komputer Anda. Container ini belum memakai volume, jadi jangan jalankan `docker compose down` kecuali Anda siap kehilangan datanya.

### 2. Migrasi skema

Skema ada di `prisma/schema.prisma` dan riwayat migrasinya di `prisma/migrations/`.

```bash
pnpm prisma generate        # buat Prisma Client (wajib setelah pull / ganti skema)
pnpm prisma migrate dev     # LOKAL: terapkan migrasi dan buat migrasi baru
pnpm prisma migrate deploy  # NEON (dev / prod): hanya menerapkan migrasi yang belum ada
pnpm prisma migrate status  # cek status migrasi (hanya membaca)
```

> **Jangan** menjalankan `migrate dev` atau `migrate reset` ke database Neon. `migrate reset` menghapus seluruh isi database. Jika Prisma menawarkan reset karena "drift", jawab **No**.

### 3. Data contoh (seed)

```bash
pnpm prisma-seed:dev
```

Membuat akun `admin@test.com`, `user@test.com`, `seller@test.com`, serta contoh artikel, produk, alamat, keranjang, dan pesanan. Password akun ada di `prisma/dev-seeds/user.seed.ts`.

- Seed **hanya** untuk database lokal atau dev. Jangan dijalankan ke production.
- Seed meng-update `role` akun seed yang sudah ada dan **menghapus** pesanan milik user seed. Jangan dijalankan jika akun itu dipakai untuk menyimpan data penting.

### 4. Neon (dev dan production)

Ada dua project Neon: `wastranusa-dev` dan `wastranusa-prod`. Nama branch di dalamnya sama-sama `main`; yang membedakan lingkungan adalah **project**, bukan nama branch.

Mengambil URL koneksi: buka project → **Connect**.

- Nyalakan **Connection pooling** → salin URL → `DATABASE_URL`.
- Matikan **Connection pooling** → salin URL → `DIRECT_URL`.

Jika koneksi gagal karena `channel_binding`, hapus `&channel_binding=require` dari kedua URL.

Menerapkan migrasi ke Neon dari komputer lokal:

1. **Production:** buat branch cadangan di Neon dulu (menu *Branches → Create branch*).
2. Di `.env`, beri `#` pada pasangan `DATABASE_URL` / `DIRECT_URL` yang aktif, lalu aktifkan **hanya satu** pasangan Neon yang dituju.
3. `pnpm prisma migrate status`, lalu `pnpm prisma migrate deploy`.
4. **Segera kembalikan** `.env` ke database lokal. Jika pasangan production dibiarkan aktif, `pnpm dev` akan menulis ke database production.

Build Vercel hanya menjalankan `prisma generate && next build`. **Migrasi tidak otomatis**: setiap migrasi baru harus diterapkan manual ke Neon dev lalu Neon prod, sebelum kode yang membutuhkannya di-deploy.

## Menjalankan Project

### Local

```bash
pnpm install
docker compose -f docker/dev/docker-compose.yml up -d database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma-seed:dev      # opsional
pnpm dev
```

Buka `http://localhost:3000`. Pastikan di `.env` hanya **satu** pasangan `DATABASE_URL` / `DIRECT_URL` yang aktif, dan `BETTER_AUTH_URL='http://localhost:3000'`.

Alternatif dengan Docker penuh (database + migrasi + aplikasi): `docker compose -f docker/dev/docker-compose.yml up --build` (host database memakai `database`, sesuai `.env.example`).

### Server Dev (Vercel Preview)

1. Terapkan migrasi baru ke Neon `wastranusa-dev` (lihat bagian Neon).
2. Pastikan variabel di Vercel → Settings → Environment Variables untuk scope **Preview** lengkap, terutama:
   - `BETTER_AUTH_URL` = alamat branch dev, tanpa path dan tanpa `/` di akhir.
   - `DATABASE_URL` (pooled) dan `DIRECT_URL` (unpooled) dari project `wastranusa-dev`.
   - `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan variabel SMTP.
3. Push ke branch `dev`. Vercel membuat deployment Preview otomatis.
4. Perubahan variabel baru berlaku setelah **Redeploy**.
5. Buka alamat dev (login Vercel dulu), lalu cek `…/api/auth/ok` → harus `{"ok":true}`.

### Production

1. Terapkan migrasi baru ke Neon `wastranusa-prod` (dengan branch cadangan), **sebelum** merge.
2. Merge `dev` ke `main` lewat pull request. Vercel men-deploy production otomatis.
3. Pastikan variabel scope **Production** benar, terutama `BETTER_AUTH_URL` = domain production dan `DATABASE_URL` / `DIRECT_URL` dari `wastranusa-prod`.
4. Setelah deploy **Ready**, cek `…/api/auth/ok`, login, dan halaman utama.

Variabel Vercel bertipe *Sensitive* tidak bisa dilihat setelah disimpan. Jika ragu nilainya benar, masukkan ulang.

## Login Google

Setiap alamat situs (lokal, dev, production) harus terdaftar di Google Cloud Console → OAuth client:

- **Authorized JavaScript origins:** `https://<alamat-situs>`
- **Authorized redirect URIs:** `https://<alamat-situs>/api/auth/callback/google`

Untuk lokal: `http://localhost:3000` dan `http://localhost:3000/api/auth/callback/google`. Jika consent screen masih berstatus *Testing*, hanya email di daftar **Test users** yang bisa login. Gunakan **Publish app** agar pengguna umum bisa login.

## Perintah Berguna

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Server pengembangan |
| `pnpm build` | `prisma generate` lalu build produksi |
| `pnpm start` | Jalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm format:check` / `pnpm format:write` | Cek / rapikan format dengan Prettier |
| `pnpm prisma studio` | GUI untuk melihat isi database aktif di `.env` |

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `P1001: Can't reach database server` | Database tidak berjalan atau URL salah | Jalankan Docker, cek `DATABASE_URL` / `DIRECT_URL` aktif di `.env` |
| `PrismaClient` tidak punya properti/tabel baru | Prisma Client belum diperbarui | `pnpm prisma generate` |
| Login: *"alamat situs ini belum diizinkan"* | `BETTER_AUTH_URL` tidak sama dengan alamat yang dibuka | Samakan persis, lalu redeploy |
| Login: `404` di `/api/auth/sign-in/email` | `BETTER_AUTH_URL` memuat path (mis. `/login`) | Isi hanya `https://<domain>`, redeploy. Cek `…/api/auth/ok` |
| Login: *"Email atau password salah"* padahal benar | Situs membaca database yang tidak berisi akun itu (mis. membuka alamat `git-main` = production, bukan dev) | Pastikan alamat dan database sesuai lingkungan. Cek tab Network di browser |
| Google: `redirect_uri_mismatch` | Alamat belum terdaftar di OAuth client | Daftarkan origin dan redirect URI, tunggu beberapa menit |
| Build Vercel gagal | Berbagai sebab | Buka Build Logs, lihat baris merah sebelum `exited with 1` |
| Tabel `shop_profile` / `conversation` tidak ada | Migrasi belum diterapkan ke database itu | `pnpm prisma migrate deploy` ke database yang dituju |

## Catatan Diketahui

- **Live chat** memakai Server-Sent Events dengan event bus di memori proses. Di Vercel (serverless) pesan baru tidak diteruskan antar instance, sehingga tidak realtime. Di `pnpm dev` berjalan normal. Solusi yang dipertimbangkan: polling atau layanan pub/sub.
- Script `prisma-seed:prod` di `package.json` merujuk ke `prisma/prod-seeds/seed.ts` yang belum ada.
- `docker/prod/docker-compose.yml` merupakan sisa konfigurasi Supabase lama; production saat ini di-deploy lewat integrasi Git Vercel dan Neon.

## Contributing

We welcome contributions to help improve and expand our platform! Please take a look at our [Contributing Guidelines](CONTRIBUTING.md) for more details on how to get started and the submission process.
