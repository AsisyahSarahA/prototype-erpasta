# RESUME ALUR WORKFLOW MODUL FINANCE & CASHFLOW MANAGEMENT
# ASTACODE ERP PLATFORM
### Arsitektur Alur Kerja Keuangan Software House: Cash Pool, Termin Billing, HPP vs OPEX, Double-Entry General Ledger & Multi-Level Reporting

---

| Dokumen | Keterangan |
| :--- | :--- |
| **Nama Modul** | Finance & Cashflow Management (Finance V3) |
| **Acuan Dokumen** | `PRD_Finance.md` & `MASTER_PRD.md` |
| **Platform** | ASTACODE ERP Platform |
| **Target Pengguna** | Finance & Accounting, Project Manager (PM), Director / Owner |
| **Fokus Arsitektur** | Cash Pool Terpadu, Milestone Billing (Termin AR), HPP Proyek vs OPEX Kantor, Double-Entry General Ledger, Multi-Level Financial Reporting |
| **Lokasi Modul** | `d:\PROJECT SAYA\prototype-erpasta\finance\` (`index.html`, `finance.js`, `finance.css`) |
| **Status Sistem** | 🟢 FINAL (Aligned & Up-to-Date) |

---

## 1. Ringkasan Eksekutif & Visi Arsitektur

Modul Finance Astacode ERP dirancang secara spesifik untuk model bisnis **Software House & Digital Agency Modern**. Berbeda fundamental dari akuntansi manufaktur atau retail konvensional yang kaku dan sarat persediaan barang fisik, modul Finance mengadopsi 4 pilar arsitektur utama:

1. **Prinsip Cash Pool Terpadu**: Seluruh penerimaan pembayaran termin klien (Uang Muka/DP, Progress Milestone Deliverable, BAST, dan Pelunasan) langsung terkonsolidasi ke rekening kas likuid utama perusahaan.
2. **Pemisahan Tegas HPP Proyek vs OPEX Kantor**:
   * **Beban Pokok Produksi (HPP Proyek)**: Pengeluaran langsung terkait deliverable proyek, seperti upah subkontraktor/freelancer SPK, langganan server cloud AWS staging/production proyek, dan lisensi API khusus klien. Beban ini memotong margin kotor proyek bersangkutan secara *real-time*.
   * **Beban Operasional Kantor (OPEX HQ)**: Biaya umum dan operasional rutin kantor, seperti gaji pokok staf tetap (Payroll HR), sewa gedung kantor, internet dedicated, utilitas listrik PLN, dan konsumsi operasional.
3. **Buku Besar Otomatis (Zero Manual Double-Entry General Ledger)**: Setiap transaksi operasional (pembayaran invoice, klaim struk OCR, SPK freelancer, mutasi internal) langsung men-generate entri jurnal berpasangan debit-kredit seimbang (*balanced*) dengan nomor akun COA standar, tanpa input jurnal manual yang rentan human-error.
4. **Pelaporan Finansial Multi-Dimensi (Multi-Level Reporting)**:
   * **Consolidated P&L**: Laba rugi perusahaan konsolidasi dengan breakdown sub-item hingga laba bersih operasional (EBITDA).
   * **Profitabilitas per Proyek (P&L per Project)**: Visibilitas margin riil tiap proyek dengan *Visual Weighted Margin Bar* dan *Summary Total Row (`<tfoot>`)*.
   * **Portofolio per Customer**: Pemantauan profil klien, rasio kolektibilitas, *Days Sales Outstanding (DSO)*, dan kalender piutang jatuh tempo.

---

## 2. Arsitektur Informasi & Navigasi Modul Finance

Modul Finance terbagi dalam 6 domain fungsional yang saling terhubung:

```mermaid
graph TD
    FIN["Modul Finance & Cashflow (finance/index.html)"]

    subgraph D1["1. DASHBOARD & MONITORING"]
        F1["Executive Dashboard (#view-dashboard)"]
    end

    subgraph D2["2. KAS MASUK (AR)"]
        F2["Invoicing & Termin Tracking (#view-invoices)"]
    end

    subgraph D3["3. KAS KELUAR (AP & EXPENSE)"]
        F3["Klaim Struk AI OCR (#view-expenses / #view-pengeluaran)"]
        F4["Tagihan Vendor Cloud & SaaS (#view-vendor)"]
        F5["SPK Freelancer Subkon (#view-freelancer)"]
        F6["Payroll Staf Tetap (#view-payroll)"]
        F7["Biaya Operasional HQ (#view-opex)"]
    end

    subgraph D4["4. KAS & LIKUIDITAS"]
        F8["Rekening Bank & Kas (#view-accounts)"]
        F9["Mutasi Internal (#view-internal-transfer)"]
    end

    subgraph D5["5. AKUNTANSI & BUKU BESAR"]
        F10["Chart of Accounts 18 Akun (#view-coa)"]
        F11["Jurnal Umum Otomatis (#view-journal)"]
    end

    subgraph D6["6. LAPORAN FINANSIAL"]
        F12["Consolidated P&L (#view-report-company)"]
        F13["P&L per Project (#view-report-project)"]
        F14["Customer Portfolio (#view-report-customer)"]
    end

    FIN --> D1
    FIN --> D2
    FIN --> D3
    FIN --> D4
    FIN --> D5
    FIN --> D6
