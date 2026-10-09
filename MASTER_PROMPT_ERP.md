# MASTER PROMPT — Astacode ERP (Laravel + React + MySQL via SSH)

> Cara pakai: **copy blok ` ```text ` satu task** → paste ke AI coding agent. Setiap blok sudah memuat KONTEKS (BE/FE) + PROMPT + OUTPUT TARGET.
> Jika agen berhenti sebelum target tercapai, cukup ketik: **`lanjutkan T07`** (ganti nomor task). Agen wajib membaca `docs/PROGRESS.md` dan melanjutkan dari checklist yang belum selesai.

---

## 0. HASIL ANALISIS (ringkas, jadi dasar semua task)

### 0.1 Kondisi Frontend Saat Ini (prototype statis di folder `prototype-erpasta/`)
| File | Isi | Catatan untuk migrasi React |
|---|---|---|
| `index.html` (116 KB) | Shell + halaman: `page-dashboard, page-crm, page-pipeline, page-projects, page-automation, page-finance, page-marketing, page-content, page-aikanban, page-analytics, page-integrations, page-rbac, page-settings` | Jadi `Layouts/AppLayout` + halaman Inertia. Token CSS: `--primary:#305BA3; --primary-2:#264A85; --primary-soft:#E8EEF7` |
| `sidebar.html/.css/.js` | Sidebar tunggal 4 modul + submenu (`data-module`, `data-sub`) | Jadi komponen `Sidebar.jsx` dengan config menu (di bawah) |
| `crm/crm.html` | Sub: `master, customer, pipeline, quotation, analytics`; modal tab `omni, product, docs, termin`; `tablePipelineView` | Jadi `Pages/CRM/*` |
| `project/Forge PM.html` | Halaman: `dashboard, mytasks, project(tab overview/tasklist/kanban/timeline/files/comments/invoices/timesheets), clients, clientdetail, events, notes, team, tickets, automation, reports, integrations, settings` | Jadi `Pages/Project/*`. Tema gelap/terang (`data-theme`), palet navy `--navy:#101B35`, `--brand:#2F5FE0` → **disatukan ke token `#305BA3`** sesuai PRD 13.1 |
| `finance/index.html` + `finance.js/css` | View: `dashboard, invoices, expenses, vendor, freelancer, payroll, opex, accounts, internal-transfer, reconciliation, coa, journal, report-company, report-project, report-customer` | Jadi `Pages/Finance/*`. `finance/app.py` (Flask, mock data proyek) & `templates/` = **referensi saja, jangan dipakai** |
| `marketing/marketing.html/.js/.css` | View: `marketing-ops, ai-engine, approval-queue, calendar, distribution, asset-library, social-listening, inbox, content-history, kanban, analytics, settings` + `reviewModal` | Jadi `Pages/Marketing/*` |

### 0.2 Keputusan Teknis (menyesuaikan permintaan Anda)
- **PRD menulis Laravel + Inertia + Vue → diganti Laravel + Inertia + React** (sesuai permintaan). Struktur modular monolith tetap.
- **Database MySQL** — dikerjakan lewat **SSH ke server remote** (tidak install server lokal, **tanpa Docker**). Migrasi/seed dijalankan via `ssh` + `php artisan`.
- **Queue**: `QUEUE_CONNECTION=database` (tanpa Redis, karena tidak ada instalasi server tambahan). Scheduler via cron di server remote.
- **Auth**: Laravel Breeze (Inertia React) + Spatie Permission untuk RBAC (PRD Bab 16).
- **Integrasi eksternal** (Claude agent, Sentry, WA, IG/TikTok/Meta, GitHub): dibuat **adapter interface + mock driver** dulu; driver nyata `[PERLU VALIDASI]` sesuai PRD Bab 10.18/21.
- **Mata uang IDR**, zona waktu `Asia/Jakarta`, UI bahasa Indonesia.

### 0.3 Gap Prototype vs PRD (harus dicakup task)
Prototype Finance sudah punya Payroll/Opex/Freelancer/Vendor/Rekonsiliasi (di luar PRD inti) → **dipertahankan**, dipetakan ke AP/Cash/GL. Yang **belum ada di prototype tapi ada di PRD**: Fixed Asset, Taxation, Budgeting/Costing, Leads/Prospects/Follow-up/Onboarding (CRM), Schedule, Bug Report 3 kanal, Pull Request approval, Brand Kit, Content Rules, Platform Connections, Audit log. Task di bawah menambahkan halaman ini **dengan gaya visual yang sama**.

### 0.4 Peta Menu Final (config `resources/js/config/menu.js`)
```
Dashboard
CRM: Master Data(leads/prospects/clients) · Customer · Pipeline · Quotation(+termin) · Follow-ups · Analytics
Project: Dashboard · My Tasks · Projects(7 tab) · Clients · Events/Schedule · Notes · Team · Tickets(Bug) · Automation(PR approval) · Reports
Finance: Dashboard · Invoices(AR) · Expenses/Vendor Bill(AP) · Vendor · Freelancer · Payroll · Opex · Accounts(Kas&Bank) · Internal Transfer · Reconciliation · COA · Journal(GL) · Fixed Asset · Taxation · Budgeting · Report Company/Project/Customer
Marketing: Ops · AI Engine · Approval Queue · Calendar · Distribution · Asset Library · Social Listening · Inbox · Content History · Kanban · Analytics · Settings(Brand Kit, Rules, Connections)
Kanban AI · Analytics · Integrations · RBAC · Settings
```

### 0.5 Urutan Task & Prioritas (mengikuti Bab 17/18 PRD)
| Fase | Task | Prioritas |
|---|---|---|
| Fondasi | T00–T04 | MVP |
| CRM | T05–T08 | MVP |
| PM | T09–T13 | MVP |
| Finance | T14–T20 | MVP + Post-MVP |
| Integrasi | T21 | MVP |
| Automation Fix Bug | T22–T24 | Post-MVP |
| Marketing | T25–T28 | MVP-lite → Post-MVP |
| Lintas modul | T29–T30 | Post-MVP/Future |
| Penutup | T31–T32 | Wajib |

