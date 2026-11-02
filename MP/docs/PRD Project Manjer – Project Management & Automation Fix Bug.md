# PRD: Project Manjer – Project Management & Automation Fix Bug

**Versi:** 1.0 (Draft) · **Tanggal:** 16 Oktober 2026 · **Status:** Untuk review **Pemilik produk:** Pemilik sistem / programmer utama

---

## 1. Ringkasan Eksekutif

Project Manjer adalah sistem manajemen proyek terpadu (setara Jira, dengan fokus software house/agensi) yang terhubung ke CRM, HR, dan Finance, serta dilengkapi agen AI (Claude) untuk mendeteksi, menganalisis, dan memperbaiki bug pada web klien secara semi-otomatis.

Alur besar sistem:

**CRM (deal Closing/Won) → Project Manager (PM) → Pengerjaan (task, bug, revisi) → Invoice → Finance**

Dan untuk proyek yang sudah berjalan/maintenance: **Laporan bug (Web/WA/Sentry) → Task bug otomatis → Agen AI → PR → Persetujuan manusia → Deploy → Selesai → Invoice maintenance**.

Prinsip utama: **AI membantu, manusia memutuskan.** Tidak ada deploy ke production tanpa persetujuan manusia.

---

## 2. Latar Belakang & Masalah

| # | Masalah saat ini | Dampak |
| --- | --- | --- |
| 1 | Klien melapor bug lewat telepon/WhatsApp tanpa format baku | Laporan hilang, konteks kurang, sulit dilacak |
| 2 | Perbaikan dikerjakan satu per satu tanpa alur persetujuan konsisten | Risiko regresi, kualitas tidak merata |
| 3 | Tidak ada satu tempat untuk status pekerjaan, jadwal, file, diskusi, tagihan | Progres sulit dijawab, koordinasi manual |
| 4 | Deal di CRM yang sudah closing tidak otomatis menjadi proyek | Input data ganda, proyek terlambat dimulai |
| 5 | Pembagian tim tidak terhubung dengan data HR (ketersediaan, peran) | Beban kerja tidak seimbang |
| 6 | Invoice dibuat manual dan terpisah dari pekerjaan yang selesai | Tagihan telat, tidak akurat |

---

## 3. Tujuan, Non-Tujuan, dan Metrik Sukses

### 3.1 Tujuan

1. Menjadi **single source of truth** untuk seluruh pekerjaan (fitur, revisi, bug, maintenance), baik manual maupun oleh agen AI.
2. Mengotomasi konversi **CRM Won → Project** lengkap dengan template modul/fitur.
3. Mempercepat deteksi & perbaikan bug tanpa mengorbankan keamanan dan kualitas kode.
4. Memberi **transparansi progres** (kapan status terakhir diperbarui) kepada internal dan klien.
5. Menyediakan jalur manual bagi programmer dengan **paket diagnostik** dari agen.
6. Menghubungkan pekerjaan selesai ke **invoice dan Finance** secara otomatis.

### 3.2 Non-Tujuan (di luar lingkup)

- Tidak ada deploy otomatis ke production tanpa persetujuan manusia.
- Tidak menjamin semua bug dapat diperbaiki otomatis; bug kategori *Hard* tetap butuh keputusan manusia.
- Tidak menggantikan kebutuhan test; project tanpa test dasar harus disiapkan dulu sebelum masuk jalur otomatis penuh.
- Bukan pengganti sistem akuntansi penuh (Finance hanya menerima invoice & status pembayaran).
- Bukan pengganti HRIS; hanya membaca data tim dari modul HR.

### 3.3 Metrik Sukses (usulan)

| Metrik | Target awal (6 bulan) |
| --- | --- |
| Waktu dari laporan bug → task terbuat | < 1 menit (otomatis) |
| Waktu rata-rata bug *Low* sampai PR siap review | < 30 menit |
| Persentase bug *Low/Medium* yang PR-nya disetujui tanpa revisi besar | ≥ 60% |
| Persentase laporan bug yang tercatat di sistem (bukan hanya di chat) | ≥ 95% |
| Regresi pasca-deploy dari perbaikan AI | < 5% |
| Waktu dari task selesai → invoice dibuat | < 1 hari kerja |
| Task dengan status terakhir diperbarui < 48 jam | ≥ 90% |

---

## 4. Persona & Peran (RBAC)

