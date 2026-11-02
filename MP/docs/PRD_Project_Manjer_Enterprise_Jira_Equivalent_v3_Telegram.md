# PRD — Project Manjer
## Enterprise Project Management, Delivery Operations & AI Bug Automation Platform

**Versi dokumen:** 3.0 (revisi kanal komunikasi Telegram)  
**Tanggal:** 28 Oktober 2026  
**Status:** Draft komprehensif untuk review produk, arsitektur, dan estimasi  
**Pemilik produk:** Product Owner / Owner Software House  
**Target pengguna:** Software house, digital agency, tim engineering internal, klien, QA, finance, dan operations  
**Referensi dasar:** PRD “Project Manjer – Project Management & Automation Fix Bug” versi 1.0, 16 Oktober 2026  
**Arsitektur utama:** Laravel API + MySQL + React.js  
**Bahasa awal:** Bahasa Indonesia; struktur mendukung lokalisasi bahasa Inggris

---

# 1. Ringkasan Eksekutif

Project Manjer adalah platform manajemen proyek dan delivery software house dengan kemampuan inti setara kelas Jira untuk kebutuhan perencanaan, eksekusi, pelacakan, kolaborasi, quality assurance, rilis, maintenance, dan pelaporan pekerjaan. Produk ini bukan sekadar papan Kanban: sistem menjadi *single source of truth* untuk seluruh siklus delivery dari deal CRM sampai pekerjaan selesai, terverifikasi, dirilis, dan ditagihkan.

Platform menggabungkan:

1. **Project & portfolio management** — proyek, issue, epic, subtask, backlog, board, sprint, timeline, milestone, release, dependency, dan kapasitas tim.
2. **Engineering workflow** — bug, feature, task, change request, code review, pull request, CI/CD, staging, deployment, monitoring, dan rollback.
3. **Kolaborasi dan knowledge management** — komentar, mention, file, dokumen, wiki, keputusan, meeting, notifikasi, dan audit trail.
4. **Automation engine** — aturan trigger–condition–action, SLA, eskalasi, notifikasi, workflow validator, dan pekerjaan terjadwal.
5. **AI Bug Automation** — laporan dari portal klien/Telegram Bot/Sentry, deduplikasi, analisis akar masalah, klasifikasi risiko, paket diagnostik, pembuatan branch/PR, pengujian, serta approval manusia.
6. **Resource management** — anggota tim, skill, availability, workload, time tracking, dan integrasi HR.
7. **Client portal** — klien dapat membuat tiket, melihat progres yang diizinkan, memberi komentar, menyetujui milestone, dan mengakses dokumen/invoice.
8. **CRM, kontrak, dan Finance integration** — deal Won menjadi proyek, kontrak maintenance dan kuota terbaca dari CRM, pekerjaan selesai dapat menjadi draft invoice, serta status pembayaran tersinkron.
9. **Reporting & analytics** — delivery health, throughput, cycle time, SLA, bug trends, sprint metrics, utilisasi, estimasi vs realisasi, dan biaya AI.

**Prinsip keselamatan:** AI adalah asisten, bukan pemegang keputusan akhir. AI tidak boleh merge ke branch utama, menyetujui dirinya sendiri, mengakses secret produksi, atau melakukan deployment production tanpa persetujuan manusia yang berwenang. Tindakan berisiko tinggi wajib melalui approval tambahan.

## 1.1 Alur utama

**Alur proyek baru**

`CRM Deal Won → Validasi data kontrak → Project dibuat → Template/struktur pekerjaan diterapkan → Tim & kapasitas ditetapkan → Rencana/schedule disetujui → Delivery → QA/UAT → Release → Milestone selesai → Draft invoice → Finance`

**Alur bug dan maintenance**

`Portal/Telegram Bot/Sentry/Email → Validasi & deduplikasi → Issue dibuat → Prioritas & SLA dihitung → Analisis AI/manual → Branch/PR atau paket diagnostik → Review manusia → CI checks → Staging → QA/approval → Production → Monitoring → Selesai → Kuota/invoice diperbarui`

## 1.2 Tujuan produk

- Mengurangi pekerjaan administratif dan duplikasi input.
- Memberikan status proyek dan pekerjaan yang akurat serta dapat diaudit.
- Membantu PM mengelola scope, jadwal, risiko, resource, dan komunikasi klien.
- Membuat alur issue konsisten dari intake sampai release.
- Mempercepat penanganan bug tanpa mengurangi keamanan dan kualitas.
- Menghubungkan pekerjaan dengan kontrak, SLA, kuota maintenance, dan invoice.
- Mendukung beberapa proyek, tim, klien, dan organisasi dengan kontrol akses yang jelas.

---

# 2. Latar Belakang dan Masalah

| Masalah | Dampak bisnis | Respons produk |
|---|---|---|
| Laporan bug tersebar di Telegram, telepon, dan chat | Informasi hilang, tidak terukur, sulit ditelusuri | Intake terpadu, auto-acknowledge, issue key, riwayat |
| Deal Won tidak otomatis menjadi proyek | Input ganda dan kickoff lambat | Integrasi CRM → project dengan idempotensi |
| Scope, task, jadwal, dan approval berada di tempat berbeda | Perubahan scope tidak terlacak | Project workspace terpadu, baseline, change request |
| Tidak ada gambaran kapasitas tim | Overload dan keterlambatan | Workload, availability, skill, capacity planning |
| Perbaikan bug tidak konsisten | Regresi, risiko production, kualitas tidak merata | Workflow, QA gate, CI/CD, approval dan rollback |
| Status proyek harus ditanyakan manual | PM dan developer terganggu | Client portal, notifikasi, status publik terkontrol |
| Pekerjaan selesai tidak langsung masuk penagihan | Invoice terlambat atau terlewat | Draft invoice dari milestone/task/maintenance |
| Metrik delivery tidak konsisten | Sulit meningkatkan proses | Dashboard, definisi metrik baku, audit trail |

---

# 3. Ruang Lingkup Produk

## 3.1 In-scope

- Multi-organization dan pemisahan data tenant.
- Portfolio, project, issue, epic, subtask, component, version, release, sprint, board, backlog, timeline, calendar.
- Workflow dan status yang dapat dikonfigurasi.
- Komentar, mention, attachment, activity log, dokumen proyek, wiki.
- Pencarian, filter, saved views, dashboard dan laporan.
- Resource planning, availability, workload, time tracking.
- Automation rules, SLA, escalation, notification.
- Client portal dan intake bug.
- AI-assisted bug analysis dan PR workflow dengan guardrail.
- Integrasi CRM, HR, Finance, GitHub, Sentry, Telegram Bot API, email, CI/CD, dan kalender bertahap.
- Invoice workflow operasional dan sinkron status ke Finance; bukan pengganti akuntansi penuh.
- Audit, security, observability, backup, dan administrasi.

## 3.2 Out-of-scope awal

- Menggantikan sistem akuntansi/ERP penuh.
- Menggantikan HRIS; modul ini membaca data HR atau menyimpan snapshot kapasitas yang diperlukan.
- Auto-merge atau auto-deploy production tanpa approval manusia.
- Menjamin AI dapat memperbaiki seluruh kategori bug.
- Menjadi source code hosting pengganti GitHub/GitLab.
- Menjadi alat desain UI penuh seperti Figma.
- Mengirim pesan Telegram melalui kanal tidak resmi yang melanggar ketentuan provider.
- Menyediakan payroll lengkap.

## 3.3 Prinsip produk

1. **Single source of truth:** semua pekerjaan memiliki ID, status, pemilik, riwayat, dan konteks proyek.
2. **Human-in-the-loop:** aksi kritis memiliki approval eksplisit.
3. **Least privilege:** user dan service account hanya mendapat hak minimum.
4. **Auditability:** perubahan penting tidak hanya menyimpan nilai terbaru, tetapi juga siapa, kapan, dan alasan.
5. **Tenant isolation:** data organisasi dan klien tidak boleh bocor lintas tenant.
6. **API-first:** integrasi tidak bergantung pada akses langsung ke database.
7. **Progressive delivery:** modul dirilis bertahap, dengan feature flag dan pilot project.
8. **Configurable, not infinitely customizable:** konfigurasi cukup fleksibel tetapi memiliki batas agar pemeliharaan sistem tetap realistis.

---

# 4. Persona, Peran, dan Hak Akses

## 4.1 Persona utama

| Persona | Kebutuhan utama |
|---|---|
| Owner / Organization Admin | Visibilitas seluruh bisnis, keamanan, konfigurasi, biaya, dan approval |
| Product Owner / Business Analyst | Scope, requirement, acceptance criteria, prioritas, dan traceability |
| Project Manager / Delivery Manager | Timeline, resource, dependency, risiko, komunikasi, dan status delivery |
| Scrum Master / Team Lead | Sprint, impediment, throughput, dan proses tim |
| Developer | My Work, task jelas, kode/PR, komentar teknis, dan waktu kerja |
| QA / Tester | Test evidence, bug, regression, UAT, dan release readiness |
| DevOps / Release Manager | Environment, deployment, monitoring, rollback, dan change control |
| Support / Maintenance | Intake, SLA, kuota, triage, dan komunikasi klien |
| Sales / CRM | Melihat proyek dari deal yang dimenangkan dan status delivery yang diizinkan |
| Finance | Draft invoice, approval, status pembayaran, dan ekspor |
| Client Admin / Client User | Melaporkan isu, mengikuti progres yang dipublikasikan, memberi feedback dan approval |
| AI Service Account | Menjalankan tools terbatas untuk analisis dan perubahan terkontrol |

## 4.2 Model otorisasi

Gunakan **RBAC + project-level membership + policy checks**. Role global tidak otomatis memberikan akses ke seluruh proyek, kecuali role organisasi yang memang berwenang.

### Role awal

- `organization_owner`
- `organization_admin`
- `portfolio_manager`
- `project_manager`
- `product_owner`
- `developer`
- `qa_tester`
- `release_manager`
- `support_agent`
- `sales_viewer`
- `finance_user`
- `client_admin`
- `client_user`
- `auditor`
- `ai_service_account`

## 4.3 Ketentuan akses

- Akses dibatasi berdasarkan organisasi, proyek, dan visibilitas issue/komentar.
- Klien hanya dapat melihat proyek yang menjadi miliknya serta konten yang ditandai untuk klien.
- Komentar internal tidak pernah tampil di portal klien, API klien, email publik, atau Telegram klien.
- AI service account tidak memiliki akses ke invoice, konfigurasi keamanan, secret produksi, merge, atau deploy production.
- Hak approval dan hak eksekusi dipisahkan untuk perubahan berisiko tinggi.
- Semua akses administratif, ekspor massal, approval, dan aksi AI tercatat di audit log.
- User yang dinonaktifkan tidak dapat login atau melakukan aksi baru; data historisnya tetap dipertahankan.

---

# 5. Arsitektur Informasi dan Navigasi

Navigasi utama aplikasi:

