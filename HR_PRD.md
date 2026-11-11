
# HR Product Requirements Document (PRD)

> **Dokumen acuan utama backend HR.** Versi prototype yang menjadi baseline: `HR/hr.html` + `HR/hr.js`. Bagian 1-15 mempertahankan kebutuhan produk awal; **Bagian 16-26 adalah spesifikasi implementasi final dan wajib dibaca sebelum backend dibuat**. Jika ada perbedaan, bagian final ini dan kontrak data lintas modul menjadi acuan.

**Versi:** 2.0 — Prototype parity + Backend blueprint  
**Status:** Ready for backend design, dengan provider eksternal tetap configurable  
**Pemilik data:** HR untuk employee/attendance/payroll draft/PKL/recruitment; PM untuk task timer; Finance untuk approval/payment/journal

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
| **Siswa/Mahasiswa PKL** | Peserta magang | Presensi, log harian, **mengajukan evaluasi (penilaian diri + refleksi)**, lihat nilai & sertifikat |
| **Pembimbing PKL** | Karyawan senior | Review log, **meninjau pengajuan evaluasi, menyetujui atau mengubah nilai** |
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
| Ajukan evaluasi PKL (penilaian diri + refleksi) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Setujui / ubah nilai evaluasi PKL | ❌ | ❌ | ❌ | ✅ (peserta bimbingannya) | 👁️ | ✅ | ❌ |
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
[ Peserta PKL mengajukan evaluasi: penilaian diri + refleksi ]
        ▼  (status: Diajukan, baru muncul di antrean pembimbing)
[ Pembimbing meninjau ]
   ├── Setujui nilai apa adanya ──────────┐
   ├── Ubah nilai lalu setujui ───────────┼─► [ Evaluasi Disetujui ] ──► [ Sertifikat Dinamis (Nilai: ON/OFF) ]
   └── Minta revisi ──► kembali ke peserta ┘ (status: Revisi, peserta mengajukan ulang)
