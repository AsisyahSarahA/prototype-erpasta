
## 1. Ringkasan Eksekutif

Asta HR adalah platform HR terpadu yang dirancang khusus untuk software house dengan kultur **fleksibel dan kekeluargaan**, berorientasi pada **progress kerja** ("yang penting task selesai"), dan menerapkan sistem kerja **hybrid/WFH**. Sistem mengelola tiga kelompok pekerja sekaligus: **karyawan tetap**, **freelancer**, dan **siswa/mahasiswa PKL**.

Perbedaan utama dari software HR konvensional: presensi tidak lagi berfokus pada jam masuk/pulang, tetapi pada **validasi lokasi/jaringan + log progres harian**.

## 2. Latar Belakang & Masalah

| # | Masalah | Dampak |
|---|---|---|
| 1 | Presensi konvensional (clock-in/out) tidak cocok dengan kultur progress-driven | Karyawan merasa dikontrol, data tidak mencerminkan kinerja |
| 2 | Revisi/bugfix mendadak tengah malam tidak tercatat | Lembur tidak terkompensasi, risiko burnout |
| 3 | Tiga tipe pekerja punya aturan bayar berbeda | Payroll manual, rawan salah hitung |
| 4 | Pengajuan PKL masuk via surat/email, kuota dicek manual | Lambat, sering bentrok jadwal, beban admin tinggi |
| 5 | Surat balasan & sertifikat PKL dibuat manual | Tidak konsisten, memakan waktu |

## 3. Tujuan & Metrik Keberhasilan

| Tujuan | Metrik | Target (6 bulan setelah rilis) |
|---|---|---|
| Presensi cepat & tidak memberatkan | Waktu presensi per hari | ≤ 10 detik |
| Mengurangi kerja admin HR | Waktu pemrosesan satu pengajuan PKL | Dari ±2 hari menjadi < 5 menit |
| Payroll akurat | Selisih/koreksi payroll per bulan | < 2% |
| Adopsi tinggi | Karyawan aktif harian | ≥ 90% |
| Kompensasi lembur adil | Klaim Workload Malam yang diproses tepat waktu | 100% pada siklus gaji berikutnya |

### Non-Goals (di luar cakupan v1.0)
- Manajemen performa/OKR penuh
- Learning Management System
- Integrasi pajak langsung ke pemerintah (hanya ekspor data)
- Manajemen cuti & izin
- Pengganti Project Management Tool (Jira/ClickUp), hanya terintegrasi

## 4. Persona & Hak Akses

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Karyawan Tetap** | Staf developer, designer, QA, PM | Presensi cepat, submit progres, lihat slip gaji |
| **Freelancer** | Pekerja berbasis jam/proyek | Catat jam kerja dari task, lihat estimasi pembayaran |
| **Siswa/Mahasiswa PKL** | Peserta magang | Presensi, log harian, lihat nilai & sertifikat |
| **Pembimbing PKL** | Karyawan senior | Review log, input evaluasi |
| **HR Admin** | Pengelola operasional HR | Kelola karyawan, rekrutmen, PKL, payroll |
| **Manajer / Team Lead** | Atasan langsung | Approve lembur/Workload Malam, pantau progres tim |
| **Pelamar & Instansi Pendidikan** | Pihak eksternal (portal publik) | Melamar kerja, mengajukan PKL, cek status |
| **Super Admin / Finance** | Pengaturan sistem & penggajian | Konfigurasi, approval payroll, audit |

### Matriks Role (ringkas)

| Fitur | Karyawan | Freelancer | PKL | Pembimbing | Manajer | HR Admin | Finance |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Presensi & log progres | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve lembur/Workload Malam | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Lihat slip gaji sendiri | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Kelola rekrutmen | ❌ | ❌ | ❌ | ❌ | 👁️ | ✅ | ❌ |
| Kelola PKL | ❌ | ❌ | ❌ | ✅ (evaluasi) | 👁️ | ✅ | ❌ |
| Jalankan payroll | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (draft) | ✅ (final) |
| Konfigurasi sistem | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

> 👁️ = hanya lihat

---

## 5. Ruang Lingkup Modul

```
Asta HR
├── 1. Absensi & Manajemen Workload (Progress-Driven)
├── 2. Perekrutan Karyawan Tetap
├── 3. Manajemen PKL / Magang
├── 4. Payroll Engine
├── 5. Manajemen Karyawan (pendukung)
└── 6. Pengaturan & Administrasi
```