---

## 1. BLOK KONTEKS GLOBAL (sudah disisipkan di setiap task — jangan diubah)

### [CTX-BE]
```text
[CONTEXT BACKEND — Astacode ERP]
Produk: ERP software house Astacode (modul CRM, Project Management+Automation Fix Bug, Finance, Marketing & AI Content, Kanban AI). PRD: prototype-erpasta/PRD.md.
Stack BE: Laravel 11 (PHP 8.2+), modular monolith: app/Modules/{Core,CRM,Project,Finance,Marketing}/{Models,Http/Controllers,Http/Requests,Policies,Services,Events,Listeners,Jobs}, route per modul di routes/modules/*.php. Inertia::render untuk halaman, JSON resource untuk endpoint async.
DB: MySQL (remote via SSH, TANPA Docker, TANPA install server lokal). Semua perintah DB/artisan dijalankan di server remote: `ssh <user>@<host> "cd <path> && php artisan ..."`. Credential hanya di .env remote, jangan hardcode.
Aturan wajib: (1) Semua tabel dasar punya client_id/project_id/deal_id (nullable FK) sejak awal. (2) Uang = decimal(18,2) IDR. (3) Setiap perubahan status penting dicatat ke tabel *_events (waktu + actor_type human/system + actor_id). (4) Transaksi keuangan harus punya jejak ke journal_entries. (5) Validasi via FormRequest, otorisasi via Policy + Spatie Permission. (6) Event internal Laravel untuk lintas modul (DealWon→CreateProject, TaskDone→DraftInvoice, InvoicePaid→PostJournal). (7) Queue driver = database; scheduler via cron remote. (8) Tulis Feature test (Pest/PHPUnit) per modul. (9) Integrasi eksternal lewat interface + MockDriver dulu. (10) Seeder berisi data demo yang SAMA dengan data contoh di prototype HTML agar tampilan identik.
Progress: baca & update docs/PROGRESS.md di akhir setiap task.
```

### [CTX-FE]
```text
[CONTEXT FRONTEND — Astacode ERP]
FE = React 18 + Inertia.js + Vite (di dalam proyek Laravel yang sama), bahasa UI Indonesia. Referensi tampilan WAJIB = prototype statis di prototype-erpasta/: index.html, sidebar.html/css/js, crm/crm.html, project/Forge PM.html, finance/index.html(+finance.js/css), marketing/marketing.html(+js/css). Tampilan React harus PIKSEL-MIRIP prototype (layout, spacing, warna, ikon SVG, tabel, kartu KPI, modal, badge status).
Design tokens (PRD 13.1): --primary #305BA3, --primary-2 #264A85, --primary-soft #E8EEF7, putih, teks #1F2937, sekunder #6B7280, success #16A34A, warning #D97706, danger #DC2626. Pindahkan CSS prototype ke resources/css/{tokens,layout,components}.css; satu sumber token untuk semua modul (Project prototype yang memakai #2F5FE0/navy disatukan ke #305BA3, dark-mode dipertahankan via data-theme).
Struktur: resources/js/{Layouts/AppLayout.jsx, Components/{ui,Sidebar,Kanban,Gantt,ApprovalWidget,DataTable,Modal,StatusBadge,KpiCard,Charts}, Pages/{Dashboard,CRM,Project,Finance,Marketing,KanbanAI,Admin}, config/menu.js, hooks/, lib/}. Komponen reusable: Kanban (PM, Marketing, Kanban AI), Gantt (PM, Calendar), ApprovalWidget (PR, Konten, Bill AP).
Aturan: status-driven color coding konsisten lintas modul; mobile-aware (Kanban, Task Detail, Approval Queue); aksesibilitas kontras WCAG AA; tidak ada data hardcode di komponen — ambil dari props Inertia/API; loading/empty/error state wajib; id unik untuk elemen interaktif; format Rupiah & tanggal id-ID.
Progress: baca & update docs/PROGRESS.md di akhir setiap task.
```

### [PROTOKOL LANJUTKAN]
```text
Jika pesan saya "lanjutkan Txx": buka docs/PROGRESS.md, cari checklist Task Txx, kerjakan HANYA item yang belum [x], jangan ulang yang sudah selesai, verifikasi dengan perintah di bagian "Verifikasi", lalu centang item dan laporkan sisa.
```

---

# 2. DAFTAR TASK (copy-paste per blok)

## FASE 1 — FONDASI

### T00 · [BE+FE] Bootstrap proyek & akses SSH
```text
[CONTEXT: BE + FE] (sisipkan blok [CTX-BE] dan [CTX-FE] di atas sebelum prompt ini)

PROMPT:
Inisialisasi proyek `astacode-erp` di workspace saya (di dalam/bersebelahan dengan prototype-erpasta, jangan hapus prototype — dipakai referensi).
1. Buat Laravel 11 + Breeze stack "React with Inertia" (non-interaktif, jalankan `--help` dulu), Vite, install spatie/laravel-permission, spatie/laravel-activitylog, barryvdh/laravel-dompdf, maatwebsite/excel.
2. Siapkan struktur modular app/Modules/{Core,CRM,Project,Finance,Marketing} + autoload + route loader routes/modules/*.php.
3. Buat docs/DEPLOY_SSH.md + script `scripts/remote.sh` (rsync/ssh) yang: sync kode ke server, `composer install --no-dev`, `npm run build` (atau build lokal lalu rsync public/build), `php artisan migrate --force`, `queue:restart`. Host/user/path dibaca dari `.env.deploy` (buat `.env.deploy.example`). Tanpa Docker.
4. Konfigurasi .env.example: DB_CONNECTION=mysql (kredensial placeholder), QUEUE_CONNECTION=database, APP_TIMEZONE=Asia/Jakarta, APP_LOCALE=id. Tambah migrasi queue/jobs/failed_jobs/cache.
5. Tambah crontab contoh scheduler di docs/DEPLOY_SSH.md.
6. Buat docs/PROGRESS.md berisi checklist semua task T00–T32 (format `- [ ]`) dan sub-item tiap task.
Tanyakan ke saya HANYA host/user/path SSH bila belum ada; jangan minta password dalam chat (pakai SSH key).

OUTPUT TARGET:
- `php artisan about` OK, `npm run build` sukses lokal.
- Struktur folder modul + loader route ada.
- scripts/remote.sh + docs/DEPLOY_SSH.md + docs/PROGRESS.md ada.
- Halaman login Breeze tampil.
Verifikasi: `php artisan route:list`, `npm run build`, `bash -n scripts/remote.sh`.
```