```

---

## 3. Matriks Transformasi Alur Kerja (AS-IS vs TO-BE)

| Aspek Finansial | Alur Kerja Konvensional (AS-IS) | Alur Kerja Tersistem Astacode Finance (TO-BE) | Dampak & Efisiensi |
| :--- | :--- | :--- | :--- |
| **Penagihan Termin Klien** | PM lupa memberi tahu milestone selesai; Finance membuat invoice manual di Excel/Word. | Terintegrasi otomatis dari CRM Deals Won & Milestone PM; termin langsung terbit dengan kalkulator pajak PPN 11% & PPh 23 (2%). | **Invoice terbit tepat waktu**; DSO terpangkas hingga 40%. |
| **Pencatatan Biaya Proyek vs Kantor** | Semua nota dan transfer bercampur di rekening yang sama tanpa label per proyek. | Pemisahan tegas real-time: SPK Freelancer & AWS langsung memotong HPP Proyek; Payroll & Sewa kantor masuk pos OPEX Konsolidasi. | **Margin proyek akurat 100%**; mencegah kebocoran margin tersembunyi. |
| **Klaim Pengeluaran Operasional** | Nota fisik dikumpulkan di map, sering hilang, rekap manual akhir bulan. | AI OCR Drag & Drop: sistem membaca nama vendor, tanggal, nominal struk, dan otomatis mengisi form klaim. | **Klaim instan & paperless**; verifikasi nota dalam hitungan detik. |
| **Pencatatan Buku Besar (General Ledger)** | Staf akuntansi mengetik jurnal debit-kredit manual satu per satu; sering selisih/tidak balance. | Double-Entry Otomatis: Setiap transaksi AR, AP, HR, OPEX, dan Mutasi menghasilkan jurnal seimbang (Total Rp 640.500.000). | **Zero human error**; pembukuan selalu seimbang (*balanced*). |
| **Pemindahan Dana Kas Kecil** | Mutasi transfer antar rekening kantor sering salah dicatat sebagai beban/biaya rugi-laba. | Fitur Mutasi Internal: memindahkan dana antar rekening kas likuid secara non-P&L tanpa mengganggu laporan laba rugi. | **Saldo kas riil sinkron**; laporan P&L tetap valid. |
| **Analisis Profitabilitas Proyek** | Baru dihitung setelah proyek selesai, sering terkejut proyek ternyata rugi (*burn-rate* tinggi). | Laporan Laba Rugi per Proyek real-time dengan Visual Margin Bar dan baris total ringkasan (`<tfoot>`). | **Early warning system** terhadap proyek *over-budget*. |

---

## 4. Resume Rinci Alur Workflow Modul Finance

Berikut adalah visualisasi menyeluruh hubungan antar proses bisnis dan aliran dana dalam modul Finance:

```mermaid
flowchart TD
    subgraph WF1["1. SIKLUS PEMASUKAN & AR (INFLOW)"]
        A1["Deal Won di CRM / Milestone PM"] --> A2["Pecah Jadwal Termin (DP, Termin-1, BAST, Lunas)"]
        A2 --> A3["Kalkulator Pajak (DPP, PPN 11%, PPh 23 2%)"]
        A3 --> A4["Terbitkan Faktur Invoice Resmi"]
        A4 --> A5["Klien Bayar Tagihan"]
        A5 --> A6["Dana Masuk ke Cash Pool Bank BCA (1010)"]
        A6 -->|Auto Posting| JRN1["Jurnal Otomatis AR: (D) Bank / (K) Piutang & Pendapatan"]
    end

    subgraph WF2["2. SIKLUS PENGELUARAN & AP (OUTFLOW)"]
        B1["Klaim Nota AI OCR"] --> B2{"Klasifikasi Beban"}
        B3["SPK Freelancer Subkon"] --> B2
        B4["Tagihan Server AWS/SaaS"] --> B2
        B5["Payroll Karyawan (HR)"] --> B2
        B6["Biaya Sewa & Listrik HQ"] --> B2

        B2 -->|Terkait Proyek Tertentu| C1["Pos HPP Proyek (Akun 5000-an)"]
        B2 -->|Beban Rutin Kantor| C2["Pos OPEX Kantor (Akun 6000-an)"]

        C1 --> C3["Approval PM & Finance"]
        C2 --> C4["Approval Finance & Direksi"]

        C3 --> C5["Disbursement dari Rekening Kas"]
        C4 --> C5
        C5 -->|Auto Posting| JRN2["Jurnal Otomatis AP/OPEX/HPP"]
    end

    subgraph WF3["3. SIKLUS KAS & MUTASI INTERNAL"]
        D1["Rekening Utama (BCA Operasional 1010)"] -->|Mutasi Internal Non-P&L| D2["Petty Cash Kantor (Kas Kecil 1020)"]
        D2 -->|Auto Posting| JRN3["Jurnal Mutasi: (D) Kas Kecil / (K) Bank BCA"]
    end

    subgraph WF4["4. GENERAL LEDGER & REPORTING"]
        JRN1 --> GL["General Ledger Engine (COA 18 Akun Standar)"]
        JRN2 --> GL
        JRN3 --> GL
        
        GL --> R1["Laba Rugi Konsolidasi (Consolidated P&L) -> EBITDA"]
        GL --> R2["Profitabilitas Proyek (P&L per Project) -> Margin Bar"]
        GL --> R3["Portofolio Customer -> DSO & Kolektibilitas"]
    end