---

## 6. Kebutuhan Fungsional

### 6.1 Modul Absensi & Workload

#### Alur Presensi

```
[ KARYAWAN ]
     ├── Mode Onsite ──► Validasi Wifi "Asta" (BSSID/IP) ──┐
     └── Mode WFH ─────► Validasi Geolocation + Radius ────┼─► [ Presensi Tercatat ]
                                                           │
[ SUBMIT TASK / REVISI ] ──────────────────────────────────┴─► [ Log Progres Harian ]
     └── Revisi > 22:00 ──► Toggle "Klaim Workload Malam"
                                  └──► [ Auto-Carryover ke H+1 ]
```

#### Requirement

| ID | Requirement | Prioritas |
|---|---|:-:|
| ABS-01 | Pengguna memilih mode kerja: **Onsite** atau **WFH** dengan satu klik "Hadir" | P0 |
| ABS-02 | **Onsite:** validasi berdasarkan Wifi kantor "Asta" melalui kecocokan **BSSID** atau **Public IP statis** kantor | P0 |
| ABS-03 | **WFH:** validasi memakai Geolocation API (lat-long); sistem menampilkan titik di peta dan memastikan berada dalam radius toleransi lokasi WFH yang disetujui | P0 |
| ABS-04 | Admin dapat mendaftarkan beberapa lokasi WFH per karyawan beserta radius (default 200 m) | P1 |
| ABS-05 | **Kehadiran penuh** diberikan jika karyawan mengisi **Daily Log** (ringkasan kerja) atau menautkan task (ID Jira/Trello/ClickUp) atau link Git commit/PR | P0 |
| ABS-06 | Daily Log mendukung teks, tautan task, dan tautan commit/PR; bisa diedit sampai pukul 23:59 hari yang sama | P0 |
| ABS-07 | Toggle **"Klaim Workload Malam"** muncul untuk submit di atas pukul 22:00 (ambang dapat dikonfigurasi) | P0 |
| ABS-08 | Klaim malam diproses sebagai **carryover**: (a) jadwal mulai besok boleh lebih siang, atau (b) dikonversi menjadi insentif lembur di payroll (opsi dipilih per kebijakan/karyawan) | P0 |
| ABS-09 | Klaim malam memerlukan approval Manajer (atau auto-approve jika terhubung ke commit/task bertanda waktu malam) | P1 |
| ABS-10 | Status presensi: Hadir Onsite, Hadir WFH, Tanpa Keterangan, Belum Submit Progres | P0 |
| ABS-11 | Pengingat otomatis (push/email/Slack) jika presensi atau progres belum diisi | P2 |
| ABS-12 | Dashboard progres tim: siapa mengerjakan apa, beban kerja, dan kapasitas (story point harian) | P1 |
| ABS-13 | Konfigurasi tipe pekerja: **Tetap** (baseline gaji, target capacity) dan **Freelance** (hourly/project-based) | P0 |

#### Catatan Teknis Penting (Validasi Lokasi)

> ⚠️ **Browser web tidak bisa membaca SSID/BSSID Wifi** karena pembatasan keamanan. Opsi implementasi:
> 1. **Public IP statis kantor** (didukung di web, jadi opsi utama untuk MVP).
> 2. **Mobile app native** (Android/iOS) untuk membaca BSSID; Android membutuhkan izin lokasi, iOS membutuhkan entitlement khusus.
> 3. **Geofence kantor** sebagai cadangan jika Wifi gagal.
>
> Geolocation WFH rentan manipulasi (mock location). Mitigasi: deteksi mock-location di app, simpan akurasi GPS, tandai anomali untuk review HR. Selain itu, koordinat rumah adalah **data pribadi** sehingga perlu persetujuan eksplisit (lihat bagian Kepatuhan).

#### Acceptance Criteria (contoh ABS-02 & ABS-07)
- **Given** perangkat terhubung ke Wifi dengan BSSID/IP terdaftar, **When** pengguna menekan "Hadir Onsite", **Then** presensi tercatat dengan stempel waktu dan metode validasi.
- **Given** perangkat tidak cocok dengan BSSID/IP, **Then** tombol Onsite ditolak dengan pesan jelas dan menawarkan mode WFH.
- **Given** pengguna submit revisi setelah 22:00, **When** toggle Workload Malam diaktifkan, **Then** entri tercipta pada antrian approval dan carryover H+1 terhitung otomatis setelah disetujui.