### T01 · [FE] Design system, token & AppLayout dari prototype
```text
[CONTEXT: FE] (sisipkan [CTX-FE]; baca juga [CTX-BE] ringkas)

PROMPT:
Konversi shell prototype menjadi React:
1. Ekstrak seluruh CSS dari index.html, sidebar.css, finance.css, marketing.css, dan style di Forge PM.html → resources/css/tokens.css (variabel), layout.css, components.css. Satukan token biru ke #305BA3 (lihat CTX-FE). Pertahankan dark mode `data-theme`.
2. Buat `Layouts/AppLayout.jsx` meniru index.html: topbar (search, notifikasi, tema, avatar), sidebar collapse, area konten.
3. Buat `Components/Sidebar.jsx` dari sidebar.html/js (nav-label Workspace, modul expand/collapse + sub-item, state aktif dari URL Inertia) dengan data dari `config/menu.js` (peta menu 0.4). Menu difilter oleh permission user (props `auth.can`).
4. Buat komponen ui: Button, Card, KpiCard, StatusBadge (warna konsisten PRD 13.1), DataTable (sort, search, pagination, empty state), Modal, Tabs, Drawer, FormField, Toast, ConfirmDialog, Charts wrapper (recharts), Avatar, Pill.
5. Buat halaman katalog `/dev/ui` untuk memeriksa semua komponen.
Jangan memindahkan konten halaman bisnis dulu.

OUTPUT TARGET:
- Layout + Sidebar identik secara visual dengan prototype (screenshot bandingkan).
- Semua komponen ui ada & tampil di /dev/ui, responsif mobile.
- Tidak ada warna hardcode di luar tokens.css.
Verifikasi: `npm run build`, buka /dev/ui, bandingkan dengan sidebar.html di browser.
```

### T02 · [BE] Auth, RBAC, Users, Audit Log
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Implementasikan RBAC sesuai PRD Bab 16.
1. Role: owner, sales, pm, programmer, finance, marketing, client. Permission granular per modul & aksi (crm.view/create/update/delete/approve, project.*, finance.*, marketing.*, bugfix.approve, bugfix.approve_hard, kanbanai.*), format `modul.aksi`.
2. Seeder `RolePermissionSeeder` mengikuti matriks PRD 16 persis (mis. programmer hanya assigned task; client hanya lapor bug + lihat invoice miliknya; Sales hanya data miliknya via policy scoping).
3. Tabel `audit_logs` (actor_type, actor_id, action, subject_type, subject_id, old/new json, ip, created_at) + trait `Auditable` + middleware; semua modul memakainya.
4. Endpoint & halaman admin: CRUD user, assign role, matriks permission (untuk halaman RBAC prototype `page-rbac`), profil.
5. Share `auth.user`, `auth.roles`, `auth.can` ke Inertia.
6. Seed user demo tiap role (password dari .env/seed log).
7. Feature test: akses ditolak/diizinkan per role per modul.

OUTPUT TARGET:
- Migrasi + seeder jalan di MySQL remote via SSH (`migrate --force`, `db:seed`).
- Test RBAC hijau. Audit log tercatat saat user diubah.
Verifikasi: `php artisan test --filter=Rbac`.
```

### T03 · [FE] Halaman RBAC, Settings, Dashboard eksekutif
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Implementasikan halaman dari index.html: `page-dashboard` (dashboard eksekutif per role: KPI revenue, pipeline value, piutang overdue, laba proyek, status konten), `page-rbac` (matriks role×modul editable + daftar user), `page-settings`, `page-integrations` (status koneksi: WA, Sentry, GitHub, Meta, TikTok, Claude — tampil status "belum terhubung/mock").
Ambil data dari endpoint backend (buat endpoint ringkas `DashboardController` dengan data agregat; boleh stub terisi query nyata bila modul terkait belum ada → fallback 0). Dashboard menampilkan kartu berbeda tergantung role (Owner semua, Sales pipeline, Finance AR/AP, dst).

OUTPUT TARGET:
- 4 halaman tampil identik prototype, data dari BE (bukan hardcode).
- Menu tersembunyi sesuai permission.
Verifikasi: login tiap role demo, cek menu & dashboard.
```

### T04 · [BE] Skema inti lintas modul (Data Bridge)
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Buat migrasi + model + factory untuk tabel jembatan & inti (PRD Bab 12 & 14.2): clients, deals, projects, tasks, task_events, files, comments, notifications (tabel Laravel), settings, number_sequences (penomoran dokumen atomik: QUO/YYYY/MM/0001, INV/…, BILL/…), attachments polymorphic.
Semua tabel memuat client_id/project_id/deal_id sesuai relevansi (nullable FK, index). Buat service `NumberSequence::next('QUO')` thread-safe (lock). Buat trait `HasEvents` untuk menulis *_events. Tambahkan `docs/ERD.md` (mermaid) hasil nyata.