```

---

### 4.1 Workflow 1: Manajemen Penagihan & Termin (Invoicing & Accounts Receivable)

Alur ini mengelola siklus piutang usaha dari kesepakatan penjualan hingga pencairan kas:

```mermaid
sequenceDiagram
    autonumber
    actor CRM as Sales / PM
    actor Fin as Finance Officer
    actor Client as Klien / Customer
    participant App as Modul Finance (Invoices)
    participant Bank as Cash Pool (Bank BCA)
    participant GL as General Ledger

    CRM->>App: Deal Won / Milestone Tercapai (Data Kontrak & Termin)
    Fin->>App: Akses Menu Invoices & Buka Modal Edit Termin
    Note over Fin,App: Konfigurasi Persentase: DP 30%, Termin-1 40%, Lunas 30%
    App->>App: Kalkulasi Otomatis DPP, PPN 11%, dan PPh 23 (2%)
    Fin->>Client: Terbitkan & Kirim Invoice Resmi (Status: PENDING)
    Client->>Bank: Transfer Pembayaran Termin
    Bank-->>Fin: Mutasi Kas Diterima
    Fin->>App: Klik "Tandai Lunas" (Status: PAID)
    App->>GL: Auto-Generate Jurnal Umum (JRN-AR)
    Note over GL: (D) 1010 Bank Operasional BCA<br/>(D) 1040 Uang Muka Pajak PPh 23<br/>(K) 1030 Piutang Usaha / 4010 Pendapatan Usaha<br/>(K) 2020 Utang Pajak PPN
    App->>App: Update Laporan Customer (DSO) & Project Margin Real-Time
