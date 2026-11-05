# Product Requirements Document

## Modul GitHub Integration & Repository Management – ASTACODE ERP

| Dokumen | Detail |
| --- | --- |
| Versi | 1.1 – Revisi dari v1.0 (Proposed Product Specification) |
| Tanggal | 4 November 2026 |
| Platform | Web application (frontend HTML, CSS, JavaScript) + backend/API gateway |
| Modul | GitHub Integration & Repository Management |
| Status | Draft untuk review Product, Design, dan Engineering |
| Pemilik dokumen | Product Owner ASTACODE ERP |

**Tujuan:** mengubah modul GitHub menjadi ruang kerja pengembangan yang terarah, aman, terukur, dan dapat dioperasikan oleh tim software house.

## 1. Ringkasan Eksekutif

Modul GitHub ASTACODE ERP menjadi pusat pengelolaan repository dan aktivitas pengembangan yang terhubung dengan proyek, backlog, developer, code review, pipeline, dan rilis. Pengguna harus dapat memahami kondisi repository dalam beberapa detik dan menyelesaikan pekerjaan umum tanpa berpindah-pindah halaman.

**Masalah yang diselesaikan:** informasi repository, tiket, PR, dan hasil CI tersebar di banyak tempat; kesalahan manual (base branch salah, format branch/commit tidak konsisten, merge sebelum checks selesai) sulit dicegah dan dilacak.

PRD ini menetapkan satu alur kerja utama yang konsisten:

**pilih proyek/repository → siapkan branch dari base yang benar → kerjakan dan push commit → buat Pull Request → jalankan pemeriksaan → review dan approval → merge → release/deploy → audit.**

### 1.1 Prinsip Produk

- **Progressive disclosure:** tampilkan tindakan paling relevan lebih dulu; konfigurasi lanjutan berada di tab Settings.
- **Satu sumber status:** status branch, PR, checks, dan deployment berasal dari data API. Angka contoh tidak boleh tampil sebagai data live.
- **Safe by default:** operasi berisiko memerlukan konfirmasi, izin yang sesuai, dan pemeriksaan prasyarat yang divalidasi ulang di backend.
- **Actionable feedback:** setiap aksi menampilkan loading, sukses, gagal, alasan, dan langkah pemulihan.
- **Contextual workflow:** branch dan PR dapat ditautkan ke tiket backlog, epic, PIC, dan proyek.
- **Frontend bukan Git server:** operasi repository nyata dijalankan melalui GitHub API/backend atau Git lokal.

## 2. Tujuan, Sasaran, dan Bukan Sasaran

### 2.1 Tujuan

- Memusatkan informasi repository, branch, pull request, checks, deployment, collaborator, dan audit.
- Mengurangi kesalahan pemilihan base branch, format branch/commit, dan proses merge.
- Mempercepat alur developer dari tiket backlog ke Pull Request.
- Memberi visibilitas status pekerjaan kepada Tech Lead, QA, Project Manager, dan developer.
- Menyediakan fondasi integrasi yang dapat dikembangkan tanpa mengganti seluruh UI.

### 2.2 Indikator Keberhasilan Produk

Target bersifat awal dan ditinjau ulang setelah 2 bulan penggunaan. Baseline diukur pada bulan pertama sebelum target dikunci.

| Metrik | Target awal | Cara ukur |
| --- | --- | --- |
| Waktu membuat branch dari tiket | < 60 detik (p90) | Event create-branch sampai branch terkonfirmasi API |
| PR dengan tiket tertaut | ≥ 90% | PR dengan linked ticket / seluruh PR baru |
| PR merged dengan required checks sukses | 100% | Merged PR yang seluruh required checks-nya sukses |
| Aksi UI dengan state feedback lengkap | 100% | Semua aksi memiliki loading/success/error (QA checklist) |
| Operasi destructive tanpa konfirmasi | 0 | QA test dan audit event |
| Kegagalan sinkronisasi yang tidak terlihat | 0 | Error API selalu ditampilkan dan tercatat |
| Waktu muat Overview (data ter-cache) | < 2 detik (p90) | Real user monitoring |

### 2.3 Bukan Sasaran

- Menggantikan Git client atau menyediakan terminal Git penuh di browser.
- Menjalankan runner CI/CD sendiri dari browser.
- Menyimpan Personal Access Token (PAT) di localStorage/sessionStorage atau di mana pun di sisi browser.
- Mengimplementasikan Sentry, Telegram, atau deployment engine dari frontend tanpa layanan integrasi server-side.
- Menjanjikan real-time jika data hanya diperbarui melalui polling/manual refresh.
- Mendukung provider selain GitHub (GitLab, Bitbucket) pada versi ini.

### 2.4 Asumsi dan Dependensi

- Organisasi menggunakan GitHub (cloud) dan GitHub Actions atau provider CI yang dapat dibaca melalui API.
- Tersedia backend/API gateway ASTACODE untuk auth, proxy GitHub API, webhook receiver, dan audit (keputusan D-01, lihat bagian 16).
- Data tiket berasal dari modul Kanban & Backlog yang sudah ada.
- Satu proyek ASTACODE dapat dipetakan ke satu atau lebih repository.

## 3. Persona dan Hak Akses

| Persona | Kebutuhan utama | Aksi utama |
| --- | --- | --- |
| Developer | Menemukan tiket, membuat branch, melihat checks, membuka PR | Create branch, copy CLI, create/view PR, request review |
| Tech Lead / Maintainer | Menjaga kualitas dan kebijakan merge | Review, approve/request changes, merge |
| QA | Memastikan hasil tes dan preview sesuai acceptance criteria | View checks, test preview, memberi QA gate |
| Project Manager | Melihat progres dan risiko delivery | View status, link backlog, release/audit read-only |
| Admin Integrasi | Mengatur koneksi dan akses repository | Connect GitHub, kelola webhook, collaborator, protection |