| Peran | Deskripsi | Hak akses utama |
| --- | --- | --- |
| **Owner / Admin** | Pemilik sistem | Semua akses, konfigurasi workflow, approve/reject PR AI, kelola billing |
| **Project Manager** | Mengelola proyek & tim | Buat/ubah proyek, assign tim, kelola sprint/timeline, buat invoice |
| **Developer** | Programmer internal/eksternal | Kerjakan task, ubah status, komentar, terima paket diagnostik, approve PR (jika diberi hak) |
| **QA / Tester** | Verifikasi hasil | Ubah status verifikasi, buat bug, lampirkan bukti |
| **Finance** | Keuangan | Lihat invoice, tandai terbayar, ekspor laporan |
| **Sales (CRM)** | Pemilik deal | Lihat status proyek hasil deal-nya (read-only) |
| **Klien** | Pelanggan | Lapor bug, lihat status & progres proyeknya, komentar publik, lihat/unduh invoice |
| **Agen AI (service account)** | Claude Code headless via MCP | Hanya tools MCP yang diizinkan; tidak bisa merge/deploy production |

Catatan: setiap peran bersifat **per project** (satu orang bisa PM di proyek A dan Developer di proyek B).

---

## 5. Alur Bisnis End-to-End

### 5.1 Alur A: Dari CRM ke Project

1. Sales menutup deal di CRM (misal: pembuatan sistem POS dengan banyak modul).
2. Status deal **Closing/Won** memicu pembuatan **Project** otomatis di PM (webhook/event).
3. Data otomatis terbawa: nama klien, nilai kontrak, lingkup/fitur, termin pembayaran, PIC klien, kode project (mis. `POS-KLN01`).
4. PM memilih **template project** (mis. POS: modul Kasir, Stok, Laporan, dst.). Setiap modul/fitur menjadi **Epic**, turunannya menjadi **Task**.
5. PM memilih **tim** dari data HR (peran, skill, ketersediaan), lalu memberi task ke anggota terpilih.
6. Setelah proposal/jadwal disetujui (ACC), tanggal pengerjaan masuk ke **Schedule** dan **Timeline**.
7. Pengerjaan berjalan lewat Kanban/Sprint dengan log aktivitas.
8. Setelah proyek/milestone selesai, **Invoice** dibuat dari task selesai, lalu dikirim ke **Finance**.

### 5.2 Alur B: Maintenance & Bug

Sesuai alur di draft awal, diperluas:

```
Laporan masuk (Web / WhatsApp / Sentry / Email)
  → Validasi & dedup (pengelompokan laporan serupa)
  → Task dibuat (tipe=bug, status=Baru, project terdeteksi)
  → Antre di Queue → status=Dianalisis
  → Agen: clone repo → analisis akar masalah → tentukan kategori (Low/Medium/Hard)
      • Bisa diperbaiki agen → patch minimal + test → PR dibuka → status=Menunggu Persetujuan
      • Hard / agen tidak yakin / programmer pilih manual → paket diagnostik + branch kerja
  → Notifikasi ke programmer (ringkasan, kategori, diff, hasil test)
  → Programmer: Setujui / Tolak / Perbaiki sendiri / Minta revisi ke agen
  → (Setujui) Merge PR → GitHub Actions: staging → (verifikasi) → production
  → Monitoring pasca-deploy → rollback otomatis bila error naik
  → status=Selesai → tercatat di task_events → dapat masuk Invoice / kuota maintenance
```

### 5.3 Alur C: Invoice

- **Invoice proyek:** dibuat saat milestone/proyek selesai, disusun dari task berstatus Selesai (atau dari termin kontrak CRM).
- **Invoice maintenance:** untuk proyek dengan kontrak maintenance di CRM; disusun dari tiket bug/revisi yang selesai pada periode tertentu (bulanan) atau dari jam kerja.
- Setelah dibuat dan disetujui PM, invoice otomatis masuk ke modul **Finance**; status pembayaran disinkronkan balik ke project.

---

## 6. Lingkup Fitur: Project Manager (setara Jira)

Legenda prioritas: **P0** = wajib MVP, **P1** = fase 2, **P2** = fase 3 / nice-to-have.

### 6.1 Struktur Pekerjaan