1. **Home / My Work**
2. **Portfolio**
3. **Projects**
4. **Issues**
5. **Boards**
6. **Backlog**
7. **Sprints**
8. **Timeline / Gantt**
9. **Calendar / Schedule**
10. **Releases & Deployments**
11. **Service Desk / Bug Intake**
12. **AI Fix Queue**
13. **Workload & Capacity**
14. **Time Tracking**
15. **Reports & Dashboards**
16. **Automation Rules**
17. **SLA & Maintenance**
18. **Client Portal**
19. **Documents / Wiki**
20. **Invoices & Finance Sync**
21. **Integrations**
22. **Administration / Settings**
23. **Audit Log**

Menu ditampilkan berdasarkan permission. Project workspace memiliki subnavigasi konsisten: Overview, Board, Backlog, Issues, Timeline, Calendar, Releases, Documents, Reports, Settings.

---

# 6. Modul Fungsional

## 6.1 Identity, Organization, Tenant, dan User Management

### Tujuan
Mengelola organisasi, user, keanggotaan, keamanan login, serta batas data.

### Fitur
- Buat organisasi dan pengaturan dasar.
- Undang user melalui email, aktivasi, suspend, dan deactivation.
- Login email/password; dukungan SSO/OIDC dapat menjadi fase lanjutan.
- MFA/2FA wajib bagi Owner/Admin dan disarankan untuk PM/Release Manager.
- Password reset, session list, revoke session, dan perangkat aktif.
- Role global, role per proyek, permission matrix, dan custom role terbatas.
- Pengelolaan grup/tim dan default project access.
- Kebijakan password, session timeout, login throttling, dan proteksi brute force.
- Pengelolaan zona waktu, locale, format tanggal, mata uang, dan jam kerja.
- Tenant-level feature flags dan konfigurasi retensi.

### Acceptance criteria
- User tenant A tidak dapat mengakses data tenant B meskipun mengetahui ID record.
- Endpoint backend selalu melakukan authorization server-side; menyembunyikan tombol di UI bukan kontrol keamanan.
- Perubahan role langsung berlaku pada request berikutnya.
- Aksi login gagal dan perubahan hak akses tercatat.

## 6.2 Portfolio Management

### Tujuan
Memberikan gambaran lintas proyek, program, klien, dan unit delivery.

### Fitur
- Portfolio dan program yang mengelompokkan project.
- Portfolio owner, sponsor, target bisnis, budget opsional, dan status kesehatan.
- Roll-up progress dari milestone/epic dengan aturan agregasi yang dapat dijelaskan.
- Portfolio roadmap dan timeline lintas project.
- Risk register dan issue eskalasi.
- Perbandingan planned vs actual dates.
- Filter berdasarkan client, PM, status, health, priority, dan periode.
- Portfolio dashboard: proyek on-track/at-risk/blocked, kapasitas, milestone terlambat.
- Snapshot status berkala untuk laporan manajemen.

### Aturan
- Progress agregat tidak boleh sekadar merata-ratakan persentase task tanpa aturan; metode perhitungan ditetapkan per project (weight by estimate, milestone completion, atau manual).
- Status health memiliki alasan dan timestamp.

## 6.3 Project Management

### Data proyek
- Project key unik per organisasi, misalnya `POS`, `HRIS`, atau `WEB`.
- Nama, deskripsi, tipe, client, CRM deal, kontrak, project owner, PM, tanggal mulai/target selesai.
- Status: Draft, Planning, Active, On Hold, At Risk, Completed, Archived, Cancelled.
- Visibility: internal / client-visible.
- Repo, default branch, environments, Sentry project, deployment strategy.
- Workflow, issue type scheme, permission scheme, notification scheme.
- Kalender kerja, hari libur, zona waktu, SLA policy.
- Budget/contract value opsional dan aturan invoicing.
- Project health, risk, dependency, dan change log.

### Siklus hidup
1. Project dibuat manual atau dari event CRM Deal Won.
2. Validasi mapping client, kontrak, PIC, scope, dan kode proyek.
3. Pilih template project atau mulai kosong.
4. Tentukan tim dan akses.
5. Susun roadmap, epic, milestone, dan estimasi.
6. Setujui baseline jadwal/scope bila dibutuhkan.
7. Jalankan delivery dan pantau perubahan.
8. Selesaikan acceptance, release, handover, invoice, dan arsip.

### Project template
- POS / inventory
- HRIS
- E-commerce
- Company profile
- Custom web application
- Maintenance
- Bug-fix retainer
- Internal product

Template dapat berisi issue types, workflow, epic, task standar, komponen, label, milestone, checklist release, dashboard, dan automation rule. Penerapan template harus menampilkan preview sebelum dibuat.

## 6.4 Work Item / Issue Management

### Issue types default
- Epic
- Story / Feature
- Task
- Bug
- Change Request
- Maintenance
- Spike / Research
- Test
- Sub-task
- Support Request
- Incident
- Release Task

Organisasi dapat mengaktifkan tipe tambahan secara terkontrol.

### Atribut issue
- ID internal dan key tampilan unik (contoh `POS-123`).
- Project, issue type, summary/title, rich-text description.
- Status, priority, severity, resolution, labels, component, fix version.
- Reporter, assignee, reviewer, approver, watchers.
- Parent, epic, sprint, release, milestone.
- Estimate (story point/jam), remaining estimate, logged time.
- Start date, due date, target release, created/updated/resolved timestamps.
- Source: Manual, Portal, Telegram Bot, Sentry, Email, API, AI, Automation.
- Visibility: Internal / Client-visible.
- Difficulty: Low / Medium / Hard untuk alur AI bug.
- Environment, reproduction steps, expected/actual result.
- Acceptance criteria, test evidence, root cause, resolution notes.
- Related branch, commit, PR, build, deployment, invoice item.
- Custom fields sesuai field scheme proyek.

### Hierarki
`Portfolio/Program (opsional) → Project → Epic → Story/Task/Bug → Sub-task`

- Parent-child hierarchy harus memvalidasi siklus dan batas level.
- Issue link bukan hierarki; relasi link mendukung blocks, is blocked by, relates to, duplicates, caused by, cloned from.
- Penghapusan issue menggunakan soft delete/archiving sesuai kebijakan; key issue tidak boleh dipakai ulang.

### Perilaku detail issue
- Halaman detail memiliki tab: Overview, Activity, Subtasks, Links, Development, Test/QA, Attachments, Time Tracking, Approvals, dan History sesuai permission.
- Edit inline dengan validasi.
- Komentar threaded, mention, emoji/reaction opsional.
- Watch/unwatch, assign to me, clone, move, link, create subtask.
- Perubahan status melalui transisi workflow, bukan perubahan status bebas.
- Field wajib dan alasan wajib diterapkan saat transisi tertentu.
- Riwayat perubahan menampilkan actor, waktu, nilai lama/baru, dan sumber aksi.

### Acceptance criteria
- Setiap issue memiliki satu project dan key unik.
- Transisi ilegal ditolak oleh backend meski request dibuat langsung.
- Klien tidak menerima data internal lewat endpoint atau notifikasi.
- Pengubahan assignee/status menghasilkan event audit/activity.
- Perubahan yang berasal dari integrasi aman terhadap webhook duplikat.

## 6.5 Workflow & Status Configuration

### Workflow default
**Feature/Task:** Backlog → To Do → In Progress → In Review → QA/Testing → Ready for Release → Done  
**Bug manual:** New → Triaged → Confirmed → In Progress → In Review → QA → Done  
**Bug AI:** New → Analyzing → Agent Working / Needs Manual → Awaiting Approval → Approved → Deploying Staging → Staging Verification → Awaiting Production Approval → Monitoring → Done  
**Status akhir alternatif:** Rejected, Cancelled, Duplicate, Won't Fix, Cannot Reproduce, Deferred.

### Konfigurasi
- Workflow dapat dipetakan per project dan issue type.
- Transition memiliki role/permission yang boleh menjalankan.
- Validator: required fields, linked PR, passing checks, test evidence, approval, resolution.
- Post-functions: assign, notify, create linked task, update parent, trigger automation.
- Kondisi: hanya jika issue memiliki field tertentu, waktu tertentu, atau permission tertentu.
- Draft workflow harus diuji di simulator sebelum dipublikasikan.
- Perubahan workflow tidak boleh membuat issue aktif tidak memiliki status valid; sediakan mapping status lama ke status baru.

### Aturan penting
- Issue tidak dapat Done jika checklist wajib, QA, atau approval release belum terpenuhi sesuai tipe issue.
- Perubahan workflow dipublikasikan dengan versioning dan audit.
- Status yang ditampilkan ke klien dapat dipetakan dari status internal melalui public status mapping.

## 6.6 Boards: Kanban, Scrum, dan Custom Board

### Kanban board
- Default view board adalah Kanban.
- Kolom memetakan status workflow; drag-and-drop memicu transisi valid.
- Swimlane berdasarkan epic, assignee, priority, issue type, atau query.
- WIP limit per kolom dengan indikator pelanggaran.
- Quick filters: assigned to me, unassigned, high priority, overdue, bugs, blocked.
- Card menampilkan key, title, priority, assignee avatar, due date, estimate, labels, epic, dan indikator PR.
- Quick create, inline assign, inline priority, dan keyboard navigation.
- Filter dan urutan dapat disimpan sebagai personal/shared view.
- Board harus tetap responsif pada ribuan issue melalui pagination/virtualization.

### Scrum board
- Sprint backlog, sprint planning, sprint goal, start/end sprint.
- Move issue ke sprint, estimasi, kapasitas, dan peringatan overcommitment.
- Sprint report, burndown/burnup, velocity, carry-over, completed vs committed.
- Closing sprint memerlukan pilihan penanganan issue yang belum selesai.
- History sprint disimpan dan tidak diubah ketika issue dipindahkan setelah sprint ditutup.

### Custom board
- Board dapat memakai filter/query tersimpan.
- Kolom berdasarkan status atau kelompok status yang diizinkan.
- Board memiliki owner, visibility, dan permission.
- Board configuration memiliki versioning.

## 6.7 Backlog, Sprint, dan Agile Planning

### Backlog
- Daftar issue yang belum dijadwalkan.
- Drag reorder untuk prioritas.
- Epic panel dan filter.
- Bulk add to sprint dan bulk estimate.
- Prioritization fields: priority, rank, target date, business value opsional.
- Capacity warning sebelum memindahkan item ke sprint.

### Sprint
- Sprint name, goal, start date, end date, status.
- Draft → Active → Completed.
- Sprint hanya satu yang aktif per board secara default; konfigurasi multi-sprint harus eksplisit.
- Sprint commitment snapshot disimpan ketika sprint dimulai.
- Burndown memakai definisi scope yang terdokumentasi.
- Velocity dihitung dari sprint selesai dan dapat difilter per team/board.
- Tidak menganggap velocity sebagai ukuran performa individu.

## 6.8 Timeline, Gantt, Milestone, dan Dependency

