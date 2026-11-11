# HR Repair Checklist

Dokumen ini adalah sumber status utama untuk pekerjaan perbaikan modul HR dan integrasinya dengan Project Management (PM) serta Finance.

## Status

- `[x]` Selesai
- `[~]` Sedang dikerjakan
- `[ ]` Belum dikerjakan
- `[!]` Terblokir / membutuhkan keputusan

Catatan: status `Selesai` pada bagian audit berarti masalah sudah diverifikasi, bukan berarti perbaikannya sudah diterapkan.

## Progress Saat Ini

- [x] Audit awal seluruh file Markdown dan prototype terkait HR, PM, Finance, sidebar, serta master PRD.
- [x] Audit ulang route HR melalui browser lokal.
- [x] Menemukan error runtime Payroll dan Slip Gaji.
- [x] Menemukan route Workload Malam yang salah.
- [x] Menemukan duplikasi kepemilikan Payroll antara HR dan Finance.
- [x] Perbaikan prototype HR dan bridge HR–PM–Finance selesai. Item produksi/backend diberi status blocked.

## A. Perbaikan Kritis Modul HR

### P0 — Wajib sebelum prototype dianggap stabil

- [x] **HR-001 — Pulihkan data `NIGHT`**
  - Masalah: `computePayslip()` menggunakan `NIGHT`, tetapi deklarasi datanya hilang.
  - Lokasi: `HR/hr.js:228`, `HR/hr.js:524`.
  - Dampak: halaman Payroll dan Slip Gaji menghasilkan `ReferenceError`.
  - Pekerjaan: kembalikan seed data klaim malam atau ubah semua fungsi agar memakai sumber state klaim yang konsisten.
  - Validasi: Payroll dan Slip Gaji dapat dibuka tanpa page error; insentif workload malam masuk ke perhitungan.
  - Status pekerjaan: selesai. Seed `NIGHT` dipulihkan dari baseline prototype dan dipakai bersama oleh Workload Malam serta Payroll. Validasi browser untuk Payroll dan Slip Gaji lulus tanpa `pageerror`.

- [x] **HR-002 — Perbaiki route Workload Malam**
  - Masalah: route terdaftar sebagai `reg('Workload Malam', ...)`, bukan route `workload` dengan signature yang benar.
  - Lokasi: `HR/hr.js:521`.
  - Dampak: `#workload` kembali ke Beranda.
  - Pekerjaan: gunakan route ID `workload`, judul `Workload Malam`, breadcrumb, renderer, dan action hook yang benar.
  - Validasi: `hr.html#workload` menampilkan tabel klaim malam.

- [x] **HR-003 — Perbaiki menu Workload Malam**
  - Masalah: item navigasi ditulis `['Workload Malam']` tanpa route ID dan label terpisah.
  - Lokasi: `HR/hr.js:320`.
  - Pekerjaan: ubah menjadi pasangan route dan label yang valid.
  - Validasi: menu dapat diklik dan status aktif mengikuti URL.

### P1 — Penting setelah P0

- [x] **HR-004 — Perbaiki data seed kuota PKL**
  - Masalah: dashboard menampilkan okupansi `7/5`.
  - Lokasi: data `PKL` dan dashboard `HR/hr.js:348`.
  - Pekerjaan: sesuaikan seed agar kapasitas maksimal 5 tidak terlampaui atau ubah seed menjadi status historis/beda divisi yang benar.
  - Validasi: tidak ada data aktif yang melanggar kuota global/per divisi.

- [x] **HR-005 — Kunci pembatasan role dan action**
  - Masalah: Manager dapat melihat tombol `Tambah Karyawan`, `Tambah Lowongan`, dan form publik meskipun matriks role menyatakan sebagian besar hanya view.
  - Lokasi: `HR/hr.js:311`, `HR/hr.js:2130+`.
  - Pekerjaan: bedakan permission `view`, `create`, `update`, `approve`, dan `finalize`; sembunyikan action yang tidak diizinkan.
  - Validasi: setiap role hanya melihat halaman dan tombol yang sesuai.

- [x] **HR-006 — Samakan navigasi HR**
  - Masalah: sub-navigation HTML tidak memuat Payroll, Sertifikat, dan Dokumen, sedangkan sidebar memuatnya.
  - Lokasi: `HR/hr.html:52-65`.
  - Pekerjaan: tetapkan satu struktur navigasi final dan samakan sidebar serta sub-navigation.
  - Validasi: semua halaman utama dapat ditemukan dari navigasi yang konsisten.

## B. Batas Kepemilikan Data Lintas Modul