OUTPUT TARGET:
- Migrasi sukses di MySQL remote; ERD.md sesuai skema.
- Test unit NumberSequence (concurrency lock) hijau.
Verifikasi: `php artisan migrate:status`, `php artisan test --filter=NumberSequence`.
```

---

## FASE 2 — CRM

### T05 · [BE] CRM: Leads→Prospects→Clients→Deals
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Implementasikan modul CRM BE (PRD Bab 7) di app/Modules/CRM:
Tabel & model: leads, prospects, clients (lengkap: company_name, industry, pic_name, pic_contact, npwp, alamat, kontak omni-channel), deals (stage: New, Qualified, Needs Analysis, Offering Sent, Negotiation, Won, Lost; probability; expected_close_date; value_estimate; owner_id), follow_ups, client_activities, onboarding_checklists.
Logic: konversi Lead→Prospect→Client (service), pindah stage deal + event log + client_activity otomatis, reminder follow-up jatuh tempo (scheduled job + notifikasi database/email), scoping Sales (hanya miliknya).
Endpoint: CRUD + `POST deals/{id}/move-stage`, `POST leads/{id}/qualify`, `POST prospects/{id}/convert`, ringkasan pipeline per stage (jumlah & nilai).
Seeder = data contoh di crm/crm.html.
Test: konversi, stage move, scoping.

OUTPUT TARGET: semua endpoint CRM dasar + seeder + test hijau.
Verifikasi: `php artisan test --filter=Crm`.
```

### T06 · [BE] Offering, Quotation, Termin, Proposal, DealWon→Project
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Lanjutkan CRM (PRD 7.3, 7.4, 7.7): offerings (items json, total_estimate, status draft/sent/approved/rejected), quotations (snapshot dari offering, nomor `QUO/YYYY/MM/0001`, subtotal/tax/total/valid_until, status), quotation_termins (termin_name, percentage, amount, trigger_condition, due_offset_days; validasi total 100%), proposals (versi, file PDF via dompdf, status, sent_at), katalog produk/layanan (product_catalog) untuk tab "product" di modal CRM.
Logic: `Generate Quotation` dari offering approved (snapshot, bukan reference live), set termin, generate PDF quotation/proposal, approve → deal Won → dispatch event `DealWon` → listener membuat `projects` otomatis (client_id, deal_id, scope dari offering, kode proyek unik `#KODE`) + onboarding checklist default + schedule awal.
Test: acceptance criteria 7.7, DealWon→Project, termin 100%.

OUTPUT TARGET: alur offering→quotation→won→project berjalan end-to-end via test.
Verifikasi: `php artisan test --filter=Quotation`.
```

### T07 · [FE] CRM: Master, Customer, Pipeline, Quotation
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Konversi crm/crm.html ke React Pages/CRM/{Master,Customer,CustomerDetail,Pipeline,Quotation,Analytics,FollowUps}.jsx. Pertahankan persis: tab master (leads/prospects/clients), `tablePipelineView` + papan kanban pipeline (drag-drop stage pakai Components/Kanban), modal detail klien dengan tab omni/product/docs/termin, form Offering, generator Quotation + editor termin (total 100% live-validate), preview proposal/quotation PDF, halaman Analytics CRM (funnel, conversion per tahap, waktu lead→won).
Gunakan endpoint dari T05/T06 (Inertia + axios). Tambahkan halaman Follow-ups (daftar jatuh tempo, ikon reminder) dan Client History (agregat timeline).

OUTPUT TARGET: semua halaman CRM identik prototype, CRUD & drag-drop pipeline tersambung BE, tombol "Generate Quotation" dan "Mark Won" berfungsi.
Verifikasi: jalankan alur lead→won di browser, pastikan project terbentuk.
```

### T08 · [BE+FE] CRM: Onboarding, Client History, Portal Klien minimal
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
BE: endpoint onboarding checklist per client/project, `ClientHistoryService` (agregat proyek, invoice, komunikasi, aktivitas lintas modul), rute portal klien `/portal` (role client): lihat status proyek, daftar invoice miliknya, form lapor bug.
FE: tab Onboarding & History di CustomerDetail, layout portal klien ringan (reuse komponen ui).
Pastikan klien tidak bisa melihat data klien lain (policy + test).

OUTPUT TARGET: checklist bisa dicentang, history menampilkan data lintas modul, portal klien aman (test akses silang gagal).
Verifikasi: `php artisan test --filter=Portal`.
```

---

## FASE 3 — PROJECT MANAGEMENT

### T09 · [BE] PM: Projects, Tasks, Schedule, Files, Comments
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Modul Project (PRD 8.4.2, 8.6): projects (sdlc_stage, sentry_dsn nullable, repo_url nullable, kode unik, status), tasks (type feature/bug/revision, source web/wa/sentry/manual, difficulty_category, priority hotfix/normal, status baru/dianalisis/menunggu_persetujuan/dikerjakan/review/selesai, assigned_to, due_date, estimasi jam), task_events (otomatis tiap perubahan status), schedules (deadline/meeting/release), files (upload ke storage, per project/task), comments (is_ai_generated), timesheets (jam kerja → dasar actual_labor_cost), team members & notes.
Endpoint: CRUD, `PATCH tasks/{id}/status` (validasi transisi + event), reorder kanban (posisi), upload/download file, komentar + mention, timesheet start/stop.
Event `TaskDone` (dipakai invoice trigger). Scoping: programmer hanya assigned task.
Seeder dari data contoh Forge PM.html.

OUTPUT TARGET: endpoint lengkap + test transisi status & scoping.
Verifikasi: `php artisan test --filter=Project`.
```

### T10 · [FE] PM: Dashboard, My Tasks, Project (Overview/Tasklist/Kanban)
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Konversi project/Forge PM.html: `page-dashboard`, `page-mytasks`, `page-project` dengan tab overview, tasklist, kanban (komponen Kanban reusable drag-drop + optimistic update ke BE), plus `page-clients`, `page-clientdetail`, `page-team`, `page-notes`, `page-events` (kalender schedule: deadline/meeting/release). Task detail drawer (deskripsi, komentar, file, riwayat task_events, assign, prioritas, difficulty badge). Mobile-friendly.