| Konsep | Deskripsi | Prioritas |
| --- | --- | --- |
| **Project** | Wadah pekerjaan; punya kode unik, klien, repo, tim, workflow, kontrak | P0 |
| **Epic** | Modul/fitur besar (mis. "Modul Kasir") | P0 |
| **Issue types** | Feature, Task, Bug, Revisi/Change Request, Subtask, Maintenance | P0 |
| **Subtask** | Pecahan task dengan assignee berbeda | P0 |
| **Linking** | Relasi: blocks, blocked by, relates to, duplicates, caused by | P1 |
| **Components** | Pengelompokan per modul/area kode | P1 |
| **Labels & Versions/Release** | Penandaan dan target rilis (fix version) | P1 |
| **Template project** | Template tipe proyek (POS, company profile, e-commerce) yang otomatis membuat epic & task standar | P1 |

Satu tabel `tasks` dengan kolom `type` untuk semua jenis pekerjaan (sesuai draft), plus `parent_id` untuk hierarki Epic → Task → Subtask.

### 6.2 Atribut Task

- Key unik (mis. `POS-123`), judul, deskripsi (rich text), tipe, status, prioritas.
- Reporter, assignee, reviewer/approver, watcher.
- Estimasi (jam/story point), waktu tercatat, due date, start date.
- Epic, sprint, versi rilis, label, komponen.
- Sumber (Web/WA/Sentry/Manual/AI), kategori kesulitan (Low/Medium/Hard), branch & PR terkait.
- Visibilitas: **Internal** atau **Dapat dilihat klien**.
- Custom fields per project (P2).

**Prioritas:** Hotfix / Tinggi / Sedang / Rendah (sesuai konsep draft: hotfix vs biasa).

### 6.3 Workflow & Status

Workflow dapat dikonfigurasi per project dan per tipe issue (P1). Default:

| Tipe | Alur status default |
| --- | --- |
| Feature / Task | Backlog → To Do → In Progress → In Review → QA/Testing → Selesai |
| Bug (manual) | Baru → Dikonfirmasi → In Progress → In Review → QA → Selesai |
| Bug (otomatis AI) | Baru → Dianalisis → Diperbaiki Agen / Perlu Manual → Menunggu Persetujuan → Disetujui → Deploy Staging → Deploy Production → Dipantau → Selesai |
| Status akhir lain | Ditolak, Dibatalkan, Duplikat |

Aturan workflow (P1): transisi yang diizinkan per peran, field wajib saat transisi (mis. wajib alasan saat Ditolak), validator (mis. tidak bisa Selesai bila PR belum merge), dan post-function (mis. otomatis komentar/notifikasi).

### 6.4 Tampilan & Navigasi

| Fitur | Deskripsi | Prioritas |
| --- | --- | --- |
| **Backlog** | Daftar task belum dijadwalkan, drag untuk prioritas dan masuk sprint | P0 |
| **Kanban board** | Kolom = status workflow; drag-and-drop; dipakai bersama task manual dan tiket bug AI; swimlane per assignee/prioritas/epic; batas WIP per kolom | P0 |
| **Sprint (Scrum)** | Rencana, mulai, selesai sprint; burndown; velocity; carry-over | P1 |
| **Timeline (Gantt)** | Task, epic, dependensi, milestone, dan schedule; drag untuk ubah tanggal | P0 |
| **Schedule / Kalender** | Deadline, meeting, jadwal rilis, cuti anggota (dari HR) | P0 |
| **Daftar / tabel** | Tampilan list dengan kolom konfigurabel dan edit inline | P0 |
| **Detail task** | Panel samping/halaman penuh: deskripsi, subtask, file, komentar, riwayat, relasi, PR | P0 |
| **Pencarian & filter** | Filter gabungan (project, status, assignee, prioritas, tipe, tanggal, label); **bahasa query sederhana (setara JQL)** | P1 |
| **Saved filter & view** | Simpan filter pribadi/bersama | P1 |
| **Dashboard** | Widget: beban kerja tim, bug terbuka per prioritas, progres epic, SLA, status AI | P1 |
| **My Work** | Halaman "tugas saya" lintas project | P0 |
| **Bulk edit** | Ubah banyak task sekaligus | P2 |

### 6.5 Tim & Resource (integrasi HR)

- Tarik daftar karyawan, peran, skill, dan status cuti dari modul HR (P0).
- PM memilih tim per project lalu mem-assign task ke anggota terpilih (P0).
- **Workload view**: beban jam per orang per minggu vs kapasitas; peringatan overload (P1).
- Saran assignee berdasarkan skill dan beban kerja (P2, bisa dibantu AI).
- Time tracking: timer/log manual per task; rekap per orang/project (P1).

### 6.6 Kolaborasi