### 3.1 Matriks Izin Minimum

Izin efektif adalah **irisan** antara role ASTACODE dan permission GitHub aktual pengguna/installation. Backend memverifikasi setiap aksi; matriks ini adalah default yang dapat dikonfigurasi per organisasi.

| Fitur | Developer | QA | Maintainer | Project Manager | Admin |
| --- | --- | --- | --- | --- | --- |
| Lihat repository/branch/PR/checks | ✓ | ✓ | ✓ | ✓ (read-only) | ✓ |
| Buat branch / PR | ✓ | Opsional | ✓ | — | ✓ |
| Comment / Request changes | — | ✓ | ✓ | — | ✓ |
| Approve PR (review GitHub) | — | Sesuai aturan repo | ✓ | — | ✓ |
| Beri QA gate (status di ERP) | — | ✓ | ✓ | — | ✓ |
| Merge PR | — | — | ✓ | — | ✓ |
| Delete branch | Branch milik sendiri | — | ✓ | — | ✓ |
| Lihat audit log | — | — | ✓ | ✓ | ✓ |
| Ubah token / webhook / protection | — | — | Opsional | — | ✓ |
| Kelola collaborator | — | — | Opsional | — | ✓ |

*QA gate* adalah penanda validasi di ERP dan berbeda dari approval review GitHub; keduanya dicatat terpisah.

## 4. Arsitektur Informasi dan Navigasi

Gunakan satu halaman modul dengan header konteks repository, ringkasan status, lalu area kerja bertab. Konfigurasi lanjutan tidak ditumpuk di dashboard utama.

### 4.1 Navigasi Utama (satu sumber)

| Tab | Isi | Prioritas |
| --- | --- | --- |
| Overview | Ringkasan branch, PR, checks, deployment; aktivitas terbaru; action items | P0 |
| Branches | Daftar branch, filter, create branch, copy CLI | P0 |
| Pull Requests | Daftar PR, detail PR, diff, review, merge | P0 |
| Checks & Deployments | Workflow/check runs, deployment events, webhook delivery | P0 (checks) / P1 (deployment, webhook) |
| Releases | Release checklist, tag, deployment production, rollback | P2 (Release 3) |
| People & Access | Collaborators, role, permission, indikator 2FA bila tersedia | P1 |
| Settings | Koneksi GitHub, repository mapping, protection policy, webhook config | P1 |
| Audit | Aktivitas penting, actor, timestamp, hasil, correlation ID | P1 |

### 4.2 Susunan Halaman

1. **Top bar:** breadcrumb ASTACODE / Project / Repository; project & repository switcher; badge Connected/Degraded/Disconnected; tombol Refresh dan Create branch.
2. **Repository summary:** nama, visibility, default branch, URL, tombol Open on GitHub dan Copy clone URL.
3. **KPI row:** Open PRs, Branches, Checks failing, Latest deployment. Setiap kartu wajib memiliki tautan ke daftar terfilter; hindari kartu angka tanpa tindakan.
4. **Main content:** tabel/list dengan filter dan detail drawer atau halaman detail. Hindari split-screen permanen pada layar kecil.
5. **Contextual side panel:** ticket link, assignee, base branch, protection status, suggested next action.

## 5. Alur Kerja Utama – End-to-End

Alur lima tahap dipertahankan sebagai progress tracker, tetapi setiap tahap memiliki prasyarat dan status dari data aktual. Stepper berfungsi sebagai navigasi konteks, bukan dekorasi.

| Tahap | Alur yang benar | Syarat / validasi | Status UI |
| --- | --- | --- | --- |
| 1. Branch | Pilih tiket → pilih base branch (umumnya staging) → pilih prefix → buat branch | Nama unik; base tersedia; user punya write access; tiket opsional sesuai policy repo | Draft / Creating / Created / Failed |
| 2. Commit & Push | Developer bekerja lokal → commit sesuai Conventional Commits → push ke origin | UI hanya menampilkan instruksi dan status sinkronisasi dari remote | No commits / Ahead / Synced / Behind |
| 3. CI Checks | Push atau PR memicu workflow GitHub Actions | Required checks selesai dan sukses; pending/failure tidak dianggap lulus | Queued / In progress / Passed / Failed / Cancelled |
| 4. PR Review & Merge | Buat PR ke staging → review diff → approval → merge | Required approvals terpenuhi; checks lulus; tidak conflict; branch protection terpenuhi | Draft / Review requested / Changes requested / Approved / Mergeable / Merged |
| 5. Release & Audit | Setelah staging tervalidasi, buat release PR/tag ke main sesuai strategi rilis → deploy → audit | Release approval, tag unik, deployment sukses, webhook delivery tercatat | Ready / Releasing / Deployed / Failed / Rolled back |

### 5.1 Jalur Alternatif

| Jalur | Perilaku |
| --- | --- |
| Hotfix | Base `main`, prefix `hotfix/`, hanya Maintainer/Admin atau sesuai policy; wajib di-backport ke `staging` (UI menampilkan pengingat dan status backport). |
| Tanpa tiket | Diizinkan jika policy repository mengizinkan; PR ditandai "Tanpa tiket" dan dihitung pada metrik tautan tiket. |
| Branch epic | Prefix `epic/` hanya jika repository dikonfigurasi memakainya; PR ke epic tidak memicu status Done pada tiket. |
| Repository tanpa staging | Base default mengikuti template strategi branch per repository (keputusan D-03). |