```

#### Requirement

| ID | Requirement | Prioritas |
|---|---|:-:|
| PKL-01 | Form publik: data siswa/mahasiswa, sekolah/kampus, jurusan, kontak, **upload surat permohonan (PDF)**, **rentang tanggal** PKL | P0 |
| PKL-02 | Validasi file (PDF, maks 5 MB), pencegahan spam (captcha) | P0 |
| PKL-03 | **Matriks kapasitas kuota**: kuota maksimal peserta simultan (misal 5), dikonfigurasi per periode/divisi | P0 |
| PKL-04 | **Auto-check overlap tanggal**: sistem menghitung jumlah peserta aktif pada setiap hari dalam rentang yang diajukan; status **Available** hanya jika kuota cukup di *semua* hari | P0 |
| PKL-05 | **Kalender kuota per bulan**: 12 kartu bulan per tahun terpilih (filter Tahun), tiap kartu menampilkan **puncak okupansi** bulan itu (misal "Puncak 4/5"), heatmap hijau/kuning/merah, dan jumlah peserta aktif. Klik bulan membuka panel daftar peserta beserta rentang tanggalnya. Tidak ada tampilan per hari | P1 |
| PKL-06 | Auto-reject untuk kuota penuh dengan surat penolakan, **atau** mode "tinjau manual" (konfigurasi HR) | P1 |
| PKL-07 | **Surat balasan otomatis** dalam PDF: template rich-text dinamis (variabel nama, sekolah, tanggal, nomor surat), **nomor surat otomatis**, **tanda tangan digital** | P0 |
| PKL-08 | Editor template surat (rich-text) dengan variabel `{{nama_siswa}}`, `{{sekolah}}`, `{{tanggal_mulai}}`, `{{tanggal_selesai}}`, `{{nomor_surat}}` | P1 |
| PKL-09 | Notifikasi email ke instansi/siswa dengan surat terlampir dan link status | P0 |
| PKL-10 | Penugasan **pembimbing** & divisi ke peserta | P1 |
| PKL-11 | Peserta PKL memakai presensi & log harian (dapat disederhanakan) | P1 |
| PKL-12 | **Form evaluasi** dengan kriteria Code Quality, Teamwork, Punctuality, Communication, Problem Solving, dst. (skala 0-100 & bobot dapat dikonfigurasi). Form diisi **dua tahap**: penilaian diri oleh peserta (PKL-17), lalu penilaian final oleh pembimbing (PKL-18) | P0 |
| PKL-13 | **Generator sertifikat** otomatis berbasis template resmi perusahaan | P0 |
| PKL-14 | **Toggle Transkrip Nilai:** **ON**: sertifikat depan-belakang (belakang berisi nilai kompetensi); **OFF**: hanya keterangan menyelesaikan PKL | P0 |
| PKL-15 | Nomor sertifikat unik + **QR verifikasi publik** | P1 |
| PKL-16 | Pratinjau sertifikat sebelum terbit dan riwayat dokumen yang terbit | P1 |
| PKL-17 | **Pengajuan evaluasi oleh peserta**: halaman "Evaluasi Saya" berisi penilaian diri per kriteria (skala 0-100) dan **refleksi** teks. Tombol "Ajukan Evaluasi" aktif jika progres periode PKL ≥ ambang (default 80%, dapat dikonfigurasi di Pengaturan); sebelum itu tombol nonaktif disertai penjelasan | P0 |
| PKL-18 | **Antrean evaluasi pembimbing**: hanya peserta yang sudah mengajukan yang muncul di menu Evaluasi (tab Menunggu / Disetujui / Revisi, filter sekolah/instansi). Peserta yang belum mengajukan tidak dapat dinilai dan hanya ditampilkan sebagai jumlah informasi | P0 |
| PKL-19 | **Tinjau & putuskan**: panel detail menampilkan nilai peserta berdampingan dengan nilai pembimbing (slider awal terisi nilai peserta). Aksi: **Setujui**, **Ubah nilai lalu setujui**, atau **Minta revisi** (dengan catatan). **Nilai final = nilai pembimbing**; nilai diri peserta tersimpan sebagai pembanding | P0 |
| PKL-20 | **Status evaluasi**: Belum Diajukan → Diajukan → Disetujui / Revisi. Peserta dapat melihat status, catatan revisi, dan nilai final setelah Disetujui. Peserta dapat mengajukan ulang setelah status Revisi | P0 |
| PKL-21 | **Gerbang sertifikat**: sertifikat dengan Transkrip Nilai ON hanya dapat diterbitkan jika evaluasi berstatus Disetujui. Mode OFF tetap dapat diterbitkan tanpa evaluasi | P0 |
| PKL-22 | Notifikasi & audit: pembimbing diberi notifikasi saat ada pengajuan baru (+ badge jumlah menunggu di menu Evaluasi); peserta diberi notifikasi saat disetujui/direvisi; seluruh aksi (ajukan, setujui, ubah nilai, minta revisi) tercatat di audit log | P1 |

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

**Tampilan kalender per bulan (PKL-05):** angka per bulan = **nilai tertinggi `terisi` di antara semua hari dalam bulan itu** (puncak okupansi). Status warna memakai aturan yang sama (hijau tersedia, kuning hampir penuh, merah penuh).

> ⚠️ Kalender bulanan hanya **informasi**. Keputusan Available/Penuh pada pengajuan (PKL-04) **tetap dihitung per hari**, karena bulan berstatus penuh bisa tetap memiliki tanggal yang kosong. Pesan hasil cek pada form publik dan analisis pengajuan boleh disebut per bulan (misal "kuota penuh pada November 2026"), tetapi perhitungannya tidak berubah.

#### Acceptance Criteria (PKL-17 s/d PKL-21)
- **Given** peserta PKL belum mengajukan evaluasi, **When** pembimbing membuka menu Evaluasi, **Then** peserta tersebut tidak muncul di antrean.
- **Given** progres periode peserta di bawah ambang, **When** peserta membuka "Evaluasi Saya", **Then** tombol "Ajukan Evaluasi" nonaktif dan menampilkan syarat yang belum terpenuhi.
- **Given** peserta mengisi penilaian diri dan refleksi lalu menekan "Ajukan Evaluasi", **Then** status menjadi Diajukan, entri masuk antrean pembimbing, dan notifikasi terkirim.
- **Given** pembimbing mengubah nilai lalu menyetujui, **Then** nilai final tersimpan sebagai nilai pembimbing, nilai diri tetap tersimpan sebagai pembanding, dan status menjadi Disetujui.
- **Given** pembimbing memilih "Minta revisi" dengan catatan, **Then** status menjadi Revisi dan peserta dapat mengajukan ulang.
- **Given** evaluasi belum Disetujui, **When** HR menerbitkan sertifikat dengan Transkrip Nilai ON, **Then** penerbitan ditolak dengan pesan yang jelas.

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
| SET-02 | Konfigurasi lokasi kantor (SSID/BSSID/IP), radius WFH, ambang jam malam, **ambang progres untuk pengajuan evaluasi PKL** (default 80%) | P0 |
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
| 4 | **Respon Otomatis, Evaluasi & Sertifikat** | Surat balasan PDF otomatis → mendekati akhir periode peserta mengajukan evaluasi (penilaian diri + refleksi) → pembimbing menyetujui atau mengubah nilai → sertifikat digital terbit (nilai ON/OFF) |

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
| **Kalender kuota** | Grid 12 kartu bulan; heatmap hijau/kuning/merah per bulan + tooltip "Puncak 3/5 terisi"; klik bulan membuka panel peserta |
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
| **PKL** | Daftar pengajuan, detail pengajuan (surat PDF + hasil cek kuota), **Kalender Kuota (per bulan)**, peserta aktif, **Evaluasi (antrean pengajuan + panel tinjau/setujui/ubah nilai)**, **Evaluasi Saya (khusus peserta PKL: penilaian diri, refleksi, status)**, generator sertifikat (pratinjau + **toggle Transkrip Nilai**) |
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
| `pkl_evaluations` | placement_id, status (belum_diajukan/diajukan/revisi/disetujui), nilai_diri (per kriteria), refleksi, nilai_final (per kriteria), catatan_pembimbing, diajukan_at, pembimbing_id, disetujui_at |
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
| **Fase 2** | Modul PKL lengkap (form publik, kalender kuota per bulan, surat otomatis, pengajuan & persetujuan evaluasi, sertifikat + toggle nilai) | 6–8 minggu |
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
| Kalender bulanan dikira menentukan kuota | Pengajuan ditolak/diterima keliru | Beri label "Puncak okupansi" + catatan bahwa keputusan tetap per hari |
| Peserta menilai diri terlalu tinggi atau terlalu rendah | Nilai final bias | Nilai final selalu milik pembimbing; nilai diri hanya pembanding |

---

## 14. Keputusan Produk yang Sudah Dikunci

Keputusan berikut sudah tercermin pada prototype dan menjadi default backend. Nilai konfigurasi dapat diubah melalui Pengaturan tanpa mengubah UI.

| Area | Keputusan default |
|---|---|
| Presensi onsite | Public IP/provider jaringan kantor; BSSID hanya jika tersedia aplikasi native |
| Presensi WFH | Geolocation + radius + consent + akurasi GPS; default radius 200 m |
| Workload malam | Threshold 22:00; tipe kompensasi Carryover atau Insentif; approval manual Manager/HR kecuali policy auto-approve |
| Payroll tetap | Gaji pokok + tunjangan + insentif malam - potongan absensi |
| Payroll freelance | Approved PM time log × hourly rate; allocation project disimpan |
| Payroll ownership | HR membuat Draft; Finance Review/Approved/Paid dan jurnal |
| PKL quota | Dihitung per hari sepanjang rentang; prototype default maksimal 5 aktif |
| PKL full/reject | Policy dapat auto-reject atau manual review; harus disimpan pada quota policy |
| Evaluasi PKL | Self score + refleksi; default gate 80% progres; pembimbing menentukan nilai final; revisi dapat diajukan ulang |
| Sertifikat | Transcript ON membutuhkan evaluasi Approved; OFF dapat diterbitkan menurut policy |
| Integrasi PM | Provider adapter; kontrak internal `employee_id`, `user_id`, `project_id`, `task_id`, `time_log_id` |
| PPh 21 dan pajak | Tidak dihitung otomatis pada prototype; backend menyediakan component/potongan configurable dan ekspor |

Yang masih perlu dipilih saat backend setup, tetapi tidak boleh mengubah kontrak domain: stack backend, provider email/calendar/task, IP kantor final, signer/TTE, dan retention period. Simpan pilihan tersebut sebagai environment/configuration, bukan hardcode UI.

---

## 15. Lampiran: Daftar Prioritas

- **P0:** wajib untuk rilis fase terkait
- **P1:** penting, dikerjakan bila kapasitas memungkinkan
- **P2:** nilai tambah, dapat ditunda

---

## 16. Baseline Prototype yang Wajib Dipertahankan

Bagian ini memetakan seluruh halaman yang sudah tersedia di prototype. Backend harus menyediakan data dan action untuk route berikut tanpa mengubah kontrak UI.

| Route | Nama UI | Fitur prototype | Backend wajib |
|---|---|---|---|
| `#beranda` | Dashboard | KPI presensi, progres, workload malam, PKL, payroll, notifikasi | endpoint agregasi berbasis role dan periode |
| `#presensi` | Presensi Saya | Onsite/WFH, validasi jaringan/lokasi, status hadir, riwayat | attendance, office/WFH location, validation, idempotency |
| `#dailylog` | Daily Log | ringkasan, task, commit/PR, jam kerja, draft sampai 23:59 | daily logs, PM/Git references, edit window, audit |
| `#workload` | Workload Malam | klaim malam, Insentif/Carryover, approve/reject | night claims, policy, approval, payroll feed |
| `#rekap` | Rekap Tim | status presensi, tipe, tim, kapasitas, detail log | team attendance/workload read model |
| `#karyawan` | Data Karyawan | direktori, tipe Tetap/Freelance/PKL, jabatan, rate, status | employee master, compensation, identity mapping |
| `#lowongan` | Lowongan | CRUD lowongan, Draft/Published/Closed, skill | requisitions dan publishing |
| `#pipeline` | Pipeline Pelamar | Applied → Screening → Interview → Technical Test → Offering → Hired/Rejected | applicants, stages, scorecard, hire conversion |
| `#pengajuan` | Pengajuan PKL | form publik, surat, periode, cek kuota, review | intake, file metadata, quota decision, anti-spam |
| `#kalender` | Kalender Kuota | 12 bulan, puncak okupansi, warna kapasitas | daily occupancy dan quota policy |
| `#peserta` | Peserta PKL | peserta, pembimbing, divisi, progres | placements, mentor, progress |
| `#evaluasi` / `#evaluasi_saya` | Evaluasi PKL | antrean, nilai diri, refleksi, approve/revisi | evaluation state machine dan ownership |
| `#sertifikat` | Sertifikat PKL | preview, nomor, nilai ON/OFF, QR | certificate issuance, PDF, verification |
| `#payroll` / `#payslip` | Payroll | Draft/Review/Approved/Paid, rincian slip | payroll run, snapshot, Finance handoff |
| `#dokumen` | Dokumen & Template | template surat/sertifikat/slip | versioned templates dan private storage |
| `#laporan` | Laporan HR | laporan presensi, payroll, PKL, rekrutmen, audit | filtered queries dan export jobs |
| `#pengaturan` / `#profil` | Administrasi | role, lokasi, threshold, kuota, integrasi, profil | settings, RBAC, provider health, user identity |