---

### 6.2 Modul Perekrutan Karyawan Tetap

| ID | Requirement | Prioritas |
|---|---|:-:|
| REC-01 | CRUD lowongan (posisi, tim, level, lokasi, skill, deskripsi, status Draft/Published/Closed) | P0 |
| REC-02 | Publikasi ke halaman karier internal (public career page) | P0 |
| REC-03 | Integrasi **LinkedIn** (sinkron slot lowongan & tarik data pelamar) | P2 |
| REC-04 | Pipeline pelamar bergaya **Kanban**: Applied → Screening → Interview → Technical Test → Offering → Hired / Rejected | P0 |
| REC-05 | **Auto-parsing resume (ATS)**: ekstrak nama, kontak, pendidikan, pengalaman, skill dari PDF/DOCX | P1 |
| REC-06 | Penjadwalan interview + sinkron kalender | P2 |
| REC-07 | Scorecard penilaian interviewer dan catatan kolaboratif | P1 |
| REC-08 | Konversi pelamar "Hired" menjadi profil karyawan (tanpa input ulang) | P1 |

> ⚠️ **Catatan LinkedIn:** akses API LinkedIn Jobs/Talent bersifat **terbatas untuk partner resmi**. Rencana cadangan: (a) ajukan program partner LinkedIn, atau (b) gunakan tautan "Apply with LinkedIn" / impor profil manual, atau (c) multiposting via layanan pihak ketiga.

---

### 6.3 Modul Manajemen PKL / Magang

#### Alur

```
[ Form Pengajuan PKL (publik) ]
        │  Upload surat PDF + range tanggal
        ▼
[ Cek Matriks Kapasitas Kuota ]
   ├── Penuh ──► Status "Kuota Penuh" ──► Surat Penolakan (otomatis)
   └── Tersedia ─► Review HR ──► Surat Balasan Penerimaan (PDF, TTD digital)
        ▼
[ Masa PKL: presensi + log harian + pembimbing ]
        ▼
[ Evaluasi Pembimbing ] ──► [ Sertifikat Dinamis (Nilai: ON/OFF) ]
```

#### Requirement

| ID | Requirement | Prioritas |
|---|---|:-:|
| PKL-01 | Form publik: data siswa/mahasiswa, sekolah/kampus, jurusan, kontak, **upload surat permohonan (PDF)**, **rentang tanggal** PKL | P0 |
| PKL-02 | Validasi file (PDF, maks 5 MB), pencegahan spam (captcha) | P0 |
| PKL-03 | **Matriks kapasitas kuota**: kuota maksimal peserta simultan (misal 5), dikonfigurasi per periode/divisi | P0 |
| PKL-04 | **Auto-check overlap tanggal**: sistem menghitung jumlah peserta aktif pada setiap hari dalam rentang yang diajukan; status **Available** hanya jika kuota cukup di *semua* hari | P0 |
| PKL-05 | **Kalender kuota** dengan filter Tahun/Bulan/Tanggal (heatmap hijau/kuning/merah) | P1 |
| PKL-06 | Auto-reject untuk kuota penuh dengan surat penolakan, **atau** mode "tinjau manual" (konfigurasi HR) | P1 |
| PKL-07 | **Surat balasan otomatis** dalam PDF: template rich-text dinamis (variabel nama, sekolah, tanggal, nomor surat), **nomor surat otomatis**, **tanda tangan digital** | P0 |
| PKL-08 | Editor template surat (rich-text) dengan variabel `{{nama_siswa}}`, `{{sekolah}}`, `{{tanggal_mulai}}`, `{{tanggal_selesai}}`, `{{nomor_surat}}` | P1 |
| PKL-09 | Notifikasi email ke instansi/siswa dengan surat terlampir dan link status | P0 |
| PKL-10 | Penugasan **pembimbing** & divisi ke peserta | P1 |
| PKL-11 | Peserta PKL memakai presensi & log harian (dapat disederhanakan) | P1 |
| PKL-12 | **Form evaluasi** pembimbing (Code Quality, Teamwork, Punctuality, Communication, Problem Solving, dst.; skala & bobot dapat dikonfigurasi) | P0 |
| PKL-13 | **Generator sertifikat** otomatis berbasis template resmi perusahaan | P0 |
| PKL-14 | **Toggle Transkrip Nilai:** **ON**: sertifikat depan-belakang (belakang berisi nilai kompetensi); **OFF**: hanya keterangan menyelesaikan PKL | P0 |
| PKL-15 | Nomor sertifikat unik + **QR verifikasi publik** | P1 |
| PKL-16 | Pratinjau sertifikat sebelum terbit dan riwayat dokumen yang terbit | P1 |

