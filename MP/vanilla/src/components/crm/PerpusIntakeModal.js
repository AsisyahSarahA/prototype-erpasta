/**
 * PerpusIntakeModal Component (100% Native Vanilla JS ES Module)
 * Complete 1:1 parity with Next.js PerpusIntakeModal.tsx:
 * - 5 Comprehensive Tabs:
 *   1. 6 Tahapan Alur Penerimaan (Langkah 01 s/d 06)
 *   2. Semua 7 Modul & Fitur Rinci (Interactive selector with full tech stack & deliverables)
 *   3. Pembagian 5 Role Tim (Jaka, Aldyana, Azi, Parhan, Asisyah)
 *   4. Arsitektur Teknis Microservices (Traefik, PostgreSQL, Redis Atomic Mutex Lock, Docker, Sentry, WA Bot)
 *   5. Kontrak, Termin & SLA (DP 30%, Termin 40%, Pelunasan 30%, Garansi 12 Bulan)
 * - Direct navigation to Kanban Board & Wizard Konversi CRM
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class PerpusIntakeModal {
  constructor(options = {}) {
    this.container = document.createElement('div');
    this.container.className = 'modal-backdrop';

    this.onNavigateToProject = options.onNavigateToProject || (() => {});
    this.onOpenConvertDeal = options.onOpenConvertDeal || null;

    this.isOpen = false;
    this.activeTab = 'stages'; // 'stages' | 'modules' | 'roles' | 'architecture' | 'contract'
    this.selectedModuleIdx = 0;

    // 6 Tahapan Alur Penerimaan CRM
    this.stages = [
      {
        step: '01',
        title: 'Deal Won & Closing CRM',
        subtitle: 'Kualifikasi Kebutuhan & Kesepakatan Kontrak',
        icon: 'dollarSign',
        badgeColor: 'background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;',
        description: 'PIC Kampus (Kepala Perpustakaan Dra. Hj. Ratna Wulandari) menyetujui penawaran kontrak Rp 185 Juta dengan arsitektur microservices terdistribusi. Deal status berubah menjadi Closing/Won di sistem CRM.',
        deliverables: [
          'Dokumen Kontrak Fixed Price (Rp 185.000.000)',
          'Kesepakatan Termin 30% - 40% - 30%',
          'Garansi sistem 12 bulan (hingga Oktober 2027)'
        ],
        actor: 'Account Executive & Client PIC'
      },
      {
        step: '02',
        title: 'Technical Scoping & Arsitektur Microservices',
        subtitle: 'Decoupling Monolith ke Service Terisolasi',
        icon: 'cpu',
        badgeColor: 'background: #eef2ff; color: #4338ca; border-color: #c7d2fe;',
        description: 'Lead Architect & PM memetakan kebutuhan kampus menjadi 2 microservice backend Laravel 11 (Katalog & Sirkulasi), 2 portal frontend React 19 (OPAC Mahasiswa & Kasir Petugas), serta 1 Reverse Proxy Gateway.',
        deliverables: [
          'Arsitektur Domain-Driven Design (DDD)',
          'Spesifikasi Kontrak REST API (OpenAPI 3.1)',
          'Redis Atomic Lock untuk sirkulasi buku'
        ],
        actor: 'Asisyah (PM) & Azi (Fullstack/Lead)'
      },
      {
        step: '03',
        title: 'Otomasi GitHub Provisioning & Branch Per Modul',
        subtitle: 'Multi-Branch Git Workflow Otomatis',
        icon: 'gitBranch',
        badgeColor: 'background: #faf5ff; color: #7e22ce; border-color: #e9d5ff;',
        description: 'Webhook konversi CRM otomatis menginisialisasi repository GitHub dan membuat 5 isolated feature branch yang ditugaskan ke masing-masing developer sesuai spesialisasinya.',
        deliverables: [
          'Repo: github.com/softwarehouse/perpustakaan-digital-microservices',
          'Branch feature/katalog-microservice (Laravel 11)',
          'Branch feature/react-portal-opac (React 19)',
          'Branch feature/api-gateway-docker (Traefik)'
        ],
        actor: 'GitHub CI/CD Automation Webhook'
      },
      {
        step: '04',
        title: 'Otomasi Backlog Generation & Alokasi 5 Role',
        subtitle: 'Injeksi User Stories & Workload Balancing',
        icon: 'layers',
        badgeColor: 'background: #fffbeb; color: #b45309; border-color: #fde68a;',
        description: 'Sistem men-generate 27 user story dan task teknis lengkap dengan kriteria penerimaan (Acceptance Criteria), estimasi jam, bobot story point, dan langsung mendarat di Sprint 1 Backlog.',
        deliverables: [
          'Jaka (Backend): 3 task arsitektur DB & sirkulasi (64 jam)',
          'Aldyana (Frontend): 3 task OPAC & scanner barcode (62 jam)',
          'Parhan (QA): 2 task security pentest & matrix testing (30 jam)',
          'Asisyah (PM): 3 task tata kelola & UAT rektorat (34 jam)',
          'Azi (Fullstack): 2 task gateway Docker & logging (34 jam)'
        ],
        actor: 'Asisyah (PM) & AI Backlog Synthesizer'
      },
      {
        step: '05',
        title: 'Eksekusi Sprint, CI/CD Docker & Testing QA',
        subtitle: 'Siklus Pengerjaan 14 Hari & Verifikasi Staging',
        icon: 'terminal',
        badgeColor: 'background: #ecfdf5; color: #047857; border-color: #a7f3d0;',
        description: 'Developer melakukan commit ke branch masing-masing. GitHub Actions menjalankan unit test PHPUnit, build Docker container, dan deploy preview ke staging server untuk diuji oleh QA Parhan dengan K6 stress test.',
        deliverables: [
          'Pull Request Review & Linting Otomatis',
          'Load Test K6 lolos 2.000 concurrent RPS',
          'QA Sign-Off verifikasi Staging lulus 100%'
        ],
        actor: 'Jaka, Aldyana, Azi, & Parhan (QA)'
      },
      {
        step: '06',
        title: 'UAT Rektorat, Go-Live & Penagihan Termin',
        subtitle: 'Serah Terima Resmi & Aktivasi Garansi',
        icon: 'award',
        badgeColor: 'background: #f0fdfa; color: #0f766e; border-color: #99f6e4;',
        description: 'Presentasi UAT di hadapan Kepala Perpustakaan & Tim IT Rektorat. Setelah Berita Acara UAT ditandatangani, branch di-merge ke main, aplikasi go-live, dan invoice Termin 2 & 3 diterbitkan ke Finance.',
        deliverables: [
          'Berita Acara Serah Terima (BAST) Kampus',
          'Invoice Termin 2 (40%) & Termin 3 (30%) Terbit',
          'Aktivasi Kuota Pemeliharaan 25 Jam & Garansi 12 Bulan'
        ],
        actor: 'Asisyah (PM) & Finance Accounting'
      }
    ];

    // 7 Modul Lengkap Aplikasi Perpustakaan Digital
    this.modules = [
      {
        code: 'LIB-EPIC-1',
        title: 'Microservice Katalog Buku, Pengarang & ISBN',
        badge: 'Laravel 11 Backend API',
        badgeColor: 'background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;',
        assignee: 'Jaka',
        assigneeRole: 'Backend Dev',
        estimate: '24 Jam',
        stack: ['Laravel 11', 'PostgreSQL 16', 'Redis Cache', 'ISBN-13 Validator'],
        description: 'Microservice mandiri yang mengelola data master buku, entitas pengarang, penerbit, nomor panggil DDC (Dewey Decimal Classification), dan metadata cover buku.',
        features: [
          {
            name: 'Skema Database PostgreSQL E-Catalog',
            detail: 'Tabel books, authors, book_copies, categories, dan index full-text tsvector pada judul dan nama pengarang.'
          },
          {
            name: 'Validasi Algoritma Checksum ISBN-13',
            detail: 'Validasi ketat 13 digit angka standar perpustakaan nasional via FormRequest Laravel.'
          },
          {
            name: 'Redis Cache Layer Katalog Populer (TTL 1 Jam)',
            detail: 'Penyimpanan cache query daftar buku trending untuk respon API super cepat (< 25ms).'
          },
          {
            name: 'RESTful Resource API Endpoints',
            detail: 'Endpoint GET /api/v1/books, GET /api/v1/books/{id}, POST /api/v1/books dengan pagination cursor.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-2',
        title: 'Portal Katalog Pencarian OPAC & Detail Buku',
        badge: 'React 19 SPA Frontend',
        badgeColor: 'background: #ecfeff; color: #0e7490; border: 1px solid #a5f3fc;',
        assignee: 'Aldyana',
        assigneeRole: 'Frontend Dev',
        estimate: '26 Jam',
        stack: ['React 19', 'Vanilla CSS', 'Native Fetch', 'Lucide Icons'],
        description: 'Portal publik Online Public Access Catalog (OPAC) yang diakses mahasiswa melalui browser desktop, tablet kampus, maupun smartphone untuk mencari dan memesan buku.',
        features: [
          {
            name: 'Pencarian Instan Debounced Full-Text',
            detail: 'Pencarian judul/pengarang dengan auto-suggest keyword 300ms tanpa reload halaman.'
          },
          {
            name: 'Filter Multi-Faset (Kategori, Tahun, Bahasa)',
            detail: 'Sidebar filter interaktif dengan visualisasi tag chip aktif dan reset otomatis.'
          },
          {
            name: 'Visualisasi Status Ketersediaan & Lokasi Rak',
            detail: 'Badge status "Tersedia di Rak A-04" atau "Sedang Dipinjam (Kembali 24 Okt)" dengan warna kontras.'
          },
          {
            name: 'Halaman Detail Buku & Preview Sinopsis',
            detail: 'Informasi komprehensif buku: nomor DDC, sinopsis, daftar cetakan, dan tombol Booking/Reservasi.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-3',
        title: 'Microservice Sirkulasi Peminjaman & Engine Denda',
        badge: 'Laravel 11 Backend API',
        badgeColor: 'background: #fffbeb; color: #b45309; border: 1px solid #fde68a;',
        assignee: 'Jaka',
        assigneeRole: 'Backend Dev',
        estimate: '28 Jam',
        stack: ['Laravel 11', 'Redis Atomic Mutex', 'Laravel Scheduler', 'Postgres Transaction'],
        description: 'Jantung transaksi sirkulasi perpustakaan: mencatat transaksi peminjaman buku, batas durasi pinjam 7 hari, pengembalian, perpanjangan, dan sanksi denda keterlambatan.',
        features: [
          {
            name: 'Redis Atomic Distributed Lock (Anti Double-Borrow)',
            detail: 'Mencegah kondisi race condition jika 2 mahasiswa meminjam 1 eksemplar buku tersisa secara bersamaan.'
          },
          {
            name: 'Validasi Kuota Peminjaman (Maksimal 3 Buku)',
            detail: 'Pengecekan otomatis limit pinjaman mahasiswa dan blokir jika ada denda belum lunas > Rp 20.000.'
          },
          {
            name: 'Engine Kalkulasi Denda Keterlambatan Rp 2.000/Hari',
            detail: 'Cron scheduler otomatis berjalan setiap malam jam 00:01 WIB menghitung denda per hari telat.'
          },
          {
            name: 'Log Audit Transaksi & Riwayat Eksemplar',
            detail: 'Pencatatan riwayat siapa peminjam buku, tanggal pinjam, tanggal kembali, dan nama petugas jaga.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-4',
        title: 'Meja Sirkulasi Petugas & Dashboard Mahasiswa',
        badge: 'React 19 SPA Frontend',
        badgeColor: 'background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe;',
        assignee: 'Aldyana',
        assigneeRole: 'Frontend Dev',
        estimate: '22 Jam',
        stack: ['React 19', 'Barcode Scanner API', 'Thermal ESC/POS', 'State Store'],
        description: 'Antarmuka khusus petugas meja sirkulasi perpustakaan untuk memproses peminjaman/pengembalian kilat via barcode scanner serta portal mandiri mahasiswa.',
        features: [
          {
            name: 'Scanner Barcode Cepat (Kartu Mahasiswa & Buku)',
            detail: 'Input keyboard-wedge barcode scanner 1D/2D instan dengan validasi bunyi beep konfirmasi.'
          },
          {
            name: 'Cetak Bukti Peminjaman Slip Thermal 58mm',
            detail: 'Format cetak kuitansi thermal ringkas mencantumkan tanggal batas pengembalian buku.'
          },
          {
            name: 'Dashboard Riwayat & Status Pinjaman Mahasiswa',
            detail: 'Panel akun mahasiswa menampilkan buku aktif, countdown hari tersisa, dan riwayat bebas pustaka.'
          },
          {
            name: 'Modul Cetak Label Barcode Punggung Buku',
            detail: 'Fitur cetak stiker nomor panggil DDC dan barcode buku untuk ditempel pada fisik buku baru.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-5',
        title: 'API Gateway, Docker Containerization & WhatsApp Bot',
        badge: 'Infrastruktur & DevOps (Fullstack)',
        badgeColor: 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;',
        assignee: 'Azi',
        assigneeRole: 'Full stack Dev',
        estimate: '28 Jam',
        stack: ['Traefik Gateway', 'Docker Compose', 'Fonnte/Twilio WA API', 'Prometheus & Grafana'],
        description: 'Infrastruktur orkestrasi terpusat yang menghubungkan seluruh microservices, routing domain, rate limiting, serta notifikasi otomatis WhatsApp pengingat buku.',
        features: [
          {
            name: 'Traefik Reverse Proxy API Gateway & SSL Otomatis',
            detail: 'Routing lalu lintas HTTP/2, SSL Let’s Encrypt, CORS header, dan pemblokiran serangan DDoS.'
          },
          {
            name: 'Multi-Container Docker Compose Orchestrator',
            detail: 'Setup 5 container terisolasi: app-katalog, app-sirkulasi, frontend-react, postgres-db, dan redis-cache.'
          },
          {
            name: 'WhatsApp Reminder Gateway Otomatis H-1 Pengembalian',
            detail: 'Bot WhatsApp otomatis mengirimkan pesan santun pengingat H-1 sebelum buku jatuh tempo jam 08.00 WIB.'
          },
          {
            name: 'Observability & Monitoring Grafana/Prometheus',
            detail: 'Monitoring real-time traffic RPS, database latency p99, dan alert bot Telegram jika ada service down.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-6',
        title: 'Test Matrix Sirkulasi, K6 Load Testing & QA Sign-Off',
        badge: 'Quality Assurance & Security',
        badgeColor: 'background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;',
        assignee: 'Parhan',
        assigneeRole: 'QA Engineer',
        estimate: '20 Jam',
        stack: ['K6 Load Test', 'Playwright E2E', 'OWASP ZAP', 'PHPUnit Test Matrix'],
        description: 'Rangkaian pengujian jaminan kualitas menyeluruh: dari pengujian fungsional sirkulasi, uji beban konkurensi tinggi, audit keamanan, hingga verifikasi cross-browser.',
        features: [
          {
            name: 'Stress Test K6 (2.000 Concurrent Requests/Sec)',
            detail: 'Simulasi lonjakan traffic mahasiswa saat jam buka perpustakaan dengan target response time < 200ms.'
          },
          {
            name: 'Security Pentest: SQL Injection Guard & Rate Limiter',
            detail: 'Audit keamanan OWASP Top 10 pada endpoint pencarian OPAC dan mekanisme sanitasi query.'
          },
          {
            name: 'Cross-Browser Matrix Testing (Safari, Chrome, Firefox)',
            detail: 'Verifikasi render layout responsif di desktop Mac/Windows, iPad meja baca, dan Android mahasiswa.'
          },
          {
            name: 'Verifikasi Formal QA Sign-Off Staging Gatekeeper',
            detail: 'Pemeriksaan checklist 32 kriteria penerimaan sebelum kode diizinkan merge ke production.'
          }
        ]
      },
      {
        code: 'LIB-EPIC-7',
        title: 'Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek',
        badge: 'Project Management & Governance',
        badgeColor: 'background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;',
        assignee: 'Asisyah',
        assigneeRole: 'Project Manajer',
        estimate: '14 Jam',
        stack: ['Scrum Sprint Planning', 'UAT Acceptance Sign-Off', 'RACI Matrix', 'Finance Invoicing'],
        description: 'Tata kelola proyek perangkat lunak profesional: memimpin sprint planning, koordinasi stakeholder kampus, mitigasi risiko integrasi, dan penagihan termin finansial.',
        features: [
          {
            name: 'Sprint Planning & Breakdown User Story',
            detail: 'Penyusunan alokasi kapasitas jam kerja 5 engineer dan penentuan Definition of Done (DoD).'
          },
          {
            name: 'Rapat Kickoff & Berita Acara Scope of Work (SOW)',
            detail: 'Penyelarasan kebutuhan bersama Kepala Perpustakaan & Tim Puskom IT Kampus.'
          },
          {
            name: 'Sesi UAT (User Acceptance Testing) Bersama Pustakawan',
            detail: 'Pendampingan uji coba langsung petugas perpustakaan di meja sirkulasi kampus.'
          },
          {
            name: 'Verifikasi Termin Finansial & Handover Berita Acara',
            detail: 'Penerbitan faktur tagihan Termin 1, 2, dan 3 sesuai capaian milestone yang disepakati.'
          }
        ]
      }
    ];

    // 5 Role Tim Roster
    this.teamRoster = [
      {
        id: 'user-dev-3',
        name: 'Jaka',
        role: 'Backend Dev',
        badge: 'Laravel & Database Specialist',
        avatar: 'JK',
        avatarBg: 'background: #0284c7;',
        allocatedHours: 52,
        assignedEpics: ['LIB-EPIC-1 (Katalog Buku)', 'LIB-EPIC-3 (Engine Sirkulasi & Denda)'],
        focus: 'Mengembangkan REST API Laravel 11, migrasi PostgreSQL, Redis distributed lock, dan cron scheduler denda keterlambatan.'
      },
      {
        id: 'user-dev-2',
        name: 'Aldyana',
        role: 'Frontend Dev',
        badge: 'React & UI/UX Specialist',
        avatar: 'AL',
        avatarBg: 'background: #0891b2;',
        allocatedHours: 48,
        assignedEpics: ['LIB-EPIC-2 (Portal OPAC)', 'LIB-EPIC-4 (Meja Sirkulasi Barcode)'],
        focus: 'Membangun portal pencarian OPAC debounced, visualisasi rak buku, antarmuka kasir scanner barcode, dan cetak slip thermal 58mm.'
      },
      {
        id: 'user-dev-1',
        name: 'Azi',
        role: 'Full stack',
        badge: 'DevOps, Gateway & Fullstack',
        avatar: 'AZ',
        avatarBg: 'background: #4f46e5;',
        allocatedHours: 46,
        assignedEpics: ['LIB-EPIC-5 (API Gateway, Docker & WhatsApp)'],
        focus: 'Mengonfigurasi Traefik reverse proxy, orchestrator Docker Compose multi-service, gateway bot WhatsApp, dan dashboard Grafana.'
      },
      {
        id: 'user-qa',
        name: 'Parhan',
        role: 'QA',
        badge: 'Quality Assurance & Pentester',
        avatar: 'PR',
        avatarBg: 'background: #e11d48;',
        allocatedHours: 34,
        assignedEpics: ['LIB-EPIC-6 (Test Matrix & K6 Load Testing)'],
        focus: 'Membuat script K6 load test 2.000 RPS, uji penetrasi keamanan SQLi pada OPAC, pengujian cross-browser, dan sertifikasi QA Sign-Off.'
      },
      {
        id: 'user-pm',
        name: 'Asisyah',
        role: 'Project Manajer',
        badge: 'PM & Agile Scrum Master',
        avatar: 'AS',
        avatarBg: 'background: #059669;',
        allocatedHours: 34,
        assignedEpics: ['LIB-EPIC-7 (Tata Kelola Sprint & UAT Rektorat)'],
        focus: 'Memimpin sprint grooming, koordinasi stakeholder rektorat kampus, manajemen risiko API SSO, dan validasi dokumen termin pembayaran.'
      }
    ];

    this.init();
  }

  init() {
    this.render();

    // Backdrop click
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.container.classList.add('modal-backdrop--open');
    this.render();
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('modal-backdrop--open');
    this.container.innerHTML = '';
  }

  getElement() {
    return this.container;
  }

  render() {
    if (!this.isOpen) {
      this.container.innerHTML = '';
      return;
    }

    const state = store.getState();
    const perpusProject = (state.projects || []).find(p => p.id === 'proj-perpustakaan' || p.code === 'LIB-DIG');

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--detail" style="max-width: 1040px;">
        <!-- Header -->
        <div class="modal-header" style="background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
              <i class="fi fi-rr-book-alt" style="font-size: 20px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
                  Alur Penerimaan CRM: Sistem Perpustakaan Digital Kampus
                </h2>
                <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                  Laravel Microservices &amp; React 19 SPA
                </span>
                <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 6px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;">
                  LIB-DIG
                </span>
              </div>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">
                Panduan komprehensif alur penerimaan dari closing CRM, technical scoping, GitHub provisioning, alokasi 5 role tim, hingga UAT.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            ${perpusProject ? `
              <button id="perpusOpenBoardTopBtn" class="finance-btn-primary" style="padding: 6px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 6px;">
                <span>Buka Proyek Perpus di Board</span>
                ${Icons.arrowRight('', 12)}
              </button>
            ` : ''}
            <button id="closePerpusModalBtn" class="modal-header__close-btn" title="Tutup (Esc)">
              ${Icons.x('', 16)}
            </button>
          </div>
        </div>

        <!-- Linear Navigation Tabs -->
        <div style="display: flex; gap: 4px; padding: 0 20px; border-bottom: 1px solid #e2e8f0; background: white; overflow-x: auto; font-size: 12px; font-weight: 600;">
          <button class="perpus-tab-btn ${this.activeTab === 'stages' ? 'active' : ''}" data-tab="stages" style="padding: 12px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'stages' ? '#0f172a' : 'transparent'}; color: ${this.activeTab === 'stages' ? '#0f172a' : '#64748b'}; display: flex; align-items: center; gap: 6px;">
            ${Icons.workflow('', 14)}
            <span>1. Alur 6 Tahapan Penerimaan</span>
          </button>
          <button class="perpus-tab-btn ${this.activeTab === 'modules' ? 'active' : ''}" data-tab="modules" style="padding: 12px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'modules' ? '#0f172a' : 'transparent'}; color: ${this.activeTab === 'modules' ? '#0f172a' : '#64748b'}; display: flex; align-items: center; gap: 6px;">
            ${Icons.layers('', 14)}
            <span>2. Semua 7 Modul &amp; Fitur Rinci (${this.modules.length})</span>
          </button>
          <button class="perpus-tab-btn ${this.activeTab === 'roles' ? 'active' : ''}" data-tab="roles" style="padding: 12px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'roles' ? '#0f172a' : 'transparent'}; color: ${this.activeTab === 'roles' ? '#0f172a' : '#64748b'}; display: flex; align-items: center; gap: 6px;">
            ${Icons.users('', 14)}
            <span>3. Pembagian 5 Role Tim (${this.teamRoster.length})</span>
          </button>
          <button class="perpus-tab-btn ${this.activeTab === 'architecture' ? 'active' : ''}" data-tab="architecture" style="padding: 12px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'architecture' ? '#0f172a' : 'transparent'}; color: ${this.activeTab === 'architecture' ? '#0f172a' : '#64748b'}; display: flex; align-items: center; gap: 6px;">
            ${Icons.server('', 14)}
            <span>4. Arsitektur Microservices</span>
          </button>
          <button class="perpus-tab-btn ${this.activeTab === 'contract' ? 'active' : ''}" data-tab="contract" style="padding: 12px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'contract' ? '#0f172a' : 'transparent'}; color: ${this.activeTab === 'contract' ? '#0f172a' : '#64748b'}; display: flex; align-items: center; gap: 6px;">
            ${Icons.dollarSign('', 14)}
            <span>5. Kontrak, Termin &amp; SLA</span>
          </button>
        </div>

        <!-- Tab Body Content -->
        <div style="flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc;">
          ${this.renderTabContent()}
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid #e2e8f0; background: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 9999px; background: #10b981;"></span>
            <span>Sistem CRM terhubung dengan Backlog, Kanban Board &amp; GitHub Actions</span>
          </div>

          <div style="display: flex; gap: 8px;">
            ${perpusProject ? `
              <button id="perpusOpenBoardBottomBtn" class="finance-btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;">
                <span>Lihat Proyek Perpustakaan di Kanban</span>
                ${Icons.arrowRight('', 14)}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.attachEvents(perpusProject);
  }

  renderTabContent() {
    if (this.activeTab === 'stages') {
      return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="background: white; border-radius: 14px; padding: 14px 18px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
                SOP Penerimaan Standar Software House (Linear / Vercel Grade)
              </div>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">
                Dari penutupan negosiasi penjualan di CRM hingga serah terima UAT aplikasi perpustakaan kampus.
              </p>
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
              Total Siklus: 2 Sprint (28 Hari)
            </span>
          </div>

          <!-- Step cards grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            ${this.stages.map(st => `
              <div style="background: white; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid; ${st.badgeColor}">
                      Langkah ${st.step}
                    </span>
                    <div style="padding: 6px; border-radius: 8px; background: #f1f5f9; color: #475569;">
                      ${Icons[st.icon] ? Icons[st.icon]('', 14) : Icons.fileText('', 14)}
                    </div>
                  </div>

                  <div>
                    <h4 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${st.title}</h4>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px;">${st.subtitle}</div>
                  </div>

                  <p style="font-size: 11px; color: #475569; line-height: 1.5; margin: 0;">
                    ${st.description}
                  </p>
                </div>

                <div style="padding-top: 12px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Deliverable Utama:</div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${st.deliverables.map(d => `
                      <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: #334155;">
                        <i class="fi fi-rr-check" style="color: #059669; font-weight: bold; margin-top: 2px;"></i>
                        <span>${d}</span>
                      </div>
                    `).join('')}
                  </div>
                  <div style="font-size: 10px; font-family: var(--font-mono); color: #64748b; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 4px;">
                    PIC: ${st.actor}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'modules') {
      const curr = this.modules[this.selectedModuleIdx] || this.modules[0];
      return `
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px;">
          <!-- Left Module Selector List -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; padding-left: 4px; margin-bottom: 2px;">
              Daftar 7 Modul Terdistribusi:
            </div>
            ${this.modules.map((m, idx) => {
              const isSelected = this.selectedModuleIdx === idx;
              return `
                <button class="perpus-module-item-btn" data-module-idx="${idx}" style="text-align: left; padding: 12px 14px; border-radius: 12px; border: 1px solid ${isSelected ? '#0f172a' : '#e2e8f0'}; background: ${isSelected ? 'white' : 'rgba(255,255,255,0.7)'}; cursor: pointer; transition: all 0.15s ease; box-shadow: ${isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'};">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;">
                      ${m.code}
                    </span>
                    <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; ${m.badgeColor}">
                      ${m.badge}
                    </span>
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                    ${m.title}
                  </div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 4px; display: flex; gap: 8px;">
                    <span>Assignee: <strong style="color: #0f172a;">${m.assignee}</strong> (${m.assigneeRole})</span>
                    <span>·</span>
                    <span style="font-family: var(--font-mono);">${m.estimate}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Right Module Detail -->
          <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0;">
                    ${curr.code}
                  </span>
                  <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; ${curr.badgeColor}">
                    ${curr.badge}
                  </span>
                </div>
                <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
                  ${curr.title}
                </h3>
              </div>

              <div style="display: flex; gap: 6px;">
                <div style="padding: 4px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; font-size: 11px; font-family: var(--font-mono); font-weight: 600;">
                  ${curr.estimate}
                </div>
                <div style="padding: 4px 8px; border-radius: 6px; background: #0f172a; color: white; font-size: 11px; font-weight: 600;">
                  ${curr.assignee} (${curr.assigneeRole})
                </div>
              </div>
            </div>

            <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">
              ${curr.description}
            </p>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Komponen &amp; Teknologi:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${curr.stack.map(st => `
                  <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;">
                    ${st}
                  </span>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 4px;">
              <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                ${Icons.checkSquare('', 14)}
                <span>Fitur-Fitur &amp; Spesifikasi Teknis:</span>
              </span>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${curr.features.map(f => `
                  <div style="background: #f8fafc; border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                      <span style="width: 6px; height: 6px; border-radius: 9999px; background: #2563eb;"></span>
                      <span>${f.name}</span>
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 12px; line-height: 1.4;">
                      ${f.detail}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'roles') {
      return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="background: white; border-radius: 14px; padding: 14px 18px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
                Matriks Distribusi Beban Kerja 5 Anggota Tim Software House
              </div>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">
                Alokasi tugas spesifik tanpa tumpang tindih untuk kelancaran sprint release.
              </p>
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;">
              Total: 214 Jam Kerja
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${this.teamRoster.map(m => `
              <div style="background: white; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; ${m.avatarBg} color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px;">
                      ${m.avatar}
                    </div>
                    <div>
                      <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${m.name}</div>
                      <div style="font-size: 11px; color: #64748b;">${m.role}</div>
                    </div>
                  </div>

                  <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; align-self: flex-start;">
                    ${m.badge}
                  </span>

                  <p style="font-size: 11px; color: #475569; line-height: 1.5; margin: 0;">
                    ${m.focus}
                  </p>
                </div>

                <div style="padding-top: 12px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Modul Tanggung Jawab:</div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${m.assignedEpics.map(ep => `
                      <div style="font-size: 10px; font-family: var(--font-mono); color: #334155; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        ${ep}
                      </div>
                    `).join('')}
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; padding-top: 4px;">
                    <span style="color: #64748b;">Estimasi Sprint 1:</span>
                    <strong style="font-family: var(--font-mono); color: #0f172a;">${m.allocatedHours} Jam</strong>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'architecture') {
      return `
        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 18px;">
          <div>
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
              Topologi Arsitektur Terdistribusi (Laravel 11 Microservices + React 19)
            </h3>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
              Arsitektur dirancang anti single-point-of-failure (SPOF) dengan pemisahan domain layanan dan database caching.
            </p>
          </div>

          <div style="padding: 24px; border-radius: 14px; background: #09090b; color: #e2e8f0; font-family: var(--font-mono); font-size: 11px; display: flex; flex-direction: column; gap: 20px; overflow-x: auto;">
            <div style="text-align: center; color: #a1a1aa; padding-bottom: 8px; border-bottom: 1px solid #27272a;">
              [CLIENT DEVICES: Mahasiswa OPAC, Meja Petugas Barcode Scanner, Smart Mobile]
            </div>

            <div style="display: flex; justify-content: center;">
              <div style="background: rgba(37,99,235,0.2); border: 1px solid rgba(59,130,246,0.4); color: #93c5fd; padding: 12px 18px; border-radius: 10px; text-align: center; width: 100%; max-width: 550px;">
                <div style="font-weight: 700; color: white;">Traefik Reverse Proxy API Gateway (Port 80/443)</div>
                <div style="font-size: 10px; opacity: 0.85; margin-top: 2px;">SSL Auto-Renewal, CORS, Rate Limiting (100 req/min), Auth JWT Verification</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <!-- Service A -->
              <div style="padding: 14px; border-radius: 10px; background: #18181b; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; color: #38bdf8; font-weight: 700;">
                  <span>SERVICE A: Katalog Buku</span>
                  <span style="font-size: 10px; background: #082f49; padding: 2px 6px; border-radius: 4px; border: 1px solid #0369a1;">Laravel 11 API</span>
                </div>
                <div style="color: #a1a1aa; line-height: 1.5; font-size: 11px;">
                  • Port Internal: 8001<br />
                  • Database: PostgreSQL (Schema: catalog)<br />
                  • Cache: Redis db-0 (TTL 3600s)<br />
                  • Fitur: ISBN Checksum, Metadata Pengarang, DDC
                </div>
              </div>

              <!-- Service B -->
              <div style="padding: 14px; border-radius: 10px; background: #18181b; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; color: #fbbf24; font-weight: 700;">
                  <span>SERVICE B: Sirkulasi &amp; Denda</span>
                  <span style="font-size: 10px; background: #451a03; padding: 2px 6px; border-radius: 4px; border: 1px solid #92400e;">Laravel 11 Engine</span>
                </div>
                <div style="color: #a1a1aa; line-height: 1.5; font-size: 11px;">
                  • Port Internal: 8002<br />
                  • Database: PostgreSQL (Schema: circulation)<br />
                  • Mutex: Redis Distributed Lock (Anti Double-Borrow)<br />
                  • Worker: Laravel Cron Scheduler (Denda Rp 2.000/hari)
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <!-- Frontend -->
              <div style="padding: 14px; border-radius: 10px; background: #18181b; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; color: #22d3ee; font-weight: 700;">
                  <span>FRONTEND: Portal OPAC &amp; Kasir</span>
                  <span style="font-size: 10px; background: #164e63; padding: 2px 6px; border-radius: 4px; border: 1px solid #0891b2;">React 19 SPA</span>
                </div>
                <div style="color: #a1a1aa; line-height: 1.5; font-size: 11px;">
                  • Nginx Static Alpine (Port 3000)<br />
                  • Barcode Scanner Web API &amp; ESC/POS Thermal Print<br />
                  • Debounced Instant Full-text Search (&lt; 50ms)<br />
                  • Offline Fallback Service Worker
                </div>
              </div>

              <!-- Integrasi -->
              <div style="padding: 14px; border-radius: 10px; background: #18181b; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; color: #34d399; font-weight: 700;">
                  <span>INTEGRASI: WA Gateway &amp; Audit</span>
                  <span style="font-size: 10px; background: #064e3b; padding: 2px 6px; border-radius: 4px; border: 1px solid #059669;">Worker Daemon</span>
                </div>
                <div style="color: #a1a1aa; line-height: 1.5; font-size: 11px;">
                  • WhatsApp Fonnte Cloud API (Reminder H-1)<br />
                  • Sentry Error Ingestion envelope pipeline<br />
                  • Prometheus Metric Exporter (RPS &amp; Latency p99)<br />
                  • Grafana Dashboards untuk IT Rektorat
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'contract') {
      return `
        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
              Struktur Komersial, Termin Penagihan &amp; Garansi Pemeliharaan
            </h3>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
              Kontrak disepakati resmi antara PT Agensi Software House dan Universitas Nusantara Cendekia.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Termin 1 (Kick-off &amp; GitHub)</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">Rp 55.500.000</div>
              <span style="align-self: flex-start; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                DP 30% Terbayar
              </span>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; line-height: 1.4;">
                Syarat pencairan: Tanda tangan kontrak, kick-off meeting, dan inisialisasi repository GitHub.
              </p>
            </div>

            <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Termin 2 (Staging &amp; UAT Sign-Off)</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">Rp 74.000.000</div>
              <span style="align-self: flex-start; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">
                Milestone 40%
              </span>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; line-height: 1.4;">
                Syarat pencairan: Selesainya integrasi 7 modul di Staging dan lolos pengujian UAT Pustakawan.
              </p>
            </div>

            <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Termin 3 (Go-Live &amp; Handover)</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">Rp 55.500.000</div>
              <span style="align-self: flex-start; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                Pelunasan 30%
              </span>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; line-height: 1.4;">
                Syarat pencairan: Deployment ke domain resmi kampus dan penyerahan dokumentasi teknis.
              </p>
            </div>
          </div>

          <!-- SLA & Maintenance Guarantee -->
          <div style="padding: 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
              ${Icons.shieldCheck('', 14)}
              <span>Garansi &amp; Service Level Agreement (SLA) Pasca Go-Live:</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; color: #475569;">
              <div><strong>• Durasi Garansi Bug:</strong> 12 Bulan (Hingga Oktober 2027) bebas biaya untuk seluruh bug fungsional.</div>
              <div><strong>• Kuota Maintenance:</strong> 25 Jam / Bulan untuk revisi minor &amp; asistensi pemeliharaan data.</div>
              <div><strong>• SLA Tanggap Kritis (S1):</strong> Maksimal 2 Jam respons dan penyelesaian hotfix dalam 6 jam.</div>
              <div><strong>• Backup Otomatis:</strong> Daily snapshot PostgreSQL ke cold storage terenkripsi S3.</div>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  attachEvents(perpusProject) {
    const closeBtn = this.container.querySelector('#closePerpusModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Top & Bottom Go to Board buttons
    const topBtn = this.container.querySelector('#perpusOpenBoardTopBtn');
    if (topBtn && perpusProject) {
      topBtn.addEventListener('click', () => {
        store.setSelectedProjectId(perpusProject.id);
        this.onNavigateToProject(perpusProject.id);
        this.close();
      });
    }

    const botBtn = this.container.querySelector('#perpusOpenBoardBottomBtn');
    if (botBtn && perpusProject) {
      botBtn.addEventListener('click', () => {
        store.setSelectedProjectId(perpusProject.id);
        this.onNavigateToProject(perpusProject.id);
        this.close();
      });
    }

    // Tab buttons
    this.container.querySelectorAll('.perpus-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Module item click
    this.container.querySelectorAll('.perpus-module-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedModuleIdx = Number(btn.dataset.moduleIdx);
        this.render();
      });
    });
  }
}