| Fitur | Deskripsi | Prioritas |
| --- | --- | --- |
| **Text editor (rich text)** | Editor untuk deskripsi, komentar, dan dokumen: heading, list, tabel, code block, gambar, mention `@`, embed task `#POS-123`, markdown shortcut, autosave | P0 |
| **Komentar** | Per task, threaded, mention, internal vs publik (klien), edit/hapus dengan jejak | P0 |
| **Log aktivitas** | Otomatis: perubahan status, assignee, komentar agen AI, aksi sistem (task\_events) | P0 |
| **File** | Lampiran per project/task: dokumen, desain, screenshot bug; versi file; preview gambar/PDF | P0 |
| **Notifikasi** | In-app, email, WhatsApp; aturan per peran; ringkasan harian | P0 |
| **Wiki / dokumen project** | Halaman dokumentasi per project dengan editor yang sama | P2 |
| **Persetujuan (ACC)** | Alur approval formal untuk proposal, jadwal, dan change request (siapa, kapan, catatan) | P1 |

### 6.7 Automasi Aturan (seperti Jira Automation)

Aturan *trigger → kondisi → aksi*, dikonfigurasi admin/PM (P1). Contoh:

- Jika bug berprioritas Hotfix dibuat → notifikasi WA ke programmer on-call.
- Jika PR di-merge → pindahkan task ke Deploy Staging.
- Jika task melewati due date → beri label *Overdue* dan notifikasi PM.
- Jika semua subtask selesai → pindahkan parent ke In Review.
- Jika task Selesai dan tipe = Maintenance → tambahkan ke draft invoice bulanan.

### 6.8 SLA & Kontrak Maintenance (tambahan)

- SLA per prioritas: target waktu respons dan penyelesaian (mis. Hotfix respons < 1 jam).
- Penghitung SLA berjalan/terlewat, dengan jam kerja dan hari libur.
- Kuota maintenance dari CRM (jam/tiket per bulan) dengan indikator sisa kuota.
- Laporan SLA dan kepatuhan per klien.

---

## 7. Lingkup Fitur: Automation Fix Bug (AI)

### 7.1 Lima Pilar

| Pilar | Deskripsi |
| --- | --- |
| **Monitoring** | Deteksi error via Sentry (DSN unik per project, dipasang bertahap) dan laporan manual Web/WA |
| **Deploy** | CI/CD GitHub Actions: test otomatis pada PR, staging lalu production setelah disetujui, rollback otomatis jika error naik pasca-deploy |
| **Fix Bug** | Agen Claude Code headless: clone repo, analisis akar masalah, patch minimal, tulis/jalankan test, buka PR |
| **Manajemen Project** | Status task, prioritas, riwayat perubahan, terintegrasi Kanban |
| **Progres/Status Update** | Setiap perubahan status tercatat dengan waktu (task\_events) sehingga "progres terakhir" selalu akurat |

### 7.2 Klasifikasi Kesulitan

Ditentukan agen **sebelum** bekerja, dan dapat diubah manusia.

| Kategori | Kriteria | Perlakuan |
| --- | --- | --- |
| **Low (ringan)** | Tidak menyentuh data/auth/pembayaran; satu file/area; test mudah dibuat | Agen perbaiki otomatis → PR → 1x persetujuan |
| **Medium (sedang)** | Beberapa file, logika bisnis, masih dalam satu fitur | Agen perbaiki → PR dengan analisis dampak → 1x persetujuan + wajib hasil test hijau |
| **Hard (sulit)** | Migrasi database, pembayaran, autentikasi, akar masalah tidak pasti, atau berisiko merambat ke sistem lain | Agen hanya menyiapkan analisis/paket diagnostik; patch (jika ada) berstatus draft; **konfirmasi ganda** (dua orang atau dua langkah) |

Tambahan: setiap klasifikasi menyertakan **skor keyakinan** dan alasan; jika keyakinan rendah, otomatis naik ke *Hard*.

### 7.3 Jalur Perbaikan Manual

Jika programmer memilih memperbaiki sendiri, agen menyiapkan **paket diagnostik**:

- Ringkasan masalah dan langkah reproduksi.
- Lokasi kode terkait (file/baris) dan commit relevan.
- Log/stack trace, breadcrumb Sentry, jumlah dan frekuensi kejadian.
- Percobaan perbaikan sebelumnya dan hasilnya.
- Saran 2–3 opsi perbaikan beserta trade-off.
- Branch kerja siap pakai (`fix/POS-123-deskripsi`), tanpa memaksakan patch.