### 5.2 Koreksi Alur Penting

- Push tidak otomatis membuat PR. Push hanya memperbarui remote branch; PR dibuat melalui aksi terpisah atau kebijakan auto-PR yang eksplisit.
- CI dapat berjalan pada `push` dan `pull_request`. PR tidak boleh di-merge sebelum required checks selesai dan lulus.
- Approval harus berasal dari reviewer berwenang; author tidak boleh memenuhi approval atas PR sendiri jika kebijakan repository melarangnya.
- Squash merge adalah salah satu strategi merge, bukan kewajiban universal. Tampilkan strategi yang diizinkan repository.
- Deployment tidak otomatis berjalan hanya karena PR merged. Deployment mengikuti workflow release/environment dan approval yang ditentukan.
- Branch dihapus setelah merge hanya jika opsi dipilih dan API mengonfirmasi merge berhasil.
- Sentry release, Telegram notification, dan webhook adalah integrasi eksternal; tampilkan status delivery dan retry, bukan klaim sukses sebelum respons diterima.

## 6. Detail Fitur dan Persyaratan Fungsional

Setiap persyaratan memiliki ID unik agar dapat ditautkan ke tiket, test case, dan acceptance criteria.

### 6.1 Overview Dashboard

| ID | Persyaratan | Acceptance criteria | Prioritas |
| --- | --- | --- | --- |
| OV-01 | Tampilkan identitas repository aktif | Nama, owner, URL, default branch, visibility cocok dengan API | P0 |
| OV-02 | Tampilkan status koneksi GitHub | Status Connected/Degraded/Disconnected, waktu sync terakhir, tombol retry | P0 |
| OV-03 | KPI dapat diklik | Open PRs membuka daftar PR terfilter; Checks failing membuka daftar checks gagal | P0 |
| OV-04 | Tampilkan aktivitas terbaru | Actor, event, waktu, branch/PR terkait; empty state jika belum ada data | P1 |
| OV-05 | Tampilkan data freshness | Label Last synced dan refresh state; tidak menyebut real-time bila polling | P0 |
| OV-06 | Tampilkan action items | Daftar tindakan berikutnya (PR menunggu review, checks gagal, branch behind) dengan tautan langsung | P1 |

### 6.2 Branch Management

| ID | Persyaratan | Acceptance criteria | Prioritas |
| --- | --- | --- | --- |
| BR-01 | Daftar branch dalam tabel responsif | Kolom: nama, kategori, last commit, author, updated time, protection, checks, PR terkait; pagination | P0 |
| BR-02 | Pencarian dan filter | Cari berdasarkan nama branch, commit, PIC; filter All, Active, Protected, Stale, Feature, Fix, Hotfix | P0 |
| BR-03 | Aksi per branch | Open on GitHub, Copy checkout command, View PR, Delete branch (jika diizinkan dan melalui konfirmasi) | P0 |
| BR-04 | Label branch default/protected | Ditandai dengan teks dan ikon, tidak hanya warna | P0 |
| BR-05 | Deteksi branch stale | Ambang dapat dikonfigurasi (default 30 hari tanpa update); aturan ditampilkan di UI | P1 |
| BR-06 | Status sinkronisasi branch | Ahead/Behind terhadap base dibaca dari API compare | P1 |

### 6.3 Create Branch Flow

| ID | Persyaratan | Acceptance criteria | Prioritas |
| --- | --- | --- | --- |
| CB-01 | Pilih repository bila konteks belum ditentukan | Switcher mengikuti project aktif | P0 |
| CB-02 | Pilih base branch | `staging` default untuk fitur; `main` hanya untuk hotfix/release sesuai policy | P0 |
| CB-03 | Pilih prefix | `feat/`, `fix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`; `epic/` hanya jika diaktifkan untuk repository | P0 |
| CB-04 | Slug dinormalisasi dan divalidasi | Lowercase + hyphen; validasi karakter, panjang maksimum, prefix ganda, dan nama yang sudah ada | P0 |
| CB-05 | Tautkan tiket/epic dan assignee | Tersedia bila data integrasi ada; wajib/opsional mengikuti policy repository | P1 |
| CB-06 | Preview nama branch dan CLI | Menjelaskan bahwa perintah dijalankan di terminal developer | P0 |
| CB-07 | Konfirmasi memanggil backend | State Creating → Created atau error spesifik; tidak mengklaim sukses sebelum API merespons | P0 |
| CB-08 | Idempotensi | Retry dengan idempotency key tidak membuat branch ganda | P1 |

Contoh nama: `feat/lib-120-optimasi-query`. Preview CLI: `git fetch origin && git switch -c feat/lib-120-optimasi-query origin/staging`. Jika branch dibuat melalui API, instruksi checkout tetap ditampilkan setelah branch remote terkonfirmasi.

### 6.4 Commit & Push

Browser tidak dapat membaca commit lokal atau menjalankan `git push` hanya dengan HTML/CSS/JS. Modul menyediakan panduan CLI dan membaca commit yang sudah ada di remote melalui API. Status lokal yang lebih kaya memerlukan integrasi GitHub Desktop/IDE atau agent lokal (di luar cakupan MVP).

| Elemen | Aturan |
| --- | --- |
| Conventional Commit | `type(scope): description`; contoh `feat(auth): add role-based access control` |
| Jenis commit | feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert |
| Commit metadata | SHA, author, message, timestamp, branch, URL commit |
| Push status | Berdasarkan data remote; jangan menyimpulkan push sukses dari tombol Copy CLI |
| Validasi format commit | Ditampilkan sebagai peringatan (non-blocking) di daftar commit; penegakan melalui CI check commitlint bila tim memilihnya |
| Empty state | Tampilkan langkah fetch/checkout/commit/push untuk branch tanpa commit baru |

