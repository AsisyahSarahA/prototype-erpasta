# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Produk:** Astacode ERP  
**Modul:** Finance & Cashflow Management  
**Target Pengguna:** Finance & Accounting, Project Manager, Director / Owner  
**Fokus Arsitektur:** Cash Pool, Termin Tracking (Milestone Billing), HPP Proyek vs OPEX Kantor, Double-Entry General Ledger, Multi-Level Financial Reporting  
**Status:** 🟢 FINAL (Aligned & Up-to-Date)

---

## 1. RINGKASAN EKSEKUTIF (PRODUCT VISION)
Modul Finance Astacode ERP dirancang spesifik untuk model bisnis Software House / Digital Agency modern. Menggantikan akuntansi manufaktur konvensional yang kaku, modul ini mengadopsi prinsip **Cash Pool Terpadu**:
1. Seluruh penerimaan pembayaran termin klien (DP, Progress Milestone, Pelunasan) langsung terkonsolidasi ke rekening kas likuid utama perusahaan.
2. Pemisahan tegas secara real-time antara **Beban Pokok Produksi (HPP Proyek)** seperti upah freelancer SPK dan biaya server cloud AWS dengan **Beban Operasional Kantor (OPEX)** seperti gaji staf tetap bulanan, sewa kantor, dan utilitas.
3. Seluruh aktivitas transaksi terhubung langsung ke **Buku Besar (General Ledger)** dengan pembukuan ganda (double-entry) otomatis dan seimbang (balanced), tanpa memerlukan input jurnal akuntansi manual yang rentan human-error.
4. Penyajian laporan performa finansial yang komprehensif mulai dari **Laba Rugi Konsolidasi (Consolidated P&L)**, **Profitabilitas per Proyek**, hingga **Laporan Portofolio per Customer**.

---

## 2. STRUKTUR MENU NAVIGASI (UI SITEMAP)

1. **📊 Dashboard Finansial**
   - KPI Likuiditas Kas, Piutang Termin (AR), Utang & Beban (AP), dan Cash Runway.
   - Grafik Batang Arus Kas Masuk vs Keluar dengan **Toggle Periode Interaktif** (3 Bulan, 6 Bulan, 1 Tahun).
   - Diagram Donut **Alokasi Distribusi Pengeluaran** (Gaji, Freelancer, Server Cloud, Sewa Kantor, Utilitas).
   - Widget Peringatan Piutang/Utang Jatuh Tempo Minggu Ini & Quick Saldo Kas.
2. **📥 Pemasukan (Accounts Receivable / Invoicing) & Pusat Pesan (Customer Chat)**
   - **Simulasi & Detail Penerimaan Termin dari CRM**: Panel & Modal detail pengiriman Deal Won / MoU dari Account Executive CRM (mencakup nomor MoU/Quotation, waktu transmisi, data PIC & NPWP klien, serta rincian pemecahan jadwal termin TOP yang siap diimpor ke AR).
   - **Simulasi & Detail Penerimaan Invoice dari Manajemen Proyek (MP)**: Panel & Modal detail pengiriman bukti milestone selesai dari Project Manager (Forge PM), lengkap dengan progress sprint, checklist deliverable, lampiran BAST/UAT PDF, dan persetujuan (Approve) per proyek.
   - **Pratinjau Invoice Resmi & Simulasi Chat WhatsApp Konsumen**: Pratinjau faktur komersial (DPP, PPN 11%, PPh 23 2%), template pesan pengantar, ruang simulasi chat interaktif dengan konsumen (balasan otomatis, diskusi PPh 23, kirim bukti transfer & verifikasi lunas langsung dari chat), serta log riwayat di menu **Pusat Pesan**.
   - Modal Edit Jadwal & Persentase Termin (DP, Termin-1, Termin-2, BAST, Lunas).