### 16.1 Batas prototype

Selector role, seed `EMP/PKL/NIGHT/APP/EVALREQ/CERTS/PAYRUN/LOGS`, localStorage, PDF/email/QR, SSO, LinkedIn, Slack/WhatsApp, Jira/Trello/ClickUp, dan GitHub/GitLab pada prototype adalah simulasi. Backend harus menjadikan database sumber kebenaran, memakai adapter provider, dan menyimpan status sinkronisasi.

## 17. Arsitektur Backend Final

Mulai dengan modular monolith agar transaksi HR konsisten. Komponen wajib: REST API versioned (`/api/v1/hr`), PostgreSQL, object storage privat, queue/worker, outbox event, audit log, dan read model untuk dashboard/rekap/kalender. Semua timestamp UTC; UI mengonversi ke timezone tenant. Semua mutasi memakai `Idempotency-Key`; transaksi payroll, approval, audit, dan dokumen tidak boleh dihapus fisik.

### 17.1 Master identity dan organization

```text
users(id, tenant_id, email, name, status, auth_provider)
roles(id, tenant_id, code, name)
permissions(id, code)
user_roles(user_id, role_id, scope_type, scope_id)
employees(id, tenant_id, employee_code, user_id, employee_type, legal_name, display_name,
          email, phone, department_id, manager_employee_id, job_title, status,
          joined_at, ended_at, hourly_rate, base_salary, allowance, payroll_status)
employee_skills(employee_id, skill, level)
employee_projects(employee_id, project_id, role, allocation_percent, starts_at, ends_at, status)
employee_availability(employee_id, week_start, capacity_hours, leave_hours, allocated_hours,
                       available_hours, status, source, calculated_at)
```