- Timeline per project dan portfolio.
- Menampilkan project, epic, task, milestone, release, dan dependency.
- Drag untuk mengubah tanggal hanya bagi user berizin; perubahan tanggal menampilkan dampak dependency.
- Dependency types: finish-to-start sebagai default, plus start-to-start, finish-to-finish, start-to-finish bila diperlukan.
- Deteksi circular dependency.
- Baseline planned dates dan perbandingan dengan actual dates.
- Critical path dapat menjadi fase lanjutan.
- Milestone memiliki owner, due date, acceptance criteria, approval, dan status.
- Peringatan ketika predecessor terlambat atau dependency memblokir pekerjaan.
- Schedule dapat menampilkan meeting, release, cuti, dan hari libur jika integrasi HR/calendar aktif.

## 6.9 Calendar & Schedule

- Tampilan month/week/day dan agenda.
- Jenis event: meeting, deadline, milestone, sprint, release, deployment window, cuti, maintenance window.
- Buat meeting dengan peserta, agenda, link Google Meet/Teams, catatan, dan action items.
- Integrasi Google Calendar/Outlook fase lanjutan.
- Sinkronisasi harus memiliki aturan konflik dan idempotensi.
- Deadline berasal dari issue/project dan bukan salinan bebas yang mudah tidak sinkron.
- Zona waktu ditampilkan sesuai preferensi user, disimpan konsisten dalam UTC.
- Notifikasi pengingat configurable.

## 6.10 Release, Version, dan Deployment Management

### Release/version
- Version name, target date, release notes, scope issues, status.
- Status: Unreleased, Planned, In Progress, Released, Archived.
- Release readiness checklist: QA, approval, changelog, migration plan, backup, rollback plan, komunikasi klien.
- Issue dapat memiliki fix version dan affected version.

### Deployment
- Environment: development, test, staging, production, atau environment custom.
- Catat commit SHA, branch, build ID, initiator, timestamp, status, approval, logs, dan rollback reference.
- Integrasi GitHub Actions sebagai jalur awal.
- Production deployment wajib melewati gate approval manusia.
- Untuk kategori Hard, diperlukan konfirmasi ganda dari dua approver berbeda atau dua langkah eksplisit yang disetujui policy.
- Rollback otomatis hanya berjalan jika strategi rollback telah diuji dan policy proyek mengizinkan.
- Deployment gagal mengubah status deployment dan memberi notifikasi; issue tidak boleh otomatis Done.
- Post-deployment monitoring memakai jendela observasi dan ambang yang dapat dikonfigurasi.

## 6.11 Development Integration: GitHub / GitLab

### Git integration
- Hubungkan repo ke project dan branch default.
- Tautkan branch, commit, PR/MR, build status, review, dan deployment ke issue key.
- Webhook diverifikasi signature/token, dideduplikasi, dan diproses asynchronous.
- Konvensi branch contoh: `feature/POS-123-short-description`, `fix/POS-123-short-description`, `ai/POS-123-short-description`.
- PR checks: unit test, lint, static analysis, build, dan security scan sesuai pipeline.
- Menampilkan status checks dan review state di issue detail.
- Merge event dapat memicu transisi ke staging hanya sesuai workflow.
- Tidak menyimpan personal access token dalam plaintext; gunakan secret manager/encrypted storage.
- Token memiliki scope minimum dan dapat dicabut.

## 6.12 QA, Testing, dan UAT

- Test plan per release/project.
- Test cases dengan preconditions, steps, expected result, actual result, status, tester, dan evidence.
- Test run: Not Run, Passed, Failed, Blocked, Skipped.
- Link test case ke issue, requirement, release, dan bug.
- Bug dapat dibuat dari test failure dengan konteks otomatis.
- QA gate mengharuskan test evidence sesuai policy.
- UAT checklist dan sign-off klien untuk milestone yang membutuhkan acceptance formal.
- Regression suite dapat ditautkan ke release.
- Catatan QA internal tidak otomatis ditampilkan ke klien.
- Hasil test otomatis disimpan sebagai build/test artifact reference.

## 6.13 Service Desk, Bug Intake, dan Maintenance

### Kanal intake
- Portal klien/form web.
- Telegram Bot API resmi.
- Sentry.
- Email-to-issue pada fase yang ditentukan.
- Manual/internal.
- API dari sistem eksternal.

### Form laporan bug
- Client/project yang terdeteksi dari identitas Telegram yang sudah di-link dan diverifikasi, atau pilihan proyek yang telah diotorisasi.
- Summary, deskripsi, kategori, severity, URL/halaman terdampak.
- Langkah reproduksi, expected result, actual result.
- Browser/device/environment, waktu kejadian, frekuensi.
- Screenshot/video/log attachment.
- Dampak bisnis dan jumlah pengguna terdampak.
- Persetujuan pemrosesan data bila diperlukan.

### Triage
- Validasi autentikasi dan akses project.
- Deduplikasi berdasar fingerprint, judul, stack trace, dan konteks.
- Deteksi spam/rate limit.
- Tentukan issue type, priority, severity, component, reporter, dan SLA.
- Jika data tidak cukup, bot meminta klarifikasi; issue dapat dibuat dengan status Needs Information.
- Auto-acknowledge berisi issue key dan estimasi waktu respons berdasarkan SLA, bukan janji penyelesaian yang tidak terverifikasi.

### Telegram Bot dan komunikasi klien
- Pesan masuk dikaitkan ke client/contact dan project hanya melalui identitas Telegram yang sudah di-link dan diverifikasi atau melalui mapping chat/project yang disetujui admin.
- Jika user belum terhubung, bot memandu proses linking via portal dan kode sekali pakai yang kedaluwarsa; jangan mengandalkan display name atau username sebagai bukti identitas.
- AI dapat menyusun jawaban, tetapi respons otomatis hanya untuk intent yang diizinkan dan confidence memenuhi threshold. Jawaban faktual tentang status issue harus mengambil data terkini dari API Project Manjer.
- Kasus pembayaran, keamanan, akses akun, data sensitif, komplain serius, permintaan perubahan scope, approval formal, dan permintaan yang tidak jelas dieskalasikan ke manusia.
- Bot dapat membuat issue/tiket, meminta informasi reproduksi tambahan, memberi issue key, menampilkan status yang boleh dilihat, dan mengirim notifikasi event sesuai preferensi pengguna.
- Setiap perintah memeriksa authorization di server untuk setiap request; chat ID atau keberadaan dalam group tidak otomatis memberi akses ke data project.
- Group/supergroup hanya aktif jika di-enable oleh admin project; batasi command yang tersedia, hindari membocorkan informasi lintas klien, dan dokumentasikan efek privacy mode.
- Simpan Telegram update/message ID, timestamp, delivery status bila tersedia, consent/linking state, dan correlation ID. Jangan menyimpan isi percakapan melebihi kebutuhan operasional dan kebijakan retensi.
- Sediakan `/human` untuk eskalasi, `/help` untuk bantuan, `/status` untuk status tiket yang terotorisasi, serta `/unlink` untuk memutus akun.
- Pesan harus meminimalkan data pribadi. Jangan mengirim secret, stack trace sensitif, komentar internal, token, atau detail kerentanan ke klien.
- Untuk tindakan sensitif, arahkan pengguna ke portal web dengan sesi autentikasi yang sesuai; Telegram chat bukan bukti approval legal/finansial kecuali ada rancangan e-signature terpisah yang memenuhi ketentuan.

## 6.14 AI Bug Automation

### Tujuan
Membantu diagnosis dan perbaikan bug secara terkontrol, dengan manusia tetap memegang keputusan berisiko.

### Alur
1. Issue bug masuk dan lolos validasi.
2. Deduplikasi dan klasifikasi awal.
3. Cek project readiness: repo, test suite, environment, permission, dan konfigurasi AI.
4. Masuk antrean sesuai prioritas dan SLA.
5. Agen menganalisis reproduksi, log, stack trace, perubahan kode terkait, dan akar masalah.
6. Agen menetapkan Low/Medium/Hard beserta confidence score dan alasan.
7. Low/Medium: agen dapat mengusulkan patch minimal, menambah/menjalankan test, membuat branch dan PR.
8. Hard, confidence rendah, perubahan sensitif, atau batas biaya tercapai: jalur diagnostik saja atau eskalasi.
9. Reviewer memilih Approve, Reject, Request Revision, atau Fix Manually.
10. CI checks, staging deployment, QA, approval production, monitoring, dan rollback sesuai policy.
11. Semua langkah dicatat dalam agent run dan issue activity.

### Klasifikasi
- **Low:** risiko rendah, area terbatas, tidak menyentuh auth/pembayaran/data sensitif, test dapat dibuat/dijalankan.
- **Medium:** beberapa file atau logika bisnis dalam satu fitur, membutuhkan analisis dampak dan test hijau.
- **Hard:** autentikasi, otorisasi, pembayaran, migrasi database, data sensitif, infrastruktur, secret/CI config, perubahan lintas sistem, akar masalah tidak jelas, atau confidence rendah.

Jika kategori atau confidence tidak pasti, sistem harus menaikkan risiko, bukan menurunkannya.

### Paket diagnostik manual
- Ringkasan masalah, langkah reproduksi, impact, root-cause hypothesis.
- Stack trace/log yang telah dimasking.
- File dan baris relevan, commit terkait, hasil pencarian kode.
- Percobaan sebelumnya dan hasilnya.
- 2–3 opsi solusi, trade-off, risiko regresi.
- Saran test dan branch kerja jika aman.
- Tidak menyertakan secret atau PII yang tidak diperlukan.

### Guardrails wajib
- Eksekusi di sandbox/container terisolasi.
- Token repo hanya untuk scope repo dan branch yang diizinkan.
- Agen tidak dapat merge, approve, deploy production, mengubah permission, atau mengakses secret produksi.
- Masking PII, credentials, tokens, dan data sensitif pada prompt/log.
- Budget per run: durasi, token, jumlah percobaan, ukuran diff, dan file sensitif.
- File sensitif otomatis memicu Hard/approval khusus.
- Kill switch global dan per project.
- Audit lengkap atas prompt teredaksi, tools, file yang dibaca/diubah, diff, test result, PR, dan biaya.
- Project tanpa test dasar hanya boleh menjalankan diagnostic-only mode sampai readiness disetujui.
- AI output diperlakukan sebagai input tidak tepercaya; instruksi yang ditemukan di issue, repository, log, atau halaman web tidak boleh mengubah policy sistem.
- Secret tidak boleh dicetak ke output model atau log.
- Tidak ada auto-merge atau auto-production deployment.

### Agent run state
Queued → Running → Needs Human Input / Diagnostic Ready / PR Opened → Awaiting Review → Revision Requested / Rejected / Approved → CI Running → Staging → Awaiting QA / Production Approval → Monitoring → Completed / Failed / Aborted.

### Kegagalan dan retry
- Retry hanya untuk kegagalan transient dan harus idempotent.
- Batas retry, timeout, token budget, dan biaya diberlakukan.
- Kegagalan berulang masuk dead-letter queue dan membuat alert.
- Hasil parsial tetap disimpan sebagai diagnostic package.
- Tidak boleh membuat PR duplikat untuk run yang sama tanpa pemeriksaan.