### 6.5 Pull Request & Review

| ID | Persyaratan | Acceptance criteria | Prioritas |
| --- | --- | --- | --- |
| PR-01 | Daftar PR | Title, number, author, source → target, reviewer, checks, status draft/open/merged/closed, updated time | P0 |
| PR-02 | Create PR form | Title, description (template), source, target, tiket tertaut, reviewer, toggle draft; target default `staging` | P0 |
| PR-03 | Detail PR bertab | Conversation, Commits, Checks, Files changed, Deployments | P0 |
| PR-04 | Diff viewer | File tree, unified/split, syntax highlight, jumlah additions/deletions, indikator file binary/terlalu besar | P1 |
| PR-05 | Review actions | Comment, Request changes, Approve; disembunyikan/dinonaktifkan sesuai permission dan status PR | P1 |
| PR-06 | Merge dialog | Target, strategi merge yang diizinkan, commit title, required checks, approval, conflict, opsi delete branch | P1 |
| PR-07 | Konfirmasi merge | Menyebut dampak (branch target, jumlah commit) dan memerlukan konfirmasi eksplisit; kondisi divalidasi ulang tepat sebelum eksekusi | P1 |
| PR-08 | Status mergeable | Dihitung dari checks, approval, conflict, dan protection; alasan penolakan ditampilkan per syarat | P0 |

**Status PR yang ditampilkan:** Draft → Review requested → Changes requested / Approved → Mergeable → Merged (atau Closed). Status Mergeable hanya muncul jika seluruh syarat PR-08 terpenuhi.

### 6.6 CI/CD & Checks

Produk tidak dikunci pada jumlah atau nama job tertentu. Data berasal dari GitHub Actions check runs/workflow runs atau provider CI yang terhubung. Daftar berikut hanya contoh:

| Contoh job | Hasil yang ditampilkan |
| --- | --- |
| Lint & format (PHPCS/ESLint) | Status, durasi, link log, waktu selesai |
| Unit & regression tests (PHPUnit/Jest) | Status, jumlah test bila tersedia, link log |
| Security & dependency scan (Trivy/CodeQL) | Status, severity findings bila tersedia |
| Migration dry-run | Status dan ringkasan hasil tanpa membuka secret |
| Docker build | Status dan referensi artifact/image bila tersedia |
| Staging preview | Status environment dan URL preview yang valid |

- Status agregat: Pending, In progress, Passed, Failed, Cancelled, Skipped, Neutral.
- Label "All required checks passed" hanya tampil jika seluruh required checks pada commit/PR terkait sukses; checks optional ditandai terpisah.
- Required checks dibaca dari konfigurasi branch protection, bukan dari daftar tetap di aplikasi.

### 6.7 Release & Deployment

- Pisahkan merge ke staging dari release production.
- Sediakan release checklist: changelog, version/tag, target commit, approval, environment, rollback reference.
- Tampilkan status deployment dari provider; jangan menampilkan label "Live" tanpa data provider.
- Jika deployment gagal, tampilkan penyebab yang tersedia, link log, dan tindakan retry/rollback sesuai permission.
- Sentry release dan Telegram notification ditandai *delivered* hanya setelah respons provider diterima.
- Strategi rilis rinci (approval, tagging, rollback) mengikuti keputusan D-04 dan dikerjakan pada Release 3.

## 7. Tab Lanjutan

### 7.1 People & Access

Tampilkan GitHub username, nama, role ASTACODE, permission repository, status invitation, dan last activity jika tersedia. Data 2FA hanya ditampilkan jika GitHub API/organization policy menyediakannya; selain itu tampilkan "Not available", bukan asumsi "Enforced".

### 7.2 Settings & Authentication

- Gunakan **GitHub App** sebagai opsi integrasi utama untuk aplikasi organisasi; OAuth/PAT hanya jika kebutuhan dan izin memang sesuai.
- Token/secret tidak dikirim ke browser dan tidak disimpan di localStorage. Simpan dan rotasi credential di backend secret store.
- Tampilkan scopes/permissions yang benar-benar diberikan oleh installation atau OAuth grant.
- Tombol *Test connection* memanggil backend dan menampilkan hasil, akun, akses repository, latency, dan waktu pemeriksaan.
- Branch protection ditampilkan sebagai konfigurasi aktual repository; perubahan hanya oleh Admin berwenang melalui dialog konfirmasi.
- Repository mapping: satu proyek ASTACODE dapat dipetakan ke beberapa repository dengan satu repository utama.

### 7.3 Webhooks & Telegram

| Kebutuhan | Spesifikasi |
| --- | --- |
| Webhook endpoint | URL disimpan di server; signing secret tidak pernah diekspos ke client |
| Events | push, pull\_request, pull\_request\_review, workflow\_run, check\_run, issues, release, deployment\_status sesuai kebutuhan |
| Delivery log | Event/delivery ID, waktu, response status, attempt, latency, retry state |
| Signature | Validasi HMAC SHA-256 di backend; tolak payload invalid dan catat sebagai event keamanan |
| Idempotensi | Delivery ID disimpan agar pengiriman ulang dari GitHub tidak diproses dua kali |
| Ping/test | Kirim test event melalui backend dan tampilkan response aktual |
| Telegram bot | Bot token disimpan server-side; tampilkan connected state dan last delivery |
| Commands | `/help`, `/status`, `/human`, `/unlink` hanya ditampilkan jika benar-benar diimplementasikan |