### 7.4 Aksi Reviewer pada PR AI

**Setujui · Tolak (dengan alasan) · Minta revisi ke agen (dengan catatan) · Perbaiki sendiri.** Semua aksi tercatat di task\_events. Alasan penolakan dipakai sebagai umpan balik untuk memperbaiki prompt/aturan agen (P2).

### 7.5 Kanal Masuk Laporan

| Kanal | Mekanisme | Akurasi project |
| --- | --- | --- |
| **Web dashboard / portal klien** | Form dengan dropdown project, tipe, prioritas, upload screenshot/video | Tertinggi |
| **WhatsApp** | Format wajib `#KODE-PROJECT deskripsi`; tanpa kode, bot bertanya balik; mendukung kirim gambar | Tinggi |
| **Sentry (otomatis)** | DSN unik per project; dedup berdasar fingerprint; ambang minimal frekuensi sebelum jadi task | Otomatis |
| **Email (P2)** | Alamat email per project yang diubah menjadi task | Sedang |

Tambahan: **deteksi duplikat** (laporan serupa digabung), **auto-acknowledge** ke pelapor ("laporan diterima, kode POS-123"), dan notifikasi status ke klien saat berubah.

### 7.6 Guardrail Keamanan AI (wajib)

- Agen bekerja di **sandbox/container terisolasi** dengan token repo yang dibatasi (hanya push ke branch `ai/*` atau `fix/*`).
- Agen **tidak punya akses** merge ke branch utama, deploy production, ataupun membaca secret produksi.
- Data sensitif (PII, kredensial) dimasking pada log/stack trace sebelum dikirim ke agen.
- Batas anggaran per task (waktu, jumlah token, jumlah percobaan); setelah batas, otomatis berhenti dan eskalasi ke manusia.
- Larangan mengubah file sensitif (CI config, secrets, migrasi) tanpa tandai *Hard*.
- Setiap aksi agen tercatat penuh (prompt ringkas, tools yang dipanggil, diff) untuk audit.
- Project tanpa test dasar ditandai **Belum siap otomasi penuh**; hanya jalur diagnostik.
- Mekanisme **kill switch** per project dan global untuk menghentikan seluruh aktivitas agen.

### 7.7 Deploy & Rollback

- PR memicu test otomatis (unit, lint, build).
- Merge → deploy staging → smoke test → persetujuan (untuk Hard: konfirmasi ganda) → production.
- Pasca-deploy dipantau jendela waktu (mis. 30 menit): jika error rate naik melewati ambang → **rollback otomatis**, task kembali ke status *Perlu Manual* disertai komentar sistem.
- Strategi deploy yang didukung diatur per project (SSH/VPS, container, platform hosting).

---

## 8. Integrasi

| Sistem | Arah | Data/Aksi | Prioritas |
| --- | --- | --- | --- |
| **CRM** | CRM → PM; PM → CRM | Deal Won → buat project; kontrak maintenance & kuota; status proyek balik ke CRM | P0 |
| **HR** | HR → PM | Karyawan, peran, skill, cuti, kapasitas | P0 |
| **Finance** | PM → Finance; Finance → PM | Invoice masuk; status pembayaran kembali | P0 |
| **GitHub** | Dua arah | Repo, branch, PR, status checks, webhook, GitHub Actions | P0 |
| **Sentry** | Sentry → PM | Event error → task bug otomatis | P0 |
| **WhatsApp (gateway)** | Dua arah | Terima laporan, kirim notifikasi dan status | P0 |
| **MCP server** | Agen ↔ PM | Tools terstruktur (lihat bagian 10) | P0 |
| **Email / SMTP** | PM → pengguna | Notifikasi, invoice | P1 |
| **Kalender (Google/Outlook)** | Dua arah | Sinkron schedule/meeting | P2 |
| **Slack/Telegram** | PM → tim | Notifikasi opsional | P2 |

---

## 9. Invoice