3. **📤 Pengeluaran (Accounts Payable & Expense Management)**
   - **Klaim Struk (AI OCR)**: Upload struk belanja/transport via drag-and-drop dengan auto-ekstraksi data OCR.
   - **Tagihan Vendor**: Biaya server cloud hosting, lisensi API, dan invoice rekanan.
   - **Pembayaran Freelancer**: Manajemen SPK subkon proyek dengan pelacakan termin deliverable.
   - **Penggajian Karyawan (Payroll)**: Gaji pokok & tunjangan staf tetap terintegrasi data HR.
   - **Biaya Operasional (OPEX Kantor)**: Sewa gedung, internet dedicated, utilitas PLN, dan operasional rutin.
4. **🏦 Kas & Bank**
   - Daftar Rekening Bank Operasional & Petty Cash Kantor.
   - **Mutasi Internal**: Pemindahan dana antar rekening (misal BCA ke Kas Kecil) tanpa mempengaruhi laba rugi.
5. **📓 Buku Besar (General Ledger)**
   - **Chart of Accounts (COA)**: Struktur 18 Akun Standar Industri Software House, Filter Kategori (1000 Aset, 2000 Kewajiban, 3000 Ekuitas, 4000 Pendapatan, 5000 HPP, 6000 OPEX), Modal Tambah Akun Baru, Modal Edit Akun, serta Aksi Hapus Akun.
   - **Jurnal Umum Otomatis (General Journal)**: Log mutasi ganda debit-kredit seimbang (Total Rp 640.500.000), Badge Auto-Generated per modul sumber, serta Dropdown Filter Dinamis (AR, AP, HR, OPEX, Mutasi Internal).
6. **📈 Laporan Finansial (Financial Reports)**
   - **Laba Rugi Perusahaan (Consolidated P&L)**: Rincian breakdown sub-item per kategori (Pendapatan Usaha, HPP Proyek, OPEX Kantor) hingga Laba Bersih Operasional (EBITDA).
   - **Profitabilitas Proyek (P&L per Project)**: Komparasi nilai kontrak, termin terbayar, serapan HPP, laba bersih proyek, **Visual Margin Bar**, dan **Summary Total Row (TFoot)**.
   - **Laporan Keuangan per Customer**: Rekapitulasi akun klien dengan **Avatar Dinamis**, status termin, rasio kolektibilitas, serta **Summary Insight Cards** (Top Paying Client, Days Sales Outstanding/DSO, Upcoming Due Date).

---

## 3. AGILE PRODUCT BACKLOG (EPIC & USER STORIES)

### 🔵 EPIC 1: Manajemen Penagihan, Integrasi CRM/MP & Simulasi Chat Konsumen (Invoicing & AR)
- **Story 1.1:** Penerimaan & Pemecahan Nilai Kontrak ke Jadwal Termin dari CRM
  - *As a Finance,* I want to melihat detail pengiriman Deal Won/MoU dari modul CRM (pengirim AE, dokumen kontrak, kontak PIC, dan rincian pemecahan termin DP/Progress/BAST) serta mengimpornya ke daftar AR, *So that* jadwal penagihan proyek tercatat akurat sesuai kesepakatan penjualan.
  - **AC:** Modal simulasi pengiriman CRM menampilkan metadata MoU, rincian pajak per termin, dan fitur impor proyek baru secara dinamis.
- **Story 1.2:** Penerimaan & Verifikasi Draft Invoice dari Manajemen Proyek (MP)
  - *As a Finance,* I want to menerima notifikasi dan melihat detail pengiriman penyelesaian milestone dari Project Manager (progress sprint, checklist deliverable, dan dokumen BAST/UAT) sebelum melakukan *Approve* invoice, *So that* penagihan ke klien memiliki dasar penyelesaian pekerjaan yang sah.
- **Story 1.3:** Perhitungan Pajak Transaksi & Simulasi Chat Pengiriman ke Konsumen
  - *As a Finance,* I want to meninjau pratinjau invoice resmi (DPP, PPN 11%, PPh 23 2%) dan mensimulasikan pengiriman serta percakapan WhatsApp interaktif dengan PIC Klien (termasuk pengingat jatuh tempo, konfirmasi potongan pajak, dan penerimaan bukti transfer), *So that* siklus penagihan hingga pelunasan terdokumentasi di Pusat Pesan.