## 6.15 Automation Rules Engine

### Model aturan
`Trigger → Conditions → Actions → Guardrails → Audit`

### Trigger
- Issue created/updated/status changed.
- Priority/severity changed.
- Due date approaching/overdue.
- Comment/mention created.
- PR opened/merged/check failed.
- Release/deployment event.
- Sprint started/completed.
- SLA threshold reached.
- Semua subtask selesai.
- Invoice eligibility berubah.
- Webhook dari sistem terhubung.

### Conditions
- Project, issue type, status, label, priority, assignee, client, source, waktu, SLA state, release, dan field lain yang diizinkan.
- Kondisi harus dievaluasi server-side dan memiliki batas kompleksitas.

### Actions
- Assign user/role.
- Change status/priority/label.
- Add comment.
- Send notification.
- Create linked issue/subtask.
- Set due date.
- Trigger agent diagnostic (bukan bypass approval).
- Add eligible work to invoice draft.
- Call approved webhook.
- Escalate to manager/on-call.

### Guardrails
- Dry-run/simulation sebelum aktivasi.
- Versioning, enable/disable, audit, owner, dan test event.
- Loop detection, recursion limit, idempotency key, rate limit.
- Aturan tidak boleh melewati permission, workflow validator, approval, atau AI safety gate.
- Setiap aksi gagal harus terlihat dan dapat di-retry oleh operator berwenang.

## 6.16 SLA & Maintenance Contract

- SLA policy per client/project, priority/severity, jam kerja, hari libur, dan zona waktu.
- Target response time dan resolution time dipisah.
- SLA pause rules eksplisit, misalnya menunggu informasi klien, hanya jika kontrak mengizinkan.
- SLA timer mencatat business elapsed time, paused time, breach time, dan alasan pause.
- Eskalasi pada 50%, 75%, 90%, dan breach dapat dikonfigurasi.
- Kontrak maintenance: flat monthly, kuota jam, kuota tiket, atau per-incident.
- Masa kontrak, periode tagihan, jam/tiket included, carry-over policy, overage rate, garansi, dan excluded scope.
- Dashboard kuota: used, reserved, available, projected usage.
- Task yang ditagihkan tidak boleh ditagih ulang.
- Bug dalam masa garansi mengikuti aturan kontrak; pengecualian harus memiliki alasan dan approval.
- SLA report per client/project/priority dan histori breach.

## 6.17 Resource & Capacity Management

- Membaca karyawan, role, skill, status aktif, availability, cuti, dan kalender dari HR.
- Project membership dan peran per proyek.
- Capacity per anggota per minggu berdasarkan jam kerja dikurangi cuti/holiday.
- Workload view berdasarkan estimate, remaining estimate, dan time log.
- Warning untuk overload, task tanpa assignee, dan konflik jadwal.
- Saran assignee berdasarkan skill, availability, workload, dan project permission.
- Saran AI bersifat rekomendasi dan tidak otomatis mengubah assignment tanpa policy.
- PM dapat membuat allocation plan per project.
- Data HR yang disalin disimpan seminimal mungkin dan sinkronisasi mencatat timestamp.
- Jika integrasi HR gagal, tampilkan waktu data terakhir diperbarui dan sediakan fallback manual berizin.

## 6.18 Time Tracking

- Manual worklog dan timer start/stop opsional.
- Worklog berisi issue, user, tanggal, durasi, deskripsi, billable flag, dan approval state.
- Time estimate, remaining estimate, original estimate, dan logged time dipisah.
- Time zone dan aturan pembulatan dapat dikonfigurasi.
- Edit/delete worklog dibatasi dan diaudit.
- PM dapat menyetujui time log untuk kebutuhan billing.
- Report per user, project, client, issue, billable/non-billable, dan periode.
- AI agent time/cost dicatat terpisah dari jam kerja manusia.
- Jangan menganggap durasi timer sebagai bukti produktivitas individu.

## 6.19 Collaboration & Communication

### Komentar dan activity
- Komentar threaded, mention `@user`, link issue key, dan markdown/rich text.
- Internal/public visibility dengan default internal.
- Edit/hapus mengikuti permission; perubahan tetap memiliki audit trail.
- Activity stream menggabungkan status, assignment, field changes, komentar, file, approval, PR, deployment, dan agent events.
- Filter activity berdasarkan tipe.

### Notifikasi
- In-app notification center.
- Email/SMTP.
- Telegram Bot untuk notifikasi dan komunikasi klien yang telah menghubungkan akun/chat serta memberikan persetujuan sesuai kebijakan.
- Digest harian/mingguan.
- Preferensi per user dan per event.
- Notification template mendukung locale dan public/internal content separation.
- Dedup notifikasi untuk event berulang.
- Delivery status dan retry untuk provider yang mendukung.

### Meeting & decision log
- Jadwal meeting, peserta, agenda, link video conference, notulen, keputusan, dan action items.
- Action item dapat menjadi issue.
- Integrasi kalender pada fase lanjutan.
- Keputusan scope/arsitektur penting dapat ditautkan ke project dan issue.

## 6.20 Files, Documents, Wiki, dan Knowledge Base

- Attachment di project, issue, comment, test, release, dan client portal.
- Metadata file, ukuran, MIME type, uploader, timestamp, checksum, versi, visibility, dan retention.
- File storage di object storage/private storage; akses melalui signed URL berumur pendek.
- Scan malware untuk upload sesuai kemampuan infrastruktur.
- Validasi file type dan ukuran; jangan percaya MIME type dari client.
- Preview gambar/PDF dengan kontrol akses.
- Version history untuk dokumen yang diperbarui.
- Wiki page, folder/space, parent-child pages, search, labels, owner, revision history.
- Template: project brief, architecture decision record, runbook, onboarding, release notes, postmortem.
- Dokumentasi internal tidak boleh otomatis terbuka ke klien.
- Retensi dan penghapusan file mengikuti kebijakan tenant/kontrak.

## 6.21 Search, Query, Saved Filters, dan Bulk Operations

### Search
- Search issue key, title, description, comment (sesuai permission), project, client, dan dokumen.
- Filter berdasarkan project, status, issue type, priority, assignee, reporter, label, component, sprint, release, due date, source, SLA, dan field lain yang diizinkan.
- Sort dan pagination server-side.

### Query language
Fase lanjutan menyediakan bahasa query sederhana setara konsep JQL, misalnya:

`project = POS AND status = "In Progress" AND assignee = currentUser() ORDER BY priority DESC`

- Parser harus menggunakan grammar/AST yang aman, bukan mengeksekusi SQL dari input.
- Field/operator/function didaftarkan secara eksplisit.
- Query mematuhi permission dan tenant isolation.
- Query invalid memberi pesan error yang menjelaskan posisi kesalahan.
- Saved filters dapat bersifat personal atau shared dengan permission.
- Subscription filter dapat mengirim ringkasan berkala.

### Bulk operations
- Bulk edit, assign, transition, label, move sprint, dan export.
- Preview jumlah item dan dampak sebelum eksekusi.
- Validasi per issue; hasil partial success dilaporkan per item.
- Aksi massal yang berisiko membutuhkan konfirmasi tambahan.
- Rate limit dan batas jumlah item per operasi.

## 6.22 Dashboards & Reporting

### Dashboard standar
- Executive portfolio overview.
- Project health.
- Sprint dashboard.
- Team workload.
- Bug and incident trends.
- SLA and maintenance.
- Release/deployment health.
- AI agent queue, success rate, cost, and failure.
- Time tracking and billing eligibility.

### Widget
- Filter result list.
- Issue count by status/priority/type.
- Created vs resolved chart.
- Cumulative flow diagram.
- Burndown/burnup.
- Velocity.
- Cycle time/lead time distribution.
- Aging work in progress.
- Epic/milestone progress.
- Overdue and blocked items.
- SLA at risk/breached.
- Deployment frequency/failure/rollback.
- AI PR acceptance and regression metrics.
- Maintenance quota usage.
- Invoice-ready work.

### Definisi metrik
- **Lead time:** dari issue created sampai Done, dengan batas status yang terdokumentasi.
- **Cycle time:** dari mulai In Progress sampai Done.
- **Throughput:** jumlah issue selesai per periode dan filter.
- **Velocity:** estimasi yang selesai per sprint; tidak digunakan untuk membandingkan individu.
- **SLA compliance:** issue yang memenuhi target dibagi issue eligible yang selesai/diukur.
- **AI acceptance rate:** PR AI yang diterima tanpa perubahan besar sesuai definisi yang dapat diaudit.
- **Regression rate:** deployment AI-associated yang menimbulkan regresi terkonfirmasi dalam jendela pengamatan.
- Dashboard harus menunjukkan filter, periode, timezone, waktu data terakhir diperbarui, dan definisi metrik.

## 6.23 Client Portal

- Login klien dengan akses terbatas per organisasi/proyek.
- Ringkasan proyek, milestone, status issue yang dipublikasikan, release notes, dokumen publik, dan invoice yang diizinkan.
- Buat bug/support request, upload evidence, balas komentar publik, dan pantau status.
- Approval milestone/UAT/change request bila kontrak mengharuskan.
- Public status mapping agar status internal tidak bocor.
- Client users tidak melihat issue internal, komentar internal, estimasi biaya internal, worklog privat, agent prompts, secret, atau repo privat.
- Audit semua tindakan klien.
- Portal harus responsif dan mendukung accessibility dasar.

## 6.24 CRM Integration

- Deal Won/Closing yang memenuhi kondisi menghasilkan project draft atau active sesuai konfigurasi.
- Field mapping: CRM deal ID, client ID, contract value, scope, PIC, dates, payment terms, maintenance plan, warranty, currency.
- Idempotency berdasarkan source event ID/deal ID; event berulang tidak membuat proyek duplikat.
- Validasi data wajib; event tidak lengkap masuk integration exception queue.
- Project menyimpan referensi CRM dan timestamp sinkronisasi terakhir.
- Status project/milestone yang disetujui dapat disinkronkan kembali ke CRM.
- Perubahan kontrak/scope memicu review/change request, bukan overwrite diam-diam.
- Jika CRM tidak tersedia, admin berizin dapat membuat project manual dan menautkannya kemudian.

## 6.25 HR Integration

- Sinkronisasi karyawan, role, skill, status aktif, availability, cuti, dan hari libur.
- Data sync memiliki status, error, last sync, dan retry.
- Mapping external employee ID ke user ID internal.
- Perubahan status karyawan tidak menghapus attribution dari issue/worklog historis.
- Konflik mapping masuk ke exception queue.
- Modul Project Manjer tidak boleh mengubah data payroll atau HR inti kecuali integrasi secara eksplisit mengizinkannya.

## 6.26 Finance & Invoice Integration

### Jenis invoice
- Termin proyek.
- Milestone.
- Final project.
- Maintenance bulanan.
- Ad-hoc / out-of-scope bug.
- Overage kuota maintenance.

### Alur
Draft → PM Review → Approved → Sent to Finance → Issued/Sent to Client → Partially Paid/Paid/Overdue/Cancelled.