`employee_code` adalah `employee_id` lintas modul; `users.id` adalah `user_id`. Nama hanya display field, bukan foreign key.

### 17.2 Attendance, daily log, workload malam

```text
office_locations(id, name, address, latitude, longitude, radius_meters, allowed_public_ips, active)
employee_work_locations(id, employee_id, label, latitude, longitude, radius_meters, consent_at, active)
attendance_records(id, employee_id, work_date, mode, status, recorded_at, validation_method,
                   latitude, longitude, accuracy_meters, public_ip, validation_status, anomaly_flags)
daily_logs(id, employee_id, work_date, summary, hours, attendance_id, status, submitted_at,
           editable_until, source)
daily_log_links(id, daily_log_id, project_id, task_id, provider, external_url, commit_sha, pull_request_id)
night_claims(id, employee_id, work_date, submitted_at, work_start_at, work_end_at, hours,
             reason, compensation_type, status, project_id, task_id, time_log_id,
             approved_by, approved_at, rejection_reason, policy_snapshot)
```

Attendance unique `(employee_id, work_date)`. Mode `ONSITE/WFH`; status `PRESENT/ABSENT/NO_PROGRESS/REJECTED`. Daily log dapat diedit sampai 23:59 tenant. Night claim: `PENDING → APPROVED | REJECTED`; approved `INCENTIVE` masuk payroll, `CARRYOVER` masuk recovery balance dan tidak boleh dihitung dua kali.