OUTPUT TARGET: halaman identik prototype, drag-drop kanban mengubah status di DB, drawer task lengkap.
Verifikasi: geser kartu → refresh → status tetap.
```

### T11 · [FE] PM: Timeline/Gantt, Files, Comments, Timesheets, Reports
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Lengkapi tab project: `timeline` (Components/Gantt reusable: bar task, dependency sederhana, drag ubah tanggal, zoom hari/minggu), `files` (upload drag-drop, preview, per task), `comments` (thread, mention, badge AI), `timesheets` (start/stop timer, rekap), serta `page-reports` (progres proyek, workload tim, burn-down). Gantt dirancang reusable untuk Marketing Calendar.

OUTPUT TARGET: semua tab project berfungsi dengan data nyata; Gantt reusable terdokumentasi di docs/COMPONENTS.md.
Verifikasi: ubah tanggal di Gantt → tersimpan.
```

### T12 · [BE+FE] PM: Bug Report 3 kanal (Web, WhatsApp, Sentry) & Tickets
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
BE: tabel bug_reports; endpoint web form (dropdown project); webhook WhatsApp (format `#KODE-PROJECT deskripsi`; tanpa kode → balas pertanyaan klarifikasi; adapter `WhatsAppGateway` interface + FonnteDriver + MockDriver); webhook Sentry (DSN unik per project → mapping otomatis; verifikasi signature); semua webhook verifikasi signature (PRD 15.1). Setiap laporan jadi task type=bug status=baru + task_events + notifikasi ke programmer. Isi laporan diperlakukan sebagai data (sanitasi). Rate limit & idempotensi webhook.
FE: `page-tickets` (daftar bug, filter, kategori kesulitan, SLA waktu respons), form lapor bug (internal & portal klien).
Test: parsing WA, mismatch kode, signature invalid ditolak.

OUTPUT TARGET: 3 kanal membuat task bug; test hijau; halaman tickets berfungsi.
Verifikasi: `php artisan test --filter=BugReport`.
```

### T13 · [BE] PM: Invoice trigger dari task selesai
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Implementasi sisi PM invoice (PRD 8.4.2, 9.2): ketika task selesai sesuai termin (trigger_condition quotation_termins) → listener `TaskDone` membuat DRAFT invoice (generated_from task_ids/termin_id) di tabel invoices & invoice_items (milik Finance AR, dibuat di T14 — jika belum ada, buat tabel dasarnya sekarang dan T14 melanjutkan). Tombol manual "Buat Invoice dari task selesai" untuk MVP. Tab `invoices` pada halaman project menampilkan invoice proyek.

OUTPUT TARGET: task done → draft invoice terbentuk dari termin; test hijau.
Verifikasi: `php artisan test --filter=InvoiceTrigger`.
```

---

## FASE 4 — FINANCE

### T14 · [BE] Finance: COA, General Ledger, Journal engine
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
app/Modules/Finance: chart_of_accounts (kode seperti 1-11200 Bank, 4-11000 Pendapatan Proyek; hirarki parent; tipe aset/liabilitas/ekuitas/pendapatan/beban; seeder COA standar jasa software, tandai `[PERLU VALIDASI akuntan]` di komentar), journal_entries + journal_lines (journal_date, source_module AR/AP/Kas&Bank/Aset/Manual, account_code, project_id, debit, credit, notes). `JournalService::post()` WAJIB menolak jurnal tidak balance (debit=credit) dalam DB transaction, immutable setelah posted (koreksi via jurnal pembalik), periode tutup buku (`accounting_periods`). Jurnal manual + jurnal pembalik. Buku besar per akun dengan saldo berjalan, neraca saldo.
Test: balance, immutability, saldo.

OUTPUT TARGET: GL engine + COA seed + test hijau.
Verifikasi: `php artisan test --filter=Journal`.
```

### T15 · [BE] Finance AR (Invoice) & Pembayaran → Jurnal otomatis
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Lengkapi invoices (PRD 9.2): invoice_number `INV/YYYY/MM/0001`, billing_type milestone/maintenance_sla, milestone_name (dari quotation_termins), sla_billing_period, subtotal, tax_amount (PPN), withholding_tax_amount (PPh 23), total, due_date, payment_status (Belum Bayar/Dibayar Sebagian/Lunas/Terlambat — Terlambat dihitung via scheduler harian), invoice_items, payments (multi-pembayaran parsial), workflow draft→verifikasi finance→terbit→kirim (PDF dompdf + email)→bayar.
Event `InvoiceIssued` → jurnal (D Piutang / K Pendapatan + PPN Keluaran), `PaymentReceived` → jurnal (D Bank / K Piutang, PPh 23 dibayar dimuka). Pembayaran tercatat di cash_transactions (T17). Aging piutang query. Tarif pajak dari tabel konfigurasi `tax_rates` (JANGAN hardcode; `[PERLU VALIDASI konsultan pajak]`).
Test: parsial→lunas, jurnal balance, overdue.

OUTPUT TARGET: AR end-to-end dengan jurnal otomatis, PDF invoice.
Verifikasi: `php artisan test --filter=Receivable`.
```

### T16 · [BE] Finance AP: Vendor, Bill, Freelancer, Payroll, Opex
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
AP (PRD 9.3) + fitur prototype: vendors, bills (bill_number, vendor, project_id nullable, expense_category Cloud/Server|Freelancer|Lisensi API|Sewa Kantor, amount, due_date, status Menunggu Persetujuan/Siap Bayar/Lunas, attachment foto/PDF), approval bill (pakai pola ApprovalWidget: tabel `approvals` polymorphic), freelancer fee (kontrak, termin, per project), payroll (komponen gaji, PPh 21 dari tabel tarif konfigurasi, slip PDF), opex (kategori & recurring). Jurnal otomatis: bill approved (D Beban / K Utang), bayar (D Utang / K Bank). Biaya tercatat ke project actual cost.
Test: approval flow, jurnal, recurring opex.