- [x] **INT-001 — Tetapkan HR sebagai sumber data karyawan**
  - HR memiliki data karyawan, jabatan, status aktif, rate, atasan, dan struktur organisasi.
  - PM dan Finance hanya membaca melalui API/event.
  - Tambahkan `employee_id`/`user_id` sebagai relasi resmi.

- [x] **INT-002 — Tetapkan PM sebagai sumber timer task**
  - Jam freelancer tidak boleh lagi berasal dari hardcode HR.
  - Lokasi masalah: `HR/hr.js:72` (`hoursFL`).
  - HR membaca `time_log_id`, `task_id`, `project_id`, dan total jam dari PM.
  - Validasi: perubahan timer PM mengubah estimasi payroll freelancer.

- [x] **INT-003 — Tetapkan HR sebagai pembuat draft payroll**
  - HR menghitung komponen payroll berdasarkan data karyawan, presensi, absensi, workload malam, dan time log.
  - Status awal: `DRAFT`.

- [x] **INT-004 — Tetapkan Finance sebagai pemilik finalisasi payroll**
  - Finance melakukan review, approval, pembayaran, transfer bank, dan jurnal.
  - Status: `DRAFT -> REVIEW -> APPROVED -> PAID`.
  - Finance tidak boleh memiliki master payroll kedua.

- [x] **INT-005 — Hapus duplikasi payroll Finance**
  - Lokasi: `finance/index.html:1168`, `finance/index.html:3038`.
  - Pekerjaan: ubah data payroll Finance menjadi hasil sinkronisasi HR yang read-only untuk master karyawan dan komponen gaji.
  - Finance tetap memiliki action review, approve, pay, dan journal.

## C. Kontrak Data HR–PM–Finance

- [x] **DATA-001 — Standarkan ID lintas modul**
  - Wajib tersedia: `user_id`, `employee_id`, `project_id`, `task_id`, `time_log_id`, `payroll_run_id`, `journal_entry_id`.

- [x] **DATA-002 — Hubungkan Daily Log ke PM/Git**
  - Tambahkan relasi atau reference terstruktur untuk task, commit, pull request, project, dan sumber validasi.

- [x] **DATA-003 — Hubungkan payroll ke project bila diperlukan**
  - Komponen payroll harus dapat diberi alokasi `project_id` atau ditandai sebagai OPEX umum.
  - Payroll karyawan tetap default masuk OPEX.
  - Freelancer berbasis project dapat masuk HPP project.

- [x] **DATA-004 — Buat event lintas modul**
  - `attendance.recorded`
  - `daily_log.submitted`
  - `night_claim.approved`
  - `payroll.draft.created`
  - `payroll.approved`
  - `payroll.paid`
  - `employee.updated`
  - `employee.availability.changed`

- [x] **DATA-005 — Tambahkan status sinkronisasi**
  - Setiap integrasi menampilkan `last_synced_at`, status sukses/gagal, error terakhir, dan retry/fallback manual.

## D. Fitur HR yang Dibutuhkan Modul Lain

- [x] **PM-001 — Availability dan kapasitas karyawan**
  - PM membutuhkan status aktif, kapasitas mingguan, role, skill, dan availability.

- [x] **PM-002 — Kalender cuti minimum**
  - PM membutuhkan informasi cuti/hari libur untuk menghitung kapasitas.
  - HR PRD saat ini menyebut cuti sebagai non-goal; keputusan ini harus diselesaikan sebelum development.

- [x] **PM-003 — Sinkronisasi anggota project**
  - PM mengambil anggota dari HR berdasarkan `employee_id`, bukan nama bebas.

- [x] **FIN-001 — Payroll HR ke jurnal Finance**
  - Finance membuat jurnal payroll dari payload HR dengan `source_module = HR`.

- [x] **FIN-002 — Pemisahan OPEX dan HPP**
  - Gaji karyawan tetap: OPEX.
  - Freelancer berbasis project: HPP project.
  - Biaya tanpa project: OPEX umum.

- [x] **FIN-003 — Sinkron status pembayaran**
  - Status `APPROVED` dan `PAID` dari Finance harus terlihat kembali di HR.

## E. Dokumen dan Arsitektur yang Harus Dikunci

- [x] **DOC-001 — Masukkan HR ke Master PRD**
  - Tambahkan HR ke arsitektur modul, sitemap, RBAC, data bridge, dan roadmap di [MASTER_PRD.md](../MASTER_PRD.md).

