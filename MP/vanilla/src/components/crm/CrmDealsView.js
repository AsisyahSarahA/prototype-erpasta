/**
 * CrmDealsView Component (100% Native Vanilla JS ES Module)
 * Modeled after modern Jira Software / Linear Sales & Engineering Handover:
 * - Top Banner with KPI metrics (Pipeline value, Deals won, Active proposals)
 * - Deal Cards with verified high-contrast buttons, rich specs, and stage badges
 * - 5 Comprehensive Architecture Templates (Perpustakaan, POS Warung, Booking Futsal, ERP Klinik, B2B Material)
 * - 3-Step Interactive Deal Conversion Wizard:
 *   - Step 1: Identitas Proyek & Repositori Git
 *   - Step 2: Modul (Epics) & Alokasi Tim Developer
 *   - Step 3: Review Blueprint & Ketentuan Finansial
 * - Direct integration with PerpusIntakeModal & Kanban Board
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';
import { PerpusIntakeModal } from './PerpusIntakeModal.js';

export class CrmDealsView {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'crm-view';

    this.onNavigateToProject = options.onNavigateToProject || (() => {});
    this.onNavigateToSettings = options.onNavigateToSettings || (() => {});

    // State for Convert Wizard
    this.showConvertModal = false;
    this.selectedDeal = null;
    this.wizardStep = 1; // 1 | 2 | 3
    this.selectedTemplateKey = 'pos_warung';
    this.customProjectCode = '';
    this.customRepoName = '';
    this.customModules = [];

    // Predefined 5 Architecture Templates
    this.TEMPLATES = {
      perpustakaan_microservices: {
        id: 'perpustakaan_microservices',
        name: 'Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)',
        badge: 'Microservices & Edu Tech',
        icon: 'fi-rr-book-alt',
        summary: 'Arsitektur microservices: Microservice Katalog Laravel 11, Engine Sirkulasi & Denda Redis Mutex, Portal OPAC React 19, API Gateway Traefik, Telegram Reminder Bot, dan Testing QA K6/Playwright.',
        modules: [
          { keySuffix: 'EPIC-1', title: 'Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)', description: 'REST API microservice buku dengan Laravel 11, skema PostgreSQL, Redis caching, dan validasi ISBN-13.', defaultAssigneeId: 'user-dev-3', estimateHours: 24 },
          { keySuffix: 'EPIC-2', title: 'Portal Katalog Pencarian OPAC & Detail Buku (React Frontend)', description: 'Antarmuka pencarian cepat full-text judul/penulis, filter multi-kategori buku, dan visualisasi ketersediaan rak.', defaultAssigneeId: 'user-dev-2', estimateHours: 26 },
          { keySuffix: 'EPIC-3', title: 'Microservice Sirkulasi Peminjaman & Perhitungan Denda (Laravel Backend)', description: 'Logika transaksi peminjaman, batas durasi pinjam 7 hari, denda otomatis Rp 2.000/hari, dan atomic lock.', defaultAssigneeId: 'user-dev-3', estimateHours: 28 },
          { keySuffix: 'EPIC-4', title: 'Meja Sirkulasi Petugas & Dashboard Mahasiswa (React Frontend)', description: 'UI kasir peminjaman barcode scanner kartu mahasiswa & buku, riwayat aktif pinjaman, dan slip checkout thermal.', defaultAssigneeId: 'user-dev-2', estimateHours: 22 },
          { keySuffix: 'EPIC-5', title: 'API Gateway, Docker Containerization & Telegram Reminder Bot (Fullstack)', description: 'Reverse proxy Traefik/Nginx, orchestrator Docker Compose, dan bot Telegram notifikasi pengembalian H-1.', defaultAssigneeId: 'user-dev-1', estimateHours: 28 },
          { keySuffix: 'EPIC-6', title: 'Matrix Test Case Sirkulasi, K6 Load Test & Staging QA Sign-Off (QA)', description: 'Rangkaian pengujian integrasi sirkulasi buku, stress test 2.000 concurrent RPS via K6, dan sign-off UAT.', defaultAssigneeId: 'user-qa', estimateHours: 20 },
          { keySuffix: 'EPIC-7', title: 'Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek (PM)', description: 'Dokumentasi user story, koordinasi kickoff meeting kepala perpustakaan, dan verifikasi termin tagihan.', defaultAssigneeId: 'user-pm', estimateHours: 14 }
        ]
      },
      pos_warung: {
        id: 'pos_warung',
        name: 'Sistem POS Warung Makan & Kelontong Nusantara (5 Modul Lengkap)',
        badge: 'Rekomendasi UKM / Warung',
        icon: 'fi-rr-shop',
        summary: 'Kebutuhan lengkap warung makan & sembako: kasir cepat layar sentuh, potong stok resep bahan baku, QRIS dinamis, rekap tutup kasir, dan otorisasi PIN owner.',
        modules: [
          { keySuffix: 'EPIC-1', title: 'Kasir Layar Sentuh & Cetak Struk ESC/POS Thermal 58mm', description: 'Input pesanan cepat, hitung kembalian, diskon promo, dan cetak struk thermal 58mm.', defaultAssigneeId: 'user-dev-1', estimateHours: 28 },
          { keySuffix: 'EPIC-2', title: 'Manajemen Menu, Resep Bahan Baku & Pengurangan Stok Dapur', description: 'Katalog menu dan sembako, auto-potong stok bahan baku saat pesanan selesai.', defaultAssigneeId: 'user-dev-3', estimateHours: 36 },
          { keySuffix: 'EPIC-3', title: 'Integrasi Pembayaran QRIS Dinamis & Manajemen Kas Laci Warung', description: 'Integrasi QRIS dinamis real-time dan pencatatan kas laci modal & belanja.', defaultAssigneeId: 'user-dev-2', estimateHours: 24 },
          { keySuffix: 'EPIC-4', title: 'Rekap Tutup Kasir (End of Day / Z-Report) & Laporan Laba Bersih', description: 'Rekap tutup kasir harian per shift, laporan omzet, modal bahan (HPP), dan laba bersih.', defaultAssigneeId: 'user-dev-1', estimateHours: 20 },
          { keySuffix: 'EPIC-5', title: 'Multi-Kasir, Shift Karyawan & Otorisasi PIN Owner untuk Void', description: 'Login kasir cepat PIN 4-digit, audit log, dan proteksi PIN Owner saat pembatalan transaksi.', defaultAssigneeId: 'user-qa', estimateHours: 16 }
        ]
      },
      booking_futsal: {
        id: 'booking_futsal',
        name: 'Sistem Booking Lapangan Futsal & Kasir Sewa (5 Modul Lengkap)',
        badge: 'Olahraga & Sport Hub',
        icon: 'fi-rr-football',
        summary: 'Sistem sewa lapangan futsal real-time: kalender slot interaktif, DP QRIS dinamis countdown 15 menit, kasir kantin & sewa rompi/bola, Telegram ticket QR bot, dan rekap okupansi.',
        modules: [
          { keySuffix: 'EPIC-1', title: 'Manajemen Lapangan, Grid Jadwal Interaktif & Anti Double-Booking', description: 'Kalender visual pemilihan jam per lapangan, lock slot otomatis saat checkout.', defaultAssigneeId: 'user-dev-1', estimateHours: 28 },
          { keySuffix: 'EPIC-2', title: 'Pembayaran Down Payment (DP), QRIS Dinamis & Timer 15 Menit', description: 'Generate kode bayar QRIS dinamis untuk DP, webhook verifikasi otomatis, dan countdown.', defaultAssigneeId: 'user-dev-2', estimateHours: 24 },
          { keySuffix: 'EPIC-3', title: 'Rental Perlengkapan (Rompi/Sepatu/Bola) & POS Kasir Kantin', description: 'Add-on sewa perlengkapan pertandingan dan kasir POS minuman di venue.', defaultAssigneeId: 'user-dev-3', estimateHours: 20 },
          { keySuffix: 'EPIC-4', title: 'Telegram Gateway Tiket QR Code & Broadcast Reminder H-2 Jam', description: 'Pengiriman otomatis bukti booking digital berisi QR Code check-in via Telegram Bot resmi.', defaultAssigneeId: 'user-dev-1', estimateHours: 22 },
          { keySuffix: 'EPIC-5', title: 'Pelunasan di Lokasi, Rekap Kasir Shift & Laporan Okupansi', description: 'Scan QR tiket kasir resepsionis, pelunasan sisa bayar, dan analitik okupansi.', defaultAssigneeId: 'user-qa', estimateHours: 18 }
        ]
      },
      pos_system: {
        id: 'pos_system',
        name: 'Sistem ERP Klinik Gigi & Medika Prima (3 Modul)',
        badge: 'Kesehatan & Klinik',
        icon: 'fi-rr-hospital',
        summary: 'Pendaftaran pasien, rekam medis odontogram interaktif, kasir farmasi obat, dan integrasi BPJS SatuSehat.',
        modules: [
          { keySuffix: 'EPIC-1', title: 'Pendaftaran Pasien & Rekam Medis Odontogram Interaktif', description: 'Rekam medis digital gigi odontogram, riwayat tindakan, dan reservasi dokter.', defaultAssigneeId: 'user-dev-1', estimateHours: 32 },
          { keySuffix: 'EPIC-2', title: 'Kasir Klinik, Farmasi Obat & Billing Tindakan Medis', description: 'Penagihan tindakan medis, resep obat farmasi, dan cetak kuitansi rujukan.', defaultAssigneeId: 'user-dev-2', estimateHours: 28 },
          { keySuffix: 'EPIC-3', title: 'Integrasi API BPJS SatuSehat & Pelaporan Dinkes', description: 'Koneksi API SatuSehat Kemenkes dan sinkronisasi rujukan faskes.', defaultAssigneeId: 'user-dev-3', estimateHours: 24 }
        ]
      },
      ecommerce_platform: {
        id: 'ecommerce_platform',
        name: 'Marketplace B2B Material & Multi-Gudang (3 Modul)',
        badge: 'B2B & Logistik',
        icon: 'fi-rr-building',
        summary: 'Katalog grosir semen & baja, sistem kredit tenor tempo (TOP 30/60 Hari), dan manajemen multi-gudang distributor.',
        modules: [
          { keySuffix: 'EPIC-1', title: 'Katalog Grosir, Booking PO & Negosiasi Harga Volume', description: 'Katalog semen, baja, dan material berat dengan diskon kuantitas.', defaultAssigneeId: 'user-dev-1', estimateHours: 36 },
          { keySuffix: 'EPIC-2', title: 'Sistem Kredit Tenor Tempo (Term of Payment 30/60 Hari)', description: 'Manajemen limit kredit kontraktor, verifikasi invoice tempo, dan penagihan otomatis.', defaultAssigneeId: 'user-dev-3', estimateHours: 32 },
          { keySuffix: 'EPIC-3', title: 'Sinkronisasi Multi-Gudang Distributor & Armada Ekspedisi', description: 'Manajemen stok gudang regional dan tracking surat jalan armada truk.', defaultAssigneeId: 'user-dev-2', estimateHours: 28 }
        ]
      }
    };

    // Instantiate PerpusIntakeModal
    this.perpusModal = new PerpusIntakeModal({
      onNavigateToProject: (pId) => {
        store.setSelectedProjectId(pId);
        store.setActiveTab('kanban');
      },
      onOpenConvertDeal: () => {
        const perpusDeal = (store.getState().crmDeals || []).find(d =>
          d.id === 'deal-crm-lib-101' || d.id === 'deal-perpustakaan' || (d.dealCode && d.dealCode.includes('PERPUS'))
        );
        if (perpusDeal) {
          this.openConvertModal(perpusDeal);
        }
      }
    });
    document.body.appendChild(this.perpusModal.getElement());

    this.render();
    this.attachEvents();

    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  formatIDR(val) {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  }

  openConvertModal(deal) {
    this.selectedDeal = deal;
    this.wizardStep = 1;

    // Smart default code and repo name
    const code = deal.projectCode || (deal.dealCode ? deal.dealCode.replace('DEAL-', '').slice(0, 8) : 'PROJ');
    this.customProjectCode = code === 'PERPUS-01' ? 'LIB-DIG' : code === 'FTSL-01' ? 'FTSL-PRO' : code === 'WRG-01' ? 'POS-KLN' : code;
    this.customRepoName = (deal.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    this.selectedTemplateKey = deal.templateType || (deal.title && deal.title.includes('Perpustakaan') ? 'perpustakaan_microservices' : 'pos_warung');
    this.loadModulesForTemplate(this.selectedTemplateKey);
    this.showConvertModal = true;
    this.render();
  }

  loadModulesForTemplate(tmplKey) {
    const tmpl = this.TEMPLATES[tmplKey] || this.TEMPLATES.pos_warung;
    this.customModules = tmpl.modules.map((m, idx) => ({
      id: `mod-${Date.now()}-${idx}`,
      epicKey: `${this.customProjectCode || 'PROJ'}-${m.keySuffix}`,
      title: m.title,
      description: m.description,
      assigneeId: m.defaultAssigneeId,
      estimateHours: m.estimateHours
    }));
  }

  render() {
    const state = store.getState();
    const crmDeals = state.crmDeals || [];
    const projects = state.projects || [];

    // Robust calculations with fallback for both contractValue and dealValue
    const totalPipelineValue = crmDeals.reduce((acc, d) => acc + (d.contractValue || d.dealValue || 0), 0);
    const wonDeals = crmDeals.filter(d => {
      const st = (d.status || d.stage || '').toLowerCase();
      return st.includes('closing') || st.includes('won') || st.includes('converted');
    });
    const wonValue = wonDeals.reduce((acc, d) => acc + (d.contractValue || d.dealValue || 0), 0);
    const proposalDeals = crmDeals.filter(d => {
      const st = (d.status || d.stage || '').toLowerCase();
      return st.includes('proposal') || st.includes('negosiasi') || st.includes('diskusi');
    });

    this.element.innerHTML = `
      <div class="crm-container">
        <!-- 1. Top Header Banner -->
        <div class="crm-banner">
          <div class="crm-banner-left">
            <div class="crm-icon-box">
              ${Icons.briefcase('', 24)}
            </div>
            <div>
              <div class="crm-banner-title">
                <h1>Modul CRM Deals &amp; Intake Proyek</h1>
                <span class="crm-badge-blue">Kualifikasi Klien</span>
                <span class="crm-badge-green">Otomatisasi Git Branching</span>
              </div>
              <p class="crm-banner-desc">
                Manajemen pipeline deal klien software house, penentuan modul arsitektur, kalkulasi estimasi kontrak, dan konversi 1-klik menjadi proyek aktif dengan branch GitHub terisolasi.
              </p>
            </div>
          </div>

          <div class="crm-banner-right">
            <button id="openPerpusIntakeBlueprintBtn" class="crm-btn-blueprint" title="Buka Blueprint Intake Perpustakaan">
              ${Icons.bookOpen('', 14)}
              <span>Blueprint Intake Perpustakaan</span>
            </button>
          </div>
        </div>

        <!-- 2. Pipeline Summary Metrics Strip -->
        <div class="crm-metrics-grid">
          <div class="crm-metric-card">
            <div class="crm-metric-label">Total Pipeline Deals</div>
            <div class="crm-metric-value">${this.formatIDR(totalPipelineValue)}</div>
            <div class="crm-metric-subtext">${crmDeals.length} peluang bisnis aktif</div>
          </div>

          <div class="crm-metric-card">
            <div class="crm-metric-label" style="color: #059669;">Closing / Deal Won</div>
            <div class="crm-metric-value crm-metric-value--green">${this.formatIDR(wonValue)}</div>
            <div class="crm-metric-subtext" style="color: #059669;">${wonDeals.length} proyek siap dikerjakan</div>
          </div>

          <div class="crm-metric-card">
            <div class="crm-metric-label" style="color: #0052cc;">Proposal &amp; Negosiasi</div>
            <div class="crm-metric-value crm-metric-value--blue">${proposalDeals.length} Deal</div>
            <div class="crm-metric-subtext">Menunggu persetujuan stakeholder</div>
          </div>
        </div>

        <!-- 3. Deals Grid -->
        <div class="crm-deals-grid">
          ${crmDeals.map((deal) => {
            const rawStatus = deal.status || deal.stage || 'Closing/Won';
            const isWon = rawStatus.toLowerCase().includes('closing') || rawStatus.toLowerCase().includes('won') || rawStatus.toLowerCase().includes('converted') || rawStatus.toLowerCase().includes('deal');
            const isNegosiasi = rawStatus.toLowerCase().includes('negosiasi') || rawStatus.toLowerCase().includes('diskusi');
            
            const dealCode = deal.dealCode || deal.projectCode || 'DEAL';
            const clientName = deal.clientName || deal.clientCompany || 'Klien Software House';
            const clientPic = deal.clientPic || 'PIC Klien';
            const value = deal.contractValue || deal.dealValue || 0;
            const scope = deal.scopeNotes || deal.description || 'Spesifikasi pengerjaan sistem software house.';
            const templateType = deal.templateType || deal.architectureType || 'Modular MVC / Microservices';
            const paymentTerms = deal.paymentTerms || 'Termin 1 (30% DP), Termin 2 (40% UAT), Termin 3 (30% Handover)';

            // Match against projects
            const convertedProject = projects.find(p =>
              p.id === deal.convertedProjectId ||
              (dealCode === 'DEAL-PERPUS-01' && p.code === 'LIB-DIG') ||
              (dealCode === 'DEAL-FTSL-01' && p.code === 'FTSL-PRO') ||
              (dealCode === 'DEAL-WRG-01' && p.code === 'POS-KLN') ||
              p.name === deal.title
            );

            return `
              <div class="crm-deal-card">
                <div>
                  <div class="crm-deal-card-header">
                    <div>
                      <span class="crm-deal-code">${dealCode}</span>
                      <h3 class="crm-deal-title">${deal.title}</h3>
                      <div class="crm-deal-client">
                        <strong>${clientName}</strong> · PIC: ${clientPic}
                      </div>
                    </div>

                    <div class="crm-stage-pill ${isWon ? 'won' : isNegosiasi ? 'negotiation' : 'proposal'}">
                      ${isWon ? Icons.checkCircle('', 12) : Icons.clock('', 12)}
                      <span>${rawStatus}</span>
                    </div>
                  </div>

                  <p class="crm-deal-desc" style="margin-top: 10px;">
                    ${scope}
                  </p>

                  <div class="crm-deal-specs" style="margin-top: 12px;">
                    <div class="crm-spec-row">
                      <span class="crm-spec-label">Nilai Kontrak:</span>
                      <span class="crm-spec-value">${this.formatIDR(value)}</span>
                    </div>
                    <div class="crm-spec-row">
                      <span class="crm-spec-label">Skema Arsitektur:</span>
                      <span class="crm-spec-arch">${templateType}</span>
                    </div>
                    <div class="crm-spec-row">
                      <span class="crm-spec-label">Ketentuan Termin:</span>
                      <span style="font-size: 11px; color: #475569; text-align: right; max-width: 60%;">${paymentTerms.slice(0, 48)}...</span>
                    </div>
                  </div>
                </div>

                <div class="crm-deal-actions">
                  ${convertedProject ? `
                    <button class="crm-btn-primary navigate-to-project-btn" data-project-id="${convertedProject.id}">
                      ${Icons.folderGit('', 14)}
                      <span>Buka Proyek Aktif (${convertedProject.code})</span>
                    </button>
                  ` : isWon ? `
                    <button class="crm-btn-primary convert-deal-btn" data-deal-id="${deal.id}" style="background-color: #059669 !important;">
                      ${Icons.sparkles('', 14)}
                      <span><i class="fi fi-rr-bolt"></i> Eksekusi Deal &amp; Bagi Modul (Epics)</span>
                      ${Icons.arrowRight('', 14)}
                    </button>
                  ` : `
                    <div style="display: flex; gap: 6px;">
                      <button class="crm-btn-primary convert-deal-btn" data-deal-id="${deal.id}" style="flex: 1;">
                        ${Icons.sparkles('', 14)}
                        <span><i class="fi fi-rr-bolt"></i> Eksekusi &amp; Bagi Modul</span>
                      </button>
                      <button class="crm-btn-secondary mark-deal-won-btn" data-deal-id="${deal.id}" title="Tandai status sebagai Won / Deal">
                        ${Icons.check('', 12)}
                        <span>Tandai Won</span>
                      </button>
                    </div>
                  `}

                  ${dealCode.includes('PERPUS') || deal.id === 'deal-perpustakaan' || (deal.title && deal.title.includes('Perpustakaan')) ? `
                    <button class="crm-btn-blueprint view-perpus-blueprint-btn">
                      ${Icons.bookOpen('', 14)}
                      <span>Lihat Blueprint 7 Modul &amp; 6 Tahapan SOP</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Interactive 3-Step Deal Conversion Wizard Modal -->
      ${this.showConvertModal && this.selectedDeal ? this.renderConvertModal(this.selectedDeal) : ''}
    `;
  }

  renderConvertModal(deal) {
    const state = store.getState();
    const teamMembers = state.teamMembers || [];
    const dealCode = deal.dealCode || deal.projectCode || 'DEAL';
    const clientName = deal.clientName || deal.clientCompany || 'Klien';
    const value = deal.contractValue || deal.dealValue || 185000000;

    return `
      <div class="crm-wizard-overlay" id="convertWizardOverlay">
        <div class="crm-wizard-box">
          <!-- Wizard Header -->
          <div class="crm-wizard-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="crm-deal-code">${dealCode}</span>
                <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">
                  Deal Won · ${this.formatIDR(value)}
                </span>
              </div>
              <h2 class="crm-wizard-title">
                Eksekusi Deal: Pembagian Modul &amp; Inisialisasi Kanban
              </h2>
              <p class="crm-wizard-subtitle">
                Inisialisasi workspace Kanban, modul Epics, alokasi tim, dan isolasi branch repositori Git.
              </p>
            </div>

            <button id="closeConvertWizardBtn" class="crm-wizard-close" title="Tutup Modal">
              ${Icons.x('', 18)}
            </button>
          </div>

          <!-- Wizard Step Indicator -->
          <div class="crm-wizard-stepper">
            <div class="crm-wizard-step ${this.wizardStep === 1 ? 'active' : ''}">
              <span>1. Identitas &amp; Git Repo</span>
            </div>
            <div class="crm-wizard-step ${this.wizardStep === 2 ? 'active' : ''}">
              <span>2. Pembagian Modul (Epics)</span>
            </div>
            <div class="crm-wizard-step ${this.wizardStep === 3 ? 'active' : ''}">
              <span>3. Review &amp; Finansial</span>
            </div>
          </div>

          <!-- Wizard Step Content -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${this.renderWizardStepContent(deal, teamMembers, value, clientName)}
          </div>

          <!-- Wizard Controls Footer (High Visibility Buttons) -->
          <div class="crm-wizard-footer">
            ${this.wizardStep > 1 ? `
              <button id="prevWizardStepBtn" class="crm-btn-secondary" style="height: 36px; padding: 0 16px;">
                Kembali
              </button>
            ` : '<div></div>'}

            <div class="crm-wizard-footer-right">
              <button id="cancelWizardBtn" class="crm-btn-secondary" style="height: 36px; padding: 0 16px;">
                Batal
              </button>
              ${this.wizardStep < 3 ? `
                <button id="nextWizardStepBtn" class="crm-btn-primary" style="height: 36px; width: auto; padding: 0 20px;">
                  <span>Lanjut Langkah Berikutnya</span>
                  ${Icons.arrowRight('', 14)}
                </button>
              ` : `
                <button id="finishWizardBtn" class="crm-btn-success" style="height: 36px; width: auto; padding: 0 22px;">
                  ${Icons.sparkles('', 14)}
                  <span>Konfirmasi &amp; Eksekusi Proyek</span>
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderWizardStepContent(deal, teamMembers, value, clientName) {
    if (this.wizardStep === 1) {
      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="padding: 12px 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
            <strong style="color: #0f172a; font-size: 13px;">${deal.title}</strong>
            <span style="color: #64748b;">Klien: <strong>${clientName}</strong> · PIC: <strong>${deal.clientPic || 'PIC Klien'}</strong></span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
            <div class="crm-form-group">
              <label class="crm-form-label">Kode Proyek (Key Prefix):</label>
              <input id="wizardProjectCodeInput" class="crm-form-input" type="text" value="${this.customProjectCode}" style="font-family: var(--font-mono); font-weight: 700;" />
            </div>

            <div class="crm-form-group">
              <label class="crm-form-label">Nama Repositori GitHub:</label>
              <input id="wizardRepoNameInput" class="crm-form-input" type="text" value="${this.customRepoName}" style="font-family: var(--font-mono);" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="crm-form-group">
              <label class="crm-form-label">Organisasi GitHub:</label>
              <input type="text" class="crm-form-input" value="agensi-software-house" disabled />
            </div>

            <div class="crm-form-group">
              <label class="crm-form-label">Default Base Branch:</label>
              <input type="text" class="crm-form-input" value="main (Target Release: origin/main)" disabled />
            </div>
          </div>

          <div style="padding: 10px 14px; border-radius: 6px; background: #ecfdf5; border: 1px solid #a7f3d0; font-size: 12px; color: #065f46; display: flex; align-items: center; gap: 8px;">
            <i class="fi fi-rr-check" style="font-weight: bold; font-size: 14px; color: #059669;"></i>
            <span>Integrasi GitHub Webhook aktif: Repository private otomatis dibuat dengan proteksi branch staging &amp; main.</span>
          </div>
        </div>
      `;
    }

    if (this.wizardStep === 2) {
      const totalHours = this.customModules.reduce((acc, m) => acc + (Number(m.estimateHours) || 0), 0);
      const uniqueAssignees = new Set(this.customModules.map(m => m.assigneeId)).size;

      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="padding: 10px 14px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px; color: #1e40af; display: flex; align-items: flex-start; gap: 10px;">
            <i class="fi fi-rr-puzzle-piece" style="font-size: 18px; line-height: 1; color: #2563eb;"></i>
            <div>
              <strong>Alur Pembagian Modul Proyek (Epics &amp; Work Packages):</strong>
              <p style="margin: 2px 0 0 0; color: #1e3a8a; line-height: 1.4;">
                Deal yang berstatus Won otomatis dipecah menjadi modul-modul mandiri. Setiap modul akan di-generate menjadi tiket Core/Backend dan UI/Frontend, lengkap dengan checklist subtask acceptance criteria di Kanban Board.
              </p>
            </div>
          </div>

          <div class="crm-form-group">
            <label class="crm-form-label">Pilih Template Arsitektur Software House:</label>
            <select id="wizardTemplateSelect" class="crm-form-select" style="font-weight: 600;">
              ${Object.values(this.TEMPLATES).map(tmpl => `
                <option value="${tmpl.id}" ${this.selectedTemplateKey === tmpl.id ? 'selected' : ''}>
                  [${tmpl.badge}] ${tmpl.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #0f172a;">Daftar Pembagian Modul (Epics) &amp; Alokasi Engineer:</span>
              <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #e0e7ff; color: #3730a3;">
                ${this.customModules.length} Modul
              </span>
            </div>
            <button id="addCustomModuleBtn" style="font-size: 12px; font-weight: 600; color: #0052cc; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <span>+ Tambah Modul Baru</span>
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; padding-right: 4px;">
            ${this.customModules.map((m, idx) => `
              <div class="crm-mod-item" data-mod-idx="${idx}" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(9, 30, 66, 0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #bfdbfe; color: #0052cc;">
                    ${m.epicKey}
                  </span>
                  <input class="wizard-mod-title crm-form-input" data-idx="${idx}" type="text" value="${m.title}" placeholder="Judul modul (Epic)..." style="height: 32px; font-size: 12px; font-weight: 700;" />
                  <button class="delete-mod-btn" data-idx="${idx}" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 4px; border-radius: 4px;" title="Hapus modul ini">
                    ${Icons.trash('', 14)}
                  </button>
                </div>

                <div style="margin-top: 6px;">
                  <input class="wizard-mod-desc crm-form-input" data-idx="${idx}" type="text" value="${m.description || ''}" placeholder="Spesifikasi modul &amp; acceptance criteria..." style="height: 28px; font-size: 11px; color: #475569;" />
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-top: 8px; align-items: center;">
                  <div>
                    <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Lead Developer:</span>
                    <select class="wizard-mod-assignee crm-form-select" data-idx="${idx}" style="height: 30px; font-size: 11px; margin-top: 2px;">
                      ${teamMembers.map(tm => `
                        <option value="${tm.id}" ${m.assigneeId === tm.id ? 'selected' : ''}>${tm.name} (${tm.role})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div>
                    <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Estimasi Jam:</span>
                    <input class="wizard-mod-hours crm-form-input" data-idx="${idx}" type="number" value="${m.estimateHours}" style="height: 30px; font-size: 11px; font-family: var(--font-mono); margin-top: 2px;" />
                  </div>
                </div>

                <div style="margin-top: 6px; font-size: 10.5px; color: #059669; display: flex; align-items: center; gap: 6px; background: #f0fdf4; padding: 3px 8px; border-radius: 4px; border: 1px solid #dcfce7;">
                  <i class="fi fi-rr-check" style="font-size: 11px;"></i>
                  <span>Menghasilkan: 1 Task Core/Backend + 1 Task UI/Frontend + Checklist Acceptance Criteria</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Step 2 Summary Bar -->
          <div style="padding: 10px 14px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #475569;">
            <span>Total Modul: <strong style="color: #0f172a;">${this.customModules.length} Epics</strong></span>
            <span>Total Beban: <strong style="color: #0f172a; font-family: var(--font-mono);">${totalHours} Jam</strong></span>
            <span>Alokasi Tim: <strong style="color: #0f172a;">${uniqueAssignees} Developer</strong></span>
          </div>
        </div>
      `;
    }

    if (this.wizardStep === 3) {
      const totalHours = this.customModules.reduce((acc, m) => acc + (Number(m.estimateHours) || 0), 0);

      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Commercial & Identity Summary -->
          <div style="padding: 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Ringkasan Komersial &amp; Kontrak:</span>
              <span style="font-size: 16px; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">${this.formatIDR(value)}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 12px; color: #334155; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              <div>Kode: <strong>${this.customProjectCode}</strong></div>
              <div>Total Modul: <strong>${this.customModules.length} Epics</strong></div>
              <div>Estimasi Beban: <strong>${totalHours} Jam</strong></div>
            </div>
          </div>

          <!-- Generated Modules List Review -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: #0f172a;">Daftar Modul yang Diterbitkan ke Kanban:</span>
            <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
              ${this.customModules.map((m, idx) => {
                const assignee = teamMembers.find(t => t.id === m.assigneeId);
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; padding: 4px 6px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-family: var(--font-mono); font-weight: 700; color: #0052cc;">${m.epicKey}</span>
                      <strong style="color: #0f172a;">${m.title}</strong>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; color: #64748b;">
                      <span>Lead: <strong>${assignee ? assignee.name : 'Developer'}</strong></span>
                      <span style="font-family: var(--font-mono); font-weight: 600;">${m.estimateHours}h</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Finance Invoices Schedule -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #0f172a;">Jadwal Termin Tagihan Finansial (SOP Progres &gt; 10%):</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div style="padding: 12px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px;">
                <div style="font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 4px;">
                  <span>Termin 1 (DP 30%)</span>
                  <span style="font-size: 9px; background: #dbeafe; color: #1d4ed8; padding: 1px 4px; border-radius: 3px;">Terkirim</span>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: #1d4ed8; margin-top: 4px; font-size: 13px;">${this.formatIDR(value * 0.3)}</div>
                <div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">Kick-off &amp; Inisialisasi Modul Git</div>
              </div>

              <div style="padding: 12px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; font-size: 12px;">
                <div style="font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 4px;">
                  <span>Termin 2 (Milestone 40%)</span>
                  <span style="font-size: 9px; background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 3px;">Draft</span>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: #b45309; margin-top: 4px; font-size: 13px;">${this.formatIDR(value * 0.4)}</div>
                <div style="font-size: 11px; color: #d97706; margin-top: 4px;">Validasi Staging &amp; QA Sign-Off (&gt; 10%)</div>
              </div>

              <div style="padding: 12px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; font-size: 12px;">
                <div style="font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 4px;">
                  <span>Termin 3 (Pelunasan 30%)</span>
                  <span style="font-size: 9px; background: #d1fae5; color: #065f46; padding: 1px 4px; border-radius: 3px;">Draft</span>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: #047857; margin-top: 4px; font-size: 13px;">${this.formatIDR(value * 0.3)}</div>
                <div style="font-size: 11px; color: #059669; margin-top: 4px;">Go-Live &amp; Garansi 12 Bulan</div>
              </div>
            </div>
          </div>

          <div style="padding: 10px 14px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; display: flex; align-items: center; gap: 8px;">
            <i class="fi fi-rr-info" style="font-size: 14px; color: #0052cc;"></i>
            <span>Setelah konfirmasi, sistem akan otomatis berpindah ke tab Kanban Board proyek baru dan modul-modul siap dikerjakan.</span>
          </div>
        </div>
      `;
    }

    return '';
  }

  attachEvents() {
    this.element.addEventListener('click', (e) => {
      // Open perpus intake blueprint
      if (e.target.closest('#openPerpusIntakeBlueprintBtn') || e.target.closest('.view-perpus-blueprint-btn')) {
        this.perpusModal.open();
      }

      // Convert deal button
      const convBtn = e.target.closest('.convert-deal-btn');
      if (convBtn) {
        const dealId = convBtn.dataset.dealId;
        const deal = (store.getState().crmDeals || []).find(d => d.id === dealId);
        if (deal) {
          this.openConvertModal(deal);
        }
      }

      // Navigate to project
      const navBtn = e.target.closest('.navigate-to-project-btn');
      if (navBtn) {
        const pId = navBtn.dataset.projectId;
        store.setSelectedProjectId(pId);
        store.setActiveTab('kanban');
      }

      // Wizard controls
      if (e.target.closest('#closeConvertWizardBtn') || e.target.closest('#cancelWizardBtn') || e.target.id === 'convertWizardOverlay') {
        this.showConvertModal = false;
        this.selectedDeal = null;
        this.render();
      }

      if (e.target.closest('#nextWizardStepBtn')) {
        if (this.wizardStep === 1) {
          const codeInput = this.element.querySelector('#wizardProjectCodeInput');
          const repoInput = this.element.querySelector('#wizardRepoNameInput');
          if (codeInput) this.customProjectCode = codeInput.value.trim();
          if (repoInput) this.customRepoName = repoInput.value.trim();
          this.wizardStep = 2;
          this.render();
        } else if (this.wizardStep === 2) {
          this.wizardStep = 3;
          this.render();
        }
      }

      if (e.target.closest('#prevWizardStepBtn')) {
        if (this.wizardStep > 1) {
          this.wizardStep -= 1;
          this.render();
        }
      }

      // Finish Wizard
      if (e.target.closest('#finishWizardBtn')) {
        if (!this.selectedDeal) return;

        const newProj = store.convertCrmDealToProject(this.selectedDeal.id, {
          projectCode: this.customProjectCode,
          repoName: this.customRepoName,
          modules: this.customModules
        });

        this.showConvertModal = false;
        this.selectedDeal = null;

        if (newProj) {
          store.setSelectedProjectId(newProj.id);
          store.setActiveTab('kanban');
        } else {
          this.render();
        }
      }

      // Add custom module button
      if (e.target.closest('#addCustomModuleBtn')) {
        const nextIdx = this.customModules.length + 1;
        this.customModules.push({
          id: `mod-${Date.now()}-${nextIdx}`,
          epicKey: `${this.customProjectCode || 'PROJ'}-EPIC-${nextIdx}`,
          title: `Modul Fitur Baru ${nextIdx}`,
          description: 'Spesifikasi pengerjaan modul baru.',
          assigneeId: 'user-dev-1',
          estimateHours: 20
        });
        this.render();
      }

      // Delete module button
      const delModBtn = e.target.closest('.delete-mod-btn');
      if (delModBtn) {
        const idx = Number(delModBtn.dataset.idx);
        this.customModules.splice(idx, 1);
        this.render();
      }

      // Mark deal won button
      const markWonBtn = e.target.closest('.mark-deal-won-btn');
      if (markWonBtn) {
        const dealId = markWonBtn.dataset.dealId;
        const deal = (store.getState().crmDeals || []).find(d => d.id === dealId);
        if (deal) {
          deal.status = 'Deal';
          deal.stage = 'Deal';
          store.addToast('success', 'Deal Ditandai Won!', `Status deal "${deal.title}" kini Won/Deal. Siap dibagi modul.`);
          this.openConvertModal(deal);
        }
      }
    });

    // Input and change listeners for Wizard
    this.element.addEventListener('input', (e) => {
      if (e.target.classList.contains('wizard-mod-title')) {
        const idx = Number(e.target.dataset.idx);
        if (this.customModules[idx]) {
          this.customModules[idx].title = e.target.value;
        }
      }
      if (e.target.classList.contains('wizard-mod-desc')) {
        const idx = Number(e.target.dataset.idx);
        if (this.customModules[idx]) {
          this.customModules[idx].description = e.target.value;
        }
      }
      if (e.target.classList.contains('wizard-mod-hours')) {
        const idx = Number(e.target.dataset.idx);
        if (this.customModules[idx]) {
          this.customModules[idx].estimateHours = Number(e.target.value) || 0;
        }
      }
    });

    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'wizardTemplateSelect') {
        this.selectedTemplateKey = e.target.value;
        this.loadModulesForTemplate(this.selectedTemplateKey);
        this.render();
      }

      if (e.target.classList.contains('wizard-mod-assignee')) {
        const idx = Number(e.target.dataset.idx);
        if (this.customModules[idx]) {
          this.customModules[idx].assigneeId = e.target.value;
        }
      }
    });
  }
}