| Kebutuhan | Deskripsi | Prioritas |
| --- | --- | --- |
| Penyusunan dari task | Pilih task berstatus Selesai (belum ditagih) atau dari termin kontrak | P0 |
| Jenis invoice | Termin proyek, final, maintenance berkala, ad-hoc (bug di luar garansi/kuota) | P0 |
| Nomor & format | Penomoran otomatis, PPN/pajak, diskon, mata uang IDR | P0 |
| Ekspor | PDF dengan template/logo perusahaan | P0 |
| Alur persetujuan | Draft → Disetujui PM → Terkirim ke Finance → Terkirim ke klien → Dibayar/Jatuh tempo | P0 |
| Sinkron Finance | Invoice otomatis masuk modul Finance; status bayar kembali ke PM | P0 |
| Penanda ditagih | Task yang sudah ditagih ditandai agar tidak ditagih ganda | P0 |
| Garansi | Bug dalam masa garansi tidak ditagih (flag otomatis) | P1 |
| Pengingat jatuh tempo | Notifikasi otomatis ke klien/Finance | P1 |
| Portal klien | Klien melihat dan mengunduh invoice | P1 |

---

## 10. Antarmuka Teknis: MCP Server

Lapisan MCP menyediakan tools terstruktur agar agen AI dan Claude secara umum berinteraksi langsung dengan data sistem.

| Tool | Fungsi | Hak |
| --- | --- | --- |
| `list_projects`, `get_project` | Baca metadata project, repo, aturan | Baca |
| `list_tasks`, `get_task`, `search_tasks` | Baca task dan riwayat | Baca |
| `create_task`, `update_task` | Buat/ubah task (field terbatas) | Tulis terbatas |
| `update_task_status` | Ubah status sesuai transisi yang diizinkan workflow | Tulis terbatas |
| `set_difficulty` | Set kategori Low/Medium/Hard + alasan + keyakinan | Tulis |
| `add_comment` | Tambah komentar/log aktivitas agen | Tulis |
| `attach_file` | Lampirkan log/diagnostik | Tulis |
| `create_branch_and_pr` | Buat branch `ai/*` dan buka PR | Tulis terbatas |
| `prepare_diagnostic_package` | Susun paket diagnostik | Tulis |
| `get_error_events` | Ambil detail event Sentry | Baca |
| `list_team_members`, `get_workload` | Data tim dan beban kerja | Baca |
| `log_time` | Catat waktu kerja agen | Tulis |

Tool yang **sengaja tidak disediakan**: merge PR, deploy production, hapus data, ubah pengaturan keamanan, akses invoice.

Semua pemanggilan tools: terautentikasi, di-rate-limit, dan tercatat di audit log.

---

## 11. Model Data (ringkas)

| Entitas | Atribut kunci |
| --- | --- |
| `clients` | id, nama, kontak, ref\_crm\_id |
| `projects` | id, kode (unik), nama, client\_id, ref\_crm\_deal\_id, repo\_url, sentry\_dsn, status, nilai\_kontrak, tipe\_kontrak, garansi\_sampai, workflow\_id |
| `project_members` | project\_id, user\_id (dari HR), peran |
| `tasks` | id, key, project\_id, parent\_id, epic\_id, type, title, description, status, priority, difficulty, assignee\_id, reporter\_id, source, estimate, due\_date, start\_date, sprint\_id, visibility, billed\_invoice\_id |
| `task_events` | id, task\_id, actor (user/agent/system), event\_type, from\_value, to\_value, payload, created\_at |
| `task_links` | task\_id, linked\_task\_id, link\_type |
| `sprints` | id, project\_id, nama, tanggal\_mulai, tanggal\_selesai, goal, status |
| `workflows`, `workflow_transitions` | status, transisi, peran yang boleh, field wajib |
| `schedules` | id, project\_id, judul, jenis (deadline/meeting/rilis), mulai, selesai |
| `comments` | id, task\_id, author, body, is\_internal, parent\_id |
| `files` | id, project\_id, task\_id, nama, versi, storage\_path, uploader |
| `time_logs` | id, task\_id, user\_id, durasi, catatan, tanggal |
| `agent_runs` | id, task\_id, status, kategori, keyakinan, token\_used, durasi, pr\_url, log\_ref |
| `deployments` | id, project\_id, task\_id, env, commit, status, rollback\_of |
| `invoices`, `invoice_items` | nomor, project\_id, jenis, periode, subtotal, pajak, total, status, due\_date, ref\_finance\_id; item → task\_id |
| `sla_policies` | project\_id, prioritas, target\_respons, target\_selesai |
| `automation_rules` | trigger, kondisi, aksi, aktif |
| `notifications`, `audit_logs` | penerima, kanal, konten / aktor, aksi, objek |

---

## 12. Persyaratan Non-Fungsional