### 7.4 Audit Log

Audit log bersifat append-only dari sisi aplikasi dan memuat actor, action, resource, timestamp UTC, result, source, serta correlation/request ID. Credential, token, secret, dan payload sensitif tidak dicatat. Retensi default 12 bulan (dikonfirmasi pada D-07) dan dapat diekspor oleh Admin dalam format CSV.

## 8. Modal dan Interaksi

| Modal | Field / konten | Validasi & hasil |
| --- | --- | --- |
| Create Branch | Base, prefix, slug, ticket/epic, assignee, CLI preview | Slug valid, branch unik, base ada, permission write; tampilkan hasil API |
| Create Pull Request | Source, target, title, description, tiket, reviewer, draft | Ada commit pembeda, tidak ada PR duplikat, permission valid |
| Merge PR | Target, strategi, commit title, delete branch | Checks/approval/conflict valid; kondisi dicek ulang tepat sebelum merge |
| Delete Branch | Nama branch, dampak (PR terkait) | Tidak untuk default/protected branch; konfirmasi dengan mengetik nama branch |
| Add Collaborator | GitHub username, role, permission | Cek user/repository dan izin admin; invitation pending/success/error |
| Revoke Access / Disconnect | Nama user atau koneksi, dampak | Konfirmasi eksplisit; tercatat di audit |
| CLI Guide | Branching, commit convention, fetch/rebase, push, PR | Copy command per blok; sesuai OS/shell dan workflow tim |

### 8.1 Standar Semua Modal

- Label field permanen, helper text, indikator required, dan pesan error dekat field terkait.
- Enter tidak boleh tanpa sengaja mengeksekusi aksi destructive.
- Tombol submit nonaktif saat form invalid atau request berjalan.
- Saat request gagal, input dipertahankan agar user tidak mengulang.
- Dapat ditutup dengan Escape/close; jika ada perubahan belum tersimpan, minta konfirmasi.
- Aksi destructive memakai kata kerja spesifik: Delete branch, Revoke access, Merge pull request.
- Fokus keyboard dikunci di dalam modal dan dikembalikan ke pemicu setelah ditutup.

## 9. UI/UX dan Visual Design System

### 9.1 Prinsip Visual

- Tampilan SaaS B2B yang bersih: latar netral, card seperlunya, kontras teks tinggi, satu warna aksen utama.
- Hindari dashboard terlalu padat, gradient dekoratif, badge berwarna di setiap elemen, atau split-screen permanen.
- Status memakai teks dan ikon; warna bukan satu-satunya pembeda.
- Tabel untuk data operasional; card untuk ringkasan dan empty state.
- Detail ditampilkan bertahap melalui drawer/detail view agar konteks tidak hilang.

### 9.2 Layout Desktop

| Area | Rekomendasi |
| --- | --- |
| Global shell | Sidebar 232–256 px; content max width 1440 px; topbar 56–64 px |
| Page header | Breadcrumb, title, repository selector, primary action |
| KPI | 3–4 kartu ringkas dengan angka, label, dan tautan detail |
| Main workspace | Konten utama 8/12 kolom; context panel 4/12 bila relevan |
| Table | Sticky header bila panjang, row height 48–56 px, action menu konsisten |
| Detail PR | Tabs + diff viewer; panel metadata tidak mendominasi area diff |

### 9.3 Responsive

| Breakpoint | Perilaku |
| --- | --- |
| ≥ 1200 px | Sidebar penuh, tabel lengkap, detail panel berdampingan |
| 768–1199 px | Sidebar collapsible, KPI 2 kolom, panel menjadi drawer |
| < 768 px | Sidebar menjadi menu drawer, KPI 1–2 kolom, tabel menjadi stacked rows, diff memakai scroll horizontal |

### 9.4 Komponen UI Wajib

- Status badge: Connected, Failed, Pending, Approved, Merged, Deployed (teks + ikon).
- Data table: sorting, search, filter, pagination, loading skeleton, empty state, error state.
- Toast/inline alert: sukses, warning, error dengan tindakan lanjutan bila tersedia.
- Confirmation dialog untuk merge, delete, revoke, disconnect, dan perubahan protection.
- Tooltip untuk istilah Git dan status teknis.
- Focus state yang jelas, navigasi keyboard, HTML semantik, dan label form.

## 10. Arsitektur Teknis dan Batasan HTML/CSS/JS

Stack frontend HTML, CSS, dan JavaScript murni tetap dapat digunakan. Namun aplikasi membutuhkan lapisan server untuk credential, otorisasi, webhook, dan operasi yang tidak aman dilakukan langsung dari browser.

| Lapisan | Tanggung jawab | Catatan implementasi |
| --- | --- | --- |
| Frontend (HTML/CSS/JS) | Rendering, routing/tab, validasi form, state, fetch API, feedback UI | Tanpa secret; JS modular |
| Backend / API gateway | Auth session, otorisasi, proxy GitHub API, audit, webhook receiver, cache | Wajib untuk produksi |
| GitHub App / OAuth | Identitas aplikasi dan permission repository | Least privilege |
| GitHub Actions / CI provider | Lint, test, security, build, preview | Status dibaca melalui API |
| Database | Mapping project-repository, user-role, ticket links, audit, delivery logs | Credential di secret manager, bukan tabel plaintext |
| External services | Sentry, Telegram, deployment platform | Integrasi server-to-server |

### 10.1 Prinsip Keamanan