OUTPUT TARGET: seluruh AP/payroll/opex/freelancer endpoint + jurnal otomatis + test hijau.
Verifikasi: `php artisan test --filter=Payable`.
```

### T17 · [BE] Finance: Cash & Bank, Internal Transfer, Rekonsiliasi
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
bank_accounts (BCA Operasional, Kas Kecil, dll. + COA mapping), cash_transactions (direction masuk/keluar, reference_type/id ke Invoice/Bill, amount, bank_admin_fee, bank_statement_date), internal_transfers (jurnal 2 sisi + biaya admin), rekonsiliasi: import rekening koran CSV, auto-match (nominal+tanggal+referensi), manual match, selisih, status reconciled. Saldo riil per rekening, cash flow harian/bulanan.
Test: transfer balance, auto-match.

OUTPUT TARGET: modul kas/bank/transfer/rekon lengkap + test hijau.
Verifikasi: `php artisan test --filter=Cash`.
```

### T18 · [BE] Finance: Fixed Asset, Taxation, Budgeting & Costing
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Post-MVP finance (PRD 9.5–9.7):
- fixed_assets (asset_code AST-DEV-001, assigned_employee, purchase_date/price, useful_life_months, monthly_depreciation, accumulated, book_value) + job bulanan `DepreciateAssets` yang memposting jurnal penyusutan; disposal.
- tax_transactions (tax_type PPN Keluaran/Masukan/PPh 23/PPh 21, DPP, tarif dari konfigurasi, NSFP, nomor bupot, filing_status Draft/Sudah Disetor/Sudah Dilaporkan) otomatis terbentuk dari invoice & bill; rekap bulanan. Tandai `[PERLU VALIDASI]`.
- budgets (labor/outsourcing/infrastructure per project), actual otomatis dari timesheet & bills, cost_variance, alert saat >90% plafon.
Test: penyusutan bulanan, variance.

OUTPUT TARGET: 3 sub-modul + job + test hijau.
Verifikasi: `php artisan test --filter=Asset`.
```

### T19 · [BE] Finance: Financial Reporting (queue async) & Export
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Laporan (PRD 9.8): Laba Rugi per Proyek, Laba Rugi Bulanan, Neraca, Aging Piutang, Cash Flow, laporan per perusahaan/proyek/customer (3 halaman report prototype). Metrik gross_profit_per_project, project_profit_margin_percent, total_overdue_receivables, net_operating_income. Laporan besar diproses via Queue Job + simpan hasil (`financial_reports`), cache snapshot, export PDF & Excel. Semua angka dihitung dari journal_lines (single source of truth). Test: rekonsiliasi angka laporan vs jurnal.

OUTPUT TARGET: endpoint laporan + export + job async + test hijau.
Verifikasi: `php artisan test --filter=Report`.
```