#### Logika Kuota (pseudo-query)

```sql
-- Untuk setiap hari d dalam [start_req, end_req]:
SELECT d, COUNT(*) AS terisi
FROM pkl_placements
WHERE status IN ('approved','active')
  AND start_date <= d AND end_date >= d
GROUP BY d;
-- Available jika MAX(terisi) < kuota_maks untuk seluruh rentang
```

---

### 6.4 Modul Payroll Engine

| ID | Requirement | Prioritas |
|---|---|:-:|
| PAY-01 | Siklus payroll bulanan dengan status Draft → Review → Approved → Paid | P0 |
| PAY-02 | **Karyawan Tetap:** gaji pokok + tunjangan + kompensasi Workload Malam/insentif lembur − potongan (absen tanpa keterangan) | P0 |
| PAY-03 | **Freelance:** hitung dari **total logged hours** × hourly rate, atau **persentase/milestone proyek** | P0 |
| PAY-04 | Komponen gaji bisa dikonfigurasi (tambah/kurang, tetap/persentase) | P1 |
| PAY-05 | **Slip gaji PDF otomatis** + distribusi via email/portal | P0 |
| PAY-06 | Jejak audit & approval Finance sebelum finalisasi | P0 |
| PAY-07 | Ekspor ke format bank (CSV transfer massal) | P2 |
| PAY-08 | Peserta PKL: uang saku/tunjangan opsional | P2 |

### 6.5 Manajemen Karyawan (Pendukung)

| ID | Requirement | Prioritas |
|---|---|:-:|
| EMP-01 | Direktori & profil karyawan (data pribadi, kontrak, tipe pekerja, tim, atasan) | P0 |
| EMP-02 | Struktur organisasi & tim | P1 |
| EMP-03 | Dokumen karyawan (kontrak, KTP, NPWP) dengan akses terbatas | P1 |
| EMP-04 | Onboarding/offboarding checklist | P2 |

### 6.6 Pengaturan & Administrasi

| ID | Requirement | Prioritas |
|---|---|:-:|
| SET-01 | Manajemen role & permission (RBAC) | P0 |
| SET-02 | Konfigurasi lokasi kantor (SSID/BSSID/IP), radius WFH, ambang jam malam | P0 |
| SET-03 | Template dokumen (surat, sertifikat, slip gaji) | P1 |
| SET-04 | Audit log seluruh aksi sensitif | P0 |
| SET-05 | Integrasi (Jira/Trello/ClickUp, GitHub/GitLab, Slack, LinkedIn, Email) | P1 |
| SET-06 | Notifikasi (in-app, email, push) | P1 |

---

## 7. Alur Kerja Utama (End-to-End)

| # | Alur | Deskripsi |
|---|---|---|
| 1 | **Presensi & Progres Harian** | Buka app → validasi Wifi/Geolocation → isi deskripsi task/link commit → (opsional) aktifkan Workload Malam |
| 2 | **Kalkulasi Payroll** | Sistem menarik rekap presensi/progres bulanan → hitung sesuai tipe pekerja → slip PDF otomatis |
| 3 | **Validasi Kuota PKL** | Instansi mengisi form → sistem query kuota pada rentang tanggal → hasil Available/Penuh |
| 4 | **Respon Otomatis & Sertifikat** | Surat balasan PDF otomatis → akhir periode pembimbing input evaluasi → sertifikat digital terbit (nilai ON/OFF) |

---

## 8. Desain UI/UX

### 8.1 Prinsip Desain
Antarmuka bergaya **enterprise SaaS kelas Jira/Atlassian**: padat informasi tetapi bersih, konsisten, cepat dipindai, dan nyaman dipakai seharian. Target kesan: *profesional, tepercaya, modern, setingkat software house nasional.*