- PAT, GitHub App private key, Telegram bot token, webhook secret, dan deployment credential tidak boleh berada di source JS/HTML, environment yang dikirim ke browser, source map publik, atau browser storage.
- Backend proxy dengan session aman, HTTPS, CSRF protection sesuai metode auth, rate limiting, dan pemeriksaan permission di server.
- Least privilege: pisahkan izin read, write, administration, workflow, dan package sesuai kebutuhan.
- Sanitasi output dari commit message, branch name, PR description, dan webhook payload untuk mencegah XSS.
- Permission di UI hanya untuk pengalaman pengguna; backend memverifikasi setiap aksi.
- Operasi sensitif dicatat tanpa menyimpan payload yang berisi secret.

### 10.2 Kontrak API Internal yang Disarankan

Endpoint berikut adalah usulan untuk tim engineering, bukan endpoint publik GitHub, dan dapat disesuaikan dengan arsitektur backend yang ada.

| Endpoint | Metode | Kegunaan |
| --- | --- | --- |
| `/api/projects/:id/github/repository` | GET | Metadata repository dan status koneksi |
| `/api/projects/:id/github/branches` | GET / POST | Daftar (filter, pagination) dan buat branch |
| `/api/projects/:id/github/branches/:name` | DELETE | Hapus branch (dengan validasi protection) |
| `/api/projects/:id/github/pulls` | GET / POST | Daftar dan buat PR |
| `/api/projects/:id/github/pulls/:number` | GET | Detail PR |
| `/api/projects/:id/github/pulls/:number/reviews` | POST | Submit review |
| `/api/projects/:id/github/pulls/:number/merge` | PUT | Merge PR setelah validasi ulang |
| `/api/projects/:id/github/check-runs` | GET | Status CI/checks per ref/PR |
| `/api/projects/:id/github/deployments` | GET | Status deployment |
| `/api/projects/:id/github/collaborators` | GET / PUT / DELETE | Kelola collaborator |
| `/api/projects/:id/github/releases` | GET / POST | Release dan tag (Release 3) |
| `/api/projects/:id/github/webhooks/deliveries` | GET | Delivery log |
| `/api/projects/:id/github/webhooks/test` | POST | Uji webhook |
| `/api/projects/:id/github/audit` | GET | Audit log |

Endpoint disamakan di bawah `/api/projects/:id/` agar otorisasi per proyek konsisten (v1.0 mencampur dua pola path).

### 10.3 Konvensi API

- Pagination berbasis cursor; filter dan sort melalui query parameter.
- Aksi tulis (create branch, create PR, merge) menerima `Idempotency-Key`.
- Format error seragam: `{ code, message, details, retryAfter?, correlationId }`.
- Respons membawa `syncedAt` agar UI dapat menampilkan data freshness.
- Backend memakai ETag/conditional request dan cache singkat untuk menghemat rate limit GitHub.

### 10.4 Persyaratan Non-Fungsional

| Kategori | Persyaratan |
| --- | --- |
| Performa | Daftar branch/PR (cache) < 2 detik p90; aksi tulis memberi feedback awal < 300 ms |
| Ketersediaan | Saat GitHub tidak tersedia, UI menampilkan status Degraded dan data cache terakhir dengan timestamp |
| Skalabilitas | Mendukung repository dengan ≥ 1.000 branch dan ≥ 500 PR terbuka melalui pagination server-side |
| Rate limit | Anggaran request per installation dipantau; polling berhenti saat limit tercapai |
| Aksesibilitas | WCAG 2.2 AA sejauh relevan |
| Observabilitas | Log terstruktur dengan correlation ID; alert untuk kegagalan webhook berulang |
| Lokalisasi | Bahasa Indonesia sebagai default; string disiapkan untuk i18n |

## 11. State, Error Handling, dan Sinkronisasi

| Kondisi | Perilaku UI yang diwajibkan |
| --- | --- |
| Loading | Skeleton/spinner pada area terkait; cegah double submit |
| Empty | Jelaskan mengapa kosong dan berikan next action yang relevan |
| Unauthenticated / 401 | Sesi berakhir: arahkan login ulang tanpa kehilangan input form |
| Unauthorized / 403 | Tampilkan akses tidak cukup; jangan tampilkan tombol aksi yang tidak diizinkan |
| Not found / 404 | Tawarkan refresh atau kembali ke daftar |
| Conflict / 409 | Refresh state; minta user meninjau perubahan sebelum mengulang |
| Validasi / 422 | Pesan error di field terkait |
| Rate limit / 429 | Tampilkan retry-after bila tersedia; hentikan polling agresif |
| Network / 5xx | Pertahankan input; tombol retry; tampilkan last successful sync |
| Stale data | Tampilkan timestamp sinkronisasi dan tombol refresh |

Gunakan polling adaptif atau webhook-to-backend + push update (SSE/WebSocket) bila diperlukan. Jika hanya polling, tampilkan waktu pembaruan dan intervalnya secara transparan.

## 12. Integrasi dengan Modul ASTACODE ERP

| Modul | Integrasi yang diharapkan | Aturan |
| --- | --- | --- |
| CRM Deals Won | Provision repository dan struktur branch awal | Idempotent; tidak membuat repository duplikat; perlu approval/template konfigurasi |
| Kanban & Backlog | Create branch dari ticket; tautkan PR ke ticket | Simpan relasi ticket-branch-PR dan sinkronkan status secara aman |
| AI Automation Hub | Usulan patch dan branch fix untuk review | AI tidak boleh auto-merge ke protected branch; semua patch melalui PR dan checks |
| Service Desk | Tautkan bug/report ke issue/PR/release | Identifier dan audit trail konsisten |
| Telegram Bot | Notifikasi PR, review, deployment, dan failure | Notifikasi bukan sumber status utama; status tetap dari API |

### 12.1 Sinkronisasi Status Kanban