### 🔵 EPIC 2: Pengeluaran Fleksibel (HPP Proyek vs OPEX Kantor)
- **Story 2.1:** Klaim Struk AI OCR & Beban Operasional
  - *As a Karyawan / Finance,* I want to mengunggah foto kuitansi/struk belanja, *So that* sistem mengekstraksi tanggal, vendor, dan nominal secara instan tanpa ketik manual.
- **Story 2.2:** SPK Freelancer & HPP Proyek
  - *As a Project Manager / Finance,* I want to mendaftarkan kontrak kerja freelancer dengan referensi proyek terkait, *So that* pembayaran diposisikan sebagai HPP proyek dan memotong margin proyek bersangkutan.
- **Story 2.3:** Payroll Karyawan Tetap & Biaya Rutin HQ
  - *As a Finance,* I want to memproses gaji bulanan dan beban utilitas kantor terpisah dari HPP, *So that* beban operasional umum tercatat rapi pada pos OPEX konsolidasi.

### 🔵 EPIC 3: Kas, Rekening Bank & Mutasi Internal
- **Story 3.1:** Pemindahan Dana Likuid
  - *As a Finance,* I want to mencatat mutasi dana dari Rekening Bank Operasional ke Petty Cash, *So that* saldo fisik dompet kas kecil ter-update tanpa memicu pengakuan beban rugi laba.

### 🔵 EPIC 4: Buku Besar & Akuntansi Ganda (General Ledger & COA)
- **Story 4.1:** Standarisasi Chart of Accounts (COA 18 Akun)
  - *As a Finance / Auditor,* I want to mengelola master akun penomoran standar dengan filter kategori dan aksi Tambah/Edit/Hapus, *So that* klasifikasi pos keuangan selalu tertib kaidah akuntansi.
- **Story 4.2:** Jurnal Umum Otomatis Double-Entry
  - *As a Finance,* I want to meninjau log jurnal berpasangan debit-kredit yang ter-generate otomatis dari modul AR, AP, HR, OPEX, dan Mutasi, *So that* neraca saldo selalu seimbang (Rp 640.500.000).

### 🔵 EPIC 5: Laporan Finansial Multi-Dimensi
- **Story 5.1:** Consolidated P&L dengan Sub-Item Breakdown
  - *As a Director / Owner,* I want to melihat laporan laba rugi konsolidasi dengan rincian sub-item per kategori (custom dev, cloud SLA, freelancer, server, SaaS, utilitas), *So that* struktur biaya dan margin bersih (EBITDA) terlihat transparan.
- **Story 5.2:** P&L per Proyek dengan Margin Bar & Summary Total
  - *As a PM & Finance,* I want to membandingkan margin profitabilitas antar proyek dengan visual progress bar dan baris total ringkasan, *So that* proyek dengan biaya membengkak dapat dicegah lebih dini.
- **Story 5.3:** Rekapitulasi Portofolio per Customer
  - *As a Account Manager / Owner,* I want to memantau performa tagihan tiap klien, rasio kolektibilitas, dan DSO, *So that* kebijakan penagihan piutang berjalan lancar tanpa bad debt.

---