| Kategori | Persyaratan |
| --- | --- |
| **Keamanan** | Autentikasi (email+password, 2FA untuk Owner/PM), RBAC per project, enkripsi data in-transit dan at-rest, rahasia disimpan di secret manager, audit log tidak dapat diubah |
| **Privasi** | Pemisahan data antar klien; klien hanya melihat data proyeknya dan item bertanda publik; masking PII untuk agen |
| **Performa** | Halaman board/list < 2 detik untuk 5.000 task per project; pembaruan Kanban real-time |
| **Ketersediaan** | Target 99,5%; backup harian dengan uji pemulihan berkala |
| **Skalabilitas** | Queue untuk job agen; konkurensi agen dapat dibatasi; antrean prioritas (Hotfix didahulukan) |
| **Observabilitas** | Log terstruktur, metrik antrean/agen/deploy, alert jika agen atau integrasi gagal |
| **Keandalan integrasi** | Retry dengan backoff, idempotensi webhook, antrean kegagalan (dead-letter) |
| **Usability** | Responsif (mobile web), antarmuka Bahasa Indonesia (opsi Inggris), pintasan keyboard di board |
| **Aksesibilitas** | Kontras dan navigasi keyboard sesuai standar dasar WCAG |
| **Kepatuhan** | Mengikuti UU PDP; retensi data dan hak hapus data klien yang jelas |

---

## 13. Persyaratan Fungsional Kunci (User Stories)

| ID | Sebagai | Saya ingin | Agar | Prioritas |
| --- | --- | --- | --- | --- |
| FR-01 | PM | project otomatis terbuat saat deal CRM Won | tidak input ulang | P0 |
| FR-02 | PM | memilih tim dari data HR dan assign task | pembagian kerja tepat | P0 |
| FR-03 | Developer | melihat task saya di Kanban dan mengubah status | alur kerja jelas | P0 |
| FR-04 | Klien | melapor bug lewat WA dengan format sederhana | cepat tanpa telepon | P0 |
| FR-05 | Sistem | membuat task bug dari Sentry tanpa duplikat | tidak banjir tiket | P0 |
| FR-06 | Owner | menerima notifikasi PR AI dengan ringkasan, kategori, diff, hasil test | cepat memutuskan | P0 |
| FR-07 | Owner | menyetujui/menolak/minta revisi/perbaiki sendiri | kontrol penuh | P0 |
| FR-08 | Owner | konfirmasi ganda untuk bug Hard | mencegah insiden | P0 |
| FR-09 | Sistem | rollback otomatis jika error naik pasca-deploy | meminimalkan dampak | P0 |
| FR-10 | Developer | menerima paket diagnostik dan branch kerja | mempercepat perbaikan manual | P0 |
| FR-11 | Semua | mengetahui waktu status terakhir diperbarui | transparansi progres | P0 |
| FR-12 | Pengguna | memakai text editor kaya fitur untuk deskripsi dan komentar | dokumentasi jelas | P0 |
| FR-13 | PM | melihat Timeline/Gantt dan Schedule | memantau deadline | P0 |
| FR-14 | PM | membuat invoice dari task selesai dan mengekspor PDF | penagihan cepat | P0 |
| FR-15 | Finance | menerima invoice otomatis dan menandai pembayaran | proses rapi | P0 |
| FR-16 | PM | merencanakan sprint dan melihat burndown | pengiriman terukur | P1 |
| FR-17 | PM | membuat aturan automasi | mengurangi kerja manual | P1 |
| FR-18 | PM | memantau SLA dan kuota maintenance | memenuhi kontrak | P1 |
| FR-19 | Klien | melihat status laporan dan invoice di portal | tidak perlu menanyakan progres | P1 |
| FR-20 | PM | filter lanjutan dan dashboard | analisis kerja | P1 |

---

## 14. Roadmap Rilis

| Fase | Cakupan | Perkiraan |
| --- | --- | --- |
| **Fase 0 – Fondasi** | Auth & RBAC, project, task (satu tabel), status, task\_events, text editor, komentar, file | 4–6 minggu |
| **Fase 1 – MVP PM** | Kanban, backlog, schedule, timeline, integrasi HR, integrasi CRM (Won → Project), notifikasi, My Work | 4–6 minggu |
| **Fase 2 – Automation Fix Bug v1** | Web & WA intake, MCP server, agen untuk satu project percontohan (Low), PR + persetujuan, GitHub Actions staging/production | 6–8 minggu |
| **Fase 3 – Hardening & Invoice** | Sentry per project, klasifikasi Medium/Hard, rollback otomatis, paket diagnostik, invoice + sinkron Finance | 4–6 minggu |
| **Fase 4 – Setara Jira** | Sprint, workflow konfigurabel, automation rules, SLA, filter lanjutan, dashboard, portal klien, time tracking | 8–10 minggu |
| **Fase 5 – Optimasi** | Saran assignee AI, umpan balik penolakan → perbaikan agen, wiki, integrasi kalender, multi-programmer | berkelanjutan |