### Fitur
- Draft invoice dari termin kontrak, milestone selesai, atau task eligible.
- Invoice item: deskripsi, referensi issue/milestone, quantity, unit, unit price, discount, tax, subtotal, total.
- Nomor invoice unik dan sequence per organisasi.
- Mata uang default IDR; dukungan currency tambahan melalui konfigurasi.
- Pajak dan diskon mengikuti konfigurasi organisasi dan aturan finance; jangan hardcode asumsi pajak.
- PDF menggunakan template/logo organisasi.
- Due date, payment terms, notes, client billing details.
- Penanda billed mencegah penagihan ganda.
- Credit note/cancel/reissue mengikuti policy dan audit.
- Finance menjadi sumber status pembayaran; status kembali ke project.
- Invoice yang telah diterbitkan tidak diedit langsung tanpa proses koreksi.
- Portal klien hanya menampilkan invoice yang ditujukan ke klien tersebut.
- Sistem bukan buku besar akuntansi penuh; Finance tetap sistem of record untuk accounting/payment.

## 6.27 Integration Hub

### Integrasi prioritas
- CRM ↔ Project Manjer.
- HR → Project Manjer.
- Project Manjer ↔ Finance.
- GitHub/GitLab ↔ Project Manjer.
- Sentry → Project Manjer.
- Telegram Bot API ↔ Project Manjer (webhook, command, notification, dan issue intake).
- Email/SMTP → notifikasi.
- Google Calendar/Outlook fase lanjutan.
- Slack opsional; Telegram Bot API menjadi kanal komunikasi utama yang direncanakan.
- MCP server untuk AI agent.

### Standar integrasi
- Adapter per provider; Telegram menggunakan adapter Bot API tersendiri dan tidak mengasumsikan fitur kanal komunikasi lain tersedia.
- Credential encrypted dan secret manager bila tersedia.
- Signature verification dan allowlist bila relevan.
- Idempotency key, retry with exponential backoff, dead-letter queue, replay tool.
- Correlation ID dan structured logs.
- Mapping external IDs.
- Rate limit dan circuit breaker.
- Health status, last successful sync, error details yang telah disanitasi.
- Versioning API dan webhook.
- Manual fallback untuk integrasi yang tidak tersedia.
- Data dari webhook diperlakukan sebagai input tidak tepercaya.

## 6.28 MCP Server / AI Tool Gateway

### Tools read
- `list_projects`
- `get_project`
- `list_issues`
- `get_issue`
- `search_issues`
- `get_issue_events`
- `get_error_events`
- `list_team_members`
- `get_workload`
- `get_project_readiness`

### Tools write terbatas
- `create_issue`
- `update_issue_fields`
- `transition_issue`
- `set_difficulty`
- `add_comment`
- `attach_diagnostic_file`
- `prepare_diagnostic_package`
- `create_branch_and_pr`
- `log_agent_time`

### Tools yang dilarang untuk agent
- Merge PR.
- Approve PR/release.
- Deploy production.
- Delete project/issue/data.
- Read or change secrets.
- Change roles, permissions, integrations, or safety settings.
- Access invoice/payment details.
- Disable audit logging or kill switch.

Semua tool harus memiliki schema input yang ketat, authorization, validation, rate limit, audit record, dan response yang tidak mengungkap data di luar scope.

## 6.29 Administration & Configuration

- Organization settings.
- Project settings.
- User, group, role, permission scheme.
- Issue type scheme, field scheme, screen scheme.
- Workflow/status/transition scheme.
- Notification scheme.
- Priority, severity, resolution, labels, components, versions.
- Board and sprint settings.
- Automation rule administration.
- SLA and working calendar.
- Integration credentials and webhook endpoints.
- AI policy, project readiness, budget, kill switch.
- Invoice numbering and templates.
- Data retention and export.
- Audit log viewer.
- Feature flags dan release configuration.

Perubahan konfigurasi sensitif harus menyimpan before/after, actor, timestamp, reason, dan version.

---

# 7. Business Rules Lintas Modul

1. Deal Won tidak boleh membuat project duplikat jika webhook dikirim ulang.
2. Project key dan issue key tidak boleh berubah setelah dipublikasikan, kecuali melalui prosedur migrasi terkontrol.
3. Setiap status change harus melewati workflow transition dan authorization.
4. Klien hanya melihat konten yang explicitly client-visible.
5. Semua AI action harus terkait ke issue dan agent run.
6. AI tidak boleh mengubah status langsung melewati approval gate.
7. Production deployment wajib memiliki approver manusia yang berwenang.
8. Kategori Hard memerlukan approval tambahan sesuai policy.
9. Issue Done tidak otomatis berarti invoice diterbitkan; harus memenuhi aturan kontrak dan billing eligibility.
10. Issue yang telah ditagihkan tidak dapat masuk invoice lain tanpa credit/rebill workflow.
11. Penghapusan/arsip tidak boleh menghapus histori audit.
12. Webhook duplikat tidak boleh membuat duplikasi issue, komentar, deployment, atau invoice.
13. Semua timestamp disimpan konsisten dalam UTC; UI menampilkan zona waktu user/project.
14. Integrasi gagal harus terlihat di integration health dan dapat di-retry oleh role berwenang.
15. Data sensitif pada prompt/log AI harus diminimalkan dan dimasking.
16. Otomasi tidak boleh mem-bypass permission, workflow validators, SLA policy, atau approval.
17. Perubahan scope setelah baseline membutuhkan Change Request atau rekam keputusan formal.
18. Estimasi, actual time, dan billable time merupakan data berbeda.
19. Status agregat project harus dapat ditelusuri ke milestone/issue yang mendasarinya.
20. Data dari client, repository, log, dan issue dianggap untrusted input.

---

# 8. Alur End-to-End

## 8.1 CRM Won → Project Delivery

1. CRM mengirim event Deal Won.
2. Integration Hub memverifikasi signature, schema, dan idempotency key.
3. Sistem memetakan client/deal dan memvalidasi scope/kontrak.
4. Jika lengkap, project dibuat dalam status Draft/Planning; jika tidak, masuk exception queue.
5. PM meninjau template, scope, timeline, milestone, dan tim.
6. Project template membuat epic/task dan checklist sesuai konfigurasi.
7. PM menetapkan baseline dan meminta approval bila dibutuhkan.
8. Task dikerjakan lewat board/backlog/sprint.
9. QA menjalankan test dan UAT sesuai acceptance criteria.
10. Release manager memverifikasi checklist dan approval.
11. Deployment dilakukan lewat pipeline terkontrol.
12. Milestone/kontrak memenuhi kondisi billing, draft invoice dibuat.
13. PM menyetujui draft; Finance menerbitkan dan mengelola pembayaran.
14. Status project dan milestone yang relevan tersinkron ke CRM.

## 8.2 Bug masuk → AI → PR → Production

1. Laporan masuk melalui portal, Telegram, Sentry, email, atau internal.
2. Sistem memvalidasi sumber dan izin pelapor.
3. Deduplikasi dan mapping project dilakukan.
4. Issue dibuat/di-update; reporter menerima acknowledgement yang aman.
5. Priority, severity, SLA, dan routing ditentukan.
6. AI readiness check berjalan.
7. Agen menganalisis dan memberi difficulty/confidence.
8. Low/Medium yang eligible menghasilkan patch dan PR; Hard menghasilkan diagnostic package atau draft patch.
9. Reviewer manusia menilai ringkasan, diff, test, risiko, dan kategori.
10. PR melewati CI checks.
11. Deploy staging dan smoke/regression test berjalan.
12. QA/approver menyetujui release; Hard membutuhkan approval tambahan.
13. Production deploy dijalankan pipeline yang memiliki otorisasi terpisah.
14. Monitoring mendeteksi kenaikan error; rollback berjalan hanya bila aman dan diaktifkan.
15. Issue ditandai Done setelah verifikasi.
16. Jam/kuota/eligibility billing diperbarui dan audit trail lengkap tersimpan.

## 8.3 Change Request

1. Klien/internal mengajukan perubahan scope.
2. BA/PM mencatat deskripsi, alasan, dampak, prioritas, dan acceptance criteria.
3. Sistem membuat estimasi dampak terhadap biaya, effort, dependency, jadwal, dan kontrak.
4. PM meminta approval klien/internal sesuai kontrak.
5. Jika disetujui, baseline/scope diperbarui dan issue dibuat/diaktifkan.
6. Jika ditolak, CR ditutup dengan alasan dan tetap dapat diaudit.
7. Perubahan tidak boleh diam-diam mengubah nilai kontrak atau tanggal baseline.

## 8.4 Maintenance dan Invoice Bulanan

1. Tiket maintenance ditautkan ke kontrak dan periode billing.
2. SLA dan kuota dihitung berdasarkan policy kontrak.
3. Time log/ticket eligible dikumpulkan.
4. Sistem membuat preview pemakaian kuota dan draft invoice.
5. PM/Finance memeriksa pengecualian, garansi, overage, dan duplikasi.
6. Draft disetujui dan diserahkan ke Finance.
7. Status invoice/payment disinkronkan kembali.
8. Laporan periode ditutup dengan audit trail.

---

# 9. Persyaratan Fungsional dan Acceptance Criteria

| ID | Persyaratan | Prioritas | Acceptance criteria ringkas |
|---|---|---|---|
| FR-001 | Authentication & RBAC | P0 | Endpoint memvalidasi user, tenant, role, dan project membership |
| FR-002 | Project CRUD & lifecycle | P0 | Project memiliki key unik, status, owner, client, dan audit trail |
| FR-003 | Issue CRUD & hierarchy | P0 | Issue key unik; parent-child tervalidasi; issue link mendukung relasi |
| FR-004 | Workflow transition | P0 | Transisi ilegal dan field wajib yang kosong ditolak backend |
| FR-005 | Kanban board | P0 | Drag/drop hanya sukses untuk transisi valid; board dapat difilter |
| FR-006 | List/table view | P0 | Pagination, sorting, filter, dan edit inline berizin |
| FR-007 | My Work | P0 | User melihat issue lintas project sesuai permission |
| FR-008 | Activity/audit | P0 | Perubahan penting mencatat actor, waktu, source, before/after |
| FR-009 | Comments/files | P0 | Komentar internal/public dipisahkan; attachment memakai access control |
| FR-010 | Schedule/timeline | P0 | Milestone/deadline tampil dengan timezone yang benar |
| FR-011 | CRM Won → Project | P0 | Webhook idempotent; exception terlihat dan bisa diperbaiki |
| FR-012 | HR team sync | P0 | Mapping employee dan last sync/error tersedia |
| FR-013 | GitHub/CI | P0 | PR/check/deployment dapat ditautkan ke issue dengan webhook terverifikasi |
| FR-014 | Bug intake web/WA | P0 | Issue dibuat, acknowledgement dikirim, ambiguity dieskalasi |
| FR-015 | AI diagnostic package | P0 | Paket diagnostik menyertakan bukti yang dimasking dan audit run |
| FR-016 | AI PR workflow | P0 | Agent hanya membuat branch/PR; tidak dapat merge/deploy production |
| FR-017 | Human approval | P0 | Approval tercatat dan gate tidak dapat dilewati melalui API |
| FR-018 | Sentry intake/dedup | P0 | Event fingerprint dapat dikelompokkan sesuai threshold |
| FR-019 | Invoice draft | P0 | Task tidak ditagih ganda; finance status dapat disinkronkan |
| FR-020 | Notifications | P0 | Preferensi kanal, retry, dan delivery state tersedia |
| FR-021 | Sprint management | P1 | Sprint planning/start/complete dan report tersedia |
| FR-022 | Automation rules | P1 | Trigger-condition-action memiliki dry-run, audit, dan loop guard |
| FR-023 | SLA & maintenance | P1 | Business time, pause reason, breach, dan kuota dihitung konsisten |
| FR-024 | Advanced query | P1 | Parser aman, error jelas, permission diterapkan |
| FR-025 | Dashboards | P1 | Metrik memiliki definisi, filter, periode, dan data freshness |
| FR-026 | Client portal | P1 | Klien hanya melihat data publik proyeknya |
| FR-027 | Time tracking | P1 | Worklog dapat dicatat, disetujui, dilaporkan, dan diaudit |
| FR-028 | Bulk operations | P2 | Preview, per-item result, permission, dan audit tersedia |
| FR-029 | Wiki/knowledge base | P2 | Version history dan access control tersedia |
| FR-030 | Assignee recommendation | P2 | Saran mempertimbangkan skill/capacity dan tidak auto-assign tanpa policy |