### 8.2 Struktur Layout Global

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR (56px): Logo │ Search (Ctrl+K) │ + Buat │ Notif │ Help │ Avatar │
├────────────┬─────────────────────────────────────────────────────────┤
│            │ Breadcrumb  ›  Judul Halaman         [Aksi Utama]       │
│  SIDEBAR   │ ─────────────────────────────────────────────────────── │
│  (Biru     │ Tabs / Filter bar / View switcher (List│Board│Calendar)  │
│   Tua)     │ ─────────────────────────────────────────────────────── │
│  260px     │                                                         │
│            │   AREA KONTEN UTAMA (putih soft)                        │
│  collapse  │   Card, Tabel, Kanban, Kalender, Form                   │
│  → 64px    │                                                         │
│            │                                          ┌────────────┐ │
│            │                                          │ Detail     │ │
│            │                                          │ Drawer 480 │ │
└────────────┴──────────────────────────────────────────┴────────────┘
```

### 8.3 Design Tokens

#### Warna

| Token | Hex | Pemakaian |
|---|---|---|
| `--sidebar-bg` | `#0B1F4B` | Latar sidebar (**biru tua**) |
| `--sidebar-bg-hover` | `#142B63` | Hover item sidebar |
| `--sidebar-active` | `#1D3A80` | Item aktif (+ indikator kiri 3px `#4C9AFF`) |
| `--sidebar-text` | `#C7D2EC` | Teks/ikon sidebar |
| `--sidebar-text-active` | `#FFFFFF` | Teks item aktif |
| `--bg-main` | `#F7F8FA` | **Latar konten utama (putih soft)** |
| `--surface` | `#FFFFFF` | Card, tabel, modal, drawer |
| `--border` | `#E4E7EC` | Garis & pemisah |
| `--text-primary` | `#172B4D` | Teks utama |
| `--text-secondary` | `#5E6C84` | Teks sekunder |
| `--primary` | `#2563EB` | Tombol utama, link |
| `--primary-hover` | `#1D4ED8` | Hover tombol utama |
| `--success` | `#16A34A` | Hadir, Approved, Available |
| `--warning` | `#D97706` | Menunggu, Kuota hampir penuh |
| `--danger` | `#DC2626` | Ditolak, Kuota penuh, Error |
| `--info` | `#0891B2` | Informasi, WFH |

> Kontras teks sidebar terhadap latar harus ≥ 4.5:1 (WCAG AA).

#### Tipografi
- **Font:** Inter (fallback: system-ui, Segoe UI, Roboto)
- Skala: H1 24/32 (600), H2 20/28 (600), H3 16/24 (600), Body 14/20 (400), Caption 12/16 (400)
- Angka tabular (`font-variant-numeric: tabular-nums`) untuk tabel gaji & kuota

#### Spacing, Radius, Shadow
- Grid spasi 4 px (4, 8, 12, 16, 24, 32)
- Radius: 6 px (input/tombol), 8 px (card), 12 px (modal)
- Shadow card: `0 1px 2px rgba(9,30,66,.08)`; drawer/modal: `0 8px 24px rgba(9,30,66,.16)`

### 8.4 Sidebar (Biru Tua)

```
[Logo] Asta HR           ◀ (collapse)
─────────────────────────
🏠  Beranda
✅  Absensi
    ├ Presensi Saya
    ├ Daily Log
    ├ Workload Malam
    └ Rekap Tim
👥  Karyawan
🎯  Rekrutmen
    ├ Lowongan
    └ Pipeline Pelamar
🎓  Manajemen PKL
    ├ Pengajuan
    ├ Kalender Kuota
    ├ Peserta Aktif
    ├ Evaluasi
    └ Sertifikat
💰  Payroll
📄  Dokumen & Template
📊  Laporan
─────────────────────────
⚙️  Pengaturan
👤  Profil Pengguna
```

- Mendukung **collapse** (ikon saja + tooltip), **grup yang dapat dilipat**, **badge angka** (misal pengajuan menunggu), dan menu dinamis sesuai role.

### 8.5 Komponen Wajib (Pola Jira)

