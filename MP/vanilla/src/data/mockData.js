const INITIAL_PROJECTS = [
  {
    id: "proj-mbn",
    code: "MBN",
    name: "Mobile Banking 3.0 Revamp",
    clientName: "PT Bank Mandiri Digital",
    clientEmail: "procurement-it@bankmandiri.co.id",
    description: "Transformasi arsitektur mobile banking native dengan fitur Biometric Login, QRIS Cross-Border, dan Microservices Core Banking integration.",
    status: "Active",
    health: "On Track",
    contractType: "Fixed Price",
    contractValue: 850e6,
    budgetUsed: 540e6,
    totalHours: 1200,
    usedHours: 480,
    totalIssues: 9,
    doneIssues: 2,
    targetDeadline: "2026-11-30",
    color: "#4f46e5",
    repoUrl: "github.com/softwarehouse/mandiri-mobile-banking-revamp",
    sentryDsn: "https://o4508.ingest.sentry.io/api/4508901/envelope/",
    workflowType: "ai_automation",
    liveUrl: "https://mbanking.mandiri.co.id",
    stagingUrl: "https://staging-mbn.agensi.dev",
    hostingStatus: "Healthy",
    warrantyUntil: "2027-11-30",
    warrantyDaysLeft: 395,
    createdAt: "2026-09-01"
  },
  {
    id: "proj-ecp",
    code: "ECP",
    name: "E-Commerce Omnichannel Retail Engine",
    clientName: "PT Nusantara Retail Group",
    clientEmail: "tech@nusantararetail.com",
    description: "Platform multi-channel POS & web storefront dengan integrasi ERP SAP, WhatsApp Commerce, dan inventory auto-sync.",
    status: "Active",
    health: "At Risk",
    contractType: "Time Material",
    contractValue: 1200e6,
    budgetUsed: 720e6,
    totalHours: 1600,
    usedHours: 850,
    totalIssues: 3,
    doneIssues: 0,
    targetDeadline: "2026-12-15",
    color: "#db2777",
    repoUrl: "github.com/softwarehouse/ecommerce-omnichannel-retail",
    sentryDsn: "https://o4508.ingest.sentry.io/api/4508902/envelope/",
    workflowType: "ai_automation",
    liveUrl: "https://omnichannel.nusantararetail.com",
    stagingUrl: "https://staging-ecp.agensi.dev",
    hostingStatus: "Warning",
    warrantyUntil: "2027-12-15",
    warrantyDaysLeft: 410,
    createdAt: "2026-08-15"
  },
  {
    id: "proj-iot",
    code: "IOT",
    name: "Smart Fleet Telematics & IoT Tracking",
    clientName: "PT Astra Logistik Pintar",
    clientEmail: "telematics@astralogistik.co.id",
    description: "Dashboard monitoring armada truk real-time dengan sensor GPS, OBD-II telemetry, route fuel optimization, dan IoT alert.",
    status: "Active",
    health: "On Track",
    contractType: "Fixed Price",
    contractValue: 920e6,
    budgetUsed: 310e6,
    totalHours: 1400,
    usedHours: 320,
    totalIssues: 2,
    doneIssues: 0,
    targetDeadline: "2027-01-30",
    color: "#0284c7",
    repoUrl: "github.com/softwarehouse/smart-fleet-telematics-iot",
    sentryDsn: "https://o4508.ingest.sentry.io/api/4508903/envelope/",
    workflowType: "ai_automation",
    liveUrl: "https://fleet.astralogistik.co.id",
    stagingUrl: "https://staging-iot.agensi.dev",
    hostingStatus: "Healthy",
    warrantyUntil: "2028-01-30",
    warrantyDaysLeft: 456,
    createdAt: "2026-10-01"
  },
  {
    id: "proj-perpustakaan",
    code: "LIB-DIG",
    name: "Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)",
    clientName: "Universitas Nusantara Cendekia (Perpustakaan Pusat)",
    clientEmail: "perpustakaan@nusantara.ac.id",
    description: "Sistem automasi katalog buku OPAC, sirkulasi peminjaman, denda terintegrasi, dan arsitektur microservices Laravel React.",
    status: "Active",
    health: "On Track",
    contractType: "Fixed Price",
    contractValue: 185e6,
    budgetUsed: 65e6,
    totalHours: 800,
    usedHours: 210,
    totalIssues: 7,
    doneIssues: 2,
    targetDeadline: "2027-10-31",
    color: "#6366f1",
    repoUrl: "github.com/softwarehouse/perpustakaan-digital-microservices",
    sentryDsn: "https://o4508.ingest.sentry.io/api/4508999/envelope/",
    warrantyUntil: "2027-10-31",
    maintenanceQuotaHours: 25,
    maintenanceUsedHours: 0,
    killSwitchActive: false,
    workflowType: "ai_automation",
    liveUrl: "https://perpustakaan.nusantara.ac.id",
    stagingUrl: "https://staging-perpustakaan.agensi.dev",
    hostingStatus: "Healthy",
    warrantyDaysLeft: 28,
    createdAt: "2026-10-18"
  },
  {
    id: "proj-1",
    code: "POS-KLN",
    name: "Sistem POS Multi-Outlet Kopi Kenangan",
    clientName: "PT Kopi Kenangan Nusantara",
    clientEmail: "tech-pic@kopikenangan.id",
    description: "Sistem kasir POS cloud & offline-first dengan sinkronisasi inventori bahan baku multi-outlet dan integrasi pembayaran QRIS.",
    status: "Active",
    health: "On Track",
    contractType: "Fixed Price",
    contractValue: 125e6,
    budgetUsed: 80e6,
    totalHours: 650,
    usedHours: 390,
    totalIssues: 6,
    doneIssues: 3,
    targetDeadline: "2027-04-30",
    color: "#d97706",
    repoUrl: "github.com/agensi/pos-kopi-kenangan",
    sentryDsn: "https://o4508.ingest.sentry.io/api/4508192/envelope/",
    warrantyUntil: "2027-04-30",
    maintenanceQuotaHours: 20,
    maintenanceUsedHours: 6.5,
    killSwitchActive: false,
    workflowType: "ai_automation",
    liveUrl: "https://pos.kopikenangan.co.id",
    stagingUrl: "https://staging-pos.agensi.dev",
    hostingStatus: "Healthy",
    warrantyDaysLeft: 24,
    createdAt: "2026-08-10"
  }
];
const INITIAL_EPICS = [
  {
    id: "epic-lib-1",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-1",
    title: "Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)",
    description: "REST API microservice buku dengan Laravel 11, skema PostgreSQL, Redis caching, dan validasi ISBN-13.",
    color: "#0284c7"
  },
  {
    id: "epic-lib-2",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-2",
    title: "Portal Katalog Pencarian OPAC & Detail Buku (React Frontend)",
    description: "Antarmuka pencarian cepat full-text judul/penulis, filter kategori buku, dan status ketersediaan rak.",
    color: "#0d9488"
  },
  {
    id: "epic-lib-3",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-3",
    title: "Microservice Sirkulasi Peminjaman & Perhitungan Denda (Laravel Backend)",
    description: "Logika transaksi peminjaman, batas durasi pinjam 7 hari, denda otomatis Rp 2.000/hari, dan atomic lock.",
    color: "#d97706"
  },
  {
    id: "epic-lib-4",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-4",
    title: "Meja Sirkulasi Petugas & Dashboard Mahasiswa (React Frontend)",
    description: "UI kasir peminjaman barcode scanner kartu mahasiswa & buku, riwayat aktif pinjaman, dan struk digital.",
    color: "#7c3aed"
  },
  {
    id: "epic-lib-5",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-5",
    title: "API Gateway, Docker Containerization & WhatsApp Reminder (Fullstack)",
    description: "Reverse proxy Traefik/Nginx, orchestrator Docker Compose, dan bot WhatsApp notifikasi pengembalian H-1.",
    color: "#2563eb"
  },
  {
    id: "epic-lib-6",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-6",
    title: "Matrix Test Case Sirkulasi, K6 Load Test & Staging QA Sign-Off (QA)",
    description: "Rangkaian pengujian integrasi sirkulasi buku, stress test 2.000 concurrent RPS via K6, dan sign-off UAT.",
    color: "#e11d48"
  },
  {
    id: "epic-lib-7",
    projectId: "proj-perpustakaan",
    key: "LIB-EPIC-7",
    title: "Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek (PM)",
    description: "Dokumentasi user story, koordinasi kickoff meeting kepala perpustakaan, dan verifikasi termin tagihan.",
    color: "#059669"
  },
  {
    id: "epic-1",
    projectId: "proj-1",
    key: "POS-EPIC-1",
    title: "Modul Kasir & Billing Offline-First",
    description: "Sistem pencatatan transaksi kasir dengan IndexedDB local fallback saat koneksi terputus",
    color: "#0284c7"
  },
  {
    id: "epic-2",
    projectId: "proj-1",
    key: "POS-EPIC-2",
    title: "Pajak Daerah & Cetak Struk Bluetooth",
    description: "Kalkulasi PB1 10% otomatis dan integrasi thermal printer ESC/POS",
    color: "#0d9488"
  },
  {
    id: "epic-3",
    projectId: "proj-1",
    key: "POS-EPIC-3",
    title: "Manajemen Stok & Transfer Antar Outlet",
    description: "Audit opname stok real-time dengan sinkronisasi multi-warehouse",
    color: "#d97706"
  },
  {
    id: "epic-ftsl-1",
    projectId: "proj-futsal",
    key: "FTSL-EPIC-1",
    title: "Manajemen Lapangan, Grid Jadwal Interaktif & Anti Double-Booking",
    description: "Kalender interaktif slot jam sewa lapangan (Vinyl/Sintetis) dengan proteksi distributed lock.",
    color: "#0284c7"
  },
  {
    id: "epic-ftsl-2",
    projectId: "proj-futsal",
    key: "FTSL-EPIC-2",
    title: "Down Payment (DP), QRIS Dinamis & Countdown Batas Bayar 15 Menit",
    description: "Pembayaran DP instan via QRIS dinamis otomatis dan pelepasan slot jika kedaluwarsa.",
    color: "#0d9488"
  },
  {
    id: "epic-ftsl-3",
    projectId: "proj-futsal",
    key: "FTSL-EPIC-3",
    title: "Rental Perlengkapan (Rompi/Sepatu/Bola/Wasit) & POS Kasir Kantin",
    description: "Add-on rental perlengkapan futsal dan integrasi POS kasir kantin minuman venue.",
    color: "#d97706"
  },
  {
    id: "epic-ftsl-4",
    projectId: "proj-futsal",
    key: "FTSL-EPIC-4",
    title: "WhatsApp Gateway Tiket QR Code & Broadcast Reminder H-2 Jam",
    description: "Notifikasi tiket resmi dengan QR code check-in dan pengingat jadwal kick-off otomatis.",
    color: "#7c3aed"
  },
  {
    id: "epic-ftsl-5",
    projectId: "proj-futsal",
    key: "FTSL-EPIC-5",
    title: "Pelunasan di Lokasi, Rekap Kasir Tutup Shift & Laporan Okupansi Lapangan",
    description: "Modul kasir resepsionis untuk verifikasi scan QR tiket, pelunasan sisa tagihan, dan rekap harian.",
    color: "#e11d48"
  }
];
const INITIAL_SPRINTS = [
  {
    id: "sprint-lib-1",
    projectId: "proj-perpustakaan",
    name: "Sprint 1: Fondasi Microservices Laravel, React UI & Sirkulasi Buku",
    startDate: "2026-10-18",
    endDate: "2026-11-01",
    goal: "Deliver core microservices katalog, Redis atomic lock untuk sirkulasi peminjaman, dan OPAC React SPA",
    status: "active"
  },
  {
    id: "sprint-lib-2",
    projectId: "proj-perpustakaan",
    name: "Sprint 2: Load Testing K6, WhatsApp Reminder & UAT Kampus",
    startDate: "2026-11-02",
    endDate: "2026-11-16",
    goal: "Verifikasi load test 2.000 RPS, integrasi WhatsApp Gateway denda, dan sign-off UAT bersama Kepala Perpustakaan",
    status: "future"
  },
  {
    id: "sprint-ftsl-1",
    projectId: "proj-futsal",
    name: "Sprint 1: Fondasi Jadwal, Anti Double-Booking & DP QRIS",
    startDate: "2026-10-16",
    endDate: "2026-10-30",
    goal: "Selesaikan arsitektur grid lapangan, atomic lock Redis untuk slot sewa, dan integrasi QRIS 15 menit",
    status: "active"
  },
  {
    id: "sprint-1",
    projectId: "proj-1",
    name: "Sprint 14: Stabilisasi Kasir & PB1 Hotfixes",
    startDate: "2026-10-10",
    endDate: "2026-10-24",
    goal: "Selesaikan bug kalkulasi struk dan sinkronisasi printer thermal",
    status: "active"
  },
  {
    id: "sprint-2",
    projectId: "proj-1",
    name: "Sprint 15: Integrasi QRIS Dynamic & Dashboard Owner",
    startDate: "2026-10-25",
    endDate: "2026-11-08",
    goal: "Dukungan QRIS multi-acquirer dan analitik omzet per cabang",
    status: "future"
  }
];
const INITIAL_MEMBERS = [
  {
    id: "user-pm",
    name: "Asisyah",
    role: "Project Manajer",
    email: "asisyah.pm@agensi.dev",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    skills: ["Scrum Master", "Sprint Backlog Grooming", "Client Stakeholder Meeting", "Jira JQL", "UAT Sign-off", "WBS & Termin Handover"],
    capacityHoursPerWeek: 40,
    assignedHours: 32,
    onLeave: false,
    activeProjects: ["proj-perpustakaan", "proj-1", "proj-futsal"],
    githubUsername: "asisyah-pm"
  },
  {
    id: "user-dev-1",
    name: "Azi",
    role: "Full stack",
    email: "azi.fullstack@agensi.dev",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    skills: ["Traefik API Gateway", "Docker Compose", "Laravel 11 & React 19", "Redis Pub/Sub", "PostgreSQL", "CI/CD GitHub Actions"],
    capacityHoursPerWeek: 40,
    assignedHours: 36,
    onLeave: false,
    activeProjects: ["proj-perpustakaan", "proj-1", "proj-futsal"],
    githubUsername: "azi-fullstack"
  },
  {
    id: "user-dev-2",
    name: "Aldyana",
    role: "Frontend Dev",
    email: "aldyana.frontend@agensi.dev",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    skills: ["React 19 SPA", "Tailwind CSS", "TypeScript", "Zustand State", "OPAC Catalog UI", "Barcode Scanner Webhook"],
    capacityHoursPerWeek: 40,
    assignedHours: 34,
    onLeave: false,
    activeProjects: ["proj-perpustakaan", "proj-1"],
    githubUsername: "aldyana-frontend"
  },
  {
    id: "user-dev-3",
    name: "Jaka",
    role: "Backend Dev",
    email: "jaka.backend@agensi.dev",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    skills: ["Laravel 11 Microservices", "PHP 8.3", "PostgreSQL Schema", "Redis Atomic Lock", "REST API", "Sanctum JWT", "Event Queue"],
    capacityHoursPerWeek: 40,
    assignedHours: 38,
    onLeave: false,
    activeProjects: ["proj-perpustakaan", "proj-1", "proj-futsal"],
    githubUsername: "jaka-backend"
  },
  {
    id: "user-qa",
    name: "Parhan",
    role: "QA",
    email: "parhan.qa@agensi.dev",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    skills: ["K6 Load Testing (2000 RPS)", "Playwright TypeScript", "Cypress E2E", "API Postman/Newman", "Sirkulasi Test Matrix", "Security Audit"],
    capacityHoursPerWeek: 40,
    assignedHours: 30,
    onLeave: false,
    activeProjects: ["proj-perpustakaan", "proj-1", "proj-futsal"],
    githubUsername: "parhan-qa"
  }
];
const INITIAL_TASKS = [
  // --- APLIKASI PERPUSTAKAAN DIGITAL (MICROSERVICES LARAVEL - REACT) ---
  // Jaka (Backend Dev) Tasks
  {
    id: "task-lib-101",
    key: "LIB-101",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-1",
    type: "Feature",
    title: "[Backend] Setup Microservice Katalog Buku Laravel 11 & Skema PostgreSQL",
    description: "Membangun REST API microservice katalog buku: master data ISBN, judul, pengarang, penerbit, nomor klasifikasi DDC, dan lokasi rak fisik dengan Laravel 11 & PostgreSQL.",
    status: "Selesai",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 24,
    timeLoggedHours: 8,
    startDate: "2026-10-18",
    dueDate: "2026-10-25",
    relations: [],
    subtasks: [
      { id: "sub-lib-1", title: "Migrasi database tabel books, authors, publishers, dan book_items", completed: true },
      { id: "sub-lib-2", title: "Implementasi Laravel Resource Controller & FormRequest validation ISBN-13", completed: true },
      { id: "sub-lib-3", title: "Redis caching query katalog buku terpopuler dengan TTL 1 jam", completed: false },
      { id: "sub-lib-4", title: "Unit test API endpoint /api/v1/books menggunakan PHPUnit", completed: false }
    ],
    branchName: "feature/katalog-microservice",
    visibility: "internal",
    createdAt: "2026-10-18T08:30:00Z",
    lastStatusUpdated: "2026-10-18T14:20:00Z"
  },
  {
    id: "task-lib-102",
    key: "LIB-102",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Feature",
    title: "[Backend] Engine Sirkulasi Peminjaman & Pengembalian dengan Redis Atomic Lock",
    description: "Logika bisnis sirkulasi peminjaman buku: pencegahan race-condition saat 2 mahasiswa meminjam 1 eksemplar buku fisik yang sama menggunakan Redis atomic lock, durasi pinjam 7 hari.",
    status: "In Progress",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 28,
    timeLoggedHours: 10,
    startDate: "2026-10-18",
    dueDate: "2026-10-27",
    relations: [],
    subtasks: [
      { id: "sub-lib-5", title: "Endpoint POST /api/v1/circulation/borrow dengan Redis mutex lock", completed: true },
      { id: "sub-lib-6", title: "Validasi batas kuota maksimal 3 buku aktif per kartu mahasiswa", completed: true },
      { id: "sub-lib-7", title: "Endpoint POST /api/v1/circulation/return untuk check-in buku kembali", completed: false },
      { id: "sub-lib-8", title: "Dispatch event BookReturnedEvent untuk update ketersediaan stok", completed: false }
    ],
    branchName: "feature/sirkulasi-engine",
    visibility: "internal",
    createdAt: "2026-10-18T09:00:00Z",
    lastStatusUpdated: "2026-10-18T15:10:00Z"
  },
  {
    id: "task-lib-103",
    key: "LIB-103",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Task",
    title: "[Backend] Service Perhitungan Denda Keterlambatan Rp 2.000/Hari via Laravel Scheduler",
    description: "Cron scheduler harian jam 00:01 WIB: kalkulasi otomatis hari keterlambatan pengembalian buku, pengenaan denda Rp 2.000 per hari per buku, dan blokir sementara akses peminjaman jika denda > Rp 20.000.",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 16,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-28",
    relations: [],
    subtasks: [
      { id: "sub-lib-9", title: "Command artisan CalculateOverdueFinesCommand", completed: false },
      { id: "sub-lib-10", title: "Konfigurasi pengecualian hari libur nasional & akhir pekan", completed: false },
      { id: "sub-lib-11", title: "Integrasi generate invoice denda jika mahasiswa ingin bayar via QRIS", completed: false }
    ],
    branchName: "feature/denda-scheduler",
    visibility: "internal",
    createdAt: "2026-10-18T10:00:00Z",
    lastStatusUpdated: "2026-10-18T10:00:00Z"
  },
  // Aldyana (Frontend Dev) Tasks
  {
    id: "task-lib-104",
    key: "LIB-104",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-2",
    type: "Feature",
    title: "[Frontend] Slicing & State Management Katalog OPAC React 19 + Tailwind CSS",
    description: "Portal pencarian buku publik mahasiswa (OPAC): input live search instan, filter multi-kategori (Teknologi, Sastra, Hukum, Kedokteran), pagination, dan visualisasi status ketersediaan di rak buku.",
    status: "In Progress",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-2",
    // Aldyana (Frontend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 26,
    timeLoggedHours: 12,
    startDate: "2026-10-18",
    dueDate: "2026-10-26",
    relations: [],
    subtasks: [
      { id: "sub-lib-12", title: "Komponen BookSearchFilter dengan debounce 300ms", completed: true },
      { id: "sub-lib-13", title: "Grid kartu buku dengan sampul, nama pengarang, dan badge status rak", completed: true },
      { id: "sub-lib-14", title: "Modal detail buku dengan sinopsis, nomor panggil DDC, dan lokasi rak", completed: false },
      { id: "sub-lib-15", title: "Responsiveness mobile friendly untuk akses smartphone mahasiswa", completed: false }
    ],
    branchName: "feature/react-portal-opac",
    visibility: "client_public",
    createdAt: "2026-10-18T08:45:00Z",
    lastStatusUpdated: "2026-10-18T13:40:00Z"
  },
  {
    id: "task-lib-105",
    key: "LIB-105",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-4",
    type: "Feature",
    title: "[Frontend] Dashboard Mahasiswa: Riwayat Peminjaman & Barcode Kartu Anggota",
    description: "Halaman dashboard personal anggota perpustakaan: menampilkan daftar buku yang sedang dipinjam, hitung mundur batas waktu (due date), barcode digital kartu anggota untuk scan cepat di meja petugas.",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-2",
    // Aldyana (Frontend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 22,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-29",
    relations: [],
    subtasks: [
      { id: "sub-lib-16", title: "Komponen render Barcode Code-128 berbasis NIM mahasiswa", completed: false },
      { id: "sub-lib-17", title: "Tabel buku aktif dipinjam dengan progress bar sisa hari", completed: false },
      { id: "sub-lib-18", title: "Tombol perpanjang masa pinjam mandiri (1x perpanjangan 7 hari)", completed: false }
    ],
    branchName: "feature/mahasiswa-dashboard",
    visibility: "client_public",
    createdAt: "2026-10-18T09:30:00Z",
    lastStatusUpdated: "2026-10-18T09:30:00Z"
  },
  {
    id: "task-lib-106",
    key: "LIB-106",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-4",
    type: "Feature",
    title: "[Frontend] Meja Sirkulasi Petugas: Scan Barcode ISBN & Quick Checkout Buku",
    description: "Antarmuka kasir petugas perpustakaan kampus: mendukung input otomatis scanner barcode USB/Bluetooth, checkout peminjaman dalam hitungan detik, dan cetak slip peminjaman thermal.",
    status: "To Do",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-2",
    // Aldyana (Frontend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 20,
    timeLoggedHours: 0,
    startDate: "2026-10-21",
    dueDate: "2026-10-28",
    relations: [],
    subtasks: [
      { id: "sub-lib-19", title: "Event listener global input scanner barcode keyboard-wedge", completed: false },
      { id: "sub-lib-20", title: "Keranjang sirkulasi peminjaman multi-buku", completed: false },
      { id: "sub-lib-21", title: "Integrasi cetak slip tanda terima thermal ESC/POS 58mm", completed: false }
    ],
    branchName: "feature/meja-sirkulasi-petugas",
    visibility: "internal",
    createdAt: "2026-10-18T10:15:00Z",
    lastStatusUpdated: "2026-10-18T10:15:00Z"
  },
  // Parhan (QA) Tasks
  {
    id: "task-lib-107",
    key: "LIB-107",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-6",
    type: "Task",
    title: "[QA] Susun Matrix Test Case Sirkulasi Peminjaman, Denda & Edge-Case Buku Rusak",
    description: "Menyusun skenario pengujian komprehensif QA: validasi batas kuota 3 buku, peminjaman saat mahasiswa memiliki denda belum lunas, denda libur nasional, dan pelaporan buku hilang.",
    status: "Selesai",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-qa",
    // Parhan (QA)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 18,
    timeLoggedHours: 6,
    startDate: "2026-10-18",
    dueDate: "2026-10-24",
    relations: [],
    subtasks: [
      { id: "sub-lib-22", title: "Test matrix modul katalog pencarian & filter DDC (25 test cases)", completed: true },
      { id: "sub-lib-23", title: "Test matrix transaksi sirkulasi peminjaman & pengembalian (35 test cases)", completed: true },
      { id: "sub-lib-24", title: "Test matrix edge case denda, masa tenggang, dan suspend kartu (15 test cases)", completed: false }
    ],
    branchName: "qa/sirkulasi-test-matrix",
    visibility: "internal",
    createdAt: "2026-10-18T09:15:00Z",
    lastStatusUpdated: "2026-10-18T16:00:00Z"
  },
  {
    id: "task-lib-108",
    key: "LIB-108",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-6",
    type: "Task",
    title: "[QA] Uji Beban (Load Test) Microservices API Katalog via K6 Target 2.000 RPS",
    description: "Simulasi lonjakan traffic mahasiswa saat awal semester baru (2.000 request per detik): memastikan response time API Laravel < 150ms dan utilisasi CPU Redis/PostgreSQL stabil di bawah 65%.",
    status: "To Do",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-qa",
    // Parhan (QA)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 16,
    timeLoggedHours: 0,
    startDate: "2026-10-22",
    dueDate: "2026-10-29",
    relations: [],
    subtasks: [
      { id: "sub-lib-25", title: "Script skenario K6 load test pencarian buku OPAC", completed: false },
      { id: "sub-lib-26", title: "Monitoring grafana/prometheus response latency p95 & p99", completed: false },
      { id: "sub-lib-27", title: "Laporan hasil load test dan rekomendasi tuning indeks database", completed: false }
    ],
    branchName: "qa/k6-load-testing",
    visibility: "internal",
    createdAt: "2026-10-18T11:00:00Z",
    lastStatusUpdated: "2026-10-18T11:00:00Z"
  },
  {
    id: "task-lib-109",
    key: "LIB-109",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-6",
    type: "Task",
    title: "[QA] Automation E2E Testing Skenario Peminjaman Buku Mahasiswa via Playwright",
    description: "Automated end-to-end testing browser: flow login mahasiswa SSO, cari buku di OPAC, checkout di meja petugas, hingga assert status buku berubah menjadi TERPINJAM di katalog.",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-qa",
    // Parhan (QA)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 24,
    timeLoggedHours: 0,
    startDate: "2026-10-24",
    dueDate: "2026-10-31",
    relations: [],
    subtasks: [
      { id: "sub-lib-28", title: "Setup framework Playwright TypeScript pada CI staging", completed: false },
      { id: "sub-lib-29", title: "Script E2E sirkulasi peminjaman dan verifikasi nota checkout", completed: false },
      { id: "sub-lib-30", title: "Integrasi test run otomatis saat Pull Request dibuka ke staging", completed: false }
    ],
    branchName: "qa/playwright-e2e",
    visibility: "internal",
    createdAt: "2026-10-18T11:30:00Z",
    lastStatusUpdated: "2026-10-18T11:30:00Z"
  },
  // Asisyah (Project Manajer) Tasks
  {
    id: "task-lib-110",
    key: "LIB-110",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-7",
    type: "Task",
    title: "[PM] Sprint 1 Backlog Grooming & Definisi User Story Acceptance Criteria",
    description: "Memimpin sesi backlog grooming bersama tech lead (Jaka, Aldyana, Azi) & QA (Parhan): merinci 15 user story, estimasi story point, dan penguncian scope Sprint 1.",
    status: "Selesai",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-pm",
    // Asisyah (PM)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 12,
    timeLoggedHours: 12,
    startDate: "2026-10-18",
    dueDate: "2026-10-19",
    relations: [],
    subtasks: [
      { id: "sub-lib-31", title: "Breakdown kebutuhan BRD perpustakaan kampus ke tiket Jira/Kanban", completed: true },
      { id: "sub-lib-32", title: "Penetapan Definition of Done (DoD) bersama QA tester Parhan", completed: true },
      { id: "sub-lib-33", title: "Distribusi modul backend ke Jaka, frontend ke Aldyana, gateway ke Azi", completed: true }
    ],
    branchName: "main",
    visibility: "internal",
    createdAt: "2026-10-18T07:30:00Z",
    lastStatusUpdated: "2026-10-18T12:00:00Z"
  },
  {
    id: "task-lib-111",
    key: "LIB-111",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-7",
    type: "Task",
    title: "[PM] Koordinasi Kick-off Meeting & Jadwal UAT Bersama Kepala Perpustakaan Kampus",
    description: "Menjadwalkan presentasi arsitektur microservices dan demonstrasi wireframe UI React kepada Dra. Hj. Ratna Wulandari (Kepala Perpustakaan Kampus) dan tim pustakawan.",
    status: "In Progress",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-pm",
    // Asisyah (PM)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 10,
    timeLoggedHours: 4,
    startDate: "2026-10-18",
    dueDate: "2026-10-23",
    relations: [],
    subtasks: [
      { id: "sub-lib-34", title: "Kirim dokumen Project Charter & Timeline Milestone ke rektorat", completed: true },
      { id: "sub-lib-35", title: "Sesi kickoff meeting hybrid via Google Meet & Ruang Rapat Perpus", completed: true },
      { id: "sub-lib-36", title: "Penyusunan jadwal pendampingan training pustakawan untuk Sprint 2", completed: false }
    ],
    branchName: "main",
    visibility: "client_public",
    createdAt: "2026-10-18T08:00:00Z",
    lastStatusUpdated: "2026-10-18T14:00:00Z"
  },
  {
    id: "task-lib-112",
    key: "LIB-112",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-7",
    type: "Task",
    title: "[PM] Monitoring Burn-Down Velocity Sprint 1 & Penyusunan Dokumen Berita Acara Termin 1",
    description: "Mengawasi kecepatan tim (velocity 72 hours/week), pelaporan status mingguan ke klien, dan verifikasi kelengkapan dokumen penagihan Termin 1 Down Payment 30% (Rp 55.500.000).",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-pm",
    // Asisyah (PM)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 14,
    timeLoggedHours: 0,
    startDate: "2026-10-21",
    dueDate: "2026-10-30",
    relations: [],
    subtasks: [
      { id: "sub-lib-37", title: "Analisis burndown chart harian di standup meeting", completed: false },
      { id: "sub-lib-38", title: "Penyusunan Berita Acara Penyelesaian Tahap 1 (Inisialisasi)", completed: false },
      { id: "sub-lib-39", title: "Koordinasi dengan divisi Finance untuk penerbitan Invoice Termin 1", completed: false }
    ],
    branchName: "main",
    visibility: "internal",
    createdAt: "2026-10-18T09:00:00Z",
    lastStatusUpdated: "2026-10-18T09:00:00Z"
  },
  // Azi (Full stack) Tasks
  {
    id: "task-lib-113",
    key: "LIB-113",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-5",
    type: "Feature",
    title: "[Fullstack] Setup API Gateway Traefik/Nginx, Docker Compose Microservices & CORS",
    description: "Arsitektur komunikasi antar-layanan: konfigurasi reverse proxy API Gateway, routing /api/v1/catalog ke Laravel Catalog service, /api/v1/circulation ke Laravel Circulation service, dan frontend React.",
    status: "In Progress",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-1",
    // Azi (Full stack)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 28,
    timeLoggedHours: 14,
    startDate: "2026-10-18",
    dueDate: "2026-10-25",
    relations: [],
    subtasks: [
      { id: "sub-lib-40", title: "File docker-compose.yml multi-container (PHP-FPM, Nginx, Postgres, Redis)", completed: true },
      { id: "sub-lib-41", title: "Routing API Gateway Traefik dengan SSL Let's Encrypt otomatis", completed: true },
      { id: "sub-lib-42", title: "Konfigurasi centralized JWT Sanctum authentication middleware", completed: false },
      { id: "sub-lib-43", title: "Health check endpoint /healthz untuk monitoring kelayakan container", completed: false }
    ],
    branchName: "feature/api-gateway-docker",
    visibility: "internal",
    createdAt: "2026-10-18T08:15:00Z",
    lastStatusUpdated: "2026-10-18T15:30:00Z"
  },
  {
    id: "task-lib-114",
    key: "LIB-114",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-5",
    type: "Feature",
    title: "[Fullstack] Integrasi Webhook WhatsApp Gateway untuk Notifikasi H-1 Pengingat Pengembalian Buku",
    description: "Integrasi backend Laravel dan WhatsApp Gateway API: otomatis mengirim pesan ramah pengingat ke nomor WhatsApp mahasiswa pada H-1 tanggal jatuh tempo untuk mencegah timbulnya denda.",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-1",
    // Azi (Full stack)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 20,
    timeLoggedHours: 0,
    startDate: "2026-10-22",
    dueDate: "2026-10-29",
    relations: [],
    subtasks: [
      { id: "sub-lib-44", title: "Webhook handler status delivery WhatsApp (SENT, DELIVERED, READ)", completed: false },
      { id: "sub-lib-45", title: "Template pesan dinamis: Nama mahasiswa, Judul buku, dan Tanggal kembali", completed: false },
      { id: "sub-lib-46", title: "Antrian pengiriman via Laravel Queue Redis dengan auto-retry 3x", completed: false }
    ],
    branchName: "feature/whatsapp-reminder-gateway",
    visibility: "internal",
    createdAt: "2026-10-18T10:30:00Z",
    lastStatusUpdated: "2026-10-18T10:30:00Z"
  },
  {
    id: "task-lib-115",
    key: "LIB-115",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-5",
    type: "Feature",
    title: "[Fullstack] Layanan Export Rekap Statistik Sirkulasi Bulanan Perpustakaan ke PDF & Excel",
    description: "Fitur reporting end-to-end: endpoint backend penghasil data agregat peminjaman per fakultas/program studi, dan UI React untuk mengunduh laporan berformat PDF dan Excel (XLSX).",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-1",
    // Azi (Full stack)
    reporterId: "user-pm",
    // Asisyah (PM)
    sprintId: "sprint-lib-1",
    estimateHours: 18,
    timeLoggedHours: 0,
    startDate: "2026-10-23",
    dueDate: "2026-10-31",
    relations: [],
    subtasks: [
      { id: "sub-lib-47", title: "Service export data menggunakan Laravel Excel (Maatwebsite)", completed: false },
      { id: "sub-lib-48", title: "Template PDF laporan resmi berlogo universitas menggunakan DomPDF", completed: false },
      { id: "sub-lib-49", title: "Komponen UI React DateRangePicker & tombol download dengan loading state", completed: false }
    ],
    branchName: "feature/reporting-pdf-excel",
    visibility: "internal",
    createdAt: "2026-10-18T11:15:00Z",
    lastStatusUpdated: "2026-10-18T11:15:00Z"
  },
  // --- ADDITIONAL BACKLOG POOL ITEMS DISTRIBUTED BY ROLE ---
  // Jaka (Backend Dev) Backlog Tasks
  {
    id: "task-lib-116",
    key: "LIB-116",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-1",
    type: "Feature",
    title: "[Backend] Centralized JWT Sanctum Authentication & RBAC Pustakawan vs Mahasiswa",
    description: "Implementasi middleware otorisasi terdistribusi di seluruh microservices Laravel. Mengamankan endpoint peminjaman dan reservasi hanya untuk kartu aktif terverifikasi.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 20,
    timeLoggedHours: 0,
    startDate: "2026-10-25",
    dueDate: "2026-11-02",
    relations: [],
    subtasks: [
      { id: "sub-lib-50", title: "Setup Laravel Sanctum token refresh endpoint", completed: false },
      { id: "sub-lib-51", title: "Role permission policy pustakawan vs mahasiswa", completed: false },
      { id: "sub-lib-52", title: "Rate limiter 120 req/minute per API client token", completed: false }
    ],
    branchName: "feature/sanctum-rbac-auth",
    visibility: "internal",
    createdAt: "2026-10-18T12:00:00Z",
    lastStatusUpdated: "2026-10-18T12:00:00Z"
  },
  {
    id: "task-lib-117",
    key: "LIB-117",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Feature",
    title: "[Backend] Event-Driven Message Queue (Redis) untuk Sinkronisasi Inventaris Buku Multi-Kampus",
    description: "Arsitektur asinkron pub/sub: saat buku dipinjam di Kampus A, inventaris terpusat langsung menyebarkan event ke microservice katalog di Kampus B dan C.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 22,
    timeLoggedHours: 0,
    startDate: "2026-10-28",
    dueDate: "2026-11-05",
    relations: [],
    subtasks: [
      { id: "sub-lib-53", title: "Setup Redis Stream & consumer group worker", completed: false },
      { id: "sub-lib-54", title: "Dead letter queue handler jika network cabang terputus", completed: false }
    ],
    branchName: "feature/redis-queue-inventory",
    visibility: "internal",
    createdAt: "2026-10-18T12:30:00Z",
    lastStatusUpdated: "2026-10-18T12:30:00Z"
  },
  {
    id: "task-lib-118",
    key: "LIB-118",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Bug",
    title: "[Backend] Deadlock 40P01 pada Transaksi Simultan Peminjaman Eksemplar Terakhir Buku",
    description: "Ketika dua mahasiswa menekan tombol pinjam bersamaan pada 1 eksemplar buku tersisa di rak, query SELECT FOR UPDATE mengalami deadlock di PostgreSQL.",
    status: "Perlu Manual",
    priority: "Hotfix",
    difficulty: "Hard",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-20T14:00:00Z",
    reproductionSteps: [
      "1. Buka 2 tab browser dengan akun mahasiswa berbeda (Mahasiswa A dan B)",
      "2. Pilih buku yang hanya memiliki 1 copy ketersediaan di rak",
      "3. Tekan tombol Pinjam secara serentak pada millisecond yang sama",
      "4. Postgres log mencatat deadlock detected error 40P01 pada tabel book_items"
    ],
    expectedBehavior: 'Salah satu transaksi berhasil meminjam, sedangkan transaksi kedua mendapat notifikasi ramah: "Buku baru saja dipinjam anggota lain".',
    actualBehavior: "Database rollback paksa, throw uncaught QueryException 500 ke frontend.",
    rootCauseAnalysis: "Ketiadaan timeout pelindung dan deterministik ordering pada lock baris stok di CirculationService.php.",
    preventiveMeasures: "Terapkan Redis Distributed Mutex (Redlock) sebelum transaksi database dibuka, dan set lock_timeout = 2s.",
    confidenceScore: 44,
    confidenceReason: "Menyentuh konkurensi transaksi database dan lock row eksemplar. Berisiko inkonsistensi stok fisik.",
    source: "Sentry",
    assigneeId: "user-dev-3",
    // Jaka (Backend Dev)
    reporterId: "user-qa",
    // Parhan (QA)
    estimateHours: 8,
    timeLoggedHours: 2,
    startDate: "2026-10-18",
    dueDate: "2026-10-20",
    visibility: "internal",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "PostgreSQL deadlock detected on book_items table during simultaneous checkout.",
      reproductionSteps: [
        "Kirimkan 10 concurrent requests POST /api/v1/circulation/borrow dengan item_id yang sama",
        "Amati log Postgres di Sentry: error code 40P01 deadlock detected"
      ],
      affectedFiles: [
        { path: "app/Services/CirculationService.php", lineRange: "L74-L112" },
        { path: "app/Models/BookItem.php", lineRange: "L45-L68" }
      ],
      sentryBreadcrumbs: [
        "db.query: BEGIN TRANSACTION",
        "db.query: SELECT * FROM book_items WHERE id = 1204 FOR UPDATE",
        "db.deadlock: Process 512 waits for ShareLock on transaction 91201"
      ],
      suggestedFixes: [
        { option: "Terapkan Redis Redlock atomic semaphore sebelum DB transaction", tradeOff: "Performa sangat cepat (< 5ms), dependensi Redis instance" },
        { option: "Optimistic locking dengan version timestamp column", tradeOff: "Mencegah deadlock tanpa redis, namun butuh penanganan retry" }
      ],
      branchName: "fix/lib-118-concurrency-deadlock",
      commandSnippet: "git checkout -b fix/lib-118-concurrency-deadlock origin/main"
    },
    subtasks: [
      { id: "sub-lib-55", title: "Audit isolation level di CirculationService.php", completed: true },
      { id: "sub-lib-56", title: "Implementasi Redis atomic lock wrapper", completed: false },
      { id: "sub-lib-57", title: "Verifikasi K6 concurrency test 50 threads", completed: false }
    ],
    relations: [],
    branchName: "fix/lib-118-concurrency-deadlock",
    createdAt: "2026-10-18T13:00:00Z",
    lastStatusUpdated: "2026-10-18T16:00:00Z"
  },
  {
    id: "task-lib-130",
    key: "LIB-130",
    projectId: "proj-perpustakaan",
    type: "Bug",
    title: '[Live Prod] Typo Label "Tenggat Waktu" & Missing Null Guard pada Tooltip Peminjam',
    description: 'Pada portal OPAC mahasiswa, terdapat saltik label "Tengat Waktu" dan melempar warning React TypeError: cannot read properties of undefined saat tooltip dibuka pada buku tanpa batas pinjam.',
    status: "Baru",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S3 - Minor",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-22T10:00:00Z",
    source: "Web Form",
    assigneeId: "user-dev-2",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0,
    startDate: "2026-10-19",
    dueDate: "2026-10-21",
    visibility: "client_public",
    subtasks: [
      { id: "sub-lib-b1", title: "Perbaiki string label typo di Translation/id.json", completed: false },
      { id: "sub-lib-b2", title: "Tambahkan optional chaining (?.) pada due_date tooltip", completed: false }
    ],
    relations: [],
    createdAt: "2026-10-19T09:00:00Z",
    lastStatusUpdated: "2026-10-19T09:00:00Z"
  },
  {
    id: "task-lib-131",
    key: "LIB-131",
    projectId: "proj-perpustakaan",
    type: "Bug",
    title: "[Live Prod] Selisih Perhitungan Denda Keterlambatan pada Hari Libur Nasional & Akhir Pekan",
    description: "Laporan mahasiswa: denda keterlambatan tetap dihitung Rp 2.000/hari saat tanggal pengembalian jatuh pada hari Minggu dan libur cuti bersama kalender nasional.",
    status: "Baru",
    priority: "Sedang",
    difficulty: "Medium",
    severity: "S2 - Major",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-21T18:00:00Z",
    source: "Telegram Bot",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 3,
    timeLoggedHours: 0,
    startDate: "2026-10-19",
    dueDate: "2026-10-21",
    visibility: "client_public",
    subtasks: [
      { id: "sub-lib-b3", title: "Integrasikan calendar API hari libur nasional ke CalculateOverdueFinesCommand", completed: false },
      { id: "sub-lib-b4", title: "Unit test exclude libur akhir pekan", completed: false }
    ],
    relations: [],
    createdAt: "2026-10-19T10:30:00Z",
    lastStatusUpdated: "2026-10-19T10:30:00Z"
  },
  {
    id: "task-lib-132",
    key: "LIB-132",
    projectId: "proj-perpustakaan",
    type: "Bug",
    title: "[Live Prod] Format Rupiah Denda Tidak Memiliki Titik Pemisah Ribuan pada Modal Konfirmasi",
    description: "Tampilan nominal denda pada modal kasir petugas tertulis Rp 20000 tanpa pemisah titik ribuan (seharusnya Rp 20.000).",
    status: "Menunggu Persetujuan",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S3 - Minor",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-22T14:00:00Z",
    source: "Sentry",
    assigneeId: "user-dev-2",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0.5,
    startDate: "2026-10-19",
    dueDate: "2026-10-21",
    visibility: "internal",
    branchName: "ai/fix-lib-132-currency-format",
    prNumber: "PR #42 (AI Auto-Patch)",
    prDiff: `--- a/src/utils/formatters.ts
+++ b/src/utils/formatters.ts
@@ -8,3 +8,5 @@
-export const formatRupiah = (val: number) => 'Rp ' + val;
+export const formatRupiah = (val: number) => {
+  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
+};`,
    testResult: {
      passed: true,
      total: 4,
      passedCount: 4,
      failedCount: 0,
      durationMs: 195,
      logs: [
        "PASS test/utils/formatters.spec.ts",
        "\u2713 should format 20000 as Rp 20.000 (12ms)",
        "\u2713 should handle zero correctly as Rp 0 (8ms)",
        "\u2713 should handle undefined/null with Rp 0 fallback (15ms)",
        "\u2713 snapshot regression tests pass (28ms)"
      ]
    },
    subtasks: [
      { id: "sub-lib-b5", title: "Perbaiki helper function formatCurrency", completed: true }
    ],
    relations: [],
    createdAt: "2026-10-19T08:00:00Z",
    lastStatusUpdated: "2026-10-19T08:30:00Z"
  },
  {
    id: "task-lib-133",
    key: "LIB-133",
    projectId: "proj-perpustakaan",
    type: "Bug",
    title: "[Live Prod] Race Condition Double-Refund Denda saat Webhook Payment Gateway Timeout",
    description: "Insiden Sentry Level 1: Ketika webhook Midtrans/QRIS mengalami network timeout di tengah transaksi refund denda, worker antrian melakukan double execution yang menyebabkan saldo kasir berkurang dua kali lipat.",
    status: "Perlu Manual",
    priority: "Hotfix",
    difficulty: "Hard",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-20T12:00:00Z",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "Critical financial defect: Idempotency key tidak divalidasi secara atomic sebelum executeRefund(). Transaksi berulang saat webhook retry.",
      reproductionSteps: [
        "Kirimkan 2 HTTP POST webhook request dengan transaction_id yang sama dalam rentang 10ms",
        "Amati tabel transactions: 2 baris debet dibuat dengan nomor invoice identik"
      ],
      affectedFiles: [
        { path: "app/Http/Controllers/PaymentWebhookController.php", lineRange: "L34-L78" },
        { path: "app/Services/BillingRefundService.php", lineRange: "L110-L162" }
      ],
      sentryBreadcrumbs: [
        "http.request: POST /api/v1/payment/webhook (idempotency: tx_88210)",
        "queue.job: ProcessRefundJob dispatched",
        "db.query: INSERT INTO financial_ledger ... (Duplicate entry created)"
      ],
      suggestedFixes: [
        { option: "Tambahkan unique constraint pada idempotency_key dan Redis distributed lock", tradeOff: "Mencegah double-refund secara 100%, butuh migrasi database" },
        { option: "Gunakan status state machine (PENDING -> PROCESSING -> COMPLETED) dengan optimistic lock", tradeOff: "Aman dan transparan, butuh penanganan retry handling" },
        { option: "Validasi token signature ganda dengan gateway sebelum release fund", tradeOff: "Sangat aman, namun menambah latency API sebesar 150ms" }
      ],
      branchName: "fix/lib-133-refund-idempotency",
      commandSnippet: "git checkout -b fix/lib-133-refund-idempotency origin/main"
    },
    subtasks: [
      { id: "sub-lib-b6", title: "Audit idempotency key di PaymentWebhookController", completed: true },
      { id: "sub-lib-b7", title: "Rancang distributed lock untuk transaksi keuangan", completed: false }
    ],
    relations: [],
    source: "Sentry",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 1.5,
    startDate: "2026-10-19",
    dueDate: "2026-10-20",
    visibility: "internal",
    createdAt: "2026-10-19T11:00:00Z",
    lastStatusUpdated: "2026-10-19T12:00:00Z"
  },
  // Aldyana (Frontend Dev) Backlog Tasks
  {
    id: "task-lib-119",
    key: "LIB-119",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-2",
    type: "Feature",
    title: "[Frontend] Fitur Bookmark Buku Favorit Mahasiswa & Sinkronisasi Offline LocalStorage",
    description: "Fitur simpan daftar bacaan dan referensi skripsi: mahasiswa dapat menandai buku favorit, membuat koleksi kustom, dan membaca sinopsis secara offline.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-2",
    // Aldyana (Frontend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 16,
    timeLoggedHours: 0,
    startDate: "2026-10-26",
    dueDate: "2026-11-03",
    relations: [],
    subtasks: [
      { id: "sub-lib-58", title: "Zustand persistent store untuk bookmark buku favorit", completed: false },
      { id: "sub-lib-59", title: "Export daftar referensi ke format sitasi APA 7th & BibTeX", completed: false }
    ],
    branchName: "feature/bookmark-koleksi-buku",
    visibility: "client_public",
    createdAt: "2026-10-18T13:15:00Z",
    lastStatusUpdated: "2026-10-18T13:15:00Z"
  },
  {
    id: "task-lib-120",
    key: "LIB-120",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-4",
    type: "Feature",
    title: "[Frontend] Modul Cetak Label Barcode & Nomor Panggil Punggung Buku untuk Petugas",
    description: "Fitur cetak label fisik buku ke printer thermal/stiker barcode: mencetak nomor DDC, judul singkatan, dan barcode ISBN untuk ditempel di punggung buku fisik.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-2",
    // Aldyana (Frontend Dev)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 18,
    timeLoggedHours: 0,
    startDate: "2026-10-29",
    dueDate: "2026-11-06",
    relations: [],
    subtasks: [
      { id: "sub-lib-60", title: "Komponen preview label stiker buku ukuran 3x5 cm", completed: false },
      { id: "sub-lib-61", title: "Dukungan batch print 50 label dalam 1 klik ke printer zebra/epson", completed: false }
    ],
    branchName: "feature/cetak-label-punggung-buku",
    visibility: "internal",
    createdAt: "2026-10-18T13:45:00Z",
    lastStatusUpdated: "2026-10-18T13:45:00Z"
  },
  // Parhan (QA) Backlog Tasks
  {
    id: "task-lib-122",
    key: "LIB-122",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-6",
    type: "Task",
    title: "[QA] Security Pentesting: SQL Injection Guard & Rate Limiting Test pada Endpoint OPAC",
    description: "Audit keamanan sistem informasi kampus: pengujian penetration test terhadap parameter pencarian judul buku, validasi sanitasi input, dan uji ketahanan rate limiter API.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-qa",
    // Parhan (QA)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 16,
    timeLoggedHours: 0,
    startDate: "2026-10-27",
    dueDate: "2026-11-04",
    relations: [],
    subtasks: [
      { id: "sub-lib-62", title: "Automated OWASP ZAP scan pada endpoint OPAC", completed: false },
      { id: "sub-lib-63", title: "Penetration test bypass payload SQLi pada parameter ?q=", completed: false },
      { id: "sub-lib-64", title: "Laporan security vulnerability audit untuk kepala IT kampus", completed: false }
    ],
    branchName: "qa/security-pentest-opac",
    visibility: "internal",
    createdAt: "2026-10-18T14:00:00Z",
    lastStatusUpdated: "2026-10-18T14:00:00Z"
  },
  {
    id: "task-lib-123",
    key: "LIB-123",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-6",
    type: "Task",
    title: "[QA] Validasi Matrix Cross-Browser Testing Safari, Chrome & Firefox untuk Dashboard Mahasiswa",
    description: "Memastikan seluruh antarmuka React 19 (render barcode, tabel pinjaman, scanner camera) berjalan sempurna di Safari iOS, Chrome Android, Chrome Desktop, Edge, dan Firefox.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-qa",
    // Parhan (QA)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 14,
    timeLoggedHours: 0,
    startDate: "2026-10-30",
    dueDate: "2026-11-06",
    relations: [],
    subtasks: [
      { id: "sub-lib-65", title: "Matrix cross-browser checklist 18 poin", completed: false },
      { id: "sub-lib-66", title: "Verifikasi render Barcode Code-128 di layar Retina iPhone", completed: false }
    ],
    branchName: "qa/cross-browser-matrix",
    visibility: "internal",
    createdAt: "2026-10-18T14:15:00Z",
    lastStatusUpdated: "2026-10-18T14:15:00Z"
  },
  // Asisyah (Project Manajer) Backlog Tasks
  {
    id: "task-lib-124",
    key: "LIB-124",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-7",
    type: "Task",
    title: "[PM] Perencanaan Alokasi Kapasitas Sprint 2 & Manajemen Risiko Keterlambatan Integrasi SSO Kampus",
    description: "Menyusun alokasi jam kerja 5 anggota tim untuk Sprint 2, mitigasi risiko keterlambatan izin akses API SSO Rektorat, dan penyesuaian target UAT bersama kepala perpustakaan.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-pm",
    // Asisyah (Project Manajer)
    reporterId: "user-pm",
    // Asisyah (Project Manajer)
    estimateHours: 12,
    timeLoggedHours: 0,
    startDate: "2026-10-28",
    dueDate: "2026-11-05",
    relations: [],
    subtasks: [
      { id: "sub-lib-67", title: "Rapat koordinasi tim teknis Puskom/IT Rektorat kampus", completed: false },
      { id: "sub-lib-68", title: "Matriks mitigasi risiko teknis (Risk Log Register)", completed: false }
    ],
    branchName: "main",
    visibility: "internal",
    createdAt: "2026-10-18T14:30:00Z",
    lastStatusUpdated: "2026-10-18T14:30:00Z"
  },
  {
    id: "task-lib-125",
    key: "LIB-125",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-7",
    type: "Task",
    title: "[PM] Penyerahan Berita Acara Milestone Tahap 2 & Pengajuan Invoice Termin 2 (40% Rp 74.000.000)",
    description: "Penyusunan laporan kemajuan pekerjaan Sprint 1 & 2, verifikasi dokumen sign-off pengujian QA bersama Parhan, dan pengajuan penagihan Termin 2 UAT ke bendahara universitas.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-pm",
    // Asisyah (Project Manajer)
    reporterId: "user-pm",
    // Asisyah (Project Manajer)
    estimateHours: 10,
    timeLoggedHours: 0,
    startDate: "2026-10-31",
    dueDate: "2026-11-08",
    relations: [],
    subtasks: [
      { id: "sub-lib-69", title: "Draft Berita Acara UAT Milestone Tahap 2", completed: false },
      { id: "sub-lib-70", title: "Sinkronisasi invoice Termin 2 ke modul Finance", completed: false }
    ],
    branchName: "main",
    visibility: "internal",
    createdAt: "2026-10-18T14:45:00Z",
    lastStatusUpdated: "2026-10-18T14:45:00Z"
  },
  // Azi (Full stack) Backlog Tasks
  {
    id: "task-lib-126",
    key: "LIB-126",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-5",
    type: "Feature",
    title: "[Fullstack] Setup CI/CD Automated Pipeline GitHub Actions: Lint, PHPUnit, Vitest & Docker Build",
    description: "Pipeline integrasi berkelanjutan: otomatisasi static analysis PHPStan level 8, ESLint, unit test backend & frontend, serta build image Docker multi-arch saat push ke branch main/staging.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-1",
    // Azi (Full stack)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 20,
    timeLoggedHours: 0,
    startDate: "2026-10-26",
    dueDate: "2026-11-03",
    relations: [],
    subtasks: [
      { id: "sub-lib-71", title: "Workflow file .github/workflows/ci.yml multi-job", completed: false },
      { id: "sub-lib-72", title: "Caching layer composer dependencies & node_modules untuk build < 3 menit", completed: false },
      { id: "sub-lib-73", title: "Automated preview deployment ke staging server saat PR dibuka", completed: false }
    ],
    branchName: "feature/github-actions-cicd",
    visibility: "internal",
    createdAt: "2026-10-18T15:00:00Z",
    lastStatusUpdated: "2026-10-18T15:00:00Z"
  },
  {
    id: "task-lib-127",
    key: "LIB-127",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-5",
    type: "Feature",
    title: "[Fullstack] Centralized Logging & Monitoring Dashboard Grafana/Prometheus untuk Container",
    description: "Infrastruktur observability sistem: agregasi log akses Nginx, latency query Postgres, memory usage Redis, dan alert bot Telegram jika ada downtime container microservice.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-1",
    // Azi (Full stack)
    reporterId: "user-pm",
    // Asisyah (PM)
    estimateHours: 18,
    timeLoggedHours: 0,
    startDate: "2026-10-29",
    dueDate: "2026-11-06",
    relations: [],
    subtasks: [
      { id: "sub-lib-74", title: "Konfigurasi Prometheus exporter untuk PostgreSQL & Redis", completed: false },
      { id: "sub-lib-75", title: "Dashboard Grafana metrik traffic RPS, error rate 5xx, dan latency p99", completed: false }
    ],
    branchName: "feature/monitoring-grafana-prometheus",
    visibility: "internal",
    createdAt: "2026-10-18T15:30:00Z",
    lastStatusUpdated: "2026-10-18T15:30:00Z"
  },
  // --- EXISTING TASKS ---
  {
    id: "task-104",
    key: "POS-104",
    projectId: "proj-1",
    epicId: "epic-2",
    type: "Bug",
    title: "TypeError: calculateTaxPB1 is undefined saat diskon promo 100%",
    description: "Saat kasir memberikan voucher diskon penuh 100%, sistem kasir gagal menghitung potongan PB1 dan melempar TypeError yang memblokir dialog checkout kasir.",
    status: "Menunggu Persetujuan",
    priority: "Hotfix",
    difficulty: "Low",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-15T22:00:00Z",
    reproductionSteps: [
      "1. Buka register kasir POS-KLN cabang Kenangan Mall",
      "2. Tambahkan 1 item Kopi Latte (Rp 30.000)",
      "3. Masukkan kupon promo 100% VOUCHER-GRATIS-100",
      "4. Tekan tombol Bayar -> Terjadi unhandled exception TypeError di UI kasir"
    ],
    expectedBehavior: "Total PB1 dihitung Rp 0 tanpa crash, struk complimentary voucher dicetak normal.",
    actualBehavior: "TypeError: Cannot read properties of undefined (reading calculateTaxPB1) dan tombol bayar membeku.",
    rootCauseAnalysis: "Fungsi utilitas calculateTaxPB1 di taxEngine.ts tidak memiliki batas pelindung saat taxableBase <= 0 (subtotal terdiskon 100%), menyebabkan kalkulasi objek pembagian mengembalikan undefined.",
    preventiveMeasures: "Tambahkan unit test matrix edge case diskon 100% dan static analysis check pembagian dengan nilai nol pada tax engine.",
    confidenceScore: 94,
    confidenceReason: "Bug terlokalisir pada 1 file utilitas pajak (taxEngine.ts). Nilai subtotal = 0 tidak ditangani saat pembagian persentase.",
    source: "Sentry",
    assigneeId: "user-dev-1",
    reporterId: "user-qa",
    estimateHours: 2,
    timeLoggedHours: 0.5,
    startDate: "2026-10-14",
    dueDate: "2026-10-16",
    sprintId: "sprint-1",
    visibility: "client_public",
    branchName: "ai/fix-pos-104-tax-zero-division",
    prNumber: "PR #42",
    prDiff: `--- a/src/services/taxEngine.ts
+++ b/src/services/taxEngine.ts
@@ -18,7 +18,10 @@ export function calculateTaxPB1(subtotal: number, discountTotal: number): TaxBreakdown {
+  // Guard edge-case discount 100% (subtotal after promo <= 0)
+  const taxableBase = Math.max(0, subtotal - discountTotal);
+  if (taxableBase === 0) {
+    return { taxableBase: 0, taxAmount: 0, ratePercentage: 10 };
+  }
-  const taxableBase = subtotal - discountTotal;
-  const taxAmount = Math.round(taxableBase * 0.10);
+  const taxAmount = Math.round(taxableBase * 0.10);
   return {
     taxableBase,
     taxAmount,
     ratePercentage: 10
   };
 }`,
    testResult: {
      passed: true,
      total: 4,
      passedCount: 4,
      failedCount: 0,
      durationMs: 340,
      logs: [
        "PASS test/taxEngine.test.ts",
        "\u2713 should calculate 10% PB1 on standard subtotal (45ms)",
        "\u2713 should handle 100% promo voucher without division error (12ms)",
        "\u2713 should return zero tax for complimentary orders (18ms)",
        "\u2713 should accurately round tax fractions to nearest IDR (15ms)"
      ]
    },
    diagnosticPackage: {
      summary: "TypeError runtime crash caused by missing zero-check on taxableBase.",
      reproductionSteps: [
        "Buka register kasir POS-KLN",
        "Pilih 1 Kopi Latte (Rp 30.000)",
        "Ketik kode promo VOUCHER-GRATIS-100 (Diskon Rp 30.000)",
        "Tekan tombol Bayar -> Muncul crash putih di UI"
      ],
      affectedFiles: [
        { path: "src/services/taxEngine.ts", lineRange: "L18-L28" }
      ],
      sentryBreadcrumbs: [
        "ui.click: button#btn-checkout",
        "tax.applyVoucher: code=VOUCHER-GRATIS-100 amount=30000",
        "exception: TypeError: Cannot read properties of undefined in calculateTaxPB1"
      ],
      suggestedFixes: [
        { option: "Math.max(0, subtotal - discount) guard", tradeOff: "Aman, minimal regresi, langsung lolos unit test" },
        { option: "Refactor seluruh object breakdown", tradeOff: "Terlalu berisiko menyentuh modul reporting lain" }
      ],
      branchName: "ai/fix-pos-104-tax-zero-division",
      commandSnippet: "git fetch origin && git checkout ai/fix-pos-104-tax-zero-division"
    },
    subtasks: [
      { id: "sub-1", title: "Verifikasi unit test edge case subtotal 0", completed: true },
      { id: "sub-2", title: "Review diff dan lint check", completed: true },
      { id: "sub-3", title: "Deploy ke staging & smoke test", completed: false }
    ],
    relations: [
      { targetKey: "POS-102", type: "relates_to" }
    ],
    lastStatusUpdated: "2026-10-15T18:20:00Z",
    createdAt: "2026-10-14T09:12:00Z"
  },
  {
    id: "task-108",
    key: "POS-108",
    projectId: "proj-1",
    epicId: "epic-3",
    type: "Bug",
    title: "Lock Contention Deadlock pada Sinkronisasi Stok Multi-Gudang",
    description: "Ketika dua kasir cabang berbeda melakukan checkout untuk item yang sama di warehouse pusat, transaksi database Postgres mengalami deadlock dan transaksi dibatalkan.",
    status: "Perlu Manual",
    priority: "Tinggi",
    difficulty: "Hard",
    severity: "S2 - Major",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-17T18:00:00Z",
    reproductionSteps: [
      "1. Jalankan concurrent request transaksi checkout dari dua outlet cabang berbeda",
      "2. Kedua request memesan SKU warehouse sentral yang sama persis secara simultan",
      "3. Transaksi Postgres mengalami deadlock 40P01 pada row inventory lock"
    ],
    expectedBehavior: "Row locking berjalan sekuensial atau memakai optimistic retry tanpa deadlock abort.",
    actualBehavior: "Database rollback paksa, kasir outlet kedua mendapat notifikasi Checkout Gagal (500).",
    rootCauseAnalysis: "Kurangnya deterministik ordering pada SELECT FOR UPDATE transaksi multi-item di file inventory.ts.",
    preventiveMeasures: "Terapkan deterministik lock ordering (sort SKU asc) dan stress test k6 berkala.",
    confidenceScore: 48,
    confidenceReason: "Menyentuh level isolation transaksi database (SERIALIZABLE) dan lock row inventory. Berisiko corrupt data stok antar cabang.",
    source: "Sentry",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 2,
    startDate: "2026-10-13",
    dueDate: "2026-10-17",
    sprintId: "sprint-1",
    visibility: "internal",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "PostgreSQL deadlock detected in inventory_reservations during concurrent SELECT FOR UPDATE.",
      reproductionSteps: [
        "Kirimkan 10 concurrent requests POST /api/pos/checkout untuk SKU KOPI-ARABIKA-1KG",
        "Amati log Postgres di Sentry: error code 40P01 deadlock detected"
      ],
      affectedFiles: [
        { path: "src/db/queries/inventory.ts", lineRange: "L85-L120" },
        { path: "src/services/warehouseSync.ts", lineRange: "L42-L78" }
      ],
      sentryBreadcrumbs: [
        "db.query: BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ",
        "db.query: SELECT * FROM stock_items WHERE sku = $1 FOR UPDATE",
        "db.deadlock: Process 4122 waits for ShareLock on transaction 889211"
      ],
      suggestedFixes: [
        { option: "Urutkan ID row sebelum locking (deterministic lock order)", tradeOff: "Mencegah circular wait, tapi butuh sorting array SKU di client/backend" },
        { option: "Gunakan Redis Distributed Mutex (Redlock)", tradeOff: "Sangat cepat namun menambah dependensi infrastruktur baru" }
      ],
      branchName: "fix/pos-108-inventory-deadlock-investigation",
      commandSnippet: "git checkout -b fix/pos-108-inventory-deadlock origin/main"
    },
    subtasks: [
      { id: "sub-201", title: "Tinjau isolation level di inventory.ts", completed: true },
      { id: "sub-202", title: "Tulis k6 concurrent load test", completed: false },
      { id: "sub-203", title: "Approval ganda sebelum migrasi staging", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T14:45:00Z",
    createdAt: "2026-10-13T11:00:00Z"
  },
  {
    id: "task-101",
    key: "POS-101",
    projectId: "proj-1",
    epicId: "epic-1",
    type: "Feature",
    title: "Offline IndexedDB Storage Sync untuk Transaksi Kasir",
    description: "Kasir harus tetap dapat memproses order saat koneksi internet toko putus, lalu otomatis sinkron ke server ketika sinyal kembali.",
    status: "In Progress",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 16,
    timeLoggedHours: 10.5,
    startDate: "2026-10-11",
    dueDate: "2026-10-18",
    sprintId: "sprint-1",
    visibility: "client_public",
    subtasks: [
      { id: "sub-11", title: "Setup Dexie.js / IndexedDB store schema", completed: true },
      { id: "sub-12", title: "Background sync worker event listener", completed: true },
      { id: "sub-13", title: "Indikator status koneksi hijau/kuning/merah di header kasir", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T16:10:00Z",
    createdAt: "2026-10-10T08:00:00Z"
  },
  {
    id: "task-102",
    key: "POS-102",
    projectId: "proj-1",
    epicId: "epic-2",
    type: "Task",
    title: "Koneksi Bluetooth Thermal Printer 58mm & 80mm",
    description: "Implementasi ESC/POS print driver via Web Bluetooth API untuk struk belanja customer.",
    status: "QA/Testing",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 12,
    timeLoggedHours: 11,
    startDate: "2026-10-09",
    dueDate: "2026-10-16",
    sprintId: "sprint-1",
    visibility: "client_public",
    subtasks: [
      { id: "sub-21", title: "Parser format ESC/POS text & barcode", completed: true },
      { id: "sub-22", title: "Testing dengan printer Panda & Imin", completed: true }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-14T17:30:00Z",
    createdAt: "2026-10-08T10:00:00Z"
  },
  {
    id: "task-103",
    key: "POS-103",
    projectId: "proj-1",
    epicId: "epic-1",
    type: "Feature",
    title: "Pemisahan Bill (Split Bill) per Kursi & Meja",
    description: "Memungkinkan pelanggan dalam 1 grup meja memisahkan pembayaran sesuai makanan/minuman yang dipesan.",
    status: "To Do",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 14,
    timeLoggedHours: 0,
    startDate: "2026-10-17",
    dueDate: "2026-10-23",
    sprintId: "sprint-1",
    visibility: "client_public",
    subtasks: [],
    relations: [],
    lastStatusUpdated: "2026-10-12T11:00:00Z",
    createdAt: "2026-10-10T14:00:00Z"
  },
  {
    id: "task-105",
    key: "POS-105",
    projectId: "proj-1",
    epicId: "epic-2",
    type: "Bug",
    title: "Potongan Diskon Member tidak tercetak pada Struk Salinan",
    description: "Struk customer menampilkan diskon dengan benar, namun struk kitchen/salinan merchant tidak menampilkan rincian membership.",
    status: "Selesai",
    priority: "Rendah",
    difficulty: "Low",
    source: "Telegram Bot",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 3,
    timeLoggedHours: 2.5,
    startDate: "2026-10-11",
    dueDate: "2026-10-13",
    sprintId: "sprint-1",
    visibility: "client_public",
    billedInvoiceId: "inv-101",
    subtasks: [],
    relations: [],
    lastStatusUpdated: "2026-10-13T16:00:00Z",
    createdAt: "2026-10-11T13:20:00Z"
  },
  {
    id: "task-106",
    key: "POS-106",
    projectId: "proj-1",
    type: "Maintenance",
    title: "Pembersihan Log Transaksi Lama & Vacuum Postgres Bulanan",
    description: "Jadwal maintenance rutin database: reindex index order_items dan purge temporary cart logs > 90 hari.",
    status: "Selesai",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 4,
    timeLoggedHours: 4,
    startDate: "2026-10-05",
    dueDate: "2026-10-06",
    visibility: "internal",
    billedInvoiceId: "inv-101",
    subtasks: [],
    relations: [],
    lastStatusUpdated: "2026-10-06T10:00:00Z",
    createdAt: "2026-10-04T09:00:00Z"
  },
  {
    id: "task-107",
    key: "POS-107",
    projectId: "proj-1",
    epicId: "epic-3",
    type: "Revisi",
    title: "Perubahan Format Nomor Faktur Pajak Sesuai Regulasi 2026",
    description: "Klien meminta penyesuaian format nomor seri faktur pajak standar dari format lama 010.xxx menjadi standar 16 digit NIK/NPWP.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 0,
    startDate: "2026-10-26",
    dueDate: "2026-10-31",
    visibility: "client_public",
    subtasks: [],
    relations: [],
    lastStatusUpdated: "2026-10-14T09:00:00Z",
    createdAt: "2026-10-14T08:30:00Z"
  },
  {
    id: "task-ftsl-101",
    key: "FTSL-101",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-1",
    type: "Task",
    title: "Kick-off Proyek Futsal Hub & Finalisasi Dokumen Scope of Work",
    description: "Pertemuan kick-off bersama Coach Danang & Bpk. Reza (Arena Futsal Pro) membahas termin pembayaran 50%-50%, konfigurasi 4 lapangan futsal (2 rumput sintetis, 2 vinyl interlock), dan integrasi repository GitHub.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-pm",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 0,
    startDate: "2026-10-16",
    dueDate: "2026-10-18",
    visibility: "client_public",
    subtasks: [
      { id: "st-ftsl-01", title: "Verifikasi denah lapangan & tarif sewa peak hour (18.00-24.00)", completed: false },
      { id: "st-ftsl-02", title: "Tanda tangan jadwal milestone & deliverable branch GitHub", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:30:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-b101",
    key: "FTSL-B101",
    projectId: "proj-futsal",
    type: "Bug",
    title: "[Live Prod] Label Tombol Booking Lapangan Tertukar pada Tampilan Layar Smartphone",
    description: 'Pada viewport mobile (< 640px), teks tombol "Pilih Jam" tertukar dengan "Lihat Fasilitas" akibat flex-col-reverse yang keliru.',
    status: "Baru",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S3 - Minor",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-23T12:00:00Z",
    source: "Web Form",
    assigneeId: "user-dev-2",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0,
    startDate: "2026-10-19",
    dueDate: "2026-10-22",
    visibility: "client_public",
    subtasks: [
      { id: "st-ftsl-b1", title: "Perbaiki urutan DOM elemen pada FieldCardMobile.tsx", completed: false }
    ],
    relations: [],
    createdAt: "2026-10-19T09:30:00Z",
    lastStatusUpdated: "2026-10-19T09:30:00Z"
  },
  {
    id: "task-ftsl-b102",
    key: "FTSL-B102",
    projectId: "proj-futsal",
    type: "Bug",
    title: "[Live Prod] Perhitungan Diskon Sewa Malam Hari Selisih Rp 5.000 pada Paket Sewa 3 Jam",
    description: "Formula pemotongan voucher paket malam (20.00-23.00) memotong diskon flat tanpa memperhitungkan batas minimal subtotal, menghasilkan selisih hitung Rp 5.000.",
    status: "Baru",
    priority: "Sedang",
    difficulty: "Medium",
    severity: "S2 - Major",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-21T16:00:00Z",
    source: "Telegram Bot",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 3,
    timeLoggedHours: 0,
    startDate: "2026-10-19",
    dueDate: "2026-10-21",
    visibility: "client_public",
    subtasks: [
      { id: "st-ftsl-b2", title: "Audit logika perhitungan calculateSlotPriceWithDiscount", completed: false }
    ],
    relations: [],
    createdAt: "2026-10-19T10:00:00Z",
    lastStatusUpdated: "2026-10-19T10:00:00Z"
  },
  {
    id: "task-ftsl-b103",
    key: "FTSL-B103",
    projectId: "proj-futsal",
    type: "Bug",
    title: "[Live Prod] Race Condition Double-Booking Slot 20:00 Lapangan Vinyl saat Bayar Simultan via QRIS",
    description: "Insiden Kritis Lapangan: Dua tim futsal berhasil membayar Down Payment QRIS secara serentak untuk slot jam yang sama persis (Jumat 20:00 Lapangan Vinyl A). Terjadi double booking jadwal lapangan.",
    status: "Perlu Manual",
    priority: "Hotfix",
    difficulty: "Hard",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-20T10:00:00Z",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "PostgreSQL race condition pada tabel field_reservations. Ketiadaan atomic conditional update saat status payment callback diterima.",
      reproductionSteps: [
        'Kirimkan 2 HTTP callback status "PAID" secara bersamaan untuk slot_id: ftsl_vinyl_a_20',
        "Amati tabel reservations: keduanya berhasil berstatus CONFIRMED untuk slot yang sama"
      ],
      affectedFiles: [
        { path: "src/services/bookingReservationService.ts", lineRange: "L55-L95" },
        { path: "src/db/queries/slotLock.ts", lineRange: "L22-L60" }
      ],
      sentryBreadcrumbs: [
        "qris.webhook: Payment SUCCESS (Booking #FTSL-771)",
        "qris.webhook: Payment SUCCESS (Booking #FTSL-772)",
        "conflict.warning: Slot 20:00 assigned to both booking references"
      ],
      suggestedFixes: [
        { option: 'Terapkan conditional update UPDATE slots SET status="BOOKED" WHERE status="LOCKED"', tradeOff: "Mencegah bentrok sewa 100%, booking kedua otomatis dialihkan ke antrean refund" },
        { option: "Redis Redlock atomic reservation token dengan TTL 15 menit", tradeOff: "Performa sangat responsif, dependensi Redis" },
        { option: "PostgreSQL Exclusion Constraint (tstzrange && field_id)", tradeOff: "Dijamin level engine DB, butuh migrasi skema tabel" }
      ],
      branchName: "fix/ftsl-b103-double-booking-race",
      commandSnippet: "git checkout -b fix/ftsl-b103-double-booking origin/main"
    },
    subtasks: [
      { id: "st-ftsl-b3", title: "Audit isolation callback QRIS di bookingReservationService.ts", completed: true },
      { id: "st-ftsl-b4", title: "Terapkan conditional atomic SQL update", completed: false }
    ],
    relations: [],
    source: "Sentry",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 2,
    startDate: "2026-10-19",
    dueDate: "2026-10-20",
    visibility: "internal",
    createdAt: "2026-10-19T11:30:00Z",
    lastStatusUpdated: "2026-10-19T12:00:00Z"
  },
  {
    id: "task-ftsl-102",
    key: "FTSL-102",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-1",
    type: "Feature",
    title: "Grid Kalender Jadwal Sewa Interaktif & Anti Double-Booking",
    description: "Pengembangan grid interaktif pemilihan slot per jam (08.00 - 24.00) untuk 4 lapangan. Implementasikan Redis Distributed Lock 10 menit saat slot dipilih pengguna agar tidak terjadi bentrok sewa.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 28,
    timeLoggedHours: 0,
    startDate: "2026-10-18",
    dueDate: "2026-10-25",
    visibility: "internal",
    branchName: "epic/ftsl-pro-epic-1-jadwal-slot",
    subtasks: [
      { id: "st-ftsl-11", title: "Rancang database schema field_slots & reservations", completed: false },
      { id: "st-ftsl-12", title: 'Implementasi atomic lock Redis saat tombol "Pilih Jam" ditekan', completed: false },
      { id: "st-ftsl-13", title: "Sinkronisasi WebSocket agar slot terkunci langsung abu-abu di client lain", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:32:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-103",
    key: "FTSL-103",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-2",
    type: "Feature",
    title: "Integrasi Pembayaran DP QRIS Dinamis & Countdown Batas Bayar 15 Menit",
    description: "Generate QRIS dinamis instan untuk pembayaran Down Payment (DP Rp 50.000 / jam). Sistem memasang timer countdown 15 menit; jika webhook payment gateway belum diterima, slot otomatis dilepas kembali ke publik.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 24,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-28",
    visibility: "internal",
    branchName: "epic/ftsl-pro-epic-2-dp-qris",
    subtasks: [
      { id: "st-ftsl-21", title: "Integrasi API generate QRIS dinamis Midtrans/Xendit", completed: false },
      { id: "st-ftsl-22", title: "Webhook handler notifikasi lunas & update status invoice DP", completed: false },
      { id: "st-ftsl-23", title: "Cron worker auto-release slot jika timer 15 menit kedaluwarsa", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:33:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-104",
    key: "FTSL-104",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-3",
    type: "Feature",
    title: "Rental Perlengkapan Tambahan (Rompi/Sepatu/Wasit) & POS Kasir Kantin",
    description: "Modul pemilihan add-on saat booking lapangan: sewa rompi tim (Rp 25.000/set), jasa wasit berlisensi (Rp 75.000/jam), sewa bola tambahan, serta modul kasir POS cepat untuk minuman dingin di venue.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 20,
    timeLoggedHours: 0,
    startDate: "2026-10-22",
    dueDate: "2026-10-30",
    visibility: "internal",
    branchName: "epic/ftsl-pro-epic-3-sewa-rompi-kantin",
    subtasks: [
      { id: "st-ftsl-31", title: "Manajemen inventaris perlengkapan sewa (stok rompi, bola)", completed: false },
      { id: "st-ftsl-32", title: "Katalog POS kasir kantin minuman isotonik & snack ringan", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:34:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-105",
    key: "FTSL-105",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-4",
    type: "Feature",
    title: "WhatsApp Gateway Tiket QR Code & Broadcast Pengingat Kick-Off H-2 Jam",
    description: "Pengiriman otomatis e-ticket berformat kartu digital resmi WhatsApp lengkap dengan QR Code unik untuk akses masuk arena dan broadcast pengingat H-2 jam sebelum pertandingan.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 22,
    timeLoggedHours: 0,
    startDate: "2026-10-25",
    dueDate: "2026-11-02",
    visibility: "client_public",
    branchName: "epic/ftsl-pro-epic-4-notif-wa",
    subtasks: [
      { id: "st-ftsl-41", title: "Integrasi WhatsApp Cloud API / Fonnte template tiket", completed: false },
      { id: "st-ftsl-42", title: "Generator QR code terenkripsi untuk validasi gerbang/resepsionis", completed: false },
      { id: "st-ftsl-43", title: "Scheduler cron reminder otomatis H-2 jam sebelum jam main", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:35:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-106",
    key: "FTSL-106",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-5",
    type: "Feature",
    title: "Dashboard Kasir Resepsionis, Pelunasan Lapangan & Rekap Tutup Shift",
    description: "Antarmuka kasir resepsionis venue untuk scan tiket QR, verifikasi sisa pelunasan (Cash / Debit / QRIS), kalkulasi kembalian, dan cetak slip pelunasan 58mm thermal.",
    status: "Backlog",
    priority: "Tinggi",
    source: "Manual",
    assigneeId: "user-qa",
    reporterId: "user-pm",
    estimateHours: 18,
    timeLoggedHours: 0,
    startDate: "2026-10-27",
    dueDate: "2026-11-05",
    visibility: "internal",
    branchName: "epic/ftsl-pro-epic-5-rekap-omzet",
    subtasks: [
      { id: "st-ftsl-51", title: "Kamera scanner QR ticket validator di UI resepsionis", completed: false },
      { id: "st-ftsl-52", title: "Form pelunasan sisa tagihan & cetak struk kasir thermal", completed: false },
      { id: "st-ftsl-53", title: "Rekap tutup shift kasir & audit log kas laci venue", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:36:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  {
    id: "task-ftsl-107",
    key: "FTSL-107",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-5",
    type: "Feature",
    title: "Laporan Okupansi Lapangan & Manajemen Paket Komunitas/Member Rutin",
    description: "Laporan analitik tingkat keterisian lapangan (persentase okupansi prime time vs jam sepi), grafik pendapatan harian, dan modul sewa berulang (recurring slot mingguan) untuk klub/komunitas futsal.",
    status: "Backlog",
    priority: "Sedang",
    source: "Manual",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 16,
    timeLoggedHours: 0,
    startDate: "2026-10-29",
    dueDate: "2026-11-08",
    visibility: "internal",
    branchName: "epic/ftsl-pro-epic-5-rekap-omzet",
    subtasks: [
      { id: "st-ftsl-61", title: "Grafik okupansi mingguan/bulanan per lapangan", completed: false },
      { id: "st-ftsl-62", title: "Fitur membership slot rutin mingguan (auto-reserve)", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-15T22:37:00Z",
    createdAt: "2026-10-15T22:30:00Z"
  },
  // --- LIVE PRODUCTION BUG AUTOMATION TASKS (GARANSI 1 BULAN PROYEK) ---
  // 1. Perpustakaan Digital - Bug Kecil (Auto-Fix AI)
  {
    id: "task-lib-bug-1",
    key: "LIB-BUG-1",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-2",
    type: "Bug",
    title: "[Live Prod] Typo Label ISBN & Missing Null Guard pada Form Buku OPAC",
    description: 'Di server production: label input ISBN tertera "ISBM-13" dan saat pengguna mengosongkan judul alternatif, UI melempar warning null object reference.',
    status: "Baru",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S3 - Minor",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-23T18:00:00Z",
    reproductionSteps: [
      "1. Buka live URL https://perpustakaan.nusantara.ac.id/search",
      "2. Buka modal tambah referensi buku mandiri mahasiswa",
      "3. Perhatikan label field nomor ISBN salah eja dan submit kosong memicu unhandled warning"
    ],
    expectedBehavior: 'Label tertulis "ISBN-13" rapi dan helper fungsi getSafeTitle() mengembalikan string kosong bila null.',
    actualBehavior: 'Label "ISBM-13" dan runtime warning TypeError: Cannot read property trim of undefined.',
    source: "Web Form",
    assigneeId: "user-dev-2",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-22",
    visibility: "client_public",
    branchName: "ai/fix-lib-bug-1-auto",
    subtasks: [
      { id: "st-lbug-11", title: "Perbaiki typo teks string pada BookSearchFilter.tsx", completed: false },
      { id: "st-lbug-12", title: 'Pasang safe optional chaining input?.title?.trim() ?? ""', completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T10:00:00Z",
    createdAt: "2026-10-20T10:00:00Z"
  },
  // 2. Perpustakaan Digital - Bug Menengah (Auto-Fix AI)
  {
    id: "task-lib-bug-2",
    key: "LIB-BUG-2",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Bug",
    title: "[Live Prod] Rounding Selisih Hitung Denda Keterlambatan Hari Libur Nasional",
    description: "Sentry merekam anomali pada kalkulasi cron denda harian: hari libur nasional resmi tidak ter-bypass sehingga kalkulasi total denda kelebihan Rp 4.000 (2 hari) pada mahasiswa Teknik.",
    status: "Dianalisis",
    priority: "Sedang",
    difficulty: "Medium",
    severity: "S2 - Major",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-22T12:00:00Z",
    reproductionSteps: [
      "1. Mahasiswa mengembalikan buku yang terlambat melewati hari libur Idul Fitri",
      "2. Endpoint POST /api/v1/circulation/calculate-fine dipanggil oleh sistem kasir",
      "3. Array holidayDates terlewat saat kalkulasi selisih hari kerja (business days diff)"
    ],
    expectedBehavior: "Hari libur resmi nasional dikecualikan dari pengenaan denda Rp 2.000/hari.",
    actualBehavior: "Denda dihitung kalender murni termasuk hari libur kampus/nasional.",
    source: "Sentry",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 3,
    timeLoggedHours: 0.5,
    startDate: "2026-10-20",
    dueDate: "2026-10-22",
    visibility: "internal",
    branchName: "ai/fix-lib-bug-2-holiday-fines",
    subtasks: [
      { id: "st-lbug-21", title: "Filter out publicHolidays array di FineCalculatorService.php", completed: false },
      { id: "st-lbug-22", title: "Unit test verifikasi peminjaman melintasi long-weekend", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T11:15:00Z",
    createdAt: "2026-10-20T11:00:00Z"
  },
  // 3. Perpustakaan Digital - Bug Besar (Wajib Manusia & Paket Diagnostik)
  {
    id: "task-lib-bug-3",
    key: "LIB-BUG-3",
    projectId: "proj-perpustakaan",
    epicId: "epic-lib-3",
    type: "Bug",
    title: "[Live Prod] PostgreSQL Row Lock Deadlock 40P01 Transaksi Peminjaman Simultan",
    description: "Critical Concurrency Deadlock: Ketika 2 mahasiswa serentak meminjam buku referensi tunggal di detik yang sama, transaksi PostgreSQL mengalami deadlock ShareLock/ExclusiveLock pada tabel book_copies dan sirkulasi abort.",
    status: "Baru",
    priority: "Hotfix",
    difficulty: "Hard",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-21T04:00:00Z",
    reproductionSteps: [
      "1. Kirim 20 request concurrent POST /api/v1/circulation/borrow dengan book_copy_id = 9081",
      "2. Dua koneksi database meng-acquire SELECT FOR UPDATE dengan urutan locking acak",
      "3. Transaksi Postgres 40P01 terdeteksi di Sentry dan kasir menerima pesan HTTP 500"
    ],
    expectedBehavior: 'Koneksi kedua menunggu secara aman dengan Redis Distributed Mutex atau return pesan ramah "Buku telah dipinjam" tanpa abort deadlock.',
    actualBehavior: "Error code 40P01 deadlock detected. PostgreSQL abort connection.",
    source: "Sentry",
    assigneeId: "user-dev-3",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-21",
    visibility: "internal",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "High-Risk Concurrency Deadlock on book_copies during peak hours. AI auto-patch is prohibited by Safety Guardrail to prevent corrupted borrowing records.",
      reproductionSteps: [
        "Concurrent k6 script: 30 virtual users borrowing identical book_copy_id",
        "Observe Sentry event ID 9a20b1: 40P01 Deadlock detected"
      ],
      affectedFiles: [
        { path: "src/services/CirculationService.php", lineRange: "L85-L135" },
        { path: "database/migrations/2026_10_18_create_circulation_tables.php", lineRange: "L30-L55" }
      ],
      sentryBreadcrumbs: [
        "db.query: BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ",
        "db.query: SELECT * FROM book_copies WHERE id = 9081 FOR UPDATE",
        "sentry.error: Process 9182 waits for ExclusiveLock on relation book_copies"
      ],
      suggestedFixes: [
        { option: "Integrasikan Redis Redlock atomic mutex dengan key book_copy_{id} TTL 8 detik", tradeOff: "Mencegah deadlock 100%, butuh Redis server connection pooling" },
        { option: "Gunakan Optimistic Locking dengan version column di tabel book_copies", tradeOff: "Bebas row lock, namun request kedua harus ditangani retry exception di frontend" }
      ],
      branchName: "fix/lib-bug-3-deadlock-investigation",
      commandSnippet: "git checkout -b fix/lib-bug-3-deadlock origin/main"
    },
    subtasks: [
      { id: "st-lbug-31", title: "Review level isolasi transaksi di CirculationService.php", completed: false },
      { id: "st-lbug-32", title: "Terapkan Redis Redlock atomic check-and-set", completed: false },
      { id: "st-lbug-33", title: "Uji stress test K6 500 concurrent users sebelum rilis", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T12:00:00Z",
    createdAt: "2026-10-20T12:00:00Z"
  },
  // 4. Arena Futsal Pro - Bug Kecil (Auto-Fix AI)
  {
    id: "task-ftsl-bug-1",
    key: "FTSL-BUG-1",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-1",
    type: "Bug",
    title: "[Live Prod] Format Jam Kalender Mobile Tidak Konsisten (24:00 vs 00:00)",
    description: 'Di tampilan layar smartphone (layar < 390px): slot jam penutupan lapangan tengah malam tertulis "24:00" sedangkan di server backend menggunakan standar ISO "00:00".',
    status: "Baru",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S3 - Minor",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-23T18:00:00Z",
    reproductionSteps: [
      "1. Buka https://booking.arenafutsalpro.id dari Google Chrome Android",
      "2. Scroll ke slot lapangan jam 23.00 - 00.00",
      "3. Slot terakhir menampilkan label 24.00 yang memicu kebingungan pengguna"
    ],
    expectedBehavior: "Format jam selalu terstandarisasi 2-digit HH:mm (00:00).",
    actualBehavior: "Teks tertera 24:00.",
    source: "Web Form",
    assigneeId: "user-dev-1",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-22",
    visibility: "client_public",
    branchName: "ai/fix-ftsl-bug-1-time-format",
    subtasks: [
      { id: "st-fbug-11", title: "Format waktu via date-fns HH:mm formatString", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T12:30:00Z",
    createdAt: "2026-10-20T12:30:00Z"
  },
  // 5. Arena Futsal Pro - Bug Menengah (Auto-Fix AI)
  {
    id: "task-ftsl-bug-2",
    key: "FTSL-BUG-2",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-2",
    type: "Bug",
    title: "[Live Prod] Webhook QRIS Midtrans Timeout saat Notifikasi Lunas Jam Sibuk",
    description: "Saat lonjakan sewa lapangan pukul 19.00 - 21.00 WIB, webhook payment gateway mengalami timeout 504 dan tidak melakukan auto-retry dengan exponential backoff sehingga status invoice DP lambat terupdate.",
    status: "Baru",
    priority: "Sedang",
    difficulty: "Medium",
    severity: "S2 - Major",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-22T18:00:00Z",
    reproductionSteps: [
      "1. User bayar DP QRIS senilai Rp 50.000 via mobile banking",
      "2. Midtrans mengirim webhook POST /api/v1/payment/webhook-midtrans",
      "3. Server mengalami request spike, response > 5 detik menyebabkan webhook pending"
    ],
    expectedBehavior: "Webhook controller mengembalikan HTTP 200 instan dan melempar job update invoice ke background queue worker Redis.",
    actualBehavior: "Webhook memproses database sinkron di request thread utama, rentan 504 Gateway Timeout.",
    source: "Sentry",
    assigneeId: "user-dev-2",
    reporterId: "user-pm",
    estimateHours: 3,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-22",
    visibility: "internal",
    branchName: "ai/fix-ftsl-bug-2-webhook-queue",
    subtasks: [
      { id: "st-fbug-21", title: "Dispatch ProcessMidtransPaymentJob ke queue default", completed: false },
      { id: "st-fbug-22", title: "Return HTTP 200 OK dalam < 100ms ke Midtrans", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T13:00:00Z",
    createdAt: "2026-10-20T13:00:00Z"
  },
  // 6. Arena Futsal Pro - Bug Besar (Wajib Manusia & Paket Diagnostik)
  {
    id: "task-ftsl-bug-3",
    key: "FTSL-BUG-3",
    projectId: "proj-futsal",
    epicId: "epic-ftsl-1",
    type: "Bug",
    title: "[Live Prod] Race Condition Double-Booking Slot 20.00-21.00 Lapangan Vinyl (Redis Lock Leaking)",
    description: "Kritis: Dua tim futsal berhasil membayar DP untuk slot waktu dan lapangan yang sama persis (Lapangan Vinyl 1, jam 20.00 - 21.00). Kunci distributed lock Redis kedaluwarsa prematur saat timer 15 menit berjalan.",
    status: "Baru",
    priority: "Hotfix",
    difficulty: "Hard",
    severity: "S1 - Critical (Blocker)",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-21T04:00:00Z",
    reproductionSteps: [
      "1. Dua customer membuka slot jam 20.00 - 21.00 Lapangan 1 secara simultan",
      "2. Customer A masuk checkout QRIS pada detik 00",
      "3. Key Redis slot_lock_vinyl_1_20_21 mengalami leak key expiry sebelum checkout customer A selesai",
      "4. Customer B berhasil men-generate QRIS kedua untuk slot yang sama"
    ],
    expectedBehavior: "Slot terkunci solid hingga webhook payment sukses atau waktu 15 menit benar-benar expired via atomic Lua script.",
    actualBehavior: "Dua invoice DP berstatus Lunas untuk 1 slot lapangan (Double Booking Fisik di Venue).",
    source: "Sentry",
    assigneeId: "user-dev-1",
    reporterId: "user-pm",
    estimateHours: 8,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-21",
    visibility: "internal",
    requiresDoubleConfirmation: true,
    diagnosticPackage: {
      summary: "Double booking race condition in venue reservation system. Auto-fix by AI is blocked by Software House Safety Rules to prevent physical venue scheduling collision.",
      reproductionSteps: [
        "Simulate concurrent booking requests using Jmeter / k6",
        "Check Redis keyspace notification on slot_lock_vinyl_1"
      ],
      affectedFiles: [
        { path: "src/services/SlotReservationService.ts", lineRange: "L65-L120" },
        { path: "src/services/RedisLockProvider.ts", lineRange: "L25-L60" }
      ],
      sentryBreadcrumbs: [
        "reservation.selectSlot: field=1 hour=20:00",
        "redis.set: key=slot_lock_vinyl_1_20 EX 900 NX",
        "sentry.warning: Duplicate reservation record detected for slot_id=8812"
      ],
      suggestedFixes: [
        { option: "Atomic Lua script untuk SETNX dan extend lease time saat proses pembayaran QRIS", tradeOff: "Mencegah race condition 100%, perlu audit skrip Redis di production" },
        { option: "Unique database compound index (field_id, date, start_time) di PostgreSQL", tradeOff: "Perlindungan lapis baja di database level, namun perlu migrasi skema tabel" }
      ],
      branchName: "fix/ftsl-bug-3-double-booking-investigation",
      commandSnippet: "git checkout -b fix/ftsl-bug-3-double-booking origin/main"
    },
    subtasks: [
      { id: "st-fbug-31", title: "Audit Redis lease renewal di RedisLockProvider.ts", completed: false },
      { id: "st-fbug-32", title: "Tambahkan unique compound index di PostgreSQL reservations", completed: false },
      { id: "st-fbug-33", title: "Uji concurrency simulation test dengan 100 concurrent requests", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T13:30:00Z",
    createdAt: "2026-10-20T13:30:00Z"
  },
  // 7. POS Kopi Kenangan - Bug Kecil (Auto-Fix AI)
  {
    id: "task-pos-bug-1",
    key: "POS-109",
    projectId: "proj-1",
    epicId: "epic-2",
    type: "Bug",
    title: "[Live Prod] Label Footer Struk Bluetooth Thermal Terpotong 2 Karakter",
    description: 'Pada printer thermal Bluetooth 58mm di cabang Mall Kelapa Gading: teks "Terima Kasih" terpotong di baris akhir karena margin padding paper-width 32 kolom.',
    status: "Baru",
    priority: "Rendah",
    difficulty: "Low",
    severity: "S4 - Trivial",
    environment: "Production",
    warrantyStatus: "Garansi Proyek (Gratis)",
    slaDeadline: "2026-10-23T20:00:00Z",
    reproductionSteps: [
      "1. Kasir mencetak struk transaksi kasir POS-KLN",
      "2. Baris footer penutup terpotong karakter terakhir pada ESC/POS 58mm"
    ],
    expectedBehavior: "Teks footer terbungkus rapi dalam 32 kolom karakter.",
    actualBehavior: 'Teks terpotong "Terima Kas".',
    source: "Manual",
    assigneeId: "user-dev-2",
    reporterId: "user-qa",
    estimateHours: 1,
    timeLoggedHours: 0,
    startDate: "2026-10-20",
    dueDate: "2026-10-22",
    visibility: "client_public",
    branchName: "ai/fix-pos-109-thermal-footer",
    subtasks: [
      { id: "st-pbug-11", title: "Format word-wrap footer thermal printer di printerReceipt.ts", completed: false }
    ],
    relations: [],
    lastStatusUpdated: "2026-10-20T14:00:00Z",
    createdAt: "2026-10-20T14:00:00Z"
  }
];
const INITIAL_CRM_DEALS = [
  {
    id: "deal-crm-lib-101",
    dealCode: "DEAL-PERPUS-01",
    title: "Sistem Informasi Perpustakaan Digital Kampus (Laravel Microservices & React SPA)",
    clientName: "Universitas Nusantara Cendekia (Perpustakaan Pusat)",
    clientPic: "Dra. Hj. Ratna Wulandari, M.Hum (Kepala Perpustakaan)",
    clientEmail: "perpustakaan@nusantara.ac.id",
    contractValue: 185e6,
    currency: "IDR",
    status: "Closing/Won",
    templateType: "perpustakaan_microservices",
    scopeNotes: "Arsitektur Microservices terdistribusi: Microservice Katalog Buku Laravel 11, Engine Sirkulasi Peminjaman & Denda Keterlambatan, Portal Pencarian OPAC React 19, Meja Sirkulasi Barcode Scanner, API Gateway Docker, WhatsApp Reminder Gateway, dan Pengujian Otomasi QA K6/Playwright.",
    paymentTerms: "Termin 1 (30% DP Kick-off Rp 55.500.000), Termin 2 (40% UAT & Staging Sign-Off Rp 74.000.000), Termin 3 (30% Go-Live & Handover Rp 55.500.000)",
    closedDate: "2026-10-18"
  },
  {
    id: "deal-crm-303",
    dealCode: "DEAL-FTSL-01",
    title: "Sistem Booking & Manajemen Lapangan Futsal (Champion Arena Futsal)",
    clientName: "PT Champion Arena Nusantara",
    clientPic: "Coach Danang Wijaya & Bpk. Reza",
    clientEmail: "management@arenafutsalpro.id",
    contractValue: 52e6,
    currency: "IDR",
    status: "Closing/Won",
    templateType: "booking_futsal",
    scopeNotes: "Aplikasi booking lapangan futsal interaktif 4 lapangan, pencegahan tabrakan jam sewa (anti double-booking), pembayaran DP via QRIS dinamis countdown 15 menit, add-on sewa rompi/wasit & kasir kantin, notifikasi tiket QR WhatsApp, dan rekap okupansi harian.",
    paymentTerms: "Termin 1 (50% DP Kick-off & Inisialisasi GitHub), Termin 2 (50% UAT & Go-Live Lapangan)",
    closedDate: "2026-10-15"
  },
  {
    id: "deal-crm-300",
    dealCode: "DEAL-WRG-01",
    title: "Sistem POS Warung Makan & Kelontong Nusantara (Warung Bu Siti)",
    clientName: "CV Berkah Rasa Nusantara (Warung Bu Siti Group)",
    clientPic: "Ibu Hj. Siti Rahayu & Bpk. Bambang",
    clientEmail: "warungbusiti.official@gmail.com",
    contractValue: 385e5,
    currency: "IDR",
    status: "Closing/Won",
    templateType: "pos_warung",
    scopeNotes: "POS kasir layar sentuh cepat, cetak struk thermal 58mm, potong stok resep bahan baku (beras, ayam, bumbu), pembayaran QRIS dinamis, dan rekap tutup kasir harian (End of Day).",
    paymentTerms: "Termin 1 (50% Kick-off & Inisialisasi), Termin 2 (50% UAT & Training Kasir)",
    closedDate: "2026-10-15"
  },
  {
    id: "deal-crm-medika",
    dealCode: "DEAL-MEDIKA-01",
    title: "Sistem ERP Klinik Gigi & Medika Prima (Odontogram & BPJS)",
    clientName: "PT Medika Prima Sejahtera (Klinik Utama)",
    clientPic: "drg. Hendra Pratama, Sp.Ort",
    clientEmail: "admin@medikaprima.co.id",
    contractValue: 98000000,
    currency: "IDR",
    status: "Closing/Won",
    templateType: "pos_system",
    scopeNotes: "Sistem rekam medis digital odontogram interaktif, pendaftaran reservasi pasien online, kasir farmasi obat, dan integrasi SatuSehat Kemenkes.",
    paymentTerms: "Termin 1 (30% DP Rp 29.400.000), Termin 2 (40% UAT Rp 39.200.000), Termin 3 (30% Handover Rp 29.400.000)",
    closedDate: "2026-10-21"
  },
  {
    id: "deal-crm-b2b",
    dealCode: "DEAL-B2B-01",
    title: "Marketplace B2B Material Bangunan & Multi-Gudang",
    clientName: "PT Semen Nusantara Konstruksi",
    clientPic: "Bpk. Victor Haryanto",
    clientEmail: "procurement@nusantarakonstruksi.com",
    contractValue: 245000000,
    currency: "IDR",
    status: "Negosiasi",
    templateType: "ecommerce_platform",
    scopeNotes: "Katalog grosir semen & baja, sistem kredit tenor tempo (TOP 30/60 Hari), dan sinkronisasi multi-gudang logistik armada ekspedisi.",
    paymentTerms: "Termin 1 (30% DP Rp 73.500.000), Termin 2 (40% UAT Rp 98.000.000), Termin 3 (30% Handover Rp 73.500.000)"
  }
];
const INITIAL_INVOICES = [
  {
    id: "inv-lib-101",
    invoiceNumber: "INV/2026/10/LIB-001",
    projectId: "proj-perpustakaan",
    clientName: "Universitas Nusantara Cendekia (Perpustakaan Pusat)",
    type: "Milestone Termin",
    issueDate: "2026-10-18",
    dueDate: "2026-11-01",
    items: [
      {
        id: "item-lib-1",
        description: "Termin 1: Down Payment (30%) Inisialisasi Microservices & Git",
        hoursOrUnits: 1,
        ratePerUnit: 555e5,
        amount: 555e5
      }
    ],
    subtotal: 555e5,
    discount: 0,
    taxPpn: 6105e3,
    totalAmount: 61605e3,
    status: "Lunas",
    notes: "Terima kasih atas kerja sama Universitas Nusantara Cendekia.",
    bankAccount: {
      bankName: "Bank Central Asia (BCA)",
      accountNumber: "883-091-2391",
      accountHolder: "PT Digital Manjer Solusindo"
    }
  },
  {
    id: "inv-101",
    invoiceNumber: "INV/2026/10/POS-001",
    projectId: "proj-1",
    clientName: "PT Kopi Kenangan Nusantara",
    type: "Maintenance Berkala",
    issueDate: "2026-10-14",
    dueDate: "2026-10-28",
    items: [
      {
        id: "item-1",
        taskId: "task-105",
        description: "Perbaikan bug struk diskon membership (POS-105)",
        hoursOrUnits: 2.5,
        ratePerUnit: 35e4,
        amount: 875e3
      },
      {
        id: "item-2",
        taskId: "task-106",
        description: "Pemeliharaan rutin database Postgres & Indexing (POS-106)",
        hoursOrUnits: 4,
        ratePerUnit: 35e4,
        amount: 14e5
      },
      {
        id: "item-3",
        description: "Biaya Retainer Cloud Monitoring & Sentry Alerting Periode Okt 2026",
        hoursOrUnits: 1,
        ratePerUnit: 5e6,
        amount: 5e6
      }
    ],
    subtotal: 7275e3,
    discount: 0,
    taxPpn: 800250,
    // 11%
    totalAmount: 8075250,
    status: "Disetujui PM",
    notes: "Pembayaran mohon ditransfer dalam waktu 14 hari kalender setelah tanggal invoice.",
    bankAccount: {
      bankName: "Bank Central Asia (BCA)",
      accountNumber: "883-091-2391",
      accountHolder: "PT Digital Manjer Solusindo"
    }
  },
  {
    id: "inv-ftsl-101",
    invoiceNumber: "INV/2026/10/FTSL-001",
    projectId: "proj-futsal",
    clientName: "PT Champion Arena Nusantara (Arena Futsal Pro)",
    type: "Milestone Termin",
    issueDate: "2026-10-16",
    dueDate: "2026-10-30",
    items: [
      {
        id: "item-ftsl-1",
        description: "Termin 1: Down Payment (50%) Kick-off & Inisialisasi Sistem Booking Lapangan Futsal",
        hoursOrUnits: 1,
        ratePerUnit: 26e6,
        amount: 26e6
      }
    ],
    subtotal: 26e6,
    discount: 0,
    taxPpn: 286e4,
    totalAmount: 2886e4,
    status: "Lunas",
    notes: "Terima kasih atas kerja sama Champion Arena Futsal Pro.",
    bankAccount: {
      bankName: "Bank Central Asia (BCA)",
      accountNumber: "883-091-2391",
      accountHolder: "PT Digital Manjer Solusindo"
    }
  }
];
const INITIAL_EVENTS = [
  {
    id: "ev-1",
    taskId: "task-104",
    actor: "Sentry Webhook",
    actorRole: "System",
    eventType: "created",
    fromValue: "",
    toValue: "Baru",
    payload: "Event ID 9fa2c109 terdeteksi dengan frekuensi 14x dalam 15 menit",
    timestamp: "2026-10-14T09:12:00Z"
  },
  {
    id: "ev-2",
    taskId: "task-104",
    actor: "Claude Code Agent",
    actorRole: "Service Account",
    eventType: "ai_analysis",
    fromValue: "Baru",
    toValue: "Dianalisis",
    payload: "Kategori: Low (Keyakinan: 94%). Root cause: Missing zero guard in taxEngine.ts",
    timestamp: "2026-10-14T09:13:30Z"
  },
  {
    id: "ev-3",
    taskId: "task-104",
    actor: "Claude Code Agent",
    actorRole: "Service Account",
    eventType: "pr_created",
    fromValue: "Dianalisis",
    toValue: "Menunggu Persetujuan",
    payload: "Buka PR #42 pada branch ai/fix-pos-104-tax-zero-division. 4 unit tests PASS.",
    timestamp: "2026-10-14T09:16:15Z"
  }
];
const INITIAL_COMMENTS = [
  {
    id: "comm-1",
    taskId: "task-104",
    author: "Claude Code Agent",
    authorRole: "AI Agent",
    body: "Automated patch created. Minimal diff 5 lines added in taxEngine.ts. All existing tax test suites are green.",
    isInternal: false,
    createdAt: "2026-10-14T09:16:20Z"
  },
  {
    id: "comm-2",
    taskId: "task-104",
    author: "Arya Pratama",
    authorRole: "Project Manager",
    body: "Bagus Wicaksono tolong review PR #42 ini ya, pastikan aman untuk outlet Kopi Kenangan Mall Kelapa Gading yang sering promo.",
    isInternal: true,
    createdAt: "2026-10-14T10:05:00Z"
  },
  {
    id: "comm-lib-1",
    taskId: "task-lib-102",
    authorId: "user-pm",
    author: "Asisyah",
    authorName: "Asisyah",
    authorRole: "Project Manajer",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    body: "Jaka, pastikan Redis atomic lock sirkulasi buku memiliki TTL maksimal 10 detik agar terhindar dari deadlock jika terjadi spike peminjaman bersamaan.",
    text: "Jaka, pastikan Redis atomic lock sirkulasi buku memiliki TTL maksimal 10 detik agar terhindar dari deadlock jika terjadi spike peminjaman bersamaan.",
    isInternal: true,
    createdAt: "2026-10-18T10:15:00Z"
  },
  {
    id: "comm-lib-2",
    taskId: "task-lib-102",
    authorId: "user-dev-3",
    author: "Jaka",
    authorName: "Jaka",
    authorRole: "Backend Dev",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    body: "Siap Bu Asisyah, saya sudah konfigurasi Redis mutex key dengan token uuid dan auto-release saat response dikembalikan ke client.",
    text: "Siap Bu Asisyah, saya sudah konfigurasi Redis mutex key dengan token uuid dan auto-release saat response dikembalikan ke client.",
    isInternal: true,
    createdAt: "2026-10-18T11:30:00Z"
  }
];
const INITIAL_RULES = [
  {
    id: "rule-1",
    name: "Notifikasi Cepat Telegram Bot untuk Bug Hotfix",
    trigger: "Ketika task baru dibuat dengan priority = Hotfix",
    condition: "Tipe = Bug dan Source = Sentry / Web / Telegram Bot",
    action: "Kirim alert ringkas ke grup Telegram Developer On-Call (@ProjectManjerBot) & tandai di Dashboard",
    isActive: true
  },
  {
    id: "rule-2",
    name: "Otomasi Deploy Staging Saat PR AI Disetujui",
    trigger: 'Ketika status PR berubah menjadi "Disetujui"',
    condition: "Diff lolos lint dan status check CI hijau",
    action: "Trigger GitHub Actions workflow deploy-staging.yml & ubah status ke Deploy Staging",
    isActive: true
  },
  {
    id: "rule-3",
    name: "Proteksi Auto-Rollback jika Error Pasca-Deploy Melonjak",
    trigger: "Monitoring jendela 30 menit pasca deploy production",
    condition: "Tingkat error Sentry naik > 2.0% dari baseline",
    action: 'Eksekusi rollback instan ke commit sebelumnya, kembalikan task ke "Perlu Manual", dan notifikasi PM',
    isActive: true
  },
  {
    id: "rule-4",
    name: "Auto-Bill Task Maintenance Selesai ke Draft Invoice",
    trigger: 'Ketika task tipe Maintenance berstatus "Selesai"',
    condition: "Project memiliki kontrak maintenance aktif",
    action: "Tambahkan jam pengerjaan ke draft invoice bulanan klien",
    isActive: true
  }
];
export {
  INITIAL_COMMENTS,
  INITIAL_CRM_DEALS,
  INITIAL_EPICS,
  INITIAL_EVENTS,
  INITIAL_INVOICES,
  INITIAL_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_RULES,
  INITIAL_SPRINTS,
  INITIAL_TASKS
};