- [x] **DOC-002 — Tambahkan fase HR ke Master Prompt**
  - Tambahkan fase backend/frontend HR dan integrasi HR–PM–Finance di [MASTER_PROMPT_ERP.md](../MASTER_PROMPT_ERP.md).

- [x] **DOC-003 — Tetapkan dokumen sebagai sumber kebenaran**
  - `MASTER_PRD.md`: arsitektur lintas modul.
  - `HR_PRD.md`: detail HR.
  - `PM.md`: detail PM.
  - `PRD_Finance.md`: detail Finance.
  - `MASTER_PROMPT_ERP.md`: urutan implementasi teknis.

- [!] **DOC-004 — Hapus duplikasi resume PM**
  - Pilih salah satu dari `resume_module_MP.md` dan `MP/docs/resume_module_MP.md`.

- [x] **DOC-005 — Tetapkan lokasi HR PRD**
  - Satu lokasi aktif yang tersedia: `HR_PRD.md` di root project. `HR/HR_PRD.md` sudah tidak digunakan.

- [!] **DOC-006 — Putuskan scope Finance**
  - `PRD.md` masih memuat Fixed Asset, Taxation, dan Budgeting.
  - `PRD_Finance.md` menyatakan fitur tersebut dihapus.
  - Development tidak boleh dimulai sebelum satu keputusan scope dipilih.

## F. Keamanan dan Kesiapan Produksi

- [!] **SEC-001 — Pindahkan authorization ke backend**
  - Selector role di browser hanya simulasi dan tidak boleh dianggap sebagai keamanan.

- [!] **SEC-002 — Validasi upload di server**
  - Validasi PDF, ukuran file, MIME, malware scan, storage privat, dan audit akses.

- [!] **SEC-003 — Lindungi data sensitif**
  - Dokumen KTP/NPWP, koordinat WFH, gaji, slip, dan data pelamar memerlukan RBAC, enkripsi, dan audit.

- [!] **SEC-004 — Bedakan prototype dan integrasi nyata**
  - Tombol sinkronisasi, email, PDF, QR, SSO, Jira, GitHub, Slack, dan LinkedIn harus diberi status simulasi sampai backend tersedia.

## G. Acceptance Test Sebelum Development Dimulai

- [x] `hr.html#workload` menampilkan tabel Workload Malam tanpa error.
- [x] `hr.html#payroll` menampilkan Payroll tanpa error.
- [x] `hr.html#payslip` menampilkan Slip Gaji tanpa error.
- [x] Klaim Workload Malam Approved masuk ke payroll sesuai kebijakan.
- [x] Manager tidak dapat membuat data yang hanya boleh dibuat HR.
- [x] Jam freelancer berasal dari timer PM.
- [x] Draft payroll HR dapat dibaca Finance.
- [x] Finance dapat mengubah status payroll menjadi Approved dan Paid.
- [x] Jurnal payroll Finance memiliki `source_module = HR` pada payload integrasi.
- [x] Status Review/Approved/Paid terlihat kembali di HR setelah reload.
- [x] Data karyawan PM sama dengan data HR melalui `employee_id`/`user_id`.
- [x] Data aktif PKL tidak melebihi kuota.
- [x] Daily Log dapat dikaitkan ke task, project, commit/PR, dan time log PM.
- [x] Data cuti/availability tersedia pada feed HR untuk dibaca PM.

Catatan: item `[!]` membutuhkan backend, keputusan scope, atau keputusan dokumen di luar perubahan UI prototype. Item tersebut tidak dianggap selesai hanya karena simulasi browser berhasil.

## Cara Melanjutkan Pekerjaan

Jika sesi dilanjutkan dengan pesan **“lanjut”**, baca dokumen ini terlebih dahulu. Kerjakan item pertama berstatus `[ ]` atau `[~]` sesuai prioritas P0, kemudian:

1. Periksa file dan baris yang disebutkan.
2. Implementasikan perubahan yang diperlukan.
3. Jalankan validasi terkait.
4. Ubah status checklist.
5. Tambahkan keterangan hasil, file yang berubah, dan hasil test.
6. Lanjutkan ke item berikutnya tanpa mengulang audit dari awal.

## Log Pekerjaan

### 2026-11-11 — Audit lintas modul

- Status: selesai.
- File diperiksa: seluruh Markdown project, prototype HR, Finance, PM, sidebar, dan referensi master.
- Validasi: seluruh route HR diuji melalui browser lokal.
- Hasil utama: Payroll dan Slip Gaji error karena `NIGHT` tidak tersedia; Workload Malam salah route; payroll HR/Finance belum memiliki satu sumber data; PM membutuhkan availability dan time log HR/PM.
- Perubahan kode: seed `NIGHT` dipulihkan, route/menu Workload Malam diperbaiki, dan seed PKL diselaraskan dengan kuota maksimal.