Strategi peluncuran bertahap: mulai dari **satu project internal/percontohan**, ukur metrik, lalu perluas ke project klien lain.

---

## 15. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Perbaikan AI menimbulkan regresi | Tinggi | Wajib test, persetujuan manusia, staging, rollback otomatis, kategori Hard dibatasi |
| Project klien tanpa test | Tinggi | Penilaian kesiapan; jalur diagnostik saja sampai test dasar tersedia |
| Biaya AI membengkak | Sedang | Batas token/waktu per task, antrean prioritas, dashboard biaya |
| Kebocoran data sensitif ke agen | Tinggi | Masking, sandbox, token minimum, tanpa akses secret produksi |
| Laporan WA tanpa kode/ambigu | Sedang | Bot bertanya balik, pencocokan nomor pelapor ke klien, form web sebagai jalur utama |
| Banjir tiket dari Sentry | Sedang | Dedup fingerprint, ambang frekuensi, grouping |
| Ketergantungan pada integrasi CRM/HR/Finance yang belum seragam | Sedang | Adapter/API contract jelas, fallback input manual |
| Cakupan "setara Jira" terlalu luas | Tinggi | Prioritas P0/P1/P2, rilis bertahap, fokus pada kebutuhan software house |
| Satu orang sebagai pengambil keputusan tunggal (bottleneck) | Sedang | Delegasi approver, aturan eskalasi, notifikasi ringkas |

---

## 16. Pertanyaan Terbuka

1. Catatan "**Setelah acc masuk hari**" di draft: apakah maksudnya setelah proposal/jadwal disetujui (ACC), tanggal otomatis masuk ke Schedule/Timeline? Mohon konfirmasi alur ACC dan siapa yang berhak.
2. Apakah CRM, HR, dan Finance adalah modul dalam satu aplikasi yang sama, atau sistem terpisah yang perlu integrasi API?
3. Apakah klien akan memiliki akun portal sendiri sejak MVP, atau cukup menerima notifikasi WA/email?
4. Model penagihan maintenance: kuota tiket, jam kerja, flat bulanan, atau per insiden?
5. Berapa lama masa garansi bug setelah proyek selesai, dan bagaimana aturan bug di luar garansi?
6. Stack teknologi proyek klien (framework, hosting) yang harus didukung agen pada tahap awal?
7. Siapa saja yang berhak menjadi approver PR AI, dan apakah konfirmasi ganda untuk Hard berarti dua orang berbeda?
8. Bahasa antarmuka dan dokumen untuk klien: Indonesia saja atau dwibahasa?
9. Apakah diperlukan hierarki multi-perusahaan/multi-tenant (beberapa brand/divisi)?

---

## Lampiran A: Ringkasan Penyempurnaan dari Draft Awal

| Area | Draft awal | Penambahan dalam PRD ini |
| --- | --- | --- |
| Struktur kerja | Task, Kanban | Epic, subtask, tipe issue, linking, komponen, versi rilis, template project |
| Workflow | Status bug otomatis | Workflow konfigurabel per tipe, validator, transisi per peran |
| Tampilan | Schedule, Timeline, Kanban | Backlog, sprint, burndown, My Work, dashboard, filter/query lanjutan |
| Tim | Pilih tim dari HR | Workload view, kapasitas, cuti, time tracking |
| Kolaborasi | Komentar, file, text editor | Mention, komentar internal vs publik, versi file, approval formal |
| Automasi | Pipeline bug AI | Automation rules umum, SLA, kuota maintenance |
| AI | Klasifikasi, PR, diagnostik | Skor keyakinan, guardrail, kill switch, batas biaya, audit penuh, umpan balik penolakan |
| Intake | Web, WA, Sentry | Dedup, auto-acknowledge, email, notifikasi ke klien |
| Invoice | Dari task selesai | Jenis invoice, garansi, penanda ditagih, sinkron status bayar, portal klien |
| Non-fungsional | Tidak ada | Keamanan, performa, observabilitas, kepatuhan UU PDP |
| Pengukuran | Tidak ada | Metrik sukses dan roadmap bertahap |