### 17.3 Recruitment

```text
job_requisitions(id, code, title, department_id, level, location, description, status,
                 opened_at, closed_at, headcount, created_by, published_at)
job_skills(job_id, skill, level, required)
applicants(id, name, email, phone, source, consent_at, resume_object_key, parsed_data)
applications(id, applicant_id, job_id, stage, status, owner_user_id, applied_at, hired_employee_id)
application_stage_history(id, application_id, from_stage, to_stage, actor_user_id, note, created_at)
interviews(id, application_id, scheduled_at, type, location, status, calendar_event_id)
interview_scorecards(id, interview_id, interviewer_user_id, criterion, score, note, submitted_at)
```

Semua perpindahan stage tervalidasi server-side dan menulis history. `Hired` membuat employee dalam transaction tanpa duplikasi.

### 17.4 PKL, evaluasi, sertifikat

```text
pkl_applications(id, application_code, applicant_name, institution, major, email, phone,
                 start_date, end_date, division_id, letter_object_key, status, quota_result,
                 reviewed_by, reviewed_at, rejection_reason)
pkl_quota_policies(id, year, division_id, max_active, auto_reject, active)
pkl_placements(id, application_id, participant_code, mentor_employee_id, division_id,
               start_date, end_date, status, progress_percent)
pkl_evaluations(id, placement_id, status, self_submitted_at, mentor_decided_at,
                mentor_employee_id, revision_count, final_score, revision_note)
pkl_evaluation_scores(id, evaluation_id, criterion, weight, self_score, mentor_score, note)
document_templates(id, type, version, name, body, variables, active, created_by)
certificates(id, placement_id, certificate_number, template_version, transcript_enabled,
             final_score, pdf_object_key, verification_token_hash, issued_by, issued_at, revoked_at)
```