---

# 10. Non-Functional Requirements (NFR)

## 10.1 Performance

Target awal, harus divalidasi lewat load testing:
- P95 API read umum ≤ 500 ms untuk query yang terindeks pada beban target.
- P95 board/list load ≤ 2 detik untuk project dengan 5.000 issue pada konfigurasi produksi yang disepakati.
- Perubahan Kanban tercermin ke user lain secara real-time atau near-real-time, target ≤ 3 detik.
- Upload file mendukung ukuran yang ditentukan admin dan menggunakan storage streaming/direct upload bila diperlukan.
- Query berat, report, export, dan AI jobs berjalan asynchronous.

## 10.2 Availability & Recovery

- Target availability awal 99,5% per bulan, tidak termasuk maintenance terjadwal yang diumumkan.
- Backup database otomatis minimal harian; frekuensi lebih tinggi untuk kebutuhan RPO.
- Restore test berkala dan dokumentasi disaster recovery.
- Target RPO/RTO final ditetapkan setelah sizing infrastruktur; rekomendasi awal: RPO ≤ 24 jam, RTO ≤ 8 jam untuk MVP.
- Queue dan webhook harus dapat dipulihkan setelah worker restart.
- Integrasi eksternal gagal tidak boleh menghentikan fungsi inti project/issue.

## 10.3 Security

- HTTPS/TLS untuk semua trafik.
- Encryption at rest untuk storage yang mendukung; secret di secret manager/encrypted storage.
- MFA untuk role sensitif.
- Rate limiting, brute-force protection, CSRF/XSS/SQL injection protections, secure headers.
- Authorization server-side untuk setiap resource.
- File upload validation dan malware scanning bila tersedia.
- Signed URL singkat untuk file privat.
- Webhook signature validation, replay protection, idempotency.
- Dependency scanning, static analysis, patching, dan secret scanning pada CI.
- Audit log append-only secara logis; akses edit dibatasi.
- Tidak menaruh secret atau data sensitif dalam URL, log, atau prompt AI.
- Uji keamanan mencakup tenant isolation dan IDOR/BOLA.

## 10.4 Privacy & Compliance

- Mengikuti ketentuan perlindungan data yang berlaku, termasuk UU PDP Indonesia bila relevan.
- Data minimization dan purpose limitation.
- Retention policy per kategori data.
- Alur export, koreksi, dan penghapusan data sesuai kewajiban hukum/kontrak.
- Pemisahan data internal vs client-visible.
- Data yang dikirim ke penyedia AI harus diminimalkan, dimasking, dan sesuai kontrak/consent.
- Kebijakan pemrosesan data provider AI ditinjau sebelum production.

## 10.5 Observability

- Structured logs dengan correlation ID, request ID, tenant ID yang aman, dan trace ID.
- Metrics untuk API latency, error rate, queue lag, webhook failures, AI cost, agent run duration, CI/deploy status, SLA breach.
- Alert untuk queue macet, integrasi gagal, error rate naik, backup gagal, dan budget AI terlampaui.
- Dashboard operasi internal.
- Log sensitif disanitasi dan retensi log dikonfigurasi.

## 10.6 Usability & Accessibility

- Responsive web untuk desktop/tablet/mobile.
- Bahasa Indonesia default dan fondasi i18n.
- Keyboard navigation, focus state, kontras, label form, dan error message yang jelas.
- Board menyediakan shortcut yang dapat ditemukan dan dinonaktifkan.
- Aksi destruktif/berisiko memiliki confirmation dan penjelasan dampak.
- UI tidak mengandalkan warna saja untuk status/prioritas.

---

# 11. Arsitektur Teknis

## 11.1 Stack yang ditetapkan

### Backend
- **Laravel** sebagai REST API backend.
- Laravel Sanctum untuk SPA authentication atau mekanisme OIDC/SSO jika kebutuhan organisasi mengharuskan.
- Laravel Policies/Gates untuk authorization.
- Laravel Queue untuk job asynchronous.
- Laravel Scheduler untuk tugas terjadwal.
- Laravel Events/Listeners untuk domain events.
- OpenAPI untuk dokumentasi API.

### Database
- **MySQL** sebagai transactional database.
- Redis direkomendasikan untuk queue/cache/locks/rate limiting, bukan sebagai sumber data utama.
- Object storage (S3-compatible atau storage privat) untuk attachment.
- Search engine khusus dapat ditambahkan jika kebutuhan pencarian melampaui kemampuan MySQL.

### Frontend
- **React.js** dengan TypeScript direkomendasikan.
- React Router untuk routing.
- Query/cache layer (misalnya TanStack Query) untuk server state.
- Form validation dan schema validation konsisten.
- UI component system/design tokens yang terstandar.
- Real-time menggunakan WebSocket/SSE sesuai kebutuhan dan infrastruktur.

### AI/worker
- AI orchestration sebagai worker/service terisolasi; tidak menjalankan agent code execution di web request.
- MCP server terpisah dengan tools terbatas dan autentikasi service-to-service.
- Sandbox/container ephemeral untuk operasi repository.
- Provider AI dapat dikonfigurasi; Claude Code headless adalah integrasi awal sesuai dokumen sumber.
- CI/CD dan deploy melalui GitHub Actions atau runner yang disetujui.

## 11.2 Logical architecture

```text
React SPA
   |
   | HTTPS / API
   v
Laravel API -------------------- Identity / RBAC / Tenant Policies
   |         |          |
   |         |          +------ Integration Hub / Webhooks
   |         +----------------- Domain Services / Workflow Engine
   |
   +---- MySQL (system of record)
   +---- Redis (cache, queue, locks, rate limits)
   +---- Object Storage (private files)
   +---- Queue Workers / Scheduler
               |
               +---- Notification Worker
               +---- CRM/HR/Finance Sync Worker
               +---- GitHub/Sentry/Telegram Webhook Worker
               +---- AI Orchestrator → Sandbox → Branch/PR
               +---- Reporting/Export Worker
```

## 11.3 Architectural principles

- Modular monolith Laravel pada fase awal agar transaksi dan domain logic konsisten; pisahkan worker/service saat kebutuhan skala atau isolasi keamanan menuntut.
- Domain boundaries: Identity, Organization, Portfolio, Projects, Issues, Workflow, Planning, Collaboration, Integrations, AI Automation, SLA, Billing, Reporting.
- Controller tipis; validasi di request/schema; business rules di application/domain services.
- Gunakan database transaction untuk operasi yang mengubah beberapa record terkait.
- Gunakan transactional outbox/event pattern untuk event penting yang harus dipublikasikan konsisten.
- Gunakan idempotency key untuk webhook dan aksi eksternal.
- Jangan membolehkan frontend mengakses database langsung.
- Semua integrasi memakai API/adapter; tidak ada shared database cross-system.
- Feature flag untuk rollout bertahap.

## 11.4 API conventions

- Prefix versi: `/api/v1`.
- JSON request/response konsisten.
- Pagination standar: cursor atau page/limit; tetapkan satu pola per endpoint family.
- Error envelope berisi `code`, `message`, `details`, `request_id`.
- Timestamp ISO 8601 UTC.
- Idempotency-Key untuk operasi yang dapat menghasilkan side effect.
- OpenAPI spec diperbarui bersama perubahan API.
- Rate limit per user, tenant, service account, dan endpoint sensitif.
- Webhook event memiliki event ID, type, created_at, source, schema version, dan payload.
- API tidak mengungkap apakah resource tenant lain ada ketika akses ditolak.

## 11.5 Real-time updates

- Real-time hanya untuk event yang berhak dilihat user.
- Broadcast channel diotorisasi server-side.
- Fallback polling bila koneksi real-time gagal.
- Event payload tidak mengandung data internal yang tidak diperlukan.
- Reconnect tidak menyebabkan event/action duplikat.

## 11.6 Queue & background jobs

Job asynchronous:
- Webhook processing.
- Notification delivery.
- AI analysis and test execution.
- File processing/virus scanning.
- PDF invoice/export.
- Reports and analytics.
- HR/CRM/Finance sync.
- Sentry event grouping.
- SLA timer evaluation.
- Scheduled reminders.

Setiap job memiliki retry policy, timeout, idempotency, failure logging, dan dead-letter handling.

---

# 12. Model Data Konseptual

Model berikut adalah baseline konseptual, bukan migrasi database final. Nama tabel dapat disesuaikan saat technical design; relasi, audit, dan tenant boundary wajib dipertahankan.

## 12.1 Identity & organization
- `organizations`: id, name, slug, timezone, locale, settings_json, status.
- `users`: id, name, email, password_hash/identity_ref, status, locale, timezone.
- `organization_members`: organization_id, user_id, status, joined_at.
- `roles`, `permissions`, `role_permissions`, `user_roles`.
- `project_members`: project_id, user_id, role_id, access_level.
- `teams`, `team_members`, `skills`, `user_skills`.
- `sessions`/identity provider tables sesuai implementasi.

## 12.2 Portfolio & projects
- `portfolios`: organization_id, key, name, owner_id, status, health.
- `programs`: portfolio_id, key, name, owner_id.
- `projects`: organization_id, key, name, client_id, crm_deal_id, owner_id, pm_id, status, start_date, target_end_date, workflow_scheme_id, permission_scheme_id, settings_json.
- `project_repositories`: project_id, provider, external_repo_id, repo_url, default_branch, credential_ref.
- `project_environments`: project_id, name, type, deployment_config_ref, enabled.
- `project_baselines`: project_id, version, scope_snapshot, schedule_snapshot, approved_by, approved_at.
- `milestones`: project_id, name, due_date, owner_id, status, acceptance_criteria.
- `project_risks`: project_id, title, impact, probability, mitigation, owner_id, status.

