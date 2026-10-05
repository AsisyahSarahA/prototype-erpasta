# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Produk:** Astacode ERP
**Modul:** Finance & Cashflow Management
**Target Pengguna:** Finance, Project Manager, Owner
**Fokus Arsitektur:** Cash Pool, Termin Tracking, Multi-Bank Reconciliation
**Status:** 🟢 FINAL (Ready for Development)

## 1. RINGKASAN EKSEKUTIF (PRODUCT VISION)
Modul Finance Astacode ERP dirancang khusus untuk ekosistem Software House. Alih-alih menggunakan pendekatan akuntansi manufaktur yang kaku, sistem ini mengadopsi model Cash Pool. Pembayaran dari klien (DP/Termin) masuk ke "dompet utama" untuk menghidupi seluruh operasional perusahaan.

Sistem ini memecahkan 3 masalah utama di lapangan:
1. Menagih proyek berdasarkan Termin (DP, BAST, Lunas) secara mudah.
2. Memisahkan Pengeluaran Proyek (HPP) dan Pengeluaran Operasional (Gaji/OPEX) dalam satu alur yang sama.
3. Menghilangkan input manual mutasi bank melalui fitur Dynamic Multi-Bank CSV Reconciliation.

## 2. STRUKTUR MENU NAVIGASI (UI SITEMAP)
- **📊 Dashboard** (Ringkasan Saldo, Piutang Jatuh Tempo, Laba/Rugi Cepat)
- **📥 Pemasukan (Accounts Receivable)**
  - Daftar Invoice (Penagihan Termin)
- **📤 Pengeluaran (Accounts Payable & Expense)**
  - Klaim & Struk (Reimbursement operasional/proyek)
  - Tagihan Vendor/Freelancer (Khusus biaya HPP proyek)
  - Penggajian (Gaji tetap bulanan - OPEX)
- **🏦 Kas & Bank**
  - Daftar Rekening & Saldo
  - Mutasi Internal (Pindah dana dari Bank ke Kas Kecil)
  - Rekonsiliasi Bank (Import CSV & Matching)
- **📓 Buku Besar (General Ledger)**
  - Chart of Accounts (COA)
  - Jurnal Umum
- **📈 Laporan**
  - Laba Rugi Perusahaan (Total keseluruhan)
  - Profitabilitas Proyek (Pendapatan Termin Proyek X - Biaya Khusus Proyek X)

## 3. AGILE PRODUCT BACKLOG (EPIC & USER STORIES)

### 🔵 EPIC 1: Manajemen Penagihan & Termin (Invoicing)
**Tujuan:** Memastikan tim Finance bisa memecah nilai proyek besar menjadi tagihan cicilan.
**Story 1.1:** Generate Termin Tagihan
As a Finance, I want to membagi total nilai kesepakatan CRM (misal Rp30 Juta) menjadi beberapa termin, So that saya bisa menerbitkan invoice sesuai milestone.
**AC:**
- [ ] Terdapat opsi pembagian persentase (Contoh: DP 30%, Termin-1 40%, Lunas 30%).
- [ ] Sistem otomatis menghitung nilai rupiah dari persentase tersebut.
- [ ] Setiap termin menghasilkan Draft Invoice dengan Due Date masing-masing.

### 🔵 EPIC 2: Manajemen Kas & Mutasi Internal
**Tujuan:** Melacak perpindahan uang riil (Kas Bon/Petty Cash) tanpa mencatatnya sebagai beban rugi.
**Story 2.1:** Mutasi Bank ke Kas Kecil
As a Finance, I want to mencatat perpindahan uang dari rekening BCA ke Kas Kecil Operasional, So that uang tersebut tercatat pindah dompet, bukan keluar/hangus.
**AC:**
- [ ] Form berisi: Akun Asal, Akun Tujuan, Nominal.
- [ ] Saldo akun asal berkurang, saldo akun tujuan bertambah, laporan laba/rugi tidak berubah.

### 🔵 EPIC 3: Pengeluaran Fleksibel (Proyek vs Operasional)
**Tujuan:** Memisahkan uang yang keluar untuk proyek (HPP) dengan uang yang keluar untuk kantor (OPEX).
**Story 3.1:** Struk Belanja & Reimbursement
As a Karyawan, I want to upload foto struk dan mengisi form nominal, So that uang saya diganti oleh perusahaan.
**AC:**
- [ ] Mendukung upload gambar/PDF.
- [ ] Terdapat toggle wajib: "Bebankan ke Proyek?". Jika "Ya", pengguna wajib memilih Nama Proyek. Jika "Tidak", tercatat sebagai OPEX.
**Story 3.2:** Pembayaran Gaji vs Freelancer
As a Finance, I want to membayar gaji staf bulanan dan freelancer proyek di menu berbeda, So that gaji tetap tidak memotong margin proyek tertentu.
**AC:**
- [ ] Menu Payroll murni memotong saldo Bank tanpa menanyakan nama proyek.
- [ ] Menu Tagihan Freelancer wajib menyertakan pilihan Nama Proyek agar terhitung sebagai HPP.

### 🔵 EPIC 4: Rekonsiliasi Multi-Bank (Dynamic CSV)
**Tujuan:** Menghilangkan entri manual mutasi dengan membaca format bank apa pun.
**Story 4.1:** Pemetaan Format Dinamis (Dynamic Mapping)
As a Finance, I want to menentukan kolom mana yang berisi Tanggal, Deskripsi, dan Nominal dari CSV Bank, So that saya bisa upload CSV BCA, Mandiri, atau BNI tanpa gagal sistem.
**AC:**
- [ ] Sistem menampilkan preview baris tabel saat CSV diunggah.
- [ ] Finance dapat memilih via dropdown untuk mencocokkan kolom sistem dengan kolom file.
- [ ] Pemetaan dapat disimpan sebagai Template (misal: "Template BCA 2026").
**Story 4.2:** Pencocokan (Matching) Pembayaran
As a Finance, I want to mengklik tombol "Match" pada baris uang masuk, So that tagihan termin proyek otomatis berstatus Lunas.
**AC:**
- [ ] Layar split-screen: kiri daftar mutasi, kanan daftar Invoice/Expense sistem.
- [ ] Sistem menyarankan Invoice berdasarkan kecocokan Nominal. Saat di-approve, saldo bank bertambah dan Invoice tertutup.

### 🔵 EPIC 5: Buku Besar & Akuntansi Dasar
**Tujuan:** Memastikan transaksi yang berjalan di sistem Cash Pool tetap menghasilkan jurnal ganda (double-entry) di balik layar.
**Story 5.1:** Chart of Accounts (COA) & Jurnal
As a Finance, I want to memantau kode akun dan entri jurnal, So that data keuangan tetap valid secara kaidah akuntansi.
**AC:**
- [ ] Daftar COA dengan kategori akun.
- [ ] Laporan Jurnal Umum otomatis ter-generate dari setiap aksi pengeluaran, pemasukan, atau rekonsiliasi.

## 4. DATABASE SCHEMA (ERD BLUEPRINT)
1. `projects` (id, name, total_value, status)
2. `invoices` (id, project_id, termin_name, amount, status)
3. `expenses` (id, project_id, expense_type, amount, receipt_file, status)
4. `company_bank_accounts` (id, bank_name, balance, csv_mapping_config)
5. `bank_mutations` (id, account_id, transaction_date, description, amount_in, amount_out, is_reconciled, reference_type, reference_id)