Quota dihitung per hari dan mengecualikan placement yang sedang diedit. Sertifikat membutuhkan nomor dan verification token unik.

### 17.5 Payroll dan integrasi

```text
payroll_runs(id, tenant_id, period_start, period_end, status, currency, created_by,
             reviewed_by, approved_by, paid_by, totals_json, calculation_version, source_snapshot_hash)
payroll_items(id, payroll_run_id, employee_id, employee_type, gross_amount, deduction_amount, net_amount, status, calculation_snapshot_json)
payroll_components(id, payroll_item_id, code, label, amount, direction, project_id, cost_class, source_type, source_id)
payslips(id, payroll_item_id, document_object_key, document_hash, published_at, viewed_at)
time_logs(id, time_log_id, employee_id, user_id, project_id, task_id, work_date, hours,
          approval_status, approved_by, approved_at, source, external_id)
integration_sync_states(id, provider, entity, status, last_synced_at, last_error, retry_count)
outbox_events(id, event_id, event_type, aggregate_type, aggregate_id, payload_json, occurred_at, published_at, attempts)
audit_logs(id, actor_user_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent, created_at)
```

## 18. API yang Harus Disediakan

```text
GET/POST/PATCH /api/v1/hr/employees[/{employeeId}]
POST /api/v1/hr/attendance/validate
POST /api/v1/hr/attendance
GET  /api/v1/hr/attendance?employee_id=&from=&to=
POST/PATCH /api/v1/hr/daily-logs[/{id}]
POST /api/v1/hr/night-claims
POST /api/v1/hr/night-claims/{id}/approve
POST /api/v1/hr/night-claims/{id}/reject
GET/POST/PATCH /api/v1/hr/jobs[/{id}]
GET /api/v1/hr/applications
POST /api/v1/hr/applications/{id}/transition
POST /api/v1/hr/applications/{id}/hire
POST /api/v1/public/pkl/applications
GET /api/v1/hr/pkl/applications
POST /api/v1/hr/pkl/applications/{id}/approve|reject
GET /api/v1/hr/pkl/quota-calendar?year=&division_id=
GET /api/v1/hr/pkl/placements
POST /api/v1/hr/pkl/placements/{id}/evaluation/submit
POST /api/v1/hr/pkl/evaluations/{id}/approve|request-revision
POST /api/v1/hr/pkl/placements/{id}/certificate/preview|issue
GET /api/v1/public/certificates/{token}
POST /api/v1/hr/payroll/runs
GET /api/v1/hr/payroll/runs[/{id}]
POST /api/v1/hr/payroll/runs/{id}/calculate
GET /api/v1/hr/payroll/runs/{id}/payslips/{employeeId}
POST /api/v1/hr/payroll/runs/{id}/submit-finance
GET /api/v1/hr/reports/{reportType}
GET/PATCH /api/v1/hr/settings
GET /api/v1/hr/integrations/status
POST /api/v1/hr/integrations/{provider}/sync
GET /api/v1/hr/audit-logs
```

Response standar: `{ data, meta: { request_id, timestamp }, error }`. Gunakan 401/403/409/422 sesuai error; quota penuh memakai `409 QUOTA_FULL`.