## 12.3 Issues & planning
- `issues`: id, organization_id, project_id, issue_key, parent_id, epic_id, issue_type_id, title, description, status_id, priority_id, severity_id, resolution_id, reporter_id, assignee_id, reviewer_id, estimate, remaining_estimate, start_date, due_date, visibility, source, difficulty, custom_fields_json, created_at, updated_at, resolved_at, archived_at.
- `issue_types`, `issue_statuses`, `issue_priorities`, `issue_resolutions`.
- `issue_links`: source_issue_id, target_issue_id, link_type.
- `issue_labels`, `labels`.
- `components`, `issue_components`.
- `versions`, `issue_fix_versions`, `issue_affected_versions`.
- `issue_watchers`.
- `issue_events`: issue_id, actor_type, actor_id, event_type, before_json, after_json, source, correlation_id, created_at.
- `comments`: issue_id, parent_comment_id, author_id, body, visibility, edited_at, deleted_at.
- `attachments`: organization_id, project_id, issue_id, storage_key, filename, mime_type, size, checksum, visibility, uploaded_by.
- `boards`, `board_columns`, `board_filters`, `board_swimlanes`.
- `sprints`, `sprint_issues`, `sprint_snapshots`.
- `workflows`, `workflow_statuses`, `workflow_transitions`, `workflow_validators`, `workflow_versions`.
- `saved_filters`, `query_subscriptions`.
- `time_logs`: issue_id, user_id, started_at, duration_seconds, work_date, description, billable, approval_status.

## 12.4 QA, release & deployment
- `test_plans`, `test_cases`, `test_steps`, `test_runs`, `test_results`, `test_evidence`.
- `releases`: project_id, version_id, name, status, target_date, released_at, release_notes.
- `release_issues`.
- `deployments`: project_id, issue_id, release_id, environment, commit_sha, status, initiated_by, approved_by, started_at, finished_at, rollback_of_id, metadata_json.
- `deployment_approvals`.
- `monitoring_events`.

## 12.5 AI & integrations
- `agent_runs`: issue_id, provider, model_ref, status, difficulty, confidence, token_usage, cost_estimate, started_at, finished_at, pr_url, log_ref, failure_code.
- `agent_run_events`: agent_run_id, event_type, sanitized_payload, created_at.
- `diagnostic_packages`: issue_id, agent_run_id, storage_ref, created_by, visibility.
- `integration_connections`: organization_id, provider, status, credential_ref, config_json, last_sync_at.
- `integration_mappings`: provider, external_id, internal_type, internal_id.
- `webhook_events`: provider, external_event_id, event_type, received_at, processed_at, status, payload_ref, error_code.
- `integration_failures`: provider, correlation_id, retry_count, next_retry_at, status.
- `automation_rules`, `automation_rule_versions`, `automation_runs`, `automation_run_actions`.
- `sla_policies`, `sla_instances`, `sla_events`.
- `maintenance_contracts`, `maintenance_periods`, `maintenance_usage`.

## 12.6 Collaboration, documents, notification
- `project_documents`, `wiki_spaces`, `wiki_pages`, `wiki_revisions`.
- `meetings`, `meeting_attendees`, `meeting_notes`, `action_items`.
- `notifications`, `notification_preferences`, `notification_deliveries`.
- `audit_logs`: organization_id, actor_type, actor_id, action, target_type, target_id, before_json, after_json, reason, request_id, ip_hash/metadata, created_at.
- `client_contacts`, `client_portal_members`, `client_project_access`.

## 12.7 Finance
- `billing_profiles`, `invoice_sequences`, `invoices`, `invoice_items`.
- `invoice_issue_links`, `invoice_approvals`, `payment_status_events`.
- `finance_sync_events`.
- `invoice_items` menyimpan snapshot deskripsi, qty, unit price, pajak, diskon, dan referensi asal agar perubahan issue berikutnya tidak mengubah invoice yang sudah diterbitkan.

## 12.8 Database rules
- Foreign keys dan unique constraints untuk tenant-scoped keys.
- Index pada organization_id, project_id, issue_key, status_id, assignee_id, due_date, created_at, source external IDs.
- Query list wajib tenant-scoped dan terindeks.
- Gunakan soft delete hanya bila ada alasan bisnis; audit/histori tidak boleh hilang.
- Hindari menyimpan file binary besar di MySQL.
- JSON fields untuk custom metadata harus memiliki schema validation dan tidak menggantikan kolom relasional untuk query inti.
- Strategi partitioning/archiving ditentukan berdasarkan volume nyata, bukan prematur.

---

# 13. Event, Webhook, dan Integrasi Data

## 13.1 Event domain
Contoh event internal:
- `project.created`
- `project.status_changed`
- `issue.created`
- `issue.updated`
- `issue.transitioned`
- `issue.assigned`
- `comment.created`
- `sprint.started`
- `sprint.completed`
- `release.created`
- `deployment.started`
- `deployment.completed`
- `agent_run.started`
- `agent_run.completed`
- `sla.warning`
- `sla.breached`
- `invoice.draft_created`
- `invoice.status_changed`

Event memiliki schema version dan correlation ID. Event internal tidak otomatis menjadi webhook eksternal tanpa konfigurasi.

## 13.2 Idempotency
- Simpan external event ID dan hasil pemrosesan.
- Webhook yang sama tidak mengulang side effect.
- Aksi retry menggunakan operation key stabil.
- Aksi non-idempotent seperti invoice creation memerlukan deduplication constraint.

## 13.3 Integration exception queue
- Tampilkan provider, event, waktu, error yang disanitasi, retry count, dan status.
- Retry manual hanya oleh role berwenang.
- Replay mempertahankan correlation ID dan membuat audit record.
- Jangan menampilkan payload sensitif secara default.
- Sediakan mekanisme menghubungkan external ID yang gagal dipetakan.

---

# 14. Keamanan AI dan CI/CD

## 14.1 Trust boundaries
- Web app/API, database, integration workers, AI orchestrator, sandbox, source-control provider, CI runner, staging, dan production adalah trust boundary berbeda.
- Tidak ada credential production yang masuk ke sandbox AI.
- AI worker tidak berbagi filesystem writable dengan API web.
- Artefak AI disimpan terpisah dengan akses terbatas.

## 14.2 Approval matrix

| Kategori | Tindakan agen | Approval minimum | Production |
|---|---|---|---|
| Low | Analisis, patch, test, buka PR | Satu reviewer manusia | Hanya melalui pipeline dan approval policy |
| Medium | Patch, test, analisis dampak, buka PR | Reviewer + passing checks | Approval release sesuai policy |
| Hard | Diagnosis; patch hanya draft jika diizinkan | Dua approver berbeda atau dua tahap eksplisit | Tidak boleh sampai seluruh gate terpenuhi |

## 14.3 Production gates
- PR approved.
- Required checks passed.
- Staging deployment successful.
- Smoke/regression test passed.
- Release/change approval.
- Backup/migration/rollback plan untuk perubahan yang relevan.
- Human production approval.
- Post-deploy monitoring.
- Rollback/incident escalation bila ambang terlampaui.

## 14.4 Kill switch
- Global kill switch menghentikan agent runs baru dan membatalkan job yang aman dibatalkan.
- Project kill switch menonaktifkan AI pada project tertentu.
- Kill switch tidak menghapus log dan tidak membatalkan deployment yang sudah berjalan tanpa prosedur terpisah.
- Aksi toggle tercatat dan memerlukan permission khusus.

---

# 15. UX, Screen Inventory, dan Perilaku UI

## 15.1 Global shell
- Sidebar navigasi yang dapat diciutkan.
- Global search / command palette.
- Create button untuk project/issue/meeting.
- Notification center.
- Profile/preferences.
- Breadcrumb dan context selector organisasi/project.
- Empty state yang menjelaskan tindakan berikutnya.
- Loading, error, retry, permission denied, dan offline states yang konsisten.

## 15.2 Screen inventory minimum

| Screen | Elemen utama |
|---|---|
| Login / MFA | Form aman, reset password, MFA challenge |
| Home / My Work | Assigned to me, mentions, overdue, recent projects |
| Portfolio overview | Portfolio health, timeline, risks, project list |
| Project overview | Status, progress, dates, team, risks, milestones, recent activity |
| Board | Kanban columns, swimlanes, filters, quick create |
| Issue detail | Summary, fields, description, comments, subtasks, links, development |
| Backlog | Ranked issues, epics, sprint panel |
| Sprint planning | Capacity, sprint goal, committed items |
| Timeline/Gantt | Dates, dependencies, milestones, baseline |
| Calendar | Events, meetings, releases, deadlines |
| Release center | Version scope, readiness checklist, deployment status |
| AI Fix Queue | Queue, difficulty, confidence, run state, cost, diagnostic/PR links |
| Bug intake | Form, attachments, client/project context |
| Workload | Capacity vs allocation, skill, availability |
| Reports | Dashboard widgets and saved reports |
| Automation editor | Trigger, conditions, actions, test/dry-run |
| SLA/Maintenance | Contract, SLA clocks, usage, breach reports |
| Client portal | Public project status, tickets, approvals, invoice |
| Invoice workspace | Draft, item details, approval, PDF, finance status |
| Integrations | Connections, sync status, exceptions, retry |
| Admin | Users, roles, workflows, schemes, policies, retention |
| Audit log | Filter by actor, action, target, date, request ID |

## 15.3 Issue detail layout
Header:
- Issue key, title, type, status, priority, action menu.
Main:
- Description, acceptance criteria, reproduction steps, comments.
Sidebar:
- Assignee, reporter, dates, estimate, labels, component, sprint, epic, release.
Tabs:
- Overview
- Activity
- Subtasks
- Links
- Development
- QA/Test
- Time Tracking
- Approvals
- Attachments
- History

Tab visibility follows permission and issue type.

## 15.4 UX acceptance criteria
- Pengguna dapat membuat issue standar tanpa meninggalkan board.
- Filter aktif terlihat dan dapat dihapus satu per satu.
- Drag-and-drop menampilkan feedback sukses/gagal dan alasan transisi ditolak.
- Form mempertahankan input saat validasi gagal.
- Aksi asynchronous menunjukkan status pending/success/failure.
- Konten internal tidak pernah dirender pada portal klien meskipun UI menggunakan cache lama; permission harus diperiksa server-side.

---

# 16. Data Migration, Retention, dan Audit

- Migrasi dari spreadsheet/alat lama melalui import template dan dry-run.
- Preview validasi: baris gagal, duplicate key, field mapping, user mapping, dan referensi yang tidak ditemukan.
- Import harus idempotent berdasarkan migration batch/external ID.
- File import tidak boleh menjalankan formula/macro berbahaya.
- Audit log disimpan sesuai kebijakan retensi yang disepakati.
- Issue events dan invoice history memiliki retensi berbeda sesuai kebutuhan bisnis/hukum.
- Penghapusan data klien dilakukan melalui workflow yang mengidentifikasi dependensi, kewajiban kontrak, backup, dan legal hold.
- Backup tidak menjadi jalan pintas untuk melewati kebijakan retensi; jadwal expiry backup ditentukan.
- Export mematuhi permission, masking, dan audit.