```

* **Aturan Bisnis & Pajak Terintegrasi**:
  * **DPP (Dasar Pengenaan Pajak)** = Nilai Bruto Termin Kontrak.
  * **PPN (11%)** = Ditambahkan pada invoice sebagai kewajiban pajak keluaran klien.
  * **PPh 23 (2% Jasa)** = Dipotong sebagai kredit pajak perusahaan (Uang Muka Pajak PPh 23).
  * **Total Kas Diterima (Net Inflow)** = `DPP + PPN 11% - PPh 23 2%`.

---

### 4.2 Workflow 2: Pengeluaran Fleksibel (HPP Proyek vs OPEX Kantor)

Memastikan setiap rupiah yang keluar terkategori secara akurat antara beban deliverable proyek dan operasional umum kantor.

#### A. Sub-Workflow Klaim Struk AI OCR
1. Karyawan atau tim lapangan mengunggah foto struk/nota (*drag-and-drop receipt image*).
2. Mesin AI OCR membaca teks gambar dan otomatis mengekstrak: **Nama Vendor/Merchant**, **Tanggal Transaksi**, dan **Nominal Rupiah**.
3. Finance meninjau hasil ekstraksi dan memilih alokasi akun:
   * Jika untuk proyek tertentu (misal: transportasi ke kantor klien proyek) $\rightarrow$ dialokasikan ke **5010 HPP Proyek**.
   * Jika untuk kebutuhan rutin kantor $\rightarrow$ dialokasikan ke **6040 Beban Operasional Kantor**.
4. Pembayaran dicairkan melalui Kas Kecil atau Transfer Bank, dan sistem menerbitkan jurnal pengeluaran otomatis.

#### B. Sub-Workflow SPK Subkontraktor / Freelancer (HPP Proyek)
1. Project Manager menerbitkan Surat Perintah Kerja (SPK) untuk freelancer dengan referensi proyek terkait (misal: *Samudera Logistik App*).
2. Kontrak memuat milestone deliverable (misal: Slicing UI, Integrasi Payment Gateway).
3. Setelah deliverable diverifikasi oleh PM, invoice freelancer diajukan ke Finance.
4. Finance memproses pembayaran yang langsung didebit ke akun **5020 Beban Subkon & Freelancer**.
5. Sistem otomatis memotong margin laba proyek pada laporan **Profitabilitas Proyek**.

#### C. Sub-Workflow Tagihan Vendor Cloud & Lisensi API
1. Tagihan berkala dari penyedia infrastruktur (AWS, Google Cloud, lisensi GitHub Enterprise, SendGrid).
2. Jika server dedicated untuk proyek klien $\rightarrow$ masuk ke **5030 Beban Cloud & Server Proyek**.
3. Jika alat kerja internal kantor $\rightarrow$ masuk ke **6030 Beban Langganan Software/SaaS**.
4. Terjadwal jatuh tempo pada widget peringatan dashboard untuk mencegah suspensi layanan.

#### D. Sub-Workflow Payroll Karyawan Tetap (OPEX)
1. Rekapitulasi penggajian staf tetap bulanan disinkronkan dari data HR.
2. Meliputi gaji pokok, tunjangan kehadiran, dan potongan BPJS.
3. Dicatat langsung ke pos **6010 Beban Gaji & Upah Karyawan Tetap**.
4. Beban ini masuk ke laporan laba rugi konsolidasi perusahaan tanpa membebani HPP proyek teknis individual.

---

### 4.3 Workflow 3: Kas, Rekening Bank & Mutasi Internal (Non-P&L)

Mengatur likuiditas tanpa menyebabkan kesalahan distorsi pada laporan laba rugi:

```mermaid
flowchart LR
    A["Rekening Bank Operasional<br/>(Akun 1010 - BCA)"] -->|Transfer Internal Dana| B["Petty Cash Kantor<br/>(Akun 1020 - Kas Kecil)"]
    
    subgraph Rule["Karakteristik Akuntansi"]
        R1["1. Tidak melibatkan akun Pendapatan (4xxx)"]
        R2["2. Tidak melibatkan akun Beban (5xxx / 6xxx)"]
        R3["3. Nilai EBITDA & Laba Rugi Tetap Utuh"]
        R4["4. Neraca Aset Lancar Tetap Seimbang"]
    end
    
    B -.-> Rule