## 19. Aturan Bisnis Final

1. Onsite memakai public IP/provider jaringan yang terdaftar; WFH memakai koordinat, akurasi, consent, dan radius. Browser tidak dianggap dapat membaca BSSID.
2. Kehadiran penuh membutuhkan daily log, task link, atau commit/PR link.
3. Freelancer hanya dihitung dari `time_logs.approval_status=APPROVED`: `hours × hourly_rate`; setiap allocation mempertahankan project/task/time log.
4. Tetap dihitung dari gaji pokok + tunjangan + insentif malam - potongan absensi; simpan `calculation_version` dan snapshot.
5. Payroll: HR `DRAFT`; Finance `REVIEW → APPROVED → PAID`; HR tidak dapat menandai Paid.
6. PKL tersedia hanya jika setiap hari pada rentang memiliki occupancy `< max_active`; hanya `Aktif/Diterima` dihitung.
7. Evaluasi `Belum Diajukan → Diajukan → Disetujui/Revisi`; nilai final pembimbing, nilai diri tetap tersimpan.
8. Transcript certificate ON membutuhkan evaluasi Disetujui; OFF mengikuti policy; nomor/QR unik.
9. Assignment PM dan semua relasi modul memakai ID resmi, bukan nama.

## 20. Kontrak HR–PM–Finance

### HR → PM availability

```json
{"event_type":"employee.availability.changed","employee_id":"EMP-004","user_id":"USR-004","status":"AVAILABLE","capacity_hours_week":40,"leave_hours_week":0,"skills":[{"name":"Laravel 11","level":"senior"}],"effective_from":"2026-11-11"}
```

### PM → HR approved time log

```json
{"time_log_id":"TL-2026-10-001","employee_id":"EMP-004","user_id":"USR-004","project_id":"PROJ-LIB","task_id":"TASK-LIB-102","work_date":"2026-10-21","duration_hours":6.5,"approval_status":"APPROVED","source":"pm_timer"}
```

HR hanya memakai log approved. Webhook signed, deduplicated berdasarkan `time_log_id`, dan dapat di-replay.

### HR → Finance payroll

```json
{"payroll_run_id":"PR-2026-10","source_module":"HR","period":{"from":"2026-10-01","to":"2026-10-31"},"status":"DRAFT","items":[{"employee_id":"EMP-004","employee_type":"Freelance","gross":6500000,"deduction":0,"net":6500000,"allocations":[{"project_id":"PROJ-LIB","cost_class":"HPP","amount":6500000}]}]}
```

Finance mengembalikan `journal_entry_id`, status approval/payment, bank reference, dan timestamp. HR hanya memperbarui read model status.

Event minimum: `employee.created`, `employee.updated`, `employee.availability.changed`, `attendance.recorded`, `daily_log.submitted`, `night_claim.approved`, `pkl.application.created`, `pkl.evaluation.submitted`, `pkl.evaluation.approved`, `certificate.issued`, `payroll.draft.created`, `payroll.submitted_to_finance`, `payroll.approved`, `payroll.paid`.

## 21. RBAC Backend

Gunakan permission dan scope, bukan nama role di frontend. Permission utama: `hr.employee.*`, `hr.attendance.*`, `hr.daily_log.*`, `hr.night_claim.*`, `hr.recruitment.*`, `hr.pkl.*`, `hr.payroll.read/calculate/create_draft/submit_finance/read_payslip`, `finance.payroll.read/review/approve/pay/journal`, `pm.employee_feed.read`, `pm.time_log.write/approve`, `hr.document.*`, `hr.report.read/export`, `hr.settings.*`, `audit.read`.

Scope: employee=self; manager=direct reports; mentor=placement bimbingan; Finance=payroll workflow; HR=tenant HR. Backend wajib memeriksa scope pada setiap endpoint.

## 22. Security dan Operasional