## 4. DATABASE SCHEMA BLUEPRINT (ENTITY RELATIONSHIP)
1. `projects`: `id`, `name`, `client_id`, `total_contract_value`, `start_date`, `status`
2. `customers`: `id`, `name`, `code`, `sector`, `pic_name`, `phone`, `email`
3. `invoices`: `id`, `project_id`, `termin_name`, `dpp_amount`, `ppn_rate`, `pph_rate`, `total_amount`, `due_date`, `status`
4. `expenses`: `id`, `project_id` (nullable), `category` (HPP / OPEX), `amount`, `vendor_name`, `receipt_file`, `status`
5. `freelancer_contracts`: `id`, `project_id`, `freelancer_name`, `spk_number`, `role`, `total_fee`, `status`
6. `bank_accounts`: `id`, `bank_name`, `account_number`, `account_holder`, `balance`, `account_type`
7. `internal_transfers`: `id`, `from_account_id`, `to_account_id`, `amount`, `transfer_date`, `notes`
8. `chart_of_accounts`: `account_code`, `account_name`, `category_code`, `normal_balance`, `current_balance`
9. `journal_entries`: `id`, `entry_number`, `source_module` (AR/AP/HR/OPEX/TRF), `transaction_date`, `description`, `total_debit`, `total_credit`
10. `journal_entry_items`: `id`, `journal_entry_id`, `account_code`, `debit`, `credit`

---

## 5. TABEL RENCANA TINDAK LANJUT & STATUS EKSEKUSI