### 2026-11-11 — HR-001 dimulai

- Status: sedang dikerjakan.
- Perubahan: memulihkan seed `NIGHT` di `HR/hr.js`.
- Tujuan: menghilangkan `ReferenceError` pada Payroll dan Slip Gaji serta menyediakan sumber data klaim malam untuk perhitungan insentif.
- Validasi berikutnya: buka route `#payroll` dan `#payslip`, lalu pastikan tidak ada `pageerror`.

### 2026-11-11 — HR-001 selesai, HR-002/HR-003 selesai

- Status: HR-001, HR-002, dan HR-003 selesai.
- Perubahan: route `workload` dikembalikan ke signature `reg()` yang benar; menu Absensi memakai pasangan route ID dan label; tabel memakai key `workload`.
- Validasi: `#workload` menampilkan 2 data klaim, menu memiliki 1 link `#workload`, dan tidak ada `pageerror`.

### 2026-11-11 — Prototype HR dan bridge lintas modul selesai

- Status: seluruh item yang dapat dikerjakan pada prototype selesai; item backend/keputusan eksternal ditandai `[!]`.
- Perubahan: RBAC action, navigasi, employee/user identity, PM time log, project allocation, event log, sync status, payroll Finance read-only, Finance approval/payment bridge, serta dokumentasi Master PRD/Prompt.
- Validasi: 17 route HR lulus smoke test tanpa `pageerror`; `node --check` untuk HR/Finance lulus; `git diff --check` lulus; Finance menyimpan status payroll HR dan HR membacanya kembali setelah reload.

### 2026-11-11 — HR-004 selesai, HR-005 dimulai

- Status: HR-004 selesai; HR-005 sedang dikerjakan.
- Perubahan: dua seed PKL tambahan yang menyebabkan okupansi aktif menjadi 7/5 dipindahkan menjadi riwayat `Selesai`; kuota November tervalidasi 5/5. Manager diberi akses ke Workload Malam untuk proses approval dan tombol create HR dibatasi untuk role HR.
- Validasi: dashboard/kalender tidak lagi melebihi kuota; Manager tidak melihat tombol Tambah Karyawan/Tambah Lowongan; HR tetap melihat Tambah Karyawan; tidak ada `pageerror`.

### 2026-11-11 - Audit dan perbaikan PM-HR selesai

- Status: PM-001, PM-002, PM-003 dan INT-002 selesai pada level prototype aktif.
- File berubah: `MP/vanilla/src/data/mockData.js`, `MP/vanilla/src/state/store.js`, `MP/vanilla/src/components/hr/HrTeamView.js`, `MP/vanilla/src/components/project/ProjectModuleView.js`.
- Perubahan: setiap anggota PM memiliki `employeeId`/`userId`, status availability, kapasitas, dan jatah cuti; PM memiliki feed time log dengan `timeLogId`, `projectId`, `taskId`, status approval, serta penyimpanan timer terstruktur.
- Koreksi penting: workload mingguan memakai `assignedHours`, bukan menjumlahkan estimasi lifetime seluruh task; angka overload palsu seperti 486% sudah dihilangkan.
- Validasi: route `MP/vanilla/index.html#team` tampil tanpa error, identitas `EMP-001` s.d. `EMP-005` terlihat, log approved 6,5 jam untuk `EMP-004` terbaca, dan KPI workload menjadi 170/200 jam (85%).
- Batas prototype: feed masih seed lokal. Integrasi API/event nyata, approval timesheet HR, serta enforcement backend tetap tercatat sebagai pekerjaan produksi pada SEC-001/SEC-004.

### 2026-11-11 - HR PRD backend blueprint selesai

- Status: dokumentasi backend HR selesai diperbarui.
- File: `HR_PRD.md`.
- Isi: seluruh route prototype, pemetaan fitur ke kebutuhan backend, model tabel minimum, endpoint API, aturan bisnis final, kontrak HR-PM-Finance, RBAC server-side, keamanan/PII, queue/retry, acceptance test, migration, roadmap fase backend, dan Definition of Done.
- Keputusan default yang dikunci: attendance IP/GPS, threshold Workload Malam 22:00, quota PKL prototype 5, evaluasi gate 80%, HR membuat Draft payroll, Finance melakukan Review/Approved/Paid.
- Batas yang masih configurable: stack backend, provider eksternal, IP kantor final, signer/TTE, retention, dan aturan pajak detail.