- Jangan simpan token/provider secret di source code, seed, log, atau response.
- KTP/NPWP, gaji, slip, koordinat rumah, resume, dan surat memakai encrypted storage, private bucket, signed URL berumur pendek, dan audit download.
- Upload harus allowlist extension/MIME, size limit, checksum, antivirus scan, dan quarantine.
- Endpoint publik PKL/job memakai rate limit, CAPTCHA/anti-bot, validation, dan idempotency.
- Gunakan secure cookie/CSRF atau token rotation, CORS allowlist, webhook signature, PII masking, retention, correction, export, dan anonymization policy.
- Queue job: `attendance.reminder`, `daily_log.lock`, `quota.recalculate`, `resume.parse`, `document.render`, `notification.dispatch`, `pm.time_log.sync`, `payroll.calculate`, `payroll.export.bank`, `report.export`; semua retry exponential + dead-letter.

## 23. Acceptance Test Backend

1. User tanpa permission menerima 403 saat membuat employee/job/payroll.
2. Attendance invalid IP/radius ditolak; duplicate tanggal ditolak.
3. Daily log setelah cutoff ditolak kecuali koreksi HR dan audit tercatat.
4. Night claim approved masuk payroll tepat satu kali; rejected tidak masuk.
5. Duplicate PM time log tidak menggandakan payroll freelancer.
6. Quota PKL menolak overlap bila satu hari penuh.
7. Peserta tanpa evaluasi submit tidak muncul di antrean pembimbing.
8. Transcript ON ditolak sebelum evaluasi Disetujui.
9. Payroll yang sudah dikirim Finance tidak dihitung ulang tanpa revision.
10. Finance approval/payment mengembalikan journal reference dan event terlihat HR.
11. Semua mutasi sensitif menyimpan actor, before, after, request ID.
12. Webhook dapat diulang tanpa duplikasi dan signed URL kadaluarsa.

## 24. Urutan Pengerjaan Backend

**Fase 0:** kunci timezone, currency, enum status, permission, retention, provider, dan OpenAPI.  
**Fase 1:** auth, tenant, RBAC, audit, storage, error format, idempotency, outbox, queue.  
**Fase 2:** employee master, employment history, compensation, skills, project membership, availability, settings.  
**Fase 3:** attendance, daily log, task/commit reference, night claim, approval, notification, rekap.  
**Fase 4:** recruitment, applicant pipeline, scorecard, hire conversion, PKL quota, placement, evaluation, certificate.  
**Fase 5:** PM time-log adapter, payroll snapshot, payslip, HR→Finance, callback, OPEX/HPP, payment/journal.  
**Fase 6:** reports, provider adapters, security/load test, backup/restore, migration, UAT.

## 25. Migration dan Definition of Done

Map seed prototype ke master employee sekali dengan audit; map PM `user-*` ke `employee_id`; import PKL/NIGHT/LOGS sebagai `source=prototype_seed`; jangan menganggap nilai dummy sebagai transaksi keuangan; nonaktifkan mutation localStorage setelah API aktif.

Backend HR selesai jika semua route prototype mendapat endpoint produksi, RBAC server-side, audit/idempotency, private documents, payroll snapshot immutable, bridge PM/Finance dua arah, retry event, migration/backup teruji, acceptance test Bagian 23 lulus, dan UI berjalan tanpa seed lokal sebagai sumber transaksi.

## 26. Riwayat Revisi

| Tanggal | Perubahan |
|---|---|
| 2026-10-28 | **Kalender kuota** diubah dari per hari menjadi **per bulan** (PKL-05, §6.3 logika kuota, §8.5, §8.6); perhitungan kuota pengajuan tetap per hari. |
| 2026-10-28 | **Evaluasi PKL** diubah menjadi berbasis **pengajuan peserta**: penilaian diri + refleksi → pembimbing menyetujui/mengubah nilai/meminta revisi (PKL-12, PKL-17 s/d PKL-22, alur §6.3 & §7, persona, matriks role, model data, SET-02, risiko, roadmap Fase 2, pertanyaan terbuka 10-12). |
