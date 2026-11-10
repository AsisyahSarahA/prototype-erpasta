/**
 * CrmDealsView.js — Vanilla JS ASTACODE Proyek & Delivery Command Center
 * Sesuai arsitektur crm/js/components/projects/ProjectsList.js
 *
 * Alur Kerja Terpadu & Proporsional:
 * - Memilih 1 Proyek Aktif via Project Pills Bar (TANPA SELECT DROPDOWN)
 * - 3 Langkah Eksekusi Proyek Terpilih:
 *   1. 📥 Penerimaan Aplikasi & List Modul Bawaan
 *   2. 👥 Pembagian Modul ke Developer & Matriks Kapasitas 5 Roles
 *   3. 💰 Pengiriman Invoice & Setting TOP ke Bagian Finance (1:1 Image 3)
 * - Plus Tab 📊 Dashboard Portofolio & SLA (1:1 Image 1)
 */

import { store } from "../../state/store.js";
import { Icons } from "../../utils/icons.js";
import { PerpusIntakeModal } from "./PerpusIntakeModal.js";

export class CrmDealsView {
  constructor(options = {}) {
    this.element = document.createElement("div");
    this.element.className = "crm-view";

    this.onNavigateToProject = options.onNavigateToProject || (() => {});
    this.onNavigateToSettings = options.onNavigateToSettings || (() => {});

    // Active Project ID (Default to Perpustakaan Digital)
    this.selectedProjectId = "deal-crm-lib-101";

    // Active Step/Tab for the Selected Project
    // 'intake' (Langkah 1) | 'allocation' (Langkah 2) | 'finance_top' (Langkah 3) | 'portfolio_dashboard' (Dashboard Portofolio)
    this.activeStep = "intake";

    // Tab 3 Subtab: Setting TOP vs Invoices list
    this.financeTopSubTab = "top_setting"; // 'top_setting' | 'invoices'

    // View Mode for Project Selector: 'card' (default) | 'table'
    this.projectSelectorView = "card";

    // Whether a project is opened in detail execution mode
    // Initially false: show catalog (cards or table) only, hide detail view
    this.isProjectOpened = false;

    // Track which module detail cards are expanded
    this.expandedModules = new Set();

    // Sub-navigation tab in Step 1: 'modules' | 'docs' | 'progress'
    this.activeIntakeSubtab = "modules";

    // Predefined 5 Architecture Templates
    this.TEMPLATES = {
      perpustakaan_microservices: {
        id: "perpustakaan_microservices",
        name: "Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)",
        badge: "Microservices & Edu Tech",
        summary: "Microservice Katalog Laravel 11, Engine Sirkulasi & Denda Redis Mutex, Portal OPAC React 19, API Gateway Traefik, Telegram Reminder Bot, dan Testing QA K6.",
        modules: [
          { keySuffix: "EPIC-1", title: "Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)", description: "REST API microservice buku dengan Laravel 11, skema PostgreSQL, Redis caching, dan validasi ISBN-13.", defaultAssigneeId: "user-dev-3", estimateHours: 24, category: "Core / Backend" },
          { keySuffix: "EPIC-2", title: "Portal Katalog Pencarian OPAC & Detail Buku (React Frontend)", description: "Antarmuka pencarian cepat full-text judul/penulis, filter multi-kategori buku, dan visualisasi ketersediaan rak.", defaultAssigneeId: "user-dev-2", estimateHours: 26, category: "UI / Frontend" },
          { keySuffix: "EPIC-3", title: "Microservice Sirkulasi Peminjaman & Perhitungan Denda (Laravel Backend)", description: "Logika transaksi peminjaman, batas durasi pinjam 7 hari, denda otomatis Rp 2.000/hari, dan atomic lock.", defaultAssigneeId: "user-dev-3", estimateHours: 28, category: "Core / Backend" },
          { keySuffix: "EPIC-4", title: "Meja Sirkulasi Petugas & Dashboard Mahasiswa (React Frontend)", description: "UI kasir peminjaman barcode scanner kartu mahasiswa & buku, riwayat aktif pinjaman, dan slip checkout thermal.", defaultAssigneeId: "user-dev-2", estimateHours: 22, category: "UI / Frontend" },
          { keySuffix: "EPIC-5", title: "API Gateway, Docker Containerization & Telegram Reminder Bot (Fullstack)", description: "Reverse proxy Traefik/Nginx, orchestrator Docker Compose, dan bot Telegram notifikasi pengembalian H-1.", defaultAssigneeId: "user-dev-1", estimateHours: 28, category: "DevOps / Gateway" },
          { keySuffix: "EPIC-6", title: "Matrix Test Case Sirkulasi, K6 Load Test & Staging QA Sign-Off (QA)", description: "Rangkaian pengujian integrasi sirkulasi buku, stress test 2.000 concurrent RPS via K6, dan sign-off UAT.", defaultAssigneeId: "user-qa", estimateHours: 20, category: "QA & Testing" },
          { keySuffix: "EPIC-7", title: "Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek (PM)", description: "Dokumentasi user story, koordinasi kickoff meeting kepala perpustakaan, dan verifikasi termin tagihan.", defaultAssigneeId: "user-pm", estimateHours: 14, category: "PM & Governance" },
        ],
      },
      logistics_telematics: {
        id: "logistics_telematics",
        name: "Custom Logistics & Fleet Tracking Telematics Platform (4 Sprints)",
        badge: "Logistik & IoT Telematika",
        summary: "Platform telematika armada truk kargo: IoT GPS ingestion rate tinggi, engine route dispatching mobile app supir, dashboard real-time geofence, dan integrasi penagihan ERP.",
        modules: [
          { keySuffix: "SPRINT-1", title: "Architecture & Fleet Telematics Core (Microservices Backend)", description: "Infrastruktur database telemetry, REST API armada kargo, skema PostgreSQL partitioning dan gateway konektor IoT OBD-II.", defaultAssigneeId: "user-dev-3", estimateHours: 64, category: "Core / Backend" },
          { keySuffix: "SPRINT-2", title: "Telematics GPS High-Frequency Ingestion & Geofencing Engine", description: "Pipeline streaming Kafka & Redis memproses koordinat GPS kendaraan tiap 2 detik, filter batas kecepatan dan geofence alert.", defaultAssigneeId: "user-dev-1", estimateHours: 64, category: "IoT / Streaming" },
          { keySuffix: "SPRINT-3", title: "Driver Mobile App, Dispatch Console & Digital Proof of Delivery", description: "Aplikasi mobile supir penerima order muatan, navigasi rute turn-by-turn, upload e-signature BAST tanda terima penerima.", defaultAssigneeId: "user-dev-2", estimateHours: 56, category: "Mobile & UI" },
          { keySuffix: "SPRINT-4", title: "UAT Client Sign-Off, Load Testing K6 & BAST Production Deployment", description: "Pengujian ketahanan beban 10.000 pesan GPS per detik, verifikasi fungsional dispatching bersama manajemen ekspedisi dan rilis.", defaultAssigneeId: "user-qa", estimateHours: 40, category: "QA & Rilis" },
        ],
      },
      pos_warung: {
        id: "pos_warung",
        name: "Sistem POS Warung Makan & Kelontong Nusantara (5 Modul Lengkap)",
        badge: "Rekomendasi UKM / Warung",
        summary: "Kasir cepat layar sentuh, potong stok resep bahan baku, QRIS dinamis, rekap tutup kasir, dan otorisasi PIN owner.",
        modules: [
          { keySuffix: "EPIC-1", title: "Kasir Layar Sentuh & Cetak Struk ESC/POS Thermal 58mm", description: "Input pesanan cepat, hitung kembalian, diskon promo, dan cetak struk thermal 58mm.", defaultAssigneeId: "user-dev-1", estimateHours: 28, category: "Core / Frontend" },
          { keySuffix: "EPIC-2", title: "Manajemen Menu, Resep Bahan Baku & Pengurangan Stok Dapur", description: "Katalog menu dan sembako, auto-potong stok bahan baku saat pesanan selesai.", defaultAssigneeId: "user-dev-3", estimateHours: 36, category: "Core / Backend" },
          { keySuffix: "EPIC-3", title: "Integrasi Pembayaran QRIS Dinamis & Manajemen Kas Laci Warung", description: "Integrasi QRIS dinamis real-time dan pencatatan kas laci modal & belanja.", defaultAssigneeId: "user-dev-2", estimateHours: 24, category: "Integrasi Payment" },
          { keySuffix: "EPIC-4", title: "Rekap Tutup Kasir (End of Day / Z-Report) & Laporan Laba Bersih", description: "Rekap tutup kasir harian per shift, laporan omzet, modal bahan (HPP), dan laba bersih.", defaultAssigneeId: "user-dev-1", estimateHours: 20, category: "Reporting" },
          { keySuffix: "EPIC-5", title: "Multi-Kasir, Shift Karyawan & Otorisasi PIN Owner untuk Void", description: "Login kasir cepat PIN 4-digit, audit log, dan proteksi PIN Owner saat pembatalan transaksi.", defaultAssigneeId: "user-qa", estimateHours: 16, category: "QA & Security" },
        ],
      },
      booking_futsal: {
        id: "booking_futsal",
        name: "Sistem Booking Lapangan Futsal & Kasir Sewa (5 Modul Lengkap)",
        badge: "Olahraga & Sport Hub",
        summary: "Sistem sewa lapangan futsal real-time: kalender slot interaktif, DP QRIS dinamis countdown 15 menit, kasir kantin & sewa rompi/bola, Telegram ticket QR bot, dan rekap okupansi.",
        modules: [
          { keySuffix: "EPIC-1", title: "Manajemen Lapangan, Grid Jadwal Interaktif & Anti Double-Booking", description: "Kalender visual pemilihan jam per lapangan, lock slot otomatis saat checkout.", defaultAssigneeId: "user-dev-1", estimateHours: 28, category: "Core / Fullstack" },
          { keySuffix: "EPIC-2", title: "Pembayaran Down Payment (DP), QRIS Dinamis & Timer 15 Menit", description: "Generate kode bayar QRIS dinamis untuk DP, webhook verifikasi otomatis, dan countdown.", defaultAssigneeId: "user-dev-2", estimateHours: 24, category: "Integrasi Payment" },
          { keySuffix: "EPIC-3", title: "Rental Perlengkapan (Rompi/Sepatu/Bola) & POS Kasir Kantin", description: "Add-on sewa perlengkapan pertandingan dan kasir POS minuman di venue.", defaultAssigneeId: "user-dev-3", estimateHours: 20, category: "POS / Inventori" },
          { keySuffix: "EPIC-4", title: "Telegram Gateway Tiket QR Code & Broadcast Reminder H-2 Jam", description: "Pengiriman otomatis bukti booking digital berisi QR Code check-in via Telegram Bot resmi.", defaultAssigneeId: "user-dev-1", estimateHours: 22, category: "Bot & Gateway" },
          { keySuffix: "EPIC-5", title: "Pelunasan di Lokasi, Rekap Kasir Shift & Laporan Okupansi", description: "Scan QR tiket kasir resepsionis, pelunasan sisa bayar, dan analitik okupansi.", defaultAssigneeId: "user-qa", estimateHours: 18, category: "QA & Testing" },
        ],
      },
      erp_klinik: {
        id: "erp_klinik",
        name: "Enterprise ERP & Mobile ESS Biometric Tracking (4 Sprints)",
        badge: "Enterprise & ERP Pabrik",
        summary: "Sistem ERP operasional pabrik: modul presensi biometric mobile karyawan, mesin payroll penggajian PPh21, rekap KPI performa dan pelaporan manajemen terpadu.",
        modules: [
          { keySuffix: "SPRINT-1", title: "Payroll Engine & Database Attendance Schemas", description: "Engine formula lembur, BPJS Ketenagakerjaan & Kesehatan, skema tabel absensi presisi.", defaultAssigneeId: "user-dev-3", estimateHours: 48, category: "Core / Payroll" },
          { keySuffix: "SPRINT-2", title: "Geofencing Mobile ESS & Biometric Face Verification", description: "Aplikasi mobile absensi radius kantor, verifikasi deteksi wajah anti-fake GPS.", defaultAssigneeId: "user-dev-2", estimateHours: 52, category: "Mobile & AI" },
          { keySuffix: "SPRINT-3", title: "Executive KPI Dashboard & HR Reporting Analytics", description: "Dashboard analitik produktivitas shift kerja, export laporan SPT Masa PPh21.", defaultAssigneeId: "user-dev-1", estimateHours: 36, category: "Reporting" },
          { keySuffix: "SPRINT-4", title: "UAT & Sertifikasi BAST Handover Deployment", description: "Pengujian integrasi mesin absensi fisik pabrik dan serah terima operasional HRD.", defaultAssigneeId: "user-qa", estimateHours: 24, category: "QA & BAST" },
        ],
      },
    };

    // Unified Applications / Projects Portfolio Data
    this.applications = [
      {
        id: "deal-crm-lib-101",
        code: "LIB-DIG",
        contractId: "CT-2026-0001",
        contractNumber: "CT/2026/10/0001",
        title: "Sistem Informasi Perpustakaan Digital Kampus (Laravel Microservices & React SPA)",
        customer_name: "Universitas Nusantara Cendekia (Perpustakaan Pusat)",
        pm_name: "Asisyah Sarah Azzahra",
        contract_value: 185000000,
        budget_mandays: 110,
        actual_mandays: 110,
        progress_pct: 100,
        status: "Active",
        end_date: "2026-11-20",
        warranty_period: "12 Bulan Pasca BAST",
        sla_level: "99.8% Availability SLA",
        templateType: "perpustakaan_microservices",
        architecture: "Microservices Terdistribusi (Laravel 11, React 19, Traefik, Redis Mutex)",
        scope: "Arsitektur microservices terdistribusi: Microservice Katalog Laravel 11, Engine Sirkulasi & Denda Redis Mutex, Portal OPAC React 19, Meja Sirkulasi Barcode Scanner, API Gateway Traefik, Telegram Reminder Bot, dan Testing QA K6/Playwright.",
        top_scheme: {
          preset_name: "30/40/30",
          items: [
            { term_no: 1, name: "Down Payment (DP)", description: "Pembayaran uang muka untuk kick-off proyek & resource allocation", value: 30, calculated_amount: 55500000, trigger_label: "Saat penandatanganan kontrak / MoU", due_days_label: "Net 7", status: "Paid", is_locked: true, invoice_no: "INV/2026/10/0001" },
            { term_no: 2, name: "Progress / UAT Milestone", description: "Penyelesaian fitur utama sirkulasi, OPAC & pengujian UAT client", value: 40, calculated_amount: 74000000, trigger_label: "Setelah penyelesaian UAT aplikasi", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
            { term_no: 3, name: "Pelunasan Final", description: "Serah terima sistem final dan dokumen BAST perpustakaan", value: 30, calculated_amount: 55500000, trigger_label: "Setelah penandatanganan BAST", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
          ],
        },
        milestones: [
          { name: "Sprint 1: Microservice Katalog & Arsitektur DB", target_date: "2026-10-25", status: "Completed", mandays_budget: 35 },
          { name: "Sprint 2: Portal OPAC & Engine Sirkulasi Redis", target_date: "2026-11-05", status: "Completed", mandays_budget: 45 },
          { name: "Sprint 3: Meja Barcode Kasir & QA K6 Sign-Off", target_date: "2026-11-15", status: "Completed", mandays_budget: 30 },
        ],
        modules: [
          { keySuffix: "EPIC-1", title: "Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)", description: "REST API microservice buku dengan Laravel 11, skema PostgreSQL, Redis caching, dan validasi ISBN-13.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 24, category: "Core / Backend" },
          { keySuffix: "EPIC-2", title: "Portal Katalog Pencarian OPAC & Detail Buku (React Frontend)", description: "Antarmuka pencarian cepat full-text judul/penulis, filter multi-kategori buku, dan visualisasi ketersediaan rak.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 26, category: "UI / Frontend" },
          { keySuffix: "EPIC-3", title: "Microservice Sirkulasi Peminjaman & Perhitungan Denda (Laravel Backend)", description: "Logika transaksi peminjaman, batas durasi pinjam 7 hari, denda otomatis Rp 2.000/hari, dan atomic lock.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 28, category: "Core / Backend" },
          { keySuffix: "EPIC-4", title: "Meja Sirkulasi Petugas & Dashboard Mahasiswa (React Frontend)", description: "UI kasir peminjaman barcode scanner kartu mahasiswa & buku, riwayat aktif pinjaman, dan slip checkout thermal.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 22, category: "UI / Frontend" },
          { keySuffix: "EPIC-5", title: "API Gateway, Docker Containerization & Telegram Reminder Bot (Fullstack)", description: "Reverse proxy Traefik/Nginx, orchestrator Docker Compose, dan bot Telegram notifikasi pengembalian H-1.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 28, category: "DevOps / Gateway" },
          { keySuffix: "EPIC-6", title: "Matrix Test Case Sirkulasi, K6 Load Test & Staging QA Sign-Off (QA)", description: "Rangkaian pengujian integrasi sirkulasi buku, stress test 2.000 concurrent RPS via K6, dan sign-off UAT.", defaultAssigneeId: "user-qa", roleName: "QA (Parhan)", estimateHours: 20, category: "QA & Testing" },
          { keySuffix: "EPIC-7", title: "Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek (PM)", description: "Dokumentasi user story, koordinasi kickoff meeting kepala perpustakaan, dan verifikasi termin tagihan.", defaultAssigneeId: "user-pm", roleName: "PM (Asisyah)", estimateHours: 14, category: "PM & Governance" },
        ],
      },
      {
        id: "deal-crm-logistics",
        code: "PRJ-2026-001",
        contractId: "CT-2026-0007",
        contractNumber: "CT/2026/10/0007",
        title: "Custom Logistics & Fleet Tracking Telematics Platform",
        customer_name: "PT Logistik Express Sentosa",
        pm_name: "Asisyah Sarah Azzahra",
        contract_value: 520000000,
        budget_mandays: 240,
        actual_mandays: 72,
        progress_pct: 35,
        status: "Active",
        end_date: "2027-02-28",
        warranty_period: "90 Hari Pasca BAST",
        sla_level: "99.9% High Availability SLA",
        templateType: "logistics_telematics",
        architecture: "IoT Telematics Engine, Event-Driven Kafka, Mobile Driver Flutter & Mapbox GPS",
        scope: "Platform telematika armada truk kargo: IoT GPS ingestion rate tinggi, engine route dispatching mobile app supir, dashboard real-time geofence, dan integrasi penagihan ERP.",
        top_scheme: {
          preset_name: "30/40/30",
          items: [
            { term_no: 1, name: "Down Payment (DP)", description: "Pembayaran uang muka untuk kick-off proyek & resource allocation", value: 30, calculated_amount: 156000000, trigger_label: "Saat penandatanganan kontrak / MoU", due_days_label: "Net 7", status: "Paid", is_locked: true, invoice_no: "INV/2026/10/0007" },
            { term_no: 2, name: "Progress / UAT Milestone", description: "Penyelesaian fitur utama dan pengujian UAT client", value: 40, calculated_amount: 208000000, trigger_label: "Setelah penyelesaian UAT aplikasi", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
            { term_no: 3, name: "Pelunasan Final", description: "Serah terima sistem final dan dokumen BAST", value: 30, calculated_amount: 156000000, trigger_label: "Setelah penandatanganan BAST", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
          ],
        },
        milestones: [
          { name: "Sprint 1: Architecture & Fleet Core", target_date: "2026-10-25", status: "Completed", mandays_budget: 60 },
          { name: "Sprint 2: Telematics GPS Ingestion...", target_date: "2026-11-20", status: "In Progress", mandays_budget: 80 },
          { name: "Sprint 3: Driver Mobile App & Dispatch...", target_date: "2026-12-15", status: "Pending", mandays_budget: 60 },
          { name: "UAT & BAST Deployment", target_date: "2027-01-15", status: "Pending", mandays_budget: 40 },
        ],
        modules: [
          { keySuffix: "SPRINT-1", title: "Architecture & Fleet Telematics Core (Microservices Backend)", description: "Infrastruktur database telemetry, REST API armada kargo, skema PostgreSQL partitioning dan gateway konektor IoT OBD-II.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 64, category: "Core / Backend" },
          { keySuffix: "SPRINT-2", title: "Telematics GPS High-Frequency Ingestion & Geofencing Engine", description: "Pipeline streaming Kafka & Redis memproses koordinat GPS kendaraan tiap 2 detik, filter batas kecepatan dan geofence alert.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 64, category: "IoT / Streaming" },
          { keySuffix: "SPRINT-3", title: "Driver Mobile App, Dispatch Console & Digital Proof of Delivery", description: "Aplikasi mobile supir penerima order muatan, navigasi rute turn-by-turn, upload e-signature BAST tanda terima penerima.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 56, category: "Mobile & UI" },
          { keySuffix: "SPRINT-4", title: "UAT Client Sign-Off, Load Testing K6 & BAST Production Deployment", description: "Pengujian ketahanan beban 10.000 pesan GPS per detik, verifikasi fungsional dispatching bersama manajemen ekspedisi dan rilis.", defaultAssigneeId: "user-qa", roleName: "QA (Parhan)", estimateHours: 40, category: "QA & Rilis" },
        ],
      },
      {
        id: "deal-crm-300",
        code: "POS-KLN",
        contractId: "CT-2026-0005",
        contractNumber: "CT/2026/10/0005",
        title: "Sistem POS Warung Makan & Kelontong Nusantara (Warung Bu Siti)",
        customer_name: "CV Berkah Maju Kuliner",
        pm_name: "Asisyah Sarah Azzahra",
        contract_value: 35000000,
        budget_mandays: 45,
        actual_mandays: 15,
        progress_pct: 33,
        status: "Active",
        end_date: "2026-11-28",
        warranty_period: "60 Hari Pasca BAST",
        sla_level: "99.0% Standard SLA",
        templateType: "pos_warung",
        architecture: "Modular Monolith (Express.js, Vue 3, ESC/POS Bluetooth, QRIS Gateway)",
        scope: "Kebutuhan lengkap warung makan & sembako: kasir cepat layar sentuh, potong stok resep bahan baku, QRIS dinamis, rekap tutup kasir, dan otorisasi PIN owner.",
        top_scheme: {
          preset_name: "50/50",
          items: [
            { term_no: 1, name: "Down Payment (DP)", description: "Uang muka inisialisasi modul kasir & setup hardware printer", value: 50, calculated_amount: 17500000, trigger_label: "Saat penandatanganan kontrak / MoU", due_days_label: "Net 7", status: "Paid", is_locked: true, invoice_no: "INV/2026/10/0018" },
            { term_no: 2, name: "Pelunasan & Go-Live", description: "Pelunasan setelah serah terima sistem kasir & training kasir warung", value: 50, calculated_amount: 17500000, trigger_label: "Setelah penandatanganan BAST", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
          ],
        },
        milestones: [
          { name: "Sprint 1: Kasir Touchscreen & ESC/POS", target_date: "2026-11-10", status: "Completed", mandays_budget: 25 },
          { name: "Sprint 2: Manajemen Menu & Stok Dapur", target_date: "2026-11-20", status: "In Progress", mandays_budget: 20 },
        ],
        modules: [
          { keySuffix: "EPIC-1", title: "Kasir Layar Sentuh & Cetak Struk ESC/POS Thermal 58mm", description: "Input pesanan cepat, hitung kembalian, diskon promo, dan cetak struk thermal 58mm.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 28, category: "Core / Frontend" },
          { keySuffix: "EPIC-2", title: "Manajemen Menu, Resep Bahan Baku & Pengurangan Stok Dapur", description: "Katalog menu dan sembako, auto-potong stok bahan baku saat pesanan selesai.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 36, category: "Core / Backend" },
          { keySuffix: "EPIC-3", title: "Integrasi Pembayaran QRIS Dinamis & Manajemen Kas Laci Warung", description: "Integrasi QRIS dinamis real-time dan pencatatan kas laci modal & belanja.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 24, category: "Integrasi Payment" },
          { keySuffix: "EPIC-4", title: "Rekap Tutup Kasir (End of Day / Z-Report) & Laporan Laba Bersih", description: "Rekap tutup kasir harian per shift, laporan omzet, modal bahan (HPP), dan laba bersih.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 20, category: "Reporting" },
          { keySuffix: "EPIC-5", title: "Multi-Kasir, Shift Karyawan & Otorisasi PIN Owner untuk Void", description: "Login kasir cepat PIN 4-digit, audit log, dan proteksi PIN Owner saat pembatalan transaksi.", defaultAssigneeId: "user-qa", roleName: "QA (Parhan)", estimateHours: 16, category: "QA & Security" },
        ],
      },
      {
        id: "deal-crm-303",
        code: "FTSL-PRO",
        contractId: "CT-2026-0004",
        contractNumber: "CT/2026/10/0004",
        title: "Sistem Booking & Manajemen Lapangan Futsal (Champion Arena)",
        customer_name: "PT Champion Arena Nusantara",
        pm_name: "Asisyah Sarah Azzahra",
        contract_value: 52000000,
        budget_mandays: 60,
        actual_mandays: 20,
        progress_pct: 33,
        status: "Active",
        end_date: "2026-12-05",
        warranty_period: "90 Hari Pasca BAST",
        sla_level: "99.5% Uptime SLA",
        templateType: "booking_futsal",
        architecture: "Realtime WebSocket Calendar, Dynamic QRIS DP, Telegram Ticket Bot",
        scope: "Sistem sewa lapangan futsal real-time: kalender slot interaktif, DP QRIS dinamis countdown 15 menit, kasir kantin & sewa rompi/bola, Telegram ticket QR bot, dan rekap okupansi.",
        top_scheme: {
          preset_name: "50/50",
          items: [
            { term_no: 1, name: "Down Payment (DP)", description: "Uang muka pembuatan kalender jadwal booking & QRIS gateway", value: 50, calculated_amount: 26000000, trigger_label: "Saat penandatanganan kontrak / MoU", due_days_label: "Net 7", status: "Paid", is_locked: true, invoice_no: "INV/2026/10/0024" },
            { term_no: 2, name: "Pelunasan & Go-Live Venue", description: "Pelunasan setelah go-live 4 lapangan futsal & bot Telegram tiket", value: 50, calculated_amount: 26000000, trigger_label: "Setelah penandatanganan BAST", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
          ],
        },
        milestones: [
          { name: "Sprint 1: Grid Jadwal & Anti Double-Booking", target_date: "2026-11-15", status: "Completed", mandays_budget: 30 },
          { name: "Sprint 2: DP QRIS Dinamis & Bot Telegram", target_date: "2026-11-28", status: "In Progress", mandays_budget: 30 },
        ],
        modules: [
          { keySuffix: "EPIC-1", title: "Manajemen Lapangan, Grid Jadwal Interaktif & Anti Double-Booking", description: "Kalender visual pemilihan jam per lapangan, lock slot otomatis saat checkout.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 28, category: "Core / Fullstack" },
          { keySuffix: "EPIC-2", title: "Pembayaran Down Payment (DP), QRIS Dinamis & Timer 15 Menit", description: "Generate kode bayar QRIS dinamis untuk DP, webhook verifikasi otomatis, dan countdown.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 24, category: "Integrasi Payment" },
          { keySuffix: "EPIC-3", title: "Rental Perlengkapan (Rompi/Sepatu/Bola) & POS Kasir Kantin", description: "Add-on sewa perlengkapan pertandingan dan kasir POS minuman di venue.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 20, category: "POS / Inventori" },
          { keySuffix: "EPIC-4", title: "Telegram Gateway Tiket QR Code & Broadcast Reminder H-2 Jam", description: "Pengiriman otomatis bukti booking digital berisi QR Code check-in via Telegram Bot resmi.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 22, category: "Bot & Gateway" },
          { keySuffix: "EPIC-5", title: "Pelunasan di Lokasi, Rekap Kasir Shift & Laporan Okupansi", description: "Scan QR tiket kasir resepsionis, pelunasan sisa bayar, dan analitik okupansi.", defaultAssigneeId: "user-qa", roleName: "QA (Parhan)", estimateHours: 18, category: "QA & Testing" },
        ],
      },
      {
        id: "deal-crm-erp",
        code: "PRJ-2026-002",
        contractId: "CT-2026-0002",
        contractNumber: "CT/2026/10/0002",
        title: "Enterprise ERP & Mobile ESS Biometric Tracking",
        customer_name: "PT Maju Sejahtera Industri",
        pm_name: "Asisyah Sarah Azzahra",
        contract_value: 244200000,
        budget_mandays: 152,
        actual_mandays: 48,
        progress_pct: 28,
        status: "Active",
        end_date: "2027-01-30",
        warranty_period: "90 Hari Pasca BAST",
        sla_level: "99.5% Uptime SLA",
        templateType: "erp_klinik",
        architecture: "Enterprise Service Bus, Face Recognition Geofence, HR & Payroll Accounting",
        scope: "Sistem ERP operasional pabrik: modul presensi biometric mobile karyawan, mesin payroll penggajian PPh21, rekap KPI performa dan pelaporan manajemen terpadu.",
        top_scheme: {
          preset_name: "30/40/30",
          items: [
            { term_no: 1, name: "Down Payment (DP)", description: "Pembayaran uang muka untuk kick-off proyek & resource allocation", value: 30, calculated_amount: 73260000, trigger_label: "Saat penandatanganan kontrak / MoU", due_days_label: "Net 7", status: "Paid", is_locked: true, invoice_no: "INV/2026/10/0005" },
            { term_no: 2, name: "Progress / UAT Milestone", description: "Penyelesaian fitur penggajian payroll & absensi biometric", value: 40, calculated_amount: 97680000, trigger_label: "Setelah penyelesaian UAT aplikasi", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
            { term_no: 3, name: "Pelunasan Final", description: "Serah terima sistem final dan dokumen BAST", value: 30, calculated_amount: 73260000, trigger_label: "Setelah penandatanganan BAST", due_days_label: "Net 14", status: "Planned", is_locked: false, invoice_no: null },
          ],
        },
        milestones: [
          { name: "Sprint 1: Payroll Engine & Database Attendance Schemas", target_date: "2026-11-05", status: "In Progress", mandays_budget: 45 },
          { name: "Sprint 2: Geofencing Mobile ESS & Biometric Verification", target_date: "2026-11-30", status: "Pending", mandays_budget: 50 },
          { name: "Sprint 3: Executive KPI Dashboard & HR Analytics", target_date: "2026-12-25", status: "Pending", mandays_budget: 35 },
          { name: "UAT & Sertifikasi BAST", target_date: "2027-01-20", status: "Pending", mandays_budget: 22 },
        ],
        modules: [
          { keySuffix: "SPRINT-1", title: "Payroll Engine & Database Attendance Schemas", description: "Engine formula lembur, BPJS Ketenagakerjaan & Kesehatan, skema tabel absensi presisi.", defaultAssigneeId: "user-dev-3", roleName: "Backend (Jaka)", estimateHours: 48, category: "Core / Payroll" },
          { keySuffix: "SPRINT-2", title: "Geofencing Mobile ESS & Biometric Face Verification", description: "Aplikasi mobile absensi radius kantor, verifikasi deteksi wajah anti-fake GPS.", defaultAssigneeId: "user-dev-2", roleName: "Frontend (Aldyana)", estimateHours: 52, category: "Mobile & AI" },
          { keySuffix: "SPRINT-3", title: "Executive KPI Dashboard & HR Reporting Analytics", description: "Dashboard analitik produktivitas shift kerja, export laporan SPT Masa PPh21.", defaultAssigneeId: "user-dev-1", roleName: "Fullstack (Azi)", estimateHours: 36, category: "Reporting" },
          { keySuffix: "SPRINT-4", title: "UAT & Sertifikasi BAST Handover Deployment", description: "Pengujian integrasi mesin absensi fisik pabrik dan serah terima operasional HRD.", defaultAssigneeId: "user-qa", roleName: "QA (Parhan)", estimateHours: 24, category: "QA & BAST" },
        ],
      },
    ];

    // Invoices list for Tab 3 sub-tab 'invoices'
    this.invoicesList = [
      {
        invoice_number: "INV/2026/10/0001",
        project_title: "Sistem Informasi Perpustakaan Digital Kampus",
        contract_number: "CT/2026/10/0001",
        customer_name: "Universitas Nusantara Cendekia",
        termin_name: "Down Payment (DP)",
        grand_total: 55500000,
        due_date: "2026-10-25",
        status: "Paid",
      },
      {
        invoice_number: "INV/2026/10/0007",
        project_title: "Custom Logistics & Fleet Tracking Telematics Platform",
        contract_number: "CT/2026/10/0007",
        customer_name: "PT Logistik Express Sentosa",
        termin_name: "Down Payment (DP)",
        grand_total: 156000000,
        due_date: "2026-11-05",
        status: "Paid",
      },
      {
        invoice_number: "INV/2026/09/0022",
        project_title: "Omnichannel POS & Multi-Store Inventory Engine",
        contract_number: "CT/2026/10/0003",
        customer_name: "PT Retail Nusantara Prima",
        termin_name: "Progress / UAT Milestone",
        grand_total: 74000000,
        due_date: "2026-10-04",
        status: "Paid",
      },
    ];

    // Instantiate PerpusIntakeModal
    this.perpusModal = new PerpusIntakeModal({
      onNavigateToProject: (pId) => {
        store.setSelectedProjectId(pId);
        store.setActiveTab("kanban");
      },
      onOpenConvertDeal: () => {
        this.selectProject("deal-crm-lib-101", "allocation");
      },
    });
    document.body.appendChild(this.perpusModal.getElement());

    // Initialize modules for active project
    this.loadModulesForActiveProject();

    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  getElement() {
    return this.element;
  }

  formatIDR(val) {
    if (!val && val !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }

  getActiveProject() {
    return this.applications.find((a) => a.id === this.selectedProjectId) || this.applications[0];
  }

  getProjectShortTitle(project) {
    if (!project) return "Sistem Informasi Perpustakaan Digital";
    if (project.code === "LIB-DIG") return "Sistem Informasi Perpustakaan Digital";
    if (project.shortTitle) return project.shortTitle;
    let t = project.title || "";
    t = t.split("(")[0].replace("Kampus", "").trim();
    return t || project.title;
  }

  getModuleShortTitle(mod) {
    if (!mod) return "Modul Aplikasi";
    if (mod.shortTitle) return mod.shortTitle;
    const t = mod.title || "";
    if (t.includes("Katalog Buku")) return "Microservice Katalog Buku";
    if (t.includes("Pencarian OPAC")) return "Portal Katalog Pencarian OPAC";
    if (t.includes("Sirkulasi Peminjaman") || t.includes("Engine Sirkulasi")) return "Microservice Sirkulasi";
    if (t.includes("Meja Sirkulasi")) return "Meja Sirkulasi";
    if (t.includes("API Gateway")) return "API Gateway & Reminder";
    if (t.includes("Matrix Test Case")) return "Matrix Test Case & Staging";
    if (t.includes("Sprint Backlog")) return "Sprint Backlog & UAT";

    let clean = t.split("(")[0].trim();
    if (clean.includes(",")) {
      clean = clean.split(",")[0].trim();
    }
    return clean || t;
  }

  getModuleRoleOnly(mod) {
    // IMPORTANT: The user explicitly requested "jangan ada dulu nama developer nya"
    const cat = (mod.category || "").toLowerCase();
    const role = (mod.roleName || "").toLowerCase();

    if (cat.includes("backend") || role.includes("backend")) return "Backend";
    if (cat.includes("frontend") || role.includes("frontend")) return "Frontend";
    if (cat.includes("devops") || cat.includes("gateway") || role.includes("fullstack") || cat.includes("fullstack")) return "Fullstack";
    if (cat.includes("qa") || cat.includes("test") || role.includes("qa")) return "QA";
    if (cat.includes("pm") || cat.includes("governance") || role.includes("pm")) return "PM";
    if (cat.includes("mobile") || role.includes("mobile")) return "Mobile";
    if (cat.includes("iot") || cat.includes("streaming")) return "IoT";
    return "Developer";
  }

  getEpicTheme(idx) {
    const themes = [
      { bg: "#eff6ff", color: "#2563eb", border: "#dbeafe", icon: "fi-rr-box-alt" },
      { bg: "#f3e8ff", color: "#9333ea", border: "#f3e8ff", icon: "fi-rr-layers" },
      { bg: "#ecfdf5", color: "#16a34a", border: "#d1fae5", icon: "fi-rr-cube" },
      { bg: "#fff7ed", color: "#ea580c", border: "#ffedd5", icon: "fi-rr-desktop" },
      { bg: "#f0fdfa", color: "#0d9488", border: "#ccfbf1", icon: "fi-rr-cloud-network" },
      { bg: "#eef2ff", color: "#4f46e5", border: "#e0e7ff", icon: "fi-rr-shield-check" },
      { bg: "#ecfdf5", color: "#16a34a", border: "#d1fae5", icon: "fi-rr-briefcase" },
    ];
    return themes[idx % themes.length];
  }

  openProject(projectId, nextStep = "intake") {
    this.selectedProjectId = projectId;
    this.isProjectOpened = true;
    this.activeStep = nextStep;
    this.loadModulesForActiveProject();
    this.render();
  }

  handleBackStep() {
    switch (this.activeStep) {
      case "finance_top":
        // Dari Langkah 3, kembali ke Langkah 2: Pembagian Modul
        this.activeStep = "allocation";
        this.render();
        store.addToast("info", "Tahapan Proyek", "Kembali ke Langkah 2: Pembagian Modul ke Developer.");
        break;
      case "allocation":
        // Dari Langkah 2, kembali ke Langkah 1: Penerimaan Aplikasi & List Modul
        this.activeStep = "intake";
        this.render();
        store.addToast("info", "Tahapan Proyek", "Kembali ke Langkah 1: Penerimaan Aplikasi & Spesifikasi.");
        break;
      case "portfolio_dashboard":
        // Dari Dashboard Portofolio, kembali ke Langkah 1
        this.activeStep = "intake";
        this.render();
        break;
      case "intake":
      default:
        // Dari Langkah 1 (tahapan awal), kembali ke Daftar Proyek
        this.closeProjectToCatalog();
        store.addToast("info", "Katalog Proyek", "Kembali ke daftar seluruh proyek.");
        break;
    }
  }

  getBackStepLabel() {
    switch (this.activeStep) {
      case "finance_top":
        return "← Kembali ke Langkah 2: Pembagian Modul";
      case "allocation":
        return "← Kembali ke Langkah 1: Penerimaan Aplikasi";
      case "portfolio_dashboard":
        return "← Kembali ke Alur Eksekusi";
      case "intake":
      default:
        return "← Kembali ke Daftar Proyek";
    }
  }

  closeProjectToCatalog() {
    this.isProjectOpened = false;
    this.render();
  }

  selectProject(projectId, nextStep = null) {
    this.selectedProjectId = projectId;
    this.loadModulesForActiveProject();
    if (nextStep) {
      this.activeStep = nextStep;
    }
    this.render();
  }

  loadModulesForActiveProject() {
    const project = this.getActiveProject();
    if (!project) return;

    this.allocationModules = (project.modules || []).map((m, idx) => ({
      id: `mod-${project.code}-${idx + 1}`,
      epicKey: `${project.code}-${m.keySuffix}`,
      title: m.title,
      description: m.description,
      assigneeId: m.defaultAssigneeId || "user-dev-1",
      estimateHours: m.estimateHours || 24,
      dueDate: m.dueDate || this.getDefaultDueDate(project, idx, (project.modules || []).length),
      category: m.category || "Core",
    }));
  }

  getDefaultDueDate(project, idx, total) {
    if (!project || !project.end_date) {
      const d = new Date();
      d.setDate(d.getDate() + (idx + 1) * 4);
      return d.toISOString().split("T")[0];
    }
    const end = new Date(project.end_date);
    if (isNaN(end.getTime())) {
      const d = new Date();
      d.setDate(d.getDate() + (idx + 1) * 4);
      return d.toISOString().split("T")[0];
    }
    const daysBefore = Math.max(0, (total - 1 - idx) * 3);
    const target = new Date(end.getTime() - daysBefore * 86400000);
    return target.toISOString().split("T")[0];
  }

  render() {
    const state = store.getState();
    const teamMembers = state.teamMembers || [];
    const activeProject = this.getActiveProject();

    const totalAllocatedHours = this.allocationModules.reduce((acc, m) => acc + (Number(m.estimateHours) || 0), 0);
    const totalAllocatedMandays = Math.round(totalAllocatedHours / 8);

    // =========================================================================
    // 1. TAMPILAN AWAL: KATALOG PROYEK (CARD ATAU TABEL) SAJA
    // Di awal TIDAK MENAMPILKAN hero card, stepper, atau langkah 1 (sesuai request)
    // =========================================================================
    if (!this.isProjectOpened) {
      this.element.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 1440px; margin: 0 auto; width: 100%;">
          
          <!-- TOP HEADER BAR (ASTACODE Proyek & Delivery Command Center) -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; background: #ffffff; padding: 18px 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 2px 6px rgba(79,70,229,0.25);">
                ${Icons.layers("", 20)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h1 style="font-size: 16.5px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; margin: 0;">
                    ASTACODE Proyek &amp; Delivery Command Center
                  </h1>
                  <span style="padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(99,102,241,.1); color: #4338ca; border: 1px solid rgba(99,102,241,.2);">
                    Portal Operasional CRM
                  </span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
                  Pusat eksekusi deal won software house: pilih dan klik <strong>Buka Proyek</strong> pada kartu atau tabel untuk memuat alur pembagian modul, tim developer, dan penagihan termin.
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button
                id="openPerpusIntakeBlueprintBtn"
                style="display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; background: #f8fafc; color: #4338ca; font-weight: 700; font-size: 12px; border: 1px solid #cbd5e1; cursor: pointer; transition: all 0.15s ease;"
              >
                ${Icons.bookOpen("", 13)}
                <span>Blueprint Intake Proyek</span>
              </button>
            </div>
          </div>

          <!-- DAFTAR PROYEK DEAL WON (CARD ATAU TABEL) -->
          <div class="crm-project-selector-container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 11px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">
                    DAFTAR PROYEK DEAL WON
                  </span>
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a;">
                    (5 Aplikasi Siap Dikerjakan)
                  </span>
                </div>
                <p style="font-size: 11.5px; color: #64748b; margin: 4px 0 0 0;">
                  Silakan klik tombol <strong>Buka Proyek</strong> pada card atau baris tabel di bawah untuk membuka alur eksekusi proyek tersebut.
                </p>
              </div>

              <!-- View Mode Switcher: Card vs Table -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="crm-view-mode-toggle">
                  <button
                    type="button"
                    class="crm-view-mode-btn ${this.projectSelectorView === "card" ? "active" : ""}"
                    data-view-mode="card"
                    title="Tampilkan dalam Tampilan Card"
                  >
                    ${Icons.grid("", 13)}
                    <span>Tampilan Card</span>
                  </button>
                  <button
                    type="button"
                    class="crm-view-mode-btn ${this.projectSelectorView === "table" ? "active" : ""}"
                    data-view-mode="table"
                    title="Tampilkan dalam Tampilan Tabel"
                  >
                    ${Icons.listTodo("", 13)}
                    <span>Tampilan Tabel</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- RENDER SESUAI MODE: CARD ATAU TABEL -->
            ${this.projectSelectorView === "card" ? this.renderProjectCards(activeProject) : this.renderProjectTable(activeProject)}
          </div>

        </div>
      `;
      return;
    }

    // =========================================================================
    // 2. TAMPILAN DETAIL EKSEKUSI PROYEK TERPILIH (PERSIS SEPERTI DI GAMBAR)
    // Tampil ketika tombol Buka Proyek diklik
    // =========================================================================
    this.element.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 1440px; margin: 0 auto; width: 100%;">
        
        <!-- 1. TOP BREADCRUMB & NAVIGATION BAR -->
        <div class="crm-top-nav-bar">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Tombol Kembali -->
            <button
              type="button"
              id="crmBackBtn"
              class="crm-pill-btn"
              title="Kembali ke tahapan sebelumnya"
            >
              <i class="fi fi-rr-arrow-left"></i>
              <span>Kembali ke Daftar Proyek</span>
            </button>

            <!-- Pintasan Daftar Proyek -->
            <button
              type="button"
              id="crmDirectCatalogBtn"
              class="crm-pill-btn"
              title="Lihat katalog seluruh proyek"
            >
              <i class="fi fi-rr-apps"></i>
              <span>Daftar Proyek</span>
            </button>

            <!-- Proyek Aktif Pill -->
            <div class="crm-active-proj-pill">
              <i class="fi fi-rr-folder" style="color: #6366f1;"></i>
              <span>Proyek Aktif:</span>
              <strong>${activeProject.code}</strong>
            </div>
          </div>

          <!-- Tombol Aksi Kanan Atas -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button
             
            </button>
          </div>
        </div>

        <!-- 2. KARTU HERO PROYEK (PERSIS SESUAI MOCKUP GAMBAR) -->
        <div class="crm-hero-card">
          <div class="crm-hero-left">
            <div class="crm-hero-avatar-box">
              <i class="fi fi-rr-graduation-cap"></i>
            </div>
            
            <div class="crm-hero-info">
              <h2 class="crm-hero-title">${this.getProjectShortTitle(activeProject)}</h2>
              <p class="crm-hero-client">${activeProject.customer_name}</p>
              
              <div class="crm-hero-stats-row">
                <div class="crm-hero-stat-item">
                  <span style="color: #059669; font-weight: 700;">$</span>
                  <span class="crm-hero-stat-label">Nilai Kontrak</span>
                  <strong class="crm-hero-stat-value" style="color: #059669;">Rp ${this.formatIDR(activeProject.contract_value)}</strong>
                </div>

                <span class="crm-hero-divider"></span>

                <div class="crm-hero-stat-item">
                  <i class="fi fi-rr-calendar" style="color: #2563eb; font-size: 11px;"></i>
                  <span class="crm-hero-stat-label">Durasi</span>
                  <strong class="crm-hero-stat-value" style="color: #2563eb;">${activeProject.actual_mandays || activeProject.budget_mandays} / ${activeProject.budget_mandays} MD</strong>
                </div>

                <span class="crm-hero-divider"></span>

                <div class="crm-hero-stat-item">
                  <i class="fi fi-rr-calendar-clock" style="color: #6366f1; font-size: 11px;"></i>
                  <span class="crm-hero-stat-label">Sisa Kontrak</span>
                  <strong class="crm-hero-stat-value">30/06/79</strong>
                </div>

                <span class="crm-hero-divider"></span>

                <span class="crm-badge-active-dot">
                  <span class="crm-green-dot"></span> Aktif
                </span>
              </div>
            </div>
          </div>

          <div class="crm-hero-deal-won-badge">
            <div class="crm-deal-check-icon">
              <i class="fi fi-rr-check"></i>
            </div>
            <div>
              <div class="crm-deal-badge-text-title">Active</div>
              <div class="crm-deal-badge-text-sub">Deal Won</div>
            </div>
          </div>
        </div>

        <!-- 4. KONTEN DARI TAHAP YANG AKTIF -->
        ${this.renderCurrentStepContent(activeProject, teamMembers, totalAllocatedHours, totalAllocatedMandays)}

      </div>
    `;
  }

  // =========================================================================
  // PROJECT SELECTOR: CARD VIEW & TABLE VIEW
  // =========================================================================
  renderProjectCards(activeProject) {
    return `
      <div class="crm-project-cards-grid">
        ${this.applications
          .map((app) => {
            const isSelected = app.id === activeProject.id;
            return `
            <div
              class="crm-project-card-item ${isSelected ? "active" : ""}"
              data-project-id="${app.id}"
              tabindex="0"
              role="button"
              aria-pressed="${isSelected}"
            >
              <!-- Card Header -->
              <div class="crm-project-card-header">
                <span class="pill-code ${isSelected ? "active" : ""}">${app.code}</span>
                <span class="card-status-badge ${isSelected ? "selected" : ""}">
                  ${isSelected ? "✔ AKTIF TERPILIH" : "Deal Won"}
                </span>
              </div>

              <!-- Card Body -->
              <div>
                <h4 class="card-project-title ${isSelected ? "active" : ""}" title="${app.title}">
                  ${app.title}
                </h4>
                <p class="card-client-text" title="${app.customer_name}">
                  🏢 ${app.customer_name}
                </p>
                <p class="card-pm-text">
                  PM: <strong>${app.pm_name}</strong>
                </p>
              </div>

              <!-- Metrics: Nilai Kontrak & Mandays -->
              <div class="card-metrics-box">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">NILAI KONTRAK</span>
                  <span style="font-size: 13px; font-weight: 800; color: #059669; font-family: var(--font-mono);">
                    ${this.formatIDR(app.contract_value)}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px; font-family: var(--font-mono);">
                  <span style="color: #64748b;">${app.actual_mandays} / ${app.budget_mandays} MD</span>
                  <span style="font-weight: 700; color: ${isSelected ? "#4338ca" : "#475569"};">${app.progress_pct}% Selesai</span>
                </div>

                <div class="card-mini-progress">
                  <div class="card-mini-progress-fill" style="width: ${app.progress_pct}%; background: ${isSelected ? "linear-gradient(90deg, #4f46e5, #10b981)" : "#94a3b8"};"></div>
                </div>
              </div>

              <!-- Action Status Footer -->
              <div>
                <button type="button" class="crm-open-project-btn" data-project-id="${app.id}">
                  🚀 Buka Proyek ➔
                </button>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  renderProjectTable(activeProject) {
    return `
      <div class="crm-project-table-container">
        <table class="crm-project-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">STATUS</th>
              <th style="width: 110px;">KODE</th>
              <th>NAMA APLIKASI &amp; KLIEN</th>
              <th style="width: 140px; text-align: right;">NILAI KONTRAK</th>
              <th style="width: 160px;">MANDAYS &amp; PROGRES</th>
              <th style="width: 120px;">SKEMA TOP</th>
              <th style="width: 130px; text-align: center;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            ${this.applications
              .map((app) => {
                const isSelected = app.id === activeProject.id;
                return `
                <tr
                  class="crm-project-table-row ${isSelected ? "active-row" : ""}"
                  data-project-id="${app.id}"
                >
                  <td style="text-align: center;">
                    ${isSelected ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #4f46e5; color: #fff; font-size: 12px; font-weight: 800;">✓</span>` : `<span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #cbd5e1; color: transparent;">•</span>`}
                  </td>
                  <td>
                    <span class="pill-code ${isSelected ? "active" : ""}">${app.code}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: ${isSelected ? "#312e81" : "#0f172a"}; font-size: 12.5px; line-height: 1.35;">
                      ${app.title}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      🏢 ${app.customer_name} • PM: <strong>${app.pm_name}</strong>
                    </div>
                  </td>
                  <td style="text-align: right; font-family: var(--font-mono); font-weight: 800; color: #059669; font-size: 13px;">
                    ${this.formatIDR(app.contract_value)}
                  </td>
                  <td>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); margin-bottom: 3px;">
                      <span>${app.actual_mandays}/${app.budget_mandays} MD</span>
                      <span style="font-weight: 700; color: ${isSelected ? "#4338ca" : "#475569"};">${app.progress_pct}%</span>
                    </div>
                    <div class="card-mini-progress">
                      <div class="card-mini-progress-fill" style="width: ${app.progress_pct}%; background: ${isSelected ? "linear-gradient(90deg, #4f46e5, #10b981)" : "#94a3b8"};"></div>
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #334155; font-family: var(--font-mono); background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
                      ${app.top_scheme.preset_name}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <button type="button" class="crm-open-project-btn table-open-btn" data-project-id="${app.id}">
                      Buka Proyek ➔
                    </button>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  renderCurrentStepContent(activeProject, teamMembers, totalAllocatedHours, totalAllocatedMandays) {
    switch (this.activeStep) {
      case "intake":
        return this.renderStep1Intake(activeProject);
      case "allocation":
        return this.renderStep2Allocation(activeProject, teamMembers, totalAllocatedHours, totalAllocatedMandays);
      case "finance_top":
        return this.renderStep3Finance(activeProject);
      case "portfolio_dashboard":
        return this.renderPortfolioDashboard();
      default:
        return this.renderStep1Intake(activeProject);
    }
  }

  // =========================================================================
  // LANGKAH 1: Penerimaan Aplikasi & Spesifikasi Kebutuhan (Clean Card Layout)
  // =========================================================================
  renderStep1Intake(activeProject) {
    const totalHours = (activeProject.modules || []).reduce((acc, m) => acc + (Number(m.estimateHours) || 0), 0);
    const totalMD = Math.round(totalHours / 8);

    const isModulesActive = !this.activeIntakeSubtab || this.activeIntakeSubtab === "modules";
    const isDocsActive = this.activeIntakeSubtab === "docs";
    const isProgressActive = this.activeIntakeSubtab === "progress";

    return `
      <!-- 1. SUB-NAVIGATION TABS BAR (MODUL, DOKUMEN, PROGRESS) -->
      <div class="crm-subnav-bar">
        <div class="crm-subnav-tabs">
          <button type="button" class="crm-subtab-btn ${isModulesActive ? "active" : ""}" data-subtab="modules">
            <i class="fi fi-rr-box-open"></i>
            <span>Modul Aplikasi</span>
          </button>
          <button type="button" class="crm-subtab-btn ${isDocsActive ? "active" : ""}" data-subtab="docs">
            <i class="fi fi-rr-document"></i>
            <span>Dokumen &amp; Spesifikasi</span>
          </button>
          <button type="button" class="crm-subtab-btn ${isProgressActive ? "active" : ""}" data-subtab="progress">
            <i class="fi fi-rr-chart-histogram"></i>
            <span>Progress Proyek</span>
          </button>
        </div>

        <div class="crm-subnav-meta">
          <span class="crm-subnav-meta-item">
            <i class="fi fi-rr-calendar" style="color: #64748b;"></i>
            <span>Target: <strong>${activeProject.end_date || "2026-11-20"}</strong></span>
          </span>
          <span class="crm-subnav-meta-sep">|</span>
          <span class="crm-subnav-meta-item">
            <i class="fi fi-rr-time-twenty-four" style="color: #64748b;"></i>
            <span>Garansi: <strong>${activeProject.warranty_period ? activeProject.warranty_period.split(" ")[0] + " Bulan" : "12 Bulan"}</strong></span>
          </span>
          <span class="crm-subnav-meta-sep">|</span>
          <span class="crm-subnav-meta-item">
            <i class="fi fi-rr-bolt" style="color: #6366f1;"></i>
            <span>SLA: <strong>${activeProject.sla_level ? activeProject.sla_level.split(" ")[0] : "99.8%"}</strong></span>
          </span>
        </div>
      </div>

      ${
        isDocsActive
          ? `
        <!-- SUBTAB 2: DOKUMEN & SPESIFIKASI TEKNIS -->
        <div class="crm-section-box">
          <div class="crm-section-header">
            <div class="crm-section-title-wrap">
              <div class="crm-section-layers-icon" style="background: #fdf4ff; color: #a855f7;">
                <i class="fi fi-rr-document"></i>
              </div>
              <div>
                <h3 class="crm-section-title">Dokumen &amp; Spesifikasi Teknis Proyek</h3>
                <p class="crm-section-desc">Ringkasan arsitektur sistem dan ruang lingkup kontrak yang disetujui klien</p>
              </div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
            <div style="display: flex; gap: 16px; align-items: baseline;">
              <strong style="width: 110px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Arsitektur</strong>
              <span style="color: #0f172a; font-weight: 700; line-height: 1.5;">${activeProject.architecture || "-"}</span>
            </div>
            <div style="display: flex; gap: 16px; align-items: baseline;">
              <strong style="width: 110px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Ruang Lingkup</strong>
              <span style="color: #334155; line-height: 1.55;">${activeProject.scope || "-"}</span>
            </div>
          </div>
        </div>
      `
          : isProgressActive
            ? `
        <!-- SUBTAB 3: PROGRESS PROYEK & MILESTONES -->
        <div class="crm-section-box">
          <div class="crm-section-header">
            <div class="crm-section-title-wrap">
              <div class="crm-section-layers-icon" style="background: #ecfdf5; color: #059669;">
                <i class="fi fi-rr-chart-histogram"></i>
              </div>
              <div>
                <h3 class="crm-section-title">Progress Proyek &amp; Milestones</h3>
                <p class="crm-section-desc">Monitoring pencapaian sprint dan deliverables kontrak</p>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            ${(activeProject.milestones || [])
              .map(
                (m) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px;">
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 6px;">${m.name}</strong>
                <div style="font-size: 11.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
                  <span>Target: ${m.target_date}</span>
                  <span style="color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 4px;">${m.status || "Planned"}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
            : `
        <!-- SUBTAB 1: DAFTAR MODUL APLIKASI (PERSIS SESUAI GAMBAR) -->
        <div class="crm-section-box">
          
          <!-- Section Header Bar -->
          <div class="crm-section-header">
            <div class="crm-section-title-wrap">
              <div class="crm-section-layers-icon">
                <i class="fi fi-rr-layers"></i>
              </div>
              <div>
                <h3 class="crm-section-title">Daftar Modul Aplikasi</h3>
                <p class="crm-section-desc">Pilih modul yang ingin dikembangkan</p>
              </div>
            </div>

            <div class="crm-section-actions">
              <button type="button" id="crmExpandAllModulesBtn" class="crm-pill-action-btn" title="Buka seluruh detail modul">
                <i class="fi fi-rr-list"></i>
                <span>Lihat Semua Detail &gt;</span>
              </button>
              <button type="button" id="crmCollapseAllModulesBtn" class="crm-pill-action-btn" title="Tutup seluruh detail modul">
                <span>Tutup Semua</span>
                <i class="fi fi-rr-angle-small-up"></i>
              </button>
            </div>
          </div>

          <!-- 4-Column Cards Grid -->
          <div class="crm-module-cards-grid">
            ${(activeProject.modules || [])
              .map((mod, idx) => {
                const modFullKey = `${activeProject.code}-${mod.keySuffix}`;
                const isExpanded = this.expandedModules && this.expandedModules.has(modFullKey);
                const theme = this.getEpicTheme(idx);
                const shortTitle = this.getModuleShortTitle(mod);
                const roleOnly = this.getModuleRoleOnly(mod); // PENTING: Tanpa nama developer!

                return `
                <div class="crm-module-card ${isExpanded ? "is-expanded" : ""}" data-module-key="${modFullKey}">
                  <!-- Top Row: Badge & More Button -->
                  <div class="crm-card-header">
                    <span class="crm-epic-badge" style="background: ${theme.bg}; color: ${theme.color}; border: 1px solid ${theme.border};">
                      <i class="fi ${theme.icon}"></i>
                      <span>${modFullKey}</span>
                    </span>
                    <button type="button" class="crm-card-more-btn" title="Opsi modul">• • •</button>
                  </div>

                  <!-- Clean Short Title -->
                  <h4 class="crm-card-title" title="${mod.title}">
                    ${shortTitle}
                  </h4>

                  <!-- Meta Row: Hours & Role ONLY (Tanpa Nama Developer!) -->
                  <div class="crm-card-meta-row">
                    <div class="crm-card-meta-item">
                      <i class="fi fi-rr-time-fast"></i>
                      <span>${mod.estimateHours}H (~${Math.round(mod.estimateHours / 8)} MD)</span>
                    </div>
                    <span class="crm-card-meta-sep"></span>
                    <div class="crm-card-meta-item">
                      <i class="fi fi-rr-user"></i>
                      <span>${roleOnly}</span>
                    </div>
                  </div>

                  <!-- Collapsible Detail Drawer (Hidden by default, shown when expanded) -->
                  <div class="crm-card-detail-drawer" style="display: ${isExpanded ? "block" : "none"};">
                    <div class="crm-card-detail-desc">
                      <p style="margin: 0; line-height: 1.45;">${mod.description || "Spesifikasi modul terverifikasi dari kontrak."}</p>
                    </div>
                    <div class="crm-card-detail-footer">
                      <span class="crm-status-ready">
                        <i class="fi fi-rr-check"></i> Siap dialokasi
                      </span>
                      <span style="color: #64748b; font-size: 10.5px;">
                        Langkah 2: Resource
                      </span>
                    </div>
                  </div>

                  <!-- Toggle Button (Lihat Detail ->) -->
                  <button type="button" class="crm-card-toggle-btn" data-module-key="${modFullKey}">
                    <span class="crm-card-toggle-label">${isExpanded ? "Tutup Detail" : "Lihat Detail"}</span>
                    <i class="fi ${isExpanded ? "fi-rr-angle-small-up" : "fi-rr-arrow-right"} crm-card-toggle-icon"></i>
                  </button>
                </div>
              `;
              })
              .join("")}
          </div>

          <!-- Bottom Sticky / Footer Bar -->
          <div class="crm-intake-footer">
            <div style="font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;">
              <i class="fi fi-rr-info" style="color: #2563eb;"></i>
              <span>Verifikasi spesifikasi modul sebelum membagi beban kerja ke developer.</span>
            </div>

            <div>
              <button
                type="button"
                class="crm-footer-next-btn go-to-step-btn"
                data-target-step="allocation"
                title="Lanjut membagikan modul ke developer"
              >
                <i class="fi fi-rr-rocket-lunch"></i>
                <span>Lanjut : Bagikan Modul ke Developer ➔</span>
              </button>
            </div>
          </div>

        </div>
      `
      }
    `;
  }

  // =========================================================================
  // LANGKAH 2: Pembagian Modul ke Developer (Resource & Mandays)
  // TIDAK ADA SELECT DROPDOWN UNTUK PROYEK! LANGSUNG TERIKAT KE PROYEK AKTIF
  // =========================================================================
  renderStep2Allocation(activeProject, teamMembers, totalAllocatedHours, totalAllocatedMandays) {
    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Step 2 Section Header -->
        <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div>
            <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>👥 Langkah 2: Pembagian Modul ke Developer</span>
            </h3>
            <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
              Template Arsitektur: <strong>${activeProject.templateType}</strong> • Tentukan penugasan PIC developer dan estimasi target tanggal selesai per modul.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11.5px; font-weight: 700;">
            <span style="padding: 6px 12px; border-radius: 8px; background: #e0e7ff; color: #4338ca;">
              ${this.allocationModules.length} Epics
            </span>
            <span style="padding: 6px 12px; border-radius: 8px; background: #ecfdf5; color: #059669;">
              ${totalAllocatedHours} Jam (~${totalAllocatedMandays} MD)
            </span>
          </div>
        </div>

        <!-- Matriks Kapasitas 5 Roles Tim Developer (Beban Kerja Proyek Ini) -->
        <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
                ${Icons.users("", 16)}
                <span>Matriks Kapasitas &amp; Pembagian Beban 5 Role Tim Developer</span>
              </h3>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
                Beban jam kerja per modul secara otomatis diakumulasikan ke kapasitas mingguan masing-masing role engineer.
              </p>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 3px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
              Batas Standar: 40h / Minggu
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            ${teamMembers
              .map((m) => {
                const assignedMods = this.allocationModules.filter((mod) => mod.assigneeId === m.id);
                const assignedHours = assignedMods.reduce((acc, mod) => acc + (Number(mod.estimateHours) || 0), 0);
                const capacity = m.capacity || 40;
                const isOverload = assignedHours > capacity;
                const pct = Math.min(Math.round((assignedHours / capacity) * 100), 100);

                return `
                <div style="background: #ffffff; border-radius: 12px; border: 1px solid ${isOverload ? "#fca5a5" : "#e2e8f0"}; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); ${isOverload ? "background: #fff5f5;" : ""}">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <strong style="font-size: 12.5px; color: #0f172a; display: block;">${m.name}</strong>
                      <span style="font-size: 10.5px; color: #64748b;">${m.roleName || m.role}</span>
                    </div>
                    <span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; ${isOverload ? "background: #fee2e2; color: #b91c1c;" : "background: #ecfdf5; color: #047857;"}">
                      ${isOverload ? "OVERLOAD" : "AMAN"}
                    </span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px;">
                    <span style="font-size: 11px; color: #64748b;">${assignedMods.length} Modul Ditugaskan</span>
                    <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800; color: ${isOverload ? "#b91c1c" : "#0f172a"};">
                      ${assignedHours} / ${capacity}h
                    </span>
                  </div>

                  <!-- Progress Gauge -->
                  <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-top: 2px;">
                    <div style="height: 100%; width: ${pct}%; background: ${isOverload ? "#ef4444" : pct > 75 ? "#f59e0b" : "#10b981"}; border-radius: 9999px;"></div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Alokasi Modul Arsitektur & Penugasan Developer -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0;">
              Alokasi Modul Proyek &amp; Penugasan Developer (${this.allocationModules.length} Epics)
            </h3>
            <span style="font-size: 11.5px; color: #64748b;">
              Pilih PIC Developer &amp; tentukan estimasi target selesai.
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 14px;">
            ${this.allocationModules
              .map(
                (mod, idx) => `
              <div style="background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 4px;">
                    ${mod.epicKey}
                  </span>
                  <button type="button" class="alloc-delete-mod-btn" data-idx="${idx}" title="Hapus modul ini" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex;">
                    ${Icons.trash("", 13)}
                  </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <input type="text" class="alloc-mod-title crm-form-input" data-idx="${idx}" value="${mod.title}" style="font-size: 12px; font-weight: 700; height: 32px; border-radius: 8px;" placeholder="Nama Modul / Epic..." />
                  <textarea class="alloc-mod-desc crm-form-input" data-idx="${idx}" rows="2" style="font-size: 11px; line-height: 1.4; resize: vertical; border-radius: 8px;" placeholder="Deskripsi spesifikasi modul...">${mod.description}</textarea>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; background: #f8fafc; padding: 8px 10px; border-radius: 10px; border: 1px solid #e2e8f0;">
                  <div style="flex: 1;">
                    <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                      PIC Developer:
                    </label>
                    <select class="alloc-mod-assignee crm-form-select" data-idx="${idx}" style="font-size: 11px; font-weight: 600; height: 28px; width: 100%; border-radius: 6px;">
                      ${teamMembers
                        .map(
                          (tm) => `
                        <option value="${tm.id}" ${mod.assigneeId === tm.id ? "selected" : ""}>
                          ${tm.name} (${tm.roleName || tm.role})
                        </option>
                      `,
                        )
                        .join("")}
                    </select>
                  </div>

                  <div style="width: 145px;">
                    <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                      Estimasi Selesai:
                    </label>
                    <input
                      type="date"
                      class="alloc-mod-duedate crm-form-input"
                      data-idx="${idx}"
                      value="${mod.dueDate || ""}"
                      onclick="try { this.showPicker(); } catch (e) {}"
                      style="font-size: 11.5px; font-weight: 600; font-family: var(--font-mono); height: 28px; width: 100%; border-radius: 6px; cursor: pointer; padding: 0 8px; color: #0f172a; background: #ffffff;"
                    />
                  </div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- Allocation Action Footer -->
        <div style="background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-size: 12px; color: #64748b;">
            Modul yang sudah dibagikan siap diterbitkan ke Kanban Board dan repositori GitHub.
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
           <button type="button" id="executeAllocationBtn" class="finance-btn-primary" style="font-size: 12px; padding: 8px 18px; background-color: #059669; border: 1px solid #059669; color: #ffffff; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.sparkles("", 14)}
            <span style="color: #ffffff;">Lanjutkan ke project</span>
          </button>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // LANGKAH 3: Finansial TOP & Invoice (Image 3)
  // TIDAK ADA SELECT DROPDOWN UNTUK PROYEK! LANGSUNG TERIKAT KE PROYEK AKTIF
  // =========================================================================
  renderStep3Finance(activeProject) {
    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header Card (Matches Image 3 Header) -->
        <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em;">
                Modul Kontrak, Invoicing &amp; Setting TOP (Termin Pembayaran)
              </h2>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: rgba(99,102,241,.1); color: #4338ca; border: 1px solid rgba(99,102,241,.2);">
                PRD Section 8.11.1
              </span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">
              Setting TOP diwariskan langsung dari Quotation yang disetujui (Deal) dan mengendalikan jadwal penerbitan invoice per termin.
            </p>
          </div>

          <!-- View Switcher (Matches Image 3 Top Right) -->
          <div style="display: flex; align-items: center; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            <button type="button" class="finance-top-subtab-btn ${this.financeTopSubTab === "top_setting" ? "active" : ""}" data-subtab="top_setting" style="padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s ease; ${this.financeTopSubTab === "top_setting" ? "background: white; color: #4338ca; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" : "background: none; color: #64748b;"}">
              Setting TOP Kontrak Ini
            </button>
            <button type="button" class="finance-top-subtab-btn ${this.financeTopSubTab === "invoices" ? "active" : ""}" data-subtab="invoices" style="padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s ease; ${this.financeTopSubTab === "invoices" ? "background: white; color: #4338ca; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" : "background: none; color: #64748b;"}">
              Daftar Invoice Terbit (${this.invoicesList.length})
            </button>
          </div>
        </div>

        ${
          this.financeTopSubTab === "top_setting"
            ? `
          
          <!-- Section 1: Selector Card (TANPA SELECT DROPDOWN! Menampilkan Proyek Aktif Terikat) -->
          <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 18px;">
              
              <!-- Proyek Aktif Info (Left) -->
              <div style="flex: 1; min-width: 320px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
                  KONTRAK / PROYEK TERPILIH:
                </span>
                <div style="font-weight: 800; font-size: 14.5px; color: #0f172a;">
                  ${activeProject.contractNumber} • ${activeProject.title}
                </div>
                <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
                  Klien: <strong>${activeProject.customer_name}</strong>
                </div>
              </div>

              <!-- Right Metrics (Matches Image 3) -->
              <div style="display: flex; align-items: center; gap: 24px; font-size: 12px; flex-wrap: wrap;">
                <div>
                  <span style="color: #64748b; font-size: 11px; display: block;">Nilai Kontrak Total:</span>
                  <p style="font-family: var(--font-mono); font-weight: 800; font-size: 16px; color: #4338ca; margin: 2px 0 0 0;">
                    ${this.formatIDR(activeProject.contract_value)}
                  </p>
                </div>

                <div style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
                  <span style="color: #64748b; font-size: 11px; display: block;">Skema Termin TOP:</span>
                  <p style="font-weight: 700; color: #0f172a; margin: 2px 0 0 0;">
                    ${activeProject.top_scheme.preset_name} (${(activeProject.top_scheme.items || []).length} Termin)
                  </p>
                </div>

                <div style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
                  <span style="color: #64748b; font-size: 11px; display: block;">Status Kontrak:</span>
                  <span style="padding: 3px 10px; border-radius: 4px; font-size: 10.5px; font-weight: 800; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; display: inline-block; margin-top: 2px;">
                    AKTIF BERJALAN
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Section 2: Jadwal Termin Pembayaran Table (Matches Image 3 Section 2 from Left to Right) -->
          <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <h3 style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0;">
                Jadwal Termin Pembayaran Kontrak ${activeProject.contractNumber}
              </h3>
              <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
                🔒 Termin yang sudah diterbitkan invoice terkunci demi kepatuhan akuntansi (PRD BR-19).
              </p>
            </div>

            <!-- Table of Termins matching Image 3 -->
            <div style="overflow-x: auto;">
              <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.05em;">
                    <th style="padding: 12px 14px; width: 44px; text-align: center;">NO</th>
                    <th style="padding: 12px 14px;">NAMA TERMIN</th>
                    <th style="padding: 12px 14px; width: 90px;">PORSI (%)</th>
                    <th style="padding: 12px 14px; width: 160px;">NOMINAL (IDR)</th>
                    <th style="padding: 12px 14px;">PEMICU TAGIHAN (TRIGGER)</th>
                    <th style="padding: 12px 14px; width: 140px;">STATUS TERMIN</th>
                    <th style="padding: 12px 14px; text-align: right; width: 160px;">AKSI FINANCE</th>
                  </tr>
                </thead>
                <tbody style="border-top: 1px solid #e2e8f0;">
                  ${(activeProject.top_scheme.items || [])
                    .map((term, idx) => {
                      const isPaid = term.status === "Paid";
                      const isInvoiced = term.status === "Invoiced" || term.is_locked;

                      return `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;">
                        <td style="padding: 14px; text-align: center; font-family: var(--font-mono); font-weight: 700; color: #64748b;">
                          ${idx + 1}
                        </td>

                        <td style="padding: 14px;">
                          <div style="font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                            <span>${term.name}</span>
                            ${isInvoiced ? `<span title="Terkunci: Invoice sudah terbit" style="color: #94a3b8; display: flex;">${Icons.lock("", 12)}</span>` : ""}
                          </div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                            ${term.description || ""}
                          </div>
                        </td>

                        <td style="padding: 14px; font-family: var(--font-mono); font-weight: 700; color: #0f172a;">
                          ${term.value}%
                        </td>

                        <td style="padding: 14px; font-family: var(--font-mono); font-weight: 800; color: #059669; font-size: 12.5px;">
                          ${this.formatIDR(term.calculated_amount)}
                        </td>

                        <td style="padding: 14px; color: #334155;">
                          <div style="font-weight: 500;">${term.trigger_label || "-"}</div>
                          <span style="font-size: 10.5px; font-family: var(--font-mono); color: #64748b;">${term.due_days_label || "-"}</span>
                        </td>

                        <td style="padding: 14px;">
                          ${
                            isPaid
                              ? `
                            <span style="padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 800; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                              ✔ LUNAS (PAID)
                            </span>
                          `
                              : isInvoiced
                                ? `
                            <span style="padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 800; background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">
                              🔒 INVOICED
                            </span>
                          `
                                : `
                            <span style="padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 800; background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">
                              PLANNED
                            </span>
                          `
                          }
                        </td>

                        <td style="padding: 14px; text-align: right;">
                          ${
                            isPaid
                              ? `
                            <span style="font-size: 11px; color: #64748b; font-family: var(--font-mono); font-weight: 700;">
                              ${term.invoice_no || "INV/2026/10/0001"}
                            </span>
                          `
                              : isInvoiced
                                ? `
                            <span style="font-size: 11px; color: #4338ca; font-family: var(--font-mono); font-weight: 700;">
                              ${term.invoice_no || "Invoice Terbit"}
                            </span>
                          `
                                : `
                            <button type="button" class="issue-invoice-finance-btn" data-contract-id="${activeProject.contractId}" data-term-no="${term.term_no}" style="padding: 6px 14px; border-radius: 8px; background: #4338ca; color: white; font-weight: 700; font-size: 11.5px; border: none; cursor: pointer; box-shadow: 0 2px 6px rgba(67, 56, 202, 0.25); transition: background 0.15s ease;">
                              Terbitkan Invoice
                            </button>
                          `
                          }
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `
            : `
          <!-- TAB INVOICES: Daftar Invoice Terbit ke Finance -->
          <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <div>
                <h3 style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0;">
                  Daftar Rekapitulasi Invoice Termin Terbit ke Finance
                </h3>
                <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
                  Faktur tagihan yang telah disahkan dari modul CRM Deals dan dikirimkan ke bagian Finance &amp; Invoices.
                </p>
              </div>
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Total ${this.invoicesList.length} Faktur Tagihan</span>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.05em;">
                    <th style="padding: 12px 14px;">NO. INVOICE</th>
                    <th style="padding: 12px 14px;">KONTRAK &amp; PROYEK</th>
                    <th style="padding: 12px 14px;">CUSTOMER</th>
                    <th style="padding: 12px 14px;">TERMIN</th>
                    <th style="padding: 12px 14px;">GRAND TOTAL (RP)</th>
                    <th style="padding: 12px 14px;">JATUH TEMPO</th>
                    <th style="padding: 12px 14px; text-align: right;">STATUS</th>
                  </tr>
                </thead>
                <tbody style="border-top: 1px solid #e2e8f0;">
                  ${this.invoicesList
                    .map(
                      (inv) => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 12px 14px; font-family: var(--font-mono); font-weight: 700; color: #4338ca;">
                        ${inv.invoice_number}
                      </td>
                      <td style="padding: 12px 14px;">
                        <div style="font-weight: 700; color: #0f172a;">${inv.project_title}</div>
                        <div style="font-size: 10.5px; font-family: var(--font-mono); color: #64748b; margin-top: 2px;">${inv.contract_number}</div>
                      </td>
                      <td style="padding: 12px 14px; font-weight: 500; color: #334155;">
                        ${inv.customer_name}
                      </td>
                      <td style="padding: 12px 14px; font-weight: 600; color: #0f172a;">
                        ${inv.termin_name}
                      </td>
                      <td style="padding: 12px 14px; font-family: var(--font-mono); font-weight: 800; color: #059669;">
                        ${this.formatIDR(inv.grand_total)}
                      </td>
                      <td style="padding: 12px 14px; font-family: var(--font-mono); color: #64748b;">
                        ${inv.due_date}
                      </td>
                      <td style="padding: 12px 14px; text-align: right;">
                        <span style="padding: 3px 8px; border-radius: 9999px; font-size: 10.5px; font-weight: 800; ${inv.status === "Paid" ? "background: #ecfdf5; color: #047857;" : "background: #eff6ff; color: #1d4ed8;"}">
                          ${inv.status}
                        </span>
                      </td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `
        }

      </div>
    `;
  }

  // =========================================================================
  // TAB TAMBAHAN: Dashboard Portofolio & SLA (Image 1)
  // =========================================================================
  renderPortfolioDashboard() {
    const totalContractValue = this.applications.reduce((acc, p) => acc + (p.contract_value || 0), 0);
    const totalBudgetMandays = this.applications.reduce((acc, p) => acc + (p.budget_mandays || 0), 0);
    const totalActualMandays = this.applications.reduce((acc, p) => acc + (p.actual_mandays || 0), 0);
    const mandaysBurnPct = totalBudgetMandays > 0 ? Math.round((totalActualMandays / totalBudgetMandays) * 100) : 0;
    const avgProgress = this.applications.length > 0 ? Math.round(this.applications.reduce((acc, p) => acc + (p.progress_pct || 0), 0) / this.applications.length) : 0;

    const allMilestones = this.applications.flatMap((p) => (p.milestones || []).map((m) => ({ ...m, projectCode: p.code, customerName: p.customer_name }))).sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- 4 Top Stat Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; color: #64748b; font-size: 12px;">
              <span>Nilai Portofolio Delivery</span>
              <span style="color: #059669; display: flex;">${Icons.dollarSign("", 16)}</span>
            </div>
            <p style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 0;">
              ${this.formatIDR(totalContractValue)}
            </p>
            <div style="font-size: 11px; color: #059669; font-weight: 600;">
              <span>✓ Terikat SPK &amp; Kontrak Sah</span>
            </div>
          </div>

          <div style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; color: #64748b; font-size: 12px;">
              <span>Mandays Terpakai / Budget</span>
              <span style="color: #f59e0b; display: flex;">${Icons.activity("", 16)}</span>
            </div>
            <p style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 0;">
              ${totalActualMandays} / ${totalBudgetMandays} MD
            </p>
            <div style="width: 100%; background: #f1f5f9; height: 6px; border-radius: 9999px; overflow: hidden;">
              <div style="background: #f59e0b; height: 100%; border-radius: 9999px; width: ${Math.min(mandaysBurnPct, 100)}%;"></div>
            </div>
            <p style="font-size: 10.5px; color: #64748b; font-family: var(--font-mono); margin: 0;">
              Burn Rate: <strong>${mandaysBurnPct}%</strong>
            </p>
          </div>

          <div style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; color: #64748b; font-size: 12px;">
              <span>Rata-Rata Progres Fisik</span>
              <span style="color: #4338ca; display: flex;">${Icons.trendingUp("", 16)}</span>
            </div>
            <p style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: #4338ca; margin: 0;">
              ${avgProgress}%
            </p>
            <div style="width: 100%; background: #f1f5f9; height: 6px; border-radius: 9999px; overflow: hidden;">
              <div style="background: #4338ca; height: 100%; border-radius: 9999px; width: ${avgProgress}%;"></div>
            </div>
            <p style="font-size: 10.5px; color: #64748b; margin: 0;">
              ${this.applications.length} Proyek Aktif
            </p>
          </div>

          <div style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; color: #64748b; font-size: 12px;">
              <span>Termin Terbayar</span>
              <span style="color: #059669; display: flex;">${Icons.checkCircle("", 16)}</span>
            </div>
            <p style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: #059669; margin: 0;">
              ${this.formatIDR(this.invoicesList.filter((i) => i.status === "Paid").reduce((acc, i) => acc + i.grand_total, 0))}
            </p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">
              Total: <strong>${this.invoicesList.filter((i) => i.status === "Paid").length} Faktur Paid</strong>
            </p>
          </div>
        </div>

        <!-- 2fr : 1fr Split Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: All Projects Cards with Quick Select -->
          <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <h3 style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0;">
                Status Eksekusi Portofolio Proyek &amp; Pemanfaatan Mandays
              </h3>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
                Klik tombol "Pilih Proyek Ini" untuk langsung mengaktifkan alur 3 langkah pada proyek tersebut.
              </p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${this.applications
                .map((proj) => {
                  const burn = proj.budget_mandays > 0 ? Math.round((proj.actual_mandays / proj.budget_mandays) * 100) : 0;
                  return `
                  <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #4338ca; background: rgba(99,102,241,.1); padding: 2px 8px; border-radius: 4px;">
                            ${proj.code}
                          </span>
                          <h4 style="font-weight: 800; font-size: 13.5px; color: #0f172a; margin: 0;">
                            ${proj.title}
                          </h4>
                        </div>
                        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
                          Klien: <strong style="color: #334155;">${proj.customer_name}</strong> • PM: ${proj.pm_name}
                        </p>
                      </div>

                      <button
                        type="button"
                        class="quick-select-project-btn"
                        data-project-id="${proj.id}"
                        style="padding: 6px 12px; border-radius: 8px; background: #4338ca; color: white; font-weight: 700; font-size: 11.5px; border: none; cursor: pointer;"
                      >
                        Pilih Proyek Ini ➔
                      </button>
                    </div>

                    <!-- Visual Progress & Mandays Bar -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; padding-top: 4px;">
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px;">
                          <span style="color: #64748b; font-weight: 500;">Progress Fisik:</span>
                          <span style="font-weight: 700; color: #0f172a;">${proj.progress_pct}%</span>
                        </div>
                        <div style="width: 100%; background: #e2e8f0; height: 8px; border-radius: 9999px; overflow: hidden;">
                          <div style="background: linear-gradient(90deg, #6366f1, #10b981); height: 100%; border-radius: 9999px; width: ${proj.progress_pct}%;"></div>
                        </div>
                      </div>

                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px;">
                          <span style="color: #64748b; font-weight: 500;">Burn Mandays:</span>
                          <span style="font-family: var(--font-mono); font-weight: 700; color: #0f172a;">
                            ${proj.actual_mandays} / ${proj.budget_mandays} MD (${burn}%)
                          </span>
                        </div>
                        <div style="width: 100%; background: #e2e8f0; height: 8px; border-radius: 9999px; overflow: hidden;">
                          <div style="height: 100%; border-radius: 9999px; width: ${Math.min(burn, 100)}%; background: ${burn > 90 ? "#ef4444" : burn > 70 ? "#f59e0b" : "#6366f1"};"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <!-- Right: Milestones & SLA Checklist -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                <h3 style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: gap: 6px;">
                  ${Icons.calendar("", 14)}
                  <span>Jadwal Milestone Terdekat</span>
                </h3>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${allMilestones
                  .slice(0, 4)
                  .map(
                    (ms) => `
                  <div style="padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-weight: 700; color: #0f172a; font-size: 12px;">${ms.name}</span>
                      <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; ${ms.status === "Completed" ? "background: #ecfdf5; color: #047857;" : "background: #eef2ff; color: #4338ca;"}">
                        ${ms.status}
                      </span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; color: #64748b;">
                      <span>${ms.projectCode}</span>
                      <span style="font-family: var(--font-mono); font-weight: 600; color: #4338ca;">${ms.mandays_budget || 40} MD</span>
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>

            <!-- SLA Checklist -->
            <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px;">
              <h3 style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin: 0;">
                Kepatuhan Kualitas &amp; SLA
              </h3>

              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11.5px;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0;">
                  <span>Zero Vulnerabilities (OWASP)</span>
                  <span style="font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857;">PASS</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0;">
                  <span>CI/CD Automated Test</span>
                  <span style="font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857;">PASS</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: rgba(99,102,241,.08); color: #4338ca;">
                  <span>Helpdesk SLA Target</span>
                  <span style="font-weight: 800; font-size: 11px; font-family: var(--font-mono);">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // Event Attachments (Tanpa Select Dropdown!)
  // =========================================================================
  attachEvents() {
    this.element.addEventListener("click", (e) => {
      // Trigger native date calendar picker when clicking date input
      const dateInput = e.target.closest(".alloc-mod-duedate");
      if (dateInput && typeof dateInput.showPicker === "function") {
        try {
          dateInput.showPicker();
        } catch (err) {}
      }

      // 0a. Sequential Back Button (Kembali Sesuai Tahapan)
      if (e.target.closest("#crmBackBtn")) {
        this.handleBackStep();
        return;
      }

      // 0b. Direct Back to Catalog Buttons
      if (e.target.closest("#crmDirectCatalogBtn, #step1BackCatalogBtn, #crmBackToCatalogBtn")) {
        this.closeProjectToCatalog();
        return;
      }

      // 0b. Open Project Action Button
      const openBtn = e.target.closest(".crm-open-project-btn");
      if (openBtn) {
        const pId = openBtn.dataset.projectId;
        if (pId) {
          this.openProject(pId);
          store.addToast("info", "Membuka Proyek", `Membuka alur eksekusi untuk [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 0c. Toggle View Mode: Card vs Table
      const viewModeBtn = e.target.closest(".crm-view-mode-btn");
      if (viewModeBtn) {
        const mode = viewModeBtn.dataset.viewMode;
        if (mode && mode !== this.projectSelectorView) {
          this.projectSelectorView = mode;
          this.render();
        }
        return;
      }

      // 1a. Project Card Click (BUKA PROYEK - CARD MODE)
      const cardItem = e.target.closest(".crm-project-card-item");
      if (cardItem) {
        const pId = cardItem.dataset.projectId;
        if (pId) {
          this.openProject(pId);
          store.addToast("info", "Membuka Proyek", `Membuka alur eksekusi untuk [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 1b. Project Table Row Click (BUKA PROYEK - TABLE MODE)
      const tableRow = e.target.closest(".crm-project-table-row");
      if (tableRow) {
        const pId = tableRow.dataset.projectId;
        if (pId) {
          this.openProject(pId);
          store.addToast("info", "Membuka Proyek", `Membuka alur eksekusi untuk [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 1c. Select Project Buttons (Card/Table action buttons)
      const selectActionBtn = e.target.closest(".card-action-select-btn, .crm-table-select-btn");
      if (selectActionBtn) {
        const pId = selectActionBtn.dataset.projectId;
        if (pId && pId !== this.selectedProjectId) {
          this.selectProject(pId);
          store.addToast("info", "Proyek Dipilih", `Memuat seluruh alur untuk proyek [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 1d. Legacy Project Pill Click
      const pillBtn = e.target.closest(".crm-project-pill");
      if (pillBtn) {
        const pId = pillBtn.dataset.projectId;
        if (pId && pId !== this.selectedProjectId) {
          this.selectProject(pId);
          store.addToast("info", "Proyek Dipilih", `Memuat seluruh alur untuk proyek [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 2. Quick Select Project from Portfolio Dashboard
      const quickSelectBtn = e.target.closest(".quick-select-project-btn");
      if (quickSelectBtn) {
        const pId = quickSelectBtn.dataset.projectId;
        if (pId) {
          this.openProject(pId, "intake");
          store.addToast("info", "Proyek Dibuka", `Membuka alur eksekusi untuk [${this.getActiveProject().code}].`);
        }
        return;
      }

      // 3. Step/Tab Stepper Button Click
      const stepBtn = e.target.closest(".crm-flow-step-btn");
      if (stepBtn) {
        const step = stepBtn.dataset.step;
        if (step && step !== this.activeStep) {
          this.activeStep = step;
          this.render();
        }
        return;
      }

      // 4. Sequential Go-To-Step Buttons
      const goToStepBtn = e.target.closest(".go-to-step-btn");
      if (goToStepBtn) {
        const targetStep = goToStepBtn.dataset.targetStep;
        if (targetStep && targetStep !== this.activeStep) {
          this.activeStep = targetStep;
          this.render();
        }
        return;
      }

      // 4a. Subtab Switcher in Step 1 (Modul Aplikasi, Dokumen & Spesifikasi, Progress Proyek)
      const subtabBtn = e.target.closest(".crm-subtab-btn");
      if (subtabBtn) {
        const sub = subtabBtn.dataset.subtab;
        if (sub && sub !== this.activeIntakeSubtab) {
          this.activeIntakeSubtab = sub;
          this.render();
        }
        return;
      }

      // 4b. Module Card Detail Toggle (Accordion / Expand-Collapse)
      const cardToggleBtn = e.target.closest(".crm-card-toggle-btn");
      if (cardToggleBtn) {
        const card = cardToggleBtn.closest(".crm-module-card");
        if (card) {
          const modKey = card.dataset.moduleKey;
          const drawer = card.querySelector(".crm-card-detail-drawer");
          const toggleIcon = card.querySelector(".crm-card-toggle-icon");
          const toggleLabel = card.querySelector(".crm-card-toggle-label");

          const isExpanded = card.classList.toggle("is-expanded");
          if (drawer) {
            drawer.style.display = isExpanded ? "block" : "none";
          }
          if (toggleIcon) {
            toggleIcon.className = `fi ${isExpanded ? "fi-rr-angle-small-up" : "fi-rr-arrow-right"} crm-card-toggle-icon`;
          }
          if (toggleLabel) {
            toggleLabel.textContent = isExpanded ? "Tutup Detail" : "Lihat Detail";
          }
          if (modKey) {
            if (isExpanded) {
              this.expandedModules.add(modKey);
            } else {
              this.expandedModules.delete(modKey);
            }
          }
        }
        return;
      }

      // 4c. Expand All / Collapse All Modules
      if (e.target.closest("#crmExpandAllModulesBtn")) {
        this.element.querySelectorAll(".crm-module-card").forEach((card) => {
          card.classList.add("is-expanded");
          const drawer = card.querySelector(".crm-card-detail-drawer");
          const toggleIcon = card.querySelector(".crm-card-toggle-icon");
          const toggleLabel = card.querySelector(".crm-card-toggle-label");
          if (drawer) drawer.style.display = "block";
          if (toggleIcon) toggleIcon.className = "fi fi-rr-angle-small-up crm-card-toggle-icon";
          if (toggleLabel) toggleLabel.textContent = "Tutup Detail";
          if (card.dataset.moduleKey) this.expandedModules.add(card.dataset.moduleKey);
        });
        return;
      }

      if (e.target.closest("#crmCollapseAllModulesBtn")) {
        this.element.querySelectorAll(".crm-module-card").forEach((card) => {
          card.classList.remove("is-expanded");
          const drawer = card.querySelector(".crm-card-detail-drawer");
          const toggleIcon = card.querySelector(".crm-card-toggle-icon");
          const toggleLabel = card.querySelector(".crm-card-toggle-label");
          if (drawer) drawer.style.display = "none";
          if (toggleIcon) toggleIcon.className = "fi fi-rr-arrow-right crm-card-toggle-icon";
          if (toggleLabel) toggleLabel.textContent = "Lihat Detail";
        });
        this.expandedModules.clear();
        return;
      }

      // 5. Finance TOP Subtab Switcher
      const subTabBtn = e.target.closest(".finance-top-subtab-btn");
      if (subTabBtn) {
        const sub = subTabBtn.dataset.subtab;
        if (sub && sub !== this.financeTopSubTab) {
          this.financeTopSubTab = sub;
          this.render();
        }
        return;
      }

      // 6. Issue Invoice to Finance (Terbitkan Invoice)
      const issueInvBtn = e.target.closest(".issue-invoice-finance-btn");
      if (issueInvBtn) {
        const cId = issueInvBtn.dataset.contractId;
        const termNo = Number(issueInvBtn.dataset.termNo);
        const contract = this.applications.find((c) => c.contractId === cId);
        if (contract) {
          const term = (contract.top_scheme.items || []).find((t) => t.term_no === termNo);
          if (term && term.status !== "Paid") {
            term.status = "Invoiced";
            term.is_locked = true;
            const newInvNo = `INV/2026/11/00${Math.floor(Math.random() * 80 + 10)}`;
            term.invoice_no = newInvNo;

            this.invoicesList.unshift({
              invoice_number: newInvNo,
              project_title: contract.title,
              contract_number: contract.contractNumber,
              customer_name: contract.customer_name,
              termin_name: term.name,
              grand_total: term.calculated_amount,
              due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
              status: "Terkirim ke Finance",
            });

            store.addToast("success", "Invoice Berhasil Dikirim ke Bagian Finance!", `Faktur ${newInvNo} sebesar ${this.formatIDR(term.calculated_amount)} untuk ${term.name} telah diterbitkan dan dikirimkan ke modul Finance.`);
            this.render();
          }
        }
        return;
      }

      // 7. Open Blueprint Modal
      if (e.target.closest("#openPerpusIntakeBlueprintBtn")) {
        this.perpusModal.open();
        return;
      }

      // 8. Allocation Controls: Add Module
      if (e.target.closest("#addAllocationModuleBtn")) {
        const nextIdx = this.allocationModules.length + 1;
        const activeProj = this.getActiveProject();
        const prefix = activeProj.code || "PROJ";
        this.allocationModules.push({
          id: `mod-${prefix}-${Date.now()}`,
          epicKey: `${prefix}-EPIC-${nextIdx}`,
          title: `Modul Fitur Baru ${nextIdx}`,
          description: "Spesifikasi pengerjaan deliverable modul baru.",
          assigneeId: "user-dev-1",
          estimateHours: 20,
          dueDate: activeProj.end_date || new Date().toISOString().split("T")[0],
          category: "Custom Feature",
        });
        this.render();
        store.addToast("info", "Modul Ditambahkan", `Modul baru [${prefix}-EPIC-${nextIdx}] siap dialokasikan.`);
        return;
      }

      // 9. Allocation Controls: Delete Module
      const allocDelBtn = e.target.closest(".alloc-delete-mod-btn");
      if (allocDelBtn) {
        const idx = Number(allocDelBtn.dataset.idx);
        this.allocationModules.splice(idx, 1);
        this.render();
        return;
      }

      // 10. Execute Allocation to Kanban
      if (e.target.closest("#executeAllocationBtn")) {
        const activeProj = this.getActiveProject();
        const code = activeProj.code;
        const repoName = (activeProj.title || "project")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 30);

        const newProj = store.convertCrmDealToProject(activeProj.id, {
          projectCode: code,
          repoName: repoName,
          modules: this.allocationModules,
        });

        if (newProj) {
          store.setSelectedProjectId(newProj.id);
          store.setActiveTab("kanban");
          store.addToast("success", "Handover Berhasil!", `Proyek ${newProj.name} (${newProj.code}) aktif di Kanban.`);
        } else {
          store.addToast("success", "Alokasi Disimpan!", `Modul-modul proyek ${activeProj.title} telah dialokasikan.`);
        }
        return;
      }
    });

    // Input listeners for allocation editor
    this.element.addEventListener("input", (e) => {
      if (e.target.classList.contains("alloc-mod-title")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].title = e.target.value;
        }
      }

      if (e.target.classList.contains("alloc-mod-desc")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].description = e.target.value;
        }
      }

      if (e.target.classList.contains("alloc-mod-hours")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].estimateHours = Number(e.target.value) || 0;
        }
      }

      if (e.target.classList.contains("alloc-mod-duedate")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].dueDate = e.target.value;
        }
      }
    });

    // Change listeners for module assignees & date
    this.element.addEventListener("change", (e) => {
      if (e.target.classList.contains("alloc-mod-assignee")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].assigneeId = e.target.value;
          this.render(); // update capacity gauge immediately
        }
        return;
      }

      if (e.target.classList.contains("alloc-mod-duedate")) {
        const idx = Number(e.target.dataset.idx);
        if (this.allocationModules[idx]) {
          this.allocationModules[idx].dueDate = e.target.value;
        }
        return;
      }
    });
  }
}