### T20 · [FE] Finance: seluruh halaman (15 view prototype + baru)
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Konversi finance/index.html (+finance.js/css) ke Pages/Finance/*: Dashboard, Invoices (list, form, detail, bayar parsial, PDF), Expenses/Bills (+ approval), Vendor, Freelancer, Payroll, Opex, Accounts (kas & bank), InternalTransfer, Reconciliation (upload CSV, match UI), COA (tree), Journal (form jurnal balance realtime), ReportCompany, ReportProject, ReportCustomer, serta halaman BARU gaya sama: FixedAsset, Taxation, Budgeting. Gunakan ApprovalWidget reusable. Abaikan finance/app.py & templates Flask (hanya referensi tampilan). Hilangkan seluruh data mock `projects` — ambil dari BE.

OUTPUT TARGET: semua halaman Finance tampil identik prototype, tersambung BE, form tervalidasi, export berfungsi.
Verifikasi: buat invoice → bayar → cek jurnal & laporan berubah.
```

### T21 · [BE+FE] Integrasi lintas modul (Data Bridge) end-to-end
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
Pastikan seluruh alur Bab 12 jalan: Lead→Client→Deal→Offering→Quotation(termin)→Won→Project→Task selesai→Draft Invoice (milestone dari termin)→Terbit→Bayar→Jurnal GL→Laporan laba proyek. Buat test E2E tunggal `FullFlowTest` + seeder `DemoFlowSeeder`. Di FE: tautan silang (klik client dari invoice, project dari deal, dst), Client History lengkap, dashboard laba per proyek real-time. Perbaiki semua inkonsistensi nama/kolom.

OUTPUT TARGET: FullFlowTest hijau; demo klik-through tanpa data hardcode.
Verifikasi: `php artisan test --filter=FullFlow`.
```

---

## FASE 5 — AUTOMATION FIX BUG (Post-MVP)

### T22 · [BE] Queue, Agent Runner & PR record
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
PRD 8.4.1/8.5: tabel pull_requests, agent_runs (attempt, token_usage, cost, status), konfigurasi limit token/biaya per tiket & per hari (PRD 15.3), max percobaan 2–3. Interface `BugFixAgent` + `MockAgent` + `ClaudeCodeHeadlessDriver` (menjalankan CLI headless di folder clone sementara — TIDAK menyentuh production; fine-grained GitHub token per repo, tanpa push ke main). Job `AnalyzeBugTask`: status baru→dianalisis, tentukan difficulty (low/medium/hard), buat diagnostic package (ringkasan, lokasi kode, stack trace, saran) bila jalur manual, atau buat branch+PR bila low. Setiap langkah ditulis task_events + komentar AI otomatis. Prompt injection mitigation: isi laporan dibungkus sebagai data.
Test dengan MockAgent.

OUTPUT TARGET: pipeline analisis→PR record berjalan via queue dengan MockAgent; test hijau.
Verifikasi: `php artisan queue:work --once` + test.
```

### T23 · [BE+FE] Approval PR (single/double), GitHub webhook, Deploy status
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
BE: `GitHubGateway` interface (+Mock): merge PR HANYA setelah approval manusia; kategori hard butuh 2 approver BERBEDA (PRD 8.7, test wajib); tidak ada auto-merge (test). Webhook GitHub (signature) update status CI/deploy; notifikasi ke programmer. Rollback marker.
FE: halaman `page-automation` (Forge PM) = antrean PR: diff summary, hasil test, kategori, tombol Setujui/Tolak/Perbaiki sendiri (ApprovalWidget), indikator approval 1/2, log timeline task_events. Mobile-friendly.

OUTPUT TARGET: approve/reject tercatat dengan actor+waktu; hard butuh 2 approver; semua tertest.
Verifikasi: `php artisan test --filter=PullRequestApproval`.
```

### T24 · [BE] Monitoring Sentry lanjutan & MCP Layer (opsional)
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Tandai klasifikasi: Post-MVP/Future. Buat dokumen `docs/MCP.md` + endpoint terstruktur ber-allow-list (`list_tasks`, `update_task_status`, `create_branch_and_pr`, `add_comment`) sebagai REST internal ber-token terbatas (implementasi server MCP Node/TS dibuat sebagai paket terpisah `/mcp-server` bila diminta). Tambah monitor error-rate pasca-deploy (data dari Sentry adapter/mock) yang menandai rollback-needed. Semua aksi agen via allow-list + audit_logs.

OUTPUT TARGET: endpoint allow-list + dokumen + test akses ditolak di luar allow-list.
Verifikasi: `php artisan test --filter=Mcp`.
```

---

## FASE 6 — MARKETING

### T25 · [BE] Marketing Fase 1: Brand Kit, Content, Calendar, Approval, Rules
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
PRD 10.14 entitas inti: brand_kits, content_items, content_assets, content_series, content_calendar, content_schedule, content_approvals, content_rejections, hashtags + pivot, topic_bank, keyword_bank, platform_connections (token terenkripsi cast `encrypted`), platform_publish_log, content_rules (topik terlarang politik/agama/NSFW, elemen wajib, quality gates).
Logic: pipeline status draft→in_review→approved→scheduled→publishing→published/failed/rejected, ContentRulesEngine (WAJIB dilewati sebelum approve/publish — Out of Scope jika dilewati), approval dasar (Approve/Edit&Approve/Regenerate/Reject/Skip + alasan), regenerasi dengan feedback, scheduler cek tiap menit (stub publisher), banned hashtag flag. Interface `ContentGenerator` + MockGenerator (+ adapter LLM nyata `[PERLU VALIDASI]`) untuk blog/caption/carousel script.
Test: rules engine blokir konten terlarang, alur approval, log keputusan.

OUTPUT TARGET: backend marketing fase 1 + test hijau.
Verifikasi: `php artisan test --filter=Marketing`.
```

### T26 · [FE] Marketing: konversi 12 view prototype
```text
[CONTEXT: FE] (sisipkan [CTX-FE])

PROMPT:
Konversi marketing/marketing.html + marketing.js/css ke Pages/Marketing/*: Ops (marketing-ops), AIEngine (form brief → generate → preview), ApprovalQueue (split-view + reviewModal: Approve/Edit&Approve/Regenerate/Reject/Skip + batch), Calendar (bulanan/mingguan/harian, drag-drop jadwal, deteksi konflik, pakai Gantt/Calendar reusable), Distribution, AssetLibrary, SocialListening, Inbox, ContentHistory (list+detail view), Kanban (Content Pipeline pakai Components/Kanban), Analytics, Settings (Brand Kit manager, Content Rules, Platform Connections, Posting Frequency, Notifikasi). Hilangkan data mock di marketing.js → BE.

OUTPUT TARGET: seluruh view identik prototype & tersambung BE fase 1; view tanpa BE (SocialListening/Inbox/Distribution) tampil memakai data MockDriver dari endpoint `/api/marketing/mock/*` (bukan hardcode FE).
Verifikasi: alur brief→generate→review→approve→jadwal di browser.
```

### T27 · [BE] Marketing Fase 2: Publishing Engine, Analytics, Reporting
```text
[CONTEXT: BE] (sisipkan [CTX-BE])

PROMPT:
Abstraksi `Publisher` per platform (Instagram Graph, TikTok, Blog CMS) + MockPublisher; retry max 3x backoff, rate-limit guard (nilai dari konfigurasi `[PERLU VALIDASI]`), refresh token sebelum job (gagal→alert admin, job tidak jalan), pra-validasi asset (dimensi/format/rasio), publish log dengan external_post_id, alert Telegram/Email/Webhook. Analytics: analytics_snapshots job tiap 6 jam, skor `(likes×1+comments×3+saves×5+shares×7)/reach×1000`, ranking, heatmap 7×24 best-time, hashtag performance, weekly/monthly report (queue, PDF/Excel, kirim email Senin). Webhook Meta/TikTok diverifikasi signature.
Test: retry, token expired, rate limit, skor.

OUTPUT TARGET: engine publishing+analytics+report berjalan dengan MockPublisher; test hijau.
Verifikasi: `php artisan test --filter=Publishing`.
```

### T28 · [BE+FE] Marketing Fase 3 (kerangka Future): Ads & AI Learning
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
Klasifikasi Future — buat KERANGKA saja: tabel ad_campaigns/ad_audiences/ad_creatives/ad_performance_snapshots, ads rules (auto-pause CPE>ambang, budget cap), ai_learning_reports, sentiment_analysis, UI dashboard ROI & learning bergaya prototype dengan data mock. Semua integrasi nyata di balik interface + feature flag `FEATURE_ADS`, `FEATURE_AI_LEARNING` (default off). Dokumentasikan syarat validasi API di docs/MARKETING_FUTURE.md.

OUTPUT TARGET: skema + UI mock + feature flag aktif/nonaktif teruji.
Verifikasi: `php artisan test --filter=Ads`.
```

---

## FASE 7 — LINTAS MODUL & PENUTUP

### T29 · [BE+FE] Kanban AI lintas modul
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
PRD Bab 11: tabel `ai_tasks`; endpoint create task (form/chat/voice-text) → `TaskRouter` (interface + rule-based router + LLM adapter) menentukan modul tujuan (Finance AR, Marketing pipeline, PM, CRM) & role/skill yang disarankan, lalu membuat entitas modul tujuan. FE `page-aikanban` memakai Components/Kanban lintas modul dengan filter modul, quick-add bar bergaya prototype, eksekusi aksi (mis. "follow up invoice jatuh tempo"). Hormati permission per modul.

OUTPUT TARGET: input "buatkan invoice untuk client X" masuk Finance draft; "tulis carousel Laravel 11" masuk Content Pipeline; test routing hijau.
Verifikasi: `php artisan test --filter=KanbanAi`.
```

### T30 · [BE+FE] Notifikasi, Analytics global, Settings, Integrations
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
Pusat notifikasi (database + email, Telegram/WA via adapter) dengan ikon lonceng di topbar & halaman daftar; preferensi per user; `page-analytics` (lintas modul: revenue, pipeline, produktivitas, konten), `page-integrations` kelola koneksi (simpan kredensial terenkripsi, tes koneksi), `page-settings` (profil perusahaan, numbering format, tarif pajak, SLA, jam kerja, tema).

OUTPUT TARGET: notifikasi real (follow-up due, invoice overdue, PR menunggu, konten review) tampil & ditandai terbaca; settings tersimpan.
Verifikasi: picu event → notifikasi muncul.
```

### T31 · [BE+FE] QA, Keamanan, Performa, Audit
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
Audit menyeluruh terhadap PRD Bab 15: signature semua webhook, enkripsi at-rest kredensial/PII keuangan, rate limiting, CSRF/XSS/SQLi review, policy tiap controller (cek tidak ada endpoint tanpa otorisasi → buat test otomatis memindai route), N+1 (laravel-debugbar/telescope lokal), index DB, pagination, cache dashboard 6 jam, Laravel Pint + ESLint, tambah test yang kurang, Lighthouse/mobile check Kanban/Task/Approval. Hasilkan docs/QA_REPORT.md berisi temuan & perbaikan.

OUTPUT TARGET: `php artisan test` semua hijau, lint bersih, QA_REPORT.md lengkap.
Verifikasi: `php artisan test && npm run lint && npm run build`.
```

### T32 · [BE+FE] Deploy produksi via SSH & dokumentasi serah terima
```text
[CONTEXT: BE + FE] (sisipkan [CTX-BE] dan [CTX-FE])

PROMPT:
Deploy ke server remote memakai scripts/remote.sh (tanpa Docker): backup DB (mysqldump via SSH) → sync → migrate --force → `config:cache route:cache view:cache` → supervisor/cron untuk `queue:work` & `schedule:run` (instruksi docs/DEPLOY_SSH.md) → smoke test (login, buat lead, buat invoice) → rollback guide. Isi README.md (setup, env, role demo, arsitektur), docs/ERD.md final, docs/USER_GUIDE.md per role, dan tandai seluruh `[PERLU VALIDASI]` yang masih terbuka di docs/OPEN_QUESTIONS.md (mengacu PRD Bab 21).

OUTPUT TARGET: aplikasi hidup di server, smoke test lulus, dokumentasi lengkap, PROGRESS.md semua [x].
Verifikasi: curl health check + login manual.
```

---

## 3. TEMPLATE docs/PROGRESS.md (dibuat otomatis di T00)
```text
# PROGRESS
- [ ] T00 Bootstrap & SSH        - [ ] T17 Cash/Bank/Rekon
- [ ] T01 Design system/Layout   - [ ] T18 Asset/Tax/Budget
- [ ] T02 RBAC/Audit             - [ ] T19 Reporting
- [ ] T03 Dashboard/RBAC UI      - [ ] T20 Finance UI
- [ ] T04 Skema inti             - [ ] T21 Integrasi E2E
- [ ] T05 CRM core               - [ ] T22 Agent runner
- [ ] T06 Quotation/Won→Project  - [ ] T23 PR approval
- [ ] T07 CRM UI                 - [ ] T24 Sentry/MCP
- [ ] T08 Onboarding/Portal      - [ ] T25 Marketing BE-1
- [ ] T09 PM core                - [ ] T26 Marketing UI
- [ ] T10 PM UI-1                - [ ] T27 Publishing/Analytics
- [ ] T11 PM UI-2 (Gantt)        - [ ] T28 Ads/AI Learning (kerangka)
- [ ] T12 Bug 3 kanal            - [ ] T29 Kanban AI
- [ ] T13 Invoice trigger        - [ ] T30 Notifikasi/Settings
- [ ] T14 COA/GL                 - [ ] T31 QA/Security
- [ ] T15 AR                     - [ ] T32 Deploy & Handover
- [ ] T16 AP/Payroll/Opex
```

## 4. Catatan Penting
1. **Urutan jangan dilompati** — T04 sebelum modul apa pun; T14 sebelum T15–T19; T09 sebelum T12/T13.
2. Task **FE** bisa dikerjakan paralel dengan BE-nya setelah kontrak endpoint disepakati, tetapi hasil akhir harus tersambung.
3. Hal bertanda `[PERLU VALIDASI]` (COA, tarif pajak, API Meta/TikTok/IG) sengaja dibuat **konfigurable** — jangan di-hardcode.
4. Marketing penuh (video, Ads, AI Learning) = Future sesuai PRD 17; T28 hanya kerangka agar MVP aman di ±3 bulan.
5. Warna biru prototype Project (`#2F5FE0`) disatukan ke `#305BA3` agar konsisten dengan PRD; ubah di T01 bila ingin dipertahankan.