```

* **Tujuan**: Mengisi kembali (*replenish*) dana kas kecil untuk kebutuhan kas operasional harian kantor.
* **Auto-Journaling**:
  * `[DEBIT]` 1020 - Kas Kecil (Petty Cash)
  * `[KREDIT]` 1010 - Bank BCA Operasional
* Transaksi ini diberi tanda modul sumber `[TRF]` pada Jurnal Umum dan tidak pernah mempengaruhi nilai laba bersih perusahaan.

---

### 4.4 Workflow 4: Pembukuan Ganda Otomatis (General Ledger Engine)

Seluruh modul operasional dihubungkan oleh mesin akuntansi otomatis yang mengacu pada **Chart of Accounts (COA) 18 Akun Standar Industri Software House**:

```mermaid
graph TD
    subgraph COA["Hierarki 18 Akun Chart of Accounts (COA)"]
        A1["1000: ASET (1010 Kas/Bank, 1020 Kas Kecil, 1030 Piutang Usaha, 1040 Pajak PPh 23)"]
        A2["2000: KEWAJIBAN (2010 Utang Vendor, 2020 Utang PPN, 2030 Utang Gaji)"]
        A3["3000: EKUITAS (3010 Modal Disetor, 3020 Laba Ditahan)"]
        A4["4000: PENDAPATAN (4010 Pendapatan Jasa Dev, 4020 Cloud/SLA, 4030 Maintenance)"]
        A5["5000: HPP PROYEK (5010 Direct Cost, 5020 Subkon Freelancer, 5030 Cloud Proyek)"]
        A6["6000: OPEX KANTOR (6010 Gaji HQ, 6020 Sewa Gedung, 6030 SaaS, 6040 Utilitas)"]
    end

    subgraph AutoJRN["Log Jurnal Umum Berpasangan (Total Rp 640.500.000)"]
        J1["JRN-AR: Termin Billing & Pembayaran Klien"]
        J2["JRN-AP: Tagihan Vendor AWS & Lisensi"]
        J3["JRN-HR: Payroll Bulanan Karyawan"]
        J4["JRN-OPEX: Klaim Struk & Utilitas Kantor"]
        J5["JRN-TRF: Mutasi Internal Kas Bank"]
    end

    COA --> AutoJRN
```

* **Audit Saldo Seimbang (*Balanced Equilibrium*)**: Total debit dan kredit pada prototipe terkunci seimbang pada angka **Rp 640.500.000**.
* **Fitur Tata Kelola COA**: Dilengkapi tombol modal *Tambah Akun Baru*, *Edit Akun*, dan *Hapus Akun* dengan validasi kategori akuntansi.

---

### 4.5 Workflow 5: Pelaporan Finansial Multi-Dimensi (Multi-Level Reporting)

Siklus akhir dari data finansial adalah penyajian wawasan strategis untuk para pemangku kepentingan:

```mermaid
graph LR
    GL["Data Transaksi & Jurnal Umum"]

    subgraph L1["1. Consolidated P&L"]
        C1["Revenue Breakdown"] --> T1["Gross Profit"]
        C2["HPP Breakdown"] --> T1
        T1 --> T2["EBITDA / Net Operating Profit"]
        C3["OPEX Breakdown"] --> T2
    end

    subgraph L2["2. Profitabilitas per Proyek"]
        P1["Nilai Kontrak Deal"]
        P2["Termin Terbayar"]
        P3["Serapan HPP (Freelancer + Server)"]
        P4["Net Margin Proyek (Rp & %)"]
        P5["Visual Weighted Margin Bar"]
        P6["Summary Total Row (tfoot)"]
    end

    subgraph L3["3. Portofolio Customer"]
        K1["Avatar Dinamis Klien"]
        K2["Status Termin & Piutang"]
        K3["Rasio Kolektibilitas"]
        K4["Insight: Top Paying Client"]
        K5["Insight: Days Sales Outstanding (DSO)"]
        K6["Insight: Upcoming Inflow Schedule"]
    end

    GL --> L1
    GL --> L2
    GL --> L3