| Kejadian | Status tiket |
| --- | --- |
| Branch dibuat / pekerjaan dimulai | To Do → In Progress |
| PR dibuka (non-draft) | Code Review |
| Checks lulus dan preview siap | QA / Testing |
| PR merged ke target yang ditetapkan **dan** acceptance criteria terpenuhi | Done |

Tiket tidak menjadi Done hanya karena PR dibuat atau checks lulus. Jika PR ditutup tanpa merge, tiket kembali ke status sebelumnya dan pengguna diberi notifikasi.

## 13. Prioritas MVP dan Roadmap

Prioritas di bagian 4 dan 6 diselaraskan dengan rilis berikut (v1.0 menandai diff viewer dan review sebagai P0 di satu bagian tetapi Release 1 di bagian lain).

| Rilis | Cakupan | Kriteria selesai |
| --- | --- | --- |
| MVP – Core GitHub | Koneksi repository, Overview, branch list/create, PR list/create/detail dasar (tanpa diff), status checks, copy CLI, state loading/error/empty, audit event dasar | Alur branch → PR → checks dapat dipakai dengan data API nyata |
| Release 1 – Review & Merge | Diff viewer, review actions, merge dengan validasi, visibilitas branch protection | Merge hanya dapat dilakukan jika policy dan permission terpenuhi |
| Release 2 – Team & Automation | Collaborators, webhook delivery, Telegram, ticket linking, stale branch | Delivery log dan retry berjalan; permission teruji |
| Release 3 – Release Management | Release checklist, tag, deployment status, Sentry, rollback | Deployment state berasal dari provider dan tercatat di audit |

### 13.1 Definisi Prioritas

| Prioritas | Definisi | Contoh |
| --- | --- | --- |
| P0 | Wajib untuk workflow inti dan keamanan | Connect repository, branch, PR, checks, permission, error states |
| P1 | Meningkatkan efisiensi tim dan governance | Collaborators, webhooks, audit log, ticket sync, filters, diff, merge |
| P2 | Optimasi dan otomasi lanjutan | AI-assisted PR summary, analytics, configurable release templates |

## 14. Acceptance Criteria End-to-End

1. Admin menghubungkan repository melalui mekanisme autentikasi aman dan UI menampilkan status koneksi dari backend.
2. Developer memilih tiket, membuat branch dari staging, dan menerima konfirmasi hanya setelah API berhasil.
3. Developer mengikuti CLI snippet untuk checkout, commit, dan push; commit yang sudah ada di remote tampil di modul.
4. Push memicu workflow; UI menampilkan status checks aktual beserta link log.
5. Developer membuat PR ke staging dan tiket backlog tertaut.
6. QA/Tech Lead dapat membuka diff, berkomentar, request changes, atau approve sesuai permission.
7. Merge ditolak jika required checks belum lulus, approval kurang, konflik ada, atau user tidak berwenang.
8. Setelah merge sukses, UI memperbarui status PR dan branch; branch hanya dihapus jika opsi dipilih dan API mengonfirmasi.
9. Release/deployment tampil sukses hanya setelah provider mengembalikan status sukses.
10. Setiap aksi sensitif tercatat di audit log; error API ditampilkan dengan pesan yang dapat ditindaklanjuti.

## 15. QA Test Scenarios

| ID | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| QA-01 | Create branch dengan slug kosong/karakter ilegal | Submit ditolak; pesan validasi spesifik |
| QA-02 | Nama branch sudah ada | Conflict ditampilkan; input tetap tersedia |
| QA-03 | User read-only mencoba membuat branch | Aksi tidak tersedia atau API menolak dengan 403 |
| QA-04 | Required check masih pending | Merge dinonaktifkan/ditolak dengan alasan |
| QA-05 | Salah satu required check gagal | Status Failed; link log tersedia; merge diblokir |
| QA-06 | PR memiliki conflict | Merge diblokir; instruksi resolusi ditampilkan |
| QA-07 | Approval berasal dari author PR | Tidak dihitung jika policy melarang self-approval |
| QA-08 | Webhook signature invalid | Backend menolak payload dan mencatat event keamanan |
| QA-09 | GitHub rate limit habis | UI menampilkan rate limit dan waktu retry |
| QA-10 | Network putus saat create branch | Tidak mengklaim sukses; status direkonsiliasi saat refresh |
| QA-11 | Merge sukses, delete branch gagal | PR tetap Merged; kegagalan hapus branch ditampilkan terpisah |
| QA-12 | Layar mobile membuka detail PR | Konten tetap dapat digunakan; diff punya scroll horizontal |
| QA-13 | Sesi berakhir saat mengisi form | Login ulang; input form tidak hilang |
| QA-14 | Webhook delivery ganda (redelivery) | Diproses sekali berdasarkan delivery ID |
| QA-15 | PR ditutup tanpa merge | Tiket tidak menjadi Done; pengguna diberi notifikasi |
| QA-16 | Percobaan menghapus default/protected branch | Ditolak dengan alasan; tercatat di audit |
| QA-17 | Merge ganda dari dua pengguna bersamaan | Satu berhasil, satu menerima 409 dan melihat status terbaru |

## 16. Risiko, Asumsi, dan Keputusan yang Harus Dikonfirmasi