| Komponen | Spesifikasi |
|---|---|
| **Top bar** | Pencarian global + command palette `Ctrl/⌘+K`, tombol "+ Buat", notifikasi, bantuan, avatar |
| **Breadcrumb & page header** | Judul besar + aksi utama di kanan |
| **View switcher** | List / Board (Kanban) / Calendar / Timeline |
| **Filter bar** | Filter cepat (chip), filter lanjutan, **saved filters** |
| **Tabel data** | Header sticky, sorting, resize kolom, pilih kolom, bulk action, paginasi/infinite scroll, inline status lozenge |
| **Kanban board** | Drag & drop kartu antar kolom (pipeline rekrutmen), WIP counter, avatar & label |
| **Detail drawer / panel samping** | Klik baris membuka panel kanan (tanpa pindah halaman) |
| **Status lozenge** | Pil kecil berwarna: Hadir, WFH, Pending, Approved, Rejected, Full, Available |
| **Kalender kuota** | Heatmap hijau/kuning/merah per hari + tooltip "3/5 terisi" |
| **Form** | Label di atas, validasi inline, bagian dapat dilipat, autosave draft |
| **Toast & banner** | Konfirmasi aksi, peringatan kuota/anomali |
| **Empty state & skeleton loading** | Ilustrasi ringan + CTA, skeleton alih-alih spinner penuh |
| **Mode gelap (opsional v1.1)** | Token terpisah, sidebar tetap biru tua |

### 8.6 Inventaris Layar Utama

| Modul | Layar |
|---|---|
| **Beranda** | Kartu "Presensi Hari Ini" (tombol Hadir Onsite / WFH), ringkasan progres, tugas menunggu approval, pengumuman |
| **Absensi** | Presensi Saya (peta + status validasi), Daily Log (editor + tautan task/commit), Workload Malam, Rekap Tim (tabel/kalender), Dashboard Workload |
| **Rekrutmen** | Daftar lowongan, detail lowongan, **Kanban pipeline**, profil pelamar (resume viewer + scorecard) |
| **PKL** | Daftar pengajuan, detail pengajuan (surat PDF + hasil cek kuota), **Kalender Kuota**, peserta aktif, form evaluasi, generator sertifikat (pratinjau + **toggle Transkrip Nilai**) |
| **Payroll** | Siklus payroll, rincian per karyawan, pratinjau slip gaji |
| **Portal Publik** | Career page, **Form Pengajuan PKL**, halaman cek status, verifikasi sertifikat via QR |
| **Pengaturan** | Lokasi & jaringan, role, template, integrasi, kebijakan lembur |

### 8.7 Responsif & Aksesibilitas
- Breakpoint: ≥1280 (penuh), 768–1279 (sidebar otomatis collapse), <768 (sidebar menjadi drawer hamburger; presensi dioptimalkan untuk mobile).
- Navigasi keyboard penuh, focus ring jelas, label ARIA, kontras WCAG AA.
- Bahasa utama: **Bahasa Indonesia** (siap i18n untuk Inggris).

---

## 9. Model Data (Entitas Inti)

| Entitas | Atribut Kunci |
|---|---|
| `users` | id, nama, email, role, status |
| `employees` | user_id, tipe (tetap/freelance/pkl), tim, atasan_id, gaji_pokok, hourly_rate |
| `office_networks` | ssid, bssid, public_ip, aktif |
| `wfh_locations` | employee_id, lat, lng, radius_m, status_approval |
| `attendances` | employee_id, tanggal, mode (onsite/wfh), metode_validasi, lat, lng, waktu, status |
| `daily_logs` | attendance_id, ringkasan, task_ref, commit_url, jam_kerja |
| `night_claims` | daily_log_id, waktu_submit, tipe_kompensasi (carryover/insentif), status, approver |
| `job_postings` | judul, tim, level, status, linkedin_id |
| `applicants` | job_id, data_parsed, resume_url, stage, skor |
| `pkl_requests` | nama, instansi, surat_url, tgl_mulai, tgl_selesai, status, nomor_surat |
| `pkl_quota_rules` | periode_mulai, periode_selesai, kuota_maks, divisi |
| `pkl_evaluations` | placement_id, kriteria, nilai, pembimbing_id |
| `certificates` | placement_id, nomor, tampil_nilai (bool), pdf_url, qr_token |
| `payroll_runs` / `payslips` | periode, status, komponen, total, pdf_url |
| `document_templates` | tipe, konten_richtext, variabel |
| `audit_logs` | actor, aksi, entitas, waktu, detail |

---

## 10. Kebutuhan Non-Fungsional