```

1. **Laporan Laba Rugi Konsolidasi (Consolidated P&L)**:
   * Menyajikan rincian sub-item per kategori: Pendapatan Pengembangan Khusus, Pendapatan SLA, HPP Freelancer, HPP Server Proyek, OPEX Gaji Staf, Sewa Gedung, hingga Listrik & Internet.
   * Menghasilkan indikator laba kotor (*Gross Margin*) dan laba bersih operasional (*EBITDA*).
2. **Laporan Profitabilitas Proyek (P&L per Project)**:
   * Mengukur kesehatan delivery proyek perangkat lunak secara satuan.
   * Dilengkapi indikator grafis **Visual Margin Bar** (misal: margin sehat > 70%) dan baris kesimpulan **Summary Total Row (`<tfoot>`)** yang menjumlahkan seluruh portofolio proyek.
3. **Laporan Portofolio per Customer**:
   * Menampilkan rekapitulasi akun klien dengan avatar gradasi elegan.
   * Dilengkapi 3 buah **Summary Insight Cards**:
     * *Top Paying Client*: Klien dengan kontribusi pendapatan tertinggi.
     * *Days Sales Outstanding (DSO)*: Kecepatan rata-rata klien melunasi tagihan.
     * *Upcoming Inflow Schedule*: Proyeksi kas masuk dalam 14 hari ke depan.

---

## 5. Blueprint Skema Entitas Data (ERD Modul Finance)

Struktur tabel relasional yang menopang seluruh alur workflow Finance:

```mermaid
erDiagram
    customers ||--o{ projects : "memiliki"
    projects ||--o{ invoices : "diterbitkan"
    projects ||--o{ expenses : "menyerap HPP"
    projects ||--o{ freelancer_contracts : "mempekerjakan"
    
    bank_accounts ||--o{ internal_transfers : "sumber/tujuan dana"
    bank_accounts ||--o{ invoices : "menerima kas"
    bank_accounts ||--o{ expenses : "membayar beban"
    
    chart_of_accounts ||--o{ journal_entry_items : "referensi akun"
    journal_entries ||--o{ journal_entry_items : "memiliki item ganda"
```

### Rincian Kamus Data Entitas:
1. `projects`: `id`, `name`, `client_id`, `total_contract_value`, `start_date`, `status`
2. `customers`: `id`, `name`, `code`, `sector`, `pic_name`, `phone`, `email`
3. `invoices`: `id`, `project_id`, `termin_name`, `dpp_amount`, `ppn_rate`, `pph_rate`, `total_amount`, `due_date`, `status`
4. `expenses`: `id`, `project_id` (nullable), `category` (HPP / OPEX), `amount`, `vendor_name`, `receipt_file`, `status`
5. `freelancer_contracts`: `id`, `project_id`, `freelancer_name`, `spk_number`, `role`, `total_fee`, `status`
6. `bank_accounts`: `id`, `bank_name`, `account_number`, `account_holder`, `balance`, `account_type`
7. `internal_transfers`: `id`, `from_account_id`, `to_account_id`, `amount`, `transfer_date`, `notes`
8. `chart_of_accounts`: `account_code`, `account_name`, `category_code`, `normal_balance`, `current_balance`
9. `journal_entries`: `id`, `entry_number`, `source_module` (AR / AP / HR / OPEX / TRF), `transaction_date`, `description`, `total_debit`, `total_credit`
10. `journal_entry_items`: `id`, `journal_entry_id`, `account_code`, `debit`, `credit`

---

## 6. Integrasi Lintas Modul (Cross-Module Data Bridges)

Modul Finance beroperasi sebagai muara moneter terpusat dalam ekosistem Astacode ERP:

1. **Jembatan CRM $\rightarrow$ Finance**:
   * *Trigger*: Peluang bisnis berubah status menjadi `DEAL WON`.
   * *Payload Data*: `{ deal_id, client_id, project_name, contract_value, payment_terms }`.
   * *Aksi Finance*: Otomatis mendaftarkan draft termin pada modul Invoicing (AR).
2. **Jembatan Project Management (PM) $\rightarrow$ Finance**:
   * *Trigger*: Milestone pekerjaan / UAT disetujui (*Approved*).
   * *Payload Data*: `{ project_id, termin_number, milestone_name, percentage, due_date }`.
   * *Aksi Finance*: Mengaktifkan tombol terbitkan faktur penagihan resmi ke klien.
3. **Jembatan Marketing / PM $\rightarrow$ Finance (AP Claims)**:
   * *Trigger*: Pengajuan klaim anggaran iklan atau biaya operasional proyek.
   * *Payload Data*: `{ department: "Marketing"|"PM", expense_type, amount, receipt_url, project_id }`.
   * *Aksi Finance*: Masuk antrean verifikasi klaim pengeluaran untuk dicairkan.

---

## 7. Kebijakan Fitur yang Ditiadakan (Deprecated & Removed)

Berdasarkan kesepakatan desain arsitektur pada `PRD_Finance.md`, fitur-fitur konvensional pabrik/manufaktur berikut **telah dihapus sepenuhnya** demi menjaga modul tetap ramping, cepat, dan relevan dengan industri digital:

* ❌ **Rekonsiliasi Bank Otomatis (Dynamic CSV & Tinder Matching)**: Ditiadakan karena seluruh transaksi mutasi kas tercatat secara langsung dan *real-time* via rekening kas dan mutasi internal.
* ❌ **Aset Tetap & Depresiasi Mesin Pabrik**: Ditiadakan karena software house berfokus pada talenta intelektual dan aset komputasi awan yang langsung dibebankan secara operasional.
* ❌ **Modul Kepatuhan Pajak DJP Terpisah**: Ditiadakan; kewajiban PPN 11% dan bukti potong PPh 23 disematkan langsung pada transaksi penagihan riil.
* ❌ **Budgeting & Cost Centers Terpisah**: Ditiadakan; pengendalian anggaran biaya langsung dipantau melalui laporan **Profitabilitas per Proyek**.

---

## 8. Ringkasan Status Implementasi & Verifikasi Prototipe

Seluruh 7 butir kesepakatan penataan teknis pada `PRD_Finance.md` telah terealisasi 100% pada prototipe `finance/`:

| No | Modul / Komponen | Realisasi Implementasi | Status |
| :---: | :--- | :--- | :---: |
| 1 | **Jurnal Umum Otomatis** | 9 Entri Jurnal berpasangan lengkap dengan filter sumber (AR, AP, HR, OPEX, TRF) & status seimbang Rp 640.500.000. | 🟢 **DONE** |
| 2 | **Chart of Accounts (COA)** | 18 Akun standar industri digital, modal Tambah Akun, modal Edit Akun, dan aksi Hapus dengan auto-recalculate counter. | 🟢 **DONE** |
| 3 | **Consolidated P&L** | Sub-item breakdown mendalam pada Pendapatan (4 item), HPP (4 item), dan OPEX (6 item) dengan kalkulasi EBITDA presisi. | 🟢 **DONE** |
| 4 | **P&L per Project** | Komparasi 4 proyek aktif, baris `<tfoot>` total agregat, dan visual progress margin bar dinamis. | 🟢 **DONE** |
| 5 | **Laporan Customer** | Profil klien ber-avatar gradasi, status kolektibilitas termin, dan 3 kartu metrik ringkasan (Top Paying, DSO, Upcoming Inflow). | 🟢 **DONE** |
| 6 | **Dashboard Interaktif** | Toggle periode grafik arus kas (3 Bulan, 6 Bulan, 1 Tahun) dan donut chart alokasi biaya dengan tooltip persentase. | 🟢 **DONE** |
| 7 | **Modal & Notifikasi** | Modal dialog responsif, backdrop click handler, ESC key close, dan toast notification interaktif. | 🟢 **DONE** |