| ID | Topik | Risiko / asumsi | Keputusan yang dibutuhkan | Pemilik (usulan) |
| --- | --- | --- | --- | --- |
| D-01 | Backend tersedia? | Operasi GitHub nyata tidak aman/layak dari frontend saja | Tentukan backend/API gateway | Tech Lead |
| D-02 | GitHub auth | PAT berisiko bocor dan scope berlebih | Utamakan GitHub App; tentukan owner instalasi | Admin Integrasi |
| D-03 | Strategi branch | Alur main/staging/feature tidak cocok semua proyek | Template strategi per repository | Tech Lead |
| D-04 | Release strategy | Staging → main → production belum rinci | Tentukan approval, tagging, deploy, rollback | Tech Lead + PM |
| D-05 | CI provider | Nama dan jumlah checks beda antar repo | Gunakan dynamic checks dari provider | Tech Lead |
| D-06 | Telegram/Sentry | Endpoint dan credential belum diketahui | Tentukan service owner dan secret management | Admin Integrasi |
| D-07 | Retensi audit | Kebutuhan kepatuhan belum ditetapkan | Tentukan masa retensi dan akses ekspor | Product Owner |
| D-08 | Data user/2FA | API mungkin tidak menyediakan semua data | Tampilkan hanya data tersedia dan berizin | Product Owner |
| D-09 | Kebijakan self-approval dan QA gate | Aturan berbeda antar tim | Tetapkan default dan opsi per repository | Tech Lead + QA |

Keputusan D-01, D-02, dan D-03 menjadi prasyarat dimulainya implementasi MVP.

## 17. Rekomendasi Implementasi untuk HTML/CSS/JavaScript

- Pisahkan file berdasarkan tanggung jawab: app shell, router/navigation, API client, state/store, components, pages, validators, styles, utilities.
- Gunakan ES modules; hindari satu file JavaScript besar dengan fungsi render saling bergantung.
- Bangun komponen reusable: DataTable, StatusBadge, Modal, Toast, Tabs, EmptyState, ConfirmDialog, LoadingSkeleton.
- Gunakan satu API client terpusat untuk auth session, pemetaan error, timeout, dan retry yang aman.
- Definisikan state UI eksplisit: idle, loading, success, empty, error, disabled.
- Jangan memakai data dummy di produksi. Mode demo, jika perlu, diberi label DEMO dan dipisahkan sumber datanya.
- Tambahkan automated test untuk validator, permission gating, transisi state, dan critical user journey.

## 18. Definition of Done

- Semua requirement P0 memiliki implementasi dan test yang dapat diulang.
- Tidak ada tombol utama yang hanya dekoratif atau tanpa handler.
- Semua request memiliki state loading, success, error, dan empty yang sesuai.
- Aksi sensitif divalidasi ulang di backend.
- Tidak ada secret di bundle frontend, source map publik, atau browser storage.
- Layout diuji pada desktop, tablet, dan mobile.
- Navigasi keyboard, focus state, label, dan kontras memenuhi WCAG 2.2 AA sejauh relevan.
- Dokumentasi konfigurasi, permission, webhook, dan prosedur pemulihan tersedia.
- Product Owner, Tech Lead, QA, dan Admin Integrasi menyetujui alur kerja.

## 19. Glosarium

| Istilah | Arti |
| --- | --- |
| Branch | Cabang pengembangan terpisah dari branch dasar |
| Commit | Snapshot perubahan dalam riwayat Git |
| Push | Mengirim commit lokal ke remote repository |
| Pull Request (PR) | Permintaan untuk meninjau dan menggabungkan perubahan |
| Required checks | Pemeriksaan wajib yang harus lulus sebelum merge |
| Branch protection | Aturan untuk melindungi branch penting |
| Webhook | Notifikasi HTTP dari suatu layanan ketika event terjadi |
| Deployment | Proses merilis versi aplikasi ke environment |
| SSE/WebSocket | Teknik komunikasi server-client untuk pembaruan lebih cepat |
| GitHub App | Integrasi GitHub dengan izin granular per installation, alternatif PAT |
| Idempotency key | Kunci unik agar permintaan yang diulang tidak menghasilkan efek ganda |
| QA gate | Penanda validasi QA di ERP, terpisah dari approval review GitHub |
| Hotfix | Perbaikan mendesak yang berangkat dari main dan di-backport ke staging |

## 20. Kesimpulan Produk

Modul GitHub ASTACODE ERP diposisikan sebagai **GitHub workflow control center**, bukan sekadar dashboard statistik. Pengalaman utama berpusat pada tindakan berikutnya yang paling relevan: branch siap dikerjakan, PR menunggu review, checks gagal, approval belum lengkap, atau deployment perlu perhatian.

Prioritas implementasi adalah membuat alur inti yang benar dan aman terlebih dahulu. Setelah integrasi API dan state operasional stabil, fitur lanjutan seperti Telegram bot, Sentry, AI bug-fix, dan release automation dapat ditambahkan tanpa mengorbankan konsistensi UX.

## Riwayat Dokumen

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 4 November 2026 | Penyusunan PRD awal: workflow, UI/UX, fitur, keamanan, integrasi, roadmap, acceptance criteria, QA |
| 1.1 | 4 November 2026 | Revisi: (1) navigasi disatukan; (2) prioritas P0/P1 diselaraskan dengan roadmap (diff & merge ke Release 1); (3) ID persyaratan untuk semua fitur; (4) matriks izin menambah Project Manager dan Delete branch, serta pemisahan QA gate vs approval GitHub; (5) jalur alternatif hotfix/tanpa tiket/epic; (6) modal tambahan (Create PR, Delete Branch, Revoke/Disconnect); (7) path API disatukan, ditambah konvensi API, idempotensi, dan persyaratan non-fungsional; (8) state 401/422 dan idempotensi webhook; (9) QA-13 s.d. QA-17; (10) keputusan terbuka diberi ID dan pemilik; (11) metrik diberi p90 dan metrik performa; (12) glosarium diperluas |