| Kategori | Requirement |
|---|---|
| **Performa** | Halaman utama < 2 detik (p95); presensi < 1 detik respons server |
| **Ketersediaan** | 99.5% uptime; backup harian |
| **Keamanan** | RBAC, enkripsi TLS & data sensitif at-rest, SSO (Google/Microsoft) + 2FA opsional, audit log, rate limiting |
| **Privasi & Kepatuhan** | Patuh **UU PDP No. 27/2022**: persetujuan eksplisit untuk lokasi & data pribadi, retensi data, hak akses/hapus data |
| **Skalabilitas** | Mendukung ≥ 500 pengguna aktif & penambahan modul |
| **Kompatibilitas** | Chrome, Edge, Safari, Firefox (2 versi terakhir); iOS & Android |
| **Dokumen** | PDF A4 berkualitas cetak, tanda tangan digital dengan QR verifikasi |
| **Observabilitas** | Logging terpusat, monitoring error, dashboard metrik |

---

## 11. Integrasi

| Sistem | Tujuan | Prioritas |
|---|---|:-:|
| Jira / Trello / ClickUp | Tarik ID task & status untuk Daily Log | P1 |
| GitHub / GitLab | Validasi commit/PR | P1 |
| LinkedIn | Publikasi lowongan & tarik pelamar (bergantung akses partner) | P2 |
| Email (SMTP/API) | Notifikasi, surat balasan, slip gaji | P0 |
| Slack / WhatsApp | Pengingat presensi & approval | P2 |
| Google/Microsoft SSO | Login | P1 |
| Google Calendar | Jadwal interview | P2 |

---

## 12. Rencana Rilis (Roadmap)

| Fase | Cakupan | Estimasi |
|---|---|---|
| **MVP (Fase 1)** | Design system & layout, auth/RBAC, profil karyawan, presensi (IP + Geolocation), Daily Log, Workload Malam | 8–10 minggu |
| **Fase 2** | Modul PKL lengkap (form publik, kuota, surat otomatis, evaluasi, sertifikat + toggle nilai) | 6–8 minggu |
| **Fase 3** | Payroll Engine (tetap + freelance), slip gaji PDF | 6–8 minggu |
| **Fase 4** | Rekrutmen (pipeline, career page, ATS parsing), integrasi task/Git | 6–8 minggu |
| **Fase 5** | Integrasi LinkedIn, mobile app native (BSSID), mode gelap, laporan lanjutan | 6+ minggu |

> Estimasi bersifat kasar dan bergantung pada ukuran tim.

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Browser tidak bisa baca BSSID | Validasi Onsite tidak akurat | Gunakan Public IP statis + app native pada fase lanjut |
| Manipulasi lokasi (fake GPS) | Presensi tidak valid | Deteksi mock location, flag anomali, kebijakan berbasis kepercayaan (kultur kekeluargaan) |
| Akses API LinkedIn terbatas | Fitur integrasi tertunda | Rencana cadangan: tautan apply/impor manual |
| Kesalahan hitung payroll | Dampak finansial & kepercayaan | Mode Draft + review Finance + audit trail + uji dengan data nyata paralel |
| Data lokasi & pribadi sensitif | Risiko hukum (UU PDP) | Persetujuan eksplisit, minimisasi data, enkripsi, retensi |
| Kuota PKL salah hitung (overlap) | Peserta melebihi kapasitas | Unit test logika overlap & pengecekan ulang saat approval (hindari race condition) |

---

## 14. Pertanyaan Terbuka (Perlu Keputusan)

1. Apakah Wifi kantor memiliki **IP publik statis**? Apakah tim siap memakai **mobile app native** untuk BSSID?
2. Aturan **Workload Malam**: carryover jam (masuk lebih siang) atau insentif uang? Berapa rate dan batas maksimum per bulan?
3. Apakah klaim malam otomatis disetujui atau butuh approval manajer?
4. Berapa **kuota PKL maksimal** simultan, apakah per divisi atau global?
5. Apakah penolakan PKL karena kuota penuh benar-benar **otomatis**, atau HR tetap meninjau?
6. Tool manajemen task yang dipakai: Jira, Trello, atau ClickUp (menentukan prioritas integrasi)?
7. Aturan pajak PPh 21: dihitung di sistem atau hanya input manual?
8. Siapa penandatangan digital surat & sertifikat, dan apakah perlu tanda tangan tersertifikasi (TTE)?
9. Stack teknologi pilihan (frontend/backend/DB) dan tim pengembang yang tersedia?

---

## 15. Lampiran: Daftar Prioritas

- **P0:** wajib untuk rilis fase terkait
- **P1:** penting, dikerjakan bila kapasitas memungkinkan
- **P2:** nilai tambah, dapat ditunda