---

# 17. Testing Strategy & Definition of Done

## 17.1 Lapisan testing
- Unit test domain rules, permission policies, workflow transitions, SLA calculations, invoice eligibility, idempotency.
- Feature/API tests untuk setiap endpoint kritis.
- Integration tests untuk CRM, HR, Finance, GitHub, Sentry, Telegram Bot API, email, dan AI gateway.
- Frontend component tests untuk form/board/issue details.
- End-to-end tests untuk alur CRM Won → project, bug intake → PR approval, dan task → invoice.
- Security tests: tenant isolation, IDOR/BOLA, privilege escalation, file access, webhook replay.
- Performance/load tests untuk board/list/search dan queue.
- Disaster recovery restore test.
- AI evaluation set dengan kasus Low/Medium/Hard, prompt injection, secret leakage, false confidence, dan regression.

## 17.2 Definition of Done
Sebuah fitur dinyatakan selesai jika:
- Acceptance criteria terpenuhi.
- Authorization dan tenant isolation diuji.
- Unit/integration tests lulus sesuai risk.
- Audit/event logging diterapkan untuk perubahan penting.
- Error state dan retry behavior jelas.
- Dokumentasi API/operasional diperbarui.
- Telemetry/monitoring tersedia untuk alur kritis.
- Tidak ada secret/PII di log.
- QA dan approval yang diwajibkan selesai.
- Feature flag/rollback plan tersedia untuk perubahan berisiko.

---

# 18. Metrik Keberhasilan

Target awal berikut adalah sasaran validasi, bukan jaminan sebelum baseline operasional diukur.

| Metrik | Target awal |
|---|---|
| Laporan bug tercatat di sistem | ≥ 95% |
| Bug intake otomatis menjadi issue | P95 < 1 menit saat integrasi sehat |
| Project CRM Won dibuat tanpa duplikasi | ≥ 99,5% event valid |
| Issue dengan status diperbarui dalam 48 jam | ≥ 90% |
| Waktu bug Low hingga PR siap review | Median < 30 menit pada pilot yang memenuhi readiness |
| PR AI Low/Medium diterima tanpa revisi besar | ≥ 60% setelah baseline dan definisi disepakati |
| Regresi pasca-deploy terkait AI | < 5%, dengan definisi jendela observasi yang jelas |
| Task eligible → invoice draft | < 1 hari kerja |
| Webhook gagal tanpa terlihat di dashboard | 0 |
| Unauthorized cross-tenant access | 0 insiden terkonfirmasi |
| Restore drill sukses | 100% pada jadwal uji yang ditetapkan |

Metrik harus dipecah berdasarkan project, issue type, source, priority, dan periode agar rata-rata tidak menyembunyikan masalah.

---

# 19. Prioritas dan Roadmap

## P0 — Fondasi dan MVP Project Management
- Organization/user/auth/RBAC.
- Project CRUD dan project membership.
- Issue types, hierarchy, status, priority, issue events.
- Kanban board, list/table, My Work.
- Issue detail, comments, attachments, activity log.
- Workflow default dan validasi transisi.
- Basic schedule/milestone/timeline.
- CRM Deal Won → project.
- HR team sync dasar.
- GitHub integration dasar.
- Bug intake web/Telegram Bot API dan Sentry intake untuk pilot.
- AI diagnostic-only dan branch/PR workflow terbatas.
- Approval human-in-the-loop.
- Notifications dan audit log.
- Invoice draft + finance sync dasar.
- Security, observability, backup, dan CI/CD platform.

## P1 — Enterprise Delivery
- Scrum/sprints, burndown, velocity.
- Workflow configuration UI dan schemes.
- Automation rule engine.
- SLA/maintenance contract dan kuota.
- Advanced search/query dan saved filters.
- Dashboards/reports.
- Client portal.
- Time tracking/workload view.
- Release management, QA/UAT, deployment approval.
- Bulk operations dan project templates yang lebih lengkap.
- Calendar integration.

## P2 — Scale & Optimization
- Portfolio/program management lanjutan.
- Custom fields/screen schemes lebih fleksibel.
- Wiki/knowledge base penuh.
- AI assignee recommendations.
- Advanced analytics dan forecasting.
- Email-to-issue, Slack/Telegram.
- SSO/SCIM enterprise bila dibutuhkan.
- Search engine khusus, data warehouse, dan advanced audit exports.
- Multi-region/high-availability sesuai kebutuhan bisnis.

## Estimasi fase
Estimasi durasi harus dikonfirmasi setelah discovery, kapasitas tim, kualitas integrasi, dan tingkat desain UI diketahui. Baseline referensi dari draft awal:
- Fondasi: 4–6 minggu.
- MVP PM: 4–6 minggu.
- AI Bug Automation v1: 6–8 minggu.
- Hardening & invoice: 4–6 minggu.
- Setara Jira: 8–10 minggu.
- Optimasi: berkelanjutan.

Estimasi tersebut bukan komitmen jadwal dan tidak boleh dijumlahkan sebagai janji sebelum dependency, staffing, testing, dan scope dikunci.

---

# 20. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope “setara Jira” terlalu luas | Proyek molor dan kualitas turun | P0/P1/P2, MVP fokus software house, discovery per modul |
| AI membuat patch yang merusak | Regresi/insiden production | Sandbox, tests, review, staging, approval, monitoring, rollback |
| Secret/PII terkirim ke AI | Kebocoran data | Data minimization, masking, no production secrets, audit |
| Integrasi CRM/HR/Finance tidak seragam | Data tidak sinkron | Adapter, contract, exception queue, fallback manual |
| Webhook duplikat | Project/ticket/invoice ganda | Idempotency, unique constraints, replay-safe processing |
| Klien melihat komentar internal | Pelanggaran kerahasiaan | Visibility policy server-side, test negative, public mapping |
| Board lambat pada data besar | Produktivitas turun | Indexing, pagination, virtualization, load testing |
| Workflow terlalu fleksibel | Sulit dipahami dan dirawat | Template, validator, versioning, simulator |
| Data HR tidak terbaru | Over-allocation | Sync timestamp, stale data warning, manual override berizin |
| Invoice salah atau ganda | Kerugian finansial | Draft/approval, snapshot items, billing eligibility, idempotency |
| Ketergantungan provider AI | Gangguan layanan/biaya | Provider adapter, budget cap, diagnostic fallback |
| Tidak ada test di repo klien | Otomasi berisiko | Readiness gate, diagnostic-only mode |
| Satu approver menjadi bottleneck | Delivery lambat | Delegated approvers, escalation, backup approver |
| Data lama tidak konsisten saat migrasi | Laporan salah | Dry-run, mapping, exception report, reconciliation |

---

# 21. Pertanyaan Terbuka / Keputusan yang Harus Dikunci

1. CRM, HR, dan Finance berada dalam aplikasi yang sama atau sistem terpisah?
2. Apakah MVP wajib mendukung multi-tenant untuk banyak perusahaan, atau satu organisasi dulu dengan client separation?
3. Apakah portal klien masuk P0 atau P1?
4. Siapa pemilik Telegram Bot, apakah bot akan digunakan di private chat saja atau juga group/supergroup, dan bagaimana kebijakan consent serta verifikasi identitas klien?
5. Repository awal menggunakan GitHub saja atau perlu GitLab sejak awal?
6. Environment/deploy pertama: VPS/SSH, Docker, cloud platform, atau kombinasi?
7. Siapa approver PR AI dan siapa approver production? Apakah Hard wajib dua orang berbeda?
8. Model maintenance: flat monthly, kuota tiket, jam kerja, per incident, atau kombinasi?
9. Aturan garansi bug dan pengecualian kontrak bagaimana?
10. Pajak, mata uang, dan penomoran invoice ditetapkan oleh sistem Finance mana?
11. Target volume: jumlah user, tenant, project aktif, issue per project, attachment, dan AI runs per hari?
12. Target RPO/RTO final?
13. Apakah SSO/SCIM dibutuhkan untuk enterprise?
14. Apakah client-facing UI hanya Bahasa Indonesia atau bilingual?
15. Apakah perlu migrasi dari Jira/Trello/ClickUp atau spreadsheet? Jika ya, format data sumber apa?
16. Apakah project management menggunakan Scrum, Kanban, atau keduanya untuk setiap project?
17. Apakah custom fields dibutuhkan di MVP atau cukup field standar?
18. Apakah approval formal untuk scope, milestone, UAT, dan release wajib sejak awal?
19. Apakah laporan biaya AI perlu ditagihkan ke project/client atau hanya untuk internal cost monitoring?
20. Berapa lama retensi issue events, audit log, file, dan agent logs?

---

# 22. Glossary

- **Issue / Work item:** unit pekerjaan seperti task, bug, feature, atau change request.
- **Epic:** kelompok pekerjaan besar yang terdiri dari issue turunan.
- **Sprint:** periode kerja terjadwal dalam metode Scrum.
- **Backlog:** daftar pekerjaan yang belum dijadwalkan.
- **Workflow:** status dan transisi yang diizinkan untuk issue.
- **SLA:** target waktu respons/penyelesaian yang disepakati.
- **UAT:** User Acceptance Testing oleh klien/pemilik bisnis.
- **PR/MR:** Pull Request / Merge Request untuk review perubahan kode.
- **CI/CD:** pipeline integrasi, test, build, dan deployment.
- **MCP:** Model Context Protocol/tool gateway yang memungkinkan agent menggunakan tools terbatas.
- **Idempotency:** jaminan event/operasi yang diproses ulang tidak menggandakan side effect.
- **Tenant isolation:** pemisahan data dan akses antar organisasi.
- **Baseline:** snapshot scope/jadwal yang telah disepakati untuk mengukur perubahan.
- **Diagnostic package:** kumpulan bukti dan analisis untuk membantu developer memperbaiki bug secara manual.
- **WIP limit:** batas jumlah pekerjaan yang sedang berlangsung pada kolom Kanban.

---

# 23. Penutup

Project Manjer ditujukan menjadi platform delivery software house yang menggabungkan kemampuan inti project management setara Jira dengan alur komersial dan maintenance yang relevan bagi software house. Nilai utama bukan jumlah fitur semata, melainkan konsistensi data, workflow yang dapat diaudit, transparansi kepada klien, integrasi delivery, dan otomasi yang aman.

Implementasi harus dimulai dari fondasi permission/tenant, project/issue, workflow, activity log, dan integrasi minimum yang benar-benar dipakai. Kemampuan enterprise seperti automation builder, SLA, portal klien, query lanjutan, portfolio analytics, dan AI automation ditambahkan bertahap setelah fondasi stabil. Setiap fase wajib memiliki acceptance criteria, pengujian keamanan, metrik, serta rencana rollback yang jelas.