| # | Task | Effort | Impact | Status | Catatan Implementasi |
|---|---|---|---|---|---|
| **1** | **Jurnal Umum**: Tambah 4 entri jurnal + filter + badge auto-generated | Medium | 🔴 High | **DONE** | Ditambahkan JRN-2026-006 s/d JRN-2026-009, filter tipe modul sumber (AR, AP, HR, OPEX, TRF), total seimbang Rp 640.500.000. |
| **2** | **COA**: Tambah modal Create, lengkapi 18 akun, tombol edit/delete | Medium | 🔴 High | **DONE** | Seluruh 18 akun dilengkapi tombol Edit & Delete, modal create akun baru & modal edit aktif dengan auto-update counter. |
| **3** | **P&L Company**: Tambah sub-item breakdown per kategori | Low | 🟡 Medium | **DONE** | Rincian detail pada Revenue (4 item), HPP Proyek (4 item), dan OPEX Kantor (6 item) dengan total matematis tepat. |
| **4** | **Report Project**: Tambah proyek ke-3 & ke-4 + summary total + margin bar | Low | 🟡 Medium | **DONE** | Ditambahkan proyek Samudera Logistik, baris `<tfoot>` total portofolio, dan visual weighted margin bar (75.9%). |
| **5** | **Report Customer**: Tambah customer + avatar + summary card | Low | 🟡 Medium | **DONE** | Ditambahkan Samudera Logistik Nusantara, avatar gradasi, tabel rekapitulasi, dan 3 Summary Insight Cards (Top Paying, DSO, Upcoming Inflow). |
| **6** | **Dashboard**: Tambah toggle periode chart + donut distribusi | Medium | 🟡 Medium | **DONE** | Toggle periode 3m, 6m, 1y dinamis pada Chart Arus Kas, dan Donut Chart distribusi alokasi pengeluaran dengan tooltip persentase. |
| **7** | **Missing Modals**: Buat COA modal + polish interaksi lain | Low | 🟡 Medium | **DONE** | Modal Edit COA dibuat, event backdrop click & ESC key handler, feedback toast notifikasi di setiap aksi. |
| **8** | **Integrasi CRM & MP + Simulasi Chat Konsumen**: Detail pengiriman termin CRM, detail pengiriman invoice MP, & chat WA interaktif | Medium | 🔴 High | **DONE** | Ditambahkan Hub Transmisi CRM & MP, Modal Detail Pengiriman CRM (impor deal baru), Modal Detail Pengiriman MP (bukti BAST/UAT), Pratinjau Faktur Resmi, & Simulasi Chat WA Klien dua arah + Pusat Pesan. |
| **9** | **Penyelarasan Warna CRM & Template Chat Humanis**: Harmonisasi warna Indigo `#4F46E5`, gradient CRM, dan copywriting WhatsApp yang santun, hangat, dan profesional | Low | 🔴 High | **DONE** | Warna diselaraskan dengan ASTACODE CRM Design System (`#4F46E5`, `#3730A3`, `#EEF2FF`). Template chat ditulis ulang dengan sapaan sopan, tanpa format kaku robotik/AI. |
| **10** | **Universal Pagination, CRUD Pengeluaran & Transfer Bank + Jurnal Umum Sederhana**: Pagination di semua tabel, CRUD Operasional/Vendor/Freelancer, transfer bank terpilih + resi bukti transfer resmi, & penyederhanaan Jurnal Umum | High | 🔴 High | **DONE** | Pagination client-side di seluruh tabel modul Finance. Fitur CRUD penuh untuk Biaya Operasional (OPEX), Tagihan Vendor (AP), dan Kontrak SPK Freelancer. Transfer kas/bank interaktif dengan pilihan rekening sumber bank ASTACODE (BCA, Mandiri, Kas Kecil, Wise) yang mengurangi saldo real-time, menerbitkan Resi Bukti Transfer digital resmi, dan Jurnal Umum disederhanakan ke format tabel standar akuntansi. |
| **11** | **Eksekusi 3 Saran Strategis**: Unduh/Kirim Bukti Resi WA, Auto-Sync AI OCR ke OPEX, & Filter Tanggal + Live KPI Jurnal | Medium | 🔴 High | **DONE** | Kop Surat resmi PT Astacode Digital Nusantara & tombol kirim WA bukti transfer ke penerima; Auto-sync klaim struk OCR ke daftar OPEX & Jurnal Kas Kecil; Filter Rentang Tanggal kustom (Date Range) dengan auto-recalculation KPI Debit/Kredit real-time. |
| **12** | **Penyelarasan Payroll Setara Konsep Freelancer (Full Interactive CRUD, Bank Transfer & Official Slip)**: Transformasi menu Penggajian Karyawan (`#view-payroll`) mengadopsi standardisasi menu Freelancer: State-driven data model (`payrollList`), CRUD lengkap (Create, Read, Update, Delete, Detail Slip Resmi), workflow approval HR (`APPROVED HR` vs `MENUNGGU HR`), pencairan gaji via Bank Mandiri Payroll ASTACODE (`132-00-19283-91`) yang memotong saldo kas riil dan auto-posting jurnal beban gaji (`6101`), tombol Payroll Run Massal, serta Slip Gaji digital resmi ber-Kop Surat dengan tombol Cetak & Kirim WhatsApp ke Karyawan. | High | 🔴 High | **DONE** | Model data `payrollList` dinamis terhubung grade HR, perhitungan otomatis Gaji Pokok, Tunjangan, BPJS, PPh 21, dan Take Home Pay (THP). Universal transfer bank terintegrasi, Resi Bukti Transfer digital, Slip Gaji resmi ber-Kop Surat dengan tanda tangan direksi/HR, WhatsApp share humanis, serta paginasi tabel dinamis 5 baris per halaman. |

---

## 6. FITUR YANG TIDAK DIGUNAKAN (DEPRECATED & REMOVED)
Berdasarkan arahan kebutuhan modul Finance software house yang ramping dan efisien, fitur-fitur berikut telah **dihapus sepenuhnya** dari UI, subnavigasi, sidebar master, dan logic controller:
- ❌ **Rekonsiliasi Bank Otomatis (Dynamic CSV & Tinder Matching)**: Ditiadakan karena mutasi bank telah dikelola langsung melalui pencatatan saldo akun kas dan mutasi internal pindah dana.
- ❌ **Aset Tetap & Depresiasi**: Ditiadakan karena software house tidak membutuhkan inventarisasi mesin pabrik / depresiasi terpisah.
- ❌ **Kepatuhan Pajak DJP Terpisah**: Ditiadakan; PPN 11% dan PPh 23 diintegrasikan langsung pada pencatatan invoice dan transaksi riil.
- ❌ **Budgeting & Cost Centers Terpisah**: Ditiadakan; evaluasi plafon dan serapan biaya telah dicakup secara langsung pada laporan Profitabilitas per Proyek.
