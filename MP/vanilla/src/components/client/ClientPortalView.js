/**
 * ClientPortalView.js
 * ASTACODE ERP - Enterprise Service Desk & Client Transparency Portal
 * 
 * Fitur & Tata Letak Proporsional:
 * 1. Seluruh Bot Layanan Masuk ke List Chat (Sidebar Kiri):
 *    - Setiap bot (@ProjectManjerBot, @AstaPosTelematicsBot, @LogistikCareBot, dan bot baru)
 *      tampil proporsional di daftar chat lengkap dengan avatar, badge proyek, badge platform, dan snippet pesan terakhir.
 *    - Tab filter: 'Semua', '🤖 Bot Layanan', dan '👥 Tim Internal'.
 * 2. Multi-Session Chat Engine:
 *    - Setiap bot memiliki sesi percakapan independen dan persisten.
 *    - Klik pada bot manapun di daftar chat langsung membuka sesi percakapan bot tersebut dan
 *      menyinkronkan proyek aktif ERP.
 * 3. Sinkronisasi Penuh dengan Modul Otomasi Fix Bug AI:
 *    - Tombol aksi interaktif di gelembung pesan: '⚡ Jalankan Auto-Fix AI', '🚀 Buka Studio AI Hub'.
 *    - Bot otomatis mengirim pembaruan saat PR berhasil dibuat dan lulus 5/5 unit tests.
 * 4. Pembuatan Bot Baru (+ Buat Bot Baru):
 *    - Modal pembuatan bot (Telegram, WhatsApp, Slack, Webhook).
 *    - Bot baru langsung otomatis masuk ke daftar chat di posisi teratas dan langsung dibuka.
 * 5. Formulir Pelaporan Bug Terstruktur (🚨 Lapor Kendala / Bug) & Pusat Aturan Automasi (⚡ Automasi).
 * 6. 3-Kolom Proporsional: List Chat (320px) | Chat Arena (1fr) | Transparency Drawer (320px).
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class ClientPortalView {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'client-view';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => store.openIntakeModal());
    this.onSelectInvoice = options.onSelectInvoice || (() => store.setActiveTab('crm'));

    // Navigation & Selection State
    this.selectedSessionKey = 'bot-default-1'; // bot ID or contact key ('pm', 'dev', 'frontend')
    this.chatFilterTab = 'all'; // 'all' | 'bots' | 'team'
    this.searchQuery = '';
    this.isTyping = false;
    this.isDrawerOpen = true;

    // Modals
    this.showCreateBotModal = false;
    this.showBugReportModal = false;
    this.showAutomationModal = false;

    // Multi-Session Chat History
    this.chatSessions = {
      // Sesi 1: Perpustakaan Digital Bot (@ProjectManjerBot)
      'bot-default-1': [
        {
          id: 'msg-p-1',
          sender: 'bot',
          senderName: '@ProjectManjerBot',
          role: 'Official Telegram Service Desk',
          avatar: '',
          text: `<strong>Halo Tim Perwakilan Klien Perpustakaan Digital! 👋</strong><br />
Selamat datang di <strong>Service Desk Resmi ASTACODE (@ProjectManjerBot)</strong>.<br /><br />
Kanal ini terverifikasi terhubung dengan proyek <strong>Sistem Perpustakaan Digital Kampus (LIB-DIG)</strong> dan terintegrasi langsung dengan <strong>Engine Otomasi Fix Bug AI</strong>.<br /><br />
Perintah Cepat yang Tersedia:<br />
• <code>/status [TIKET]</code> — Lacak progres pengerjaan tiket<br />
• <code>/autofix [TIKET]</code> — Picu perbaikan otomatis oleh Agen AI<br />
• <code>/sync</code> — Sinkronkan seluruh tiket dengan Modul Otomasi AI<br />
• <code>/human</code> — Eskalasi ke Project Manajer / Lead Dev On-Call<br />
• <code>/invoice</code> — Ringkasan tagihan &amp; termin pembayaran`,
          time: '08:30',
          inlineButtons: [
            { label: '🔍 Cek Tiket LIB-117', command: '/status LIB-117' },
            { label: '⚡ Jalankan AI Fix LIB-117', action: 'runAiFix', taskId: 'LIB-117' },
            { label: '🚀 Buka di Studio AI Hub', action: 'openAiHub', taskId: 'LIB-117' },
            { label: '👤 Panggil Human Lead', command: '/human' }
          ]
        },
        {
          id: 'msg-p-2',
          sender: 'client',
          senderName: 'Dr. Ahmad Suhardi',
          role: 'Kepala Perpustakaan (PIC)',
          text: 'Selamat pagi tim ASTACODE. Kami sedang menguji simulasi peminjaman buku pada portal mahasiswa (LIB-117). Ditemukan error validasi kuota peminjaman saat mahasiswa memiliki denda aktif. Mohon dicek apakah ini masuk garansi dan kapan estimasi patch-nya?',
          time: '09:15',
          read: true
        },
        {
          id: 'msg-p-3',
          sender: 'bot',
          senderName: '@ProjectManjerBot (Auto-Triage)',
          role: 'AI Service Bot · Gemini Engine',
          text: `<strong>Laporan Terverifikasi &amp; Di-Triage Otomatis:</strong><br />
• ID Tiket: <strong>LIB-117</strong><br />
• Klasifikasi: <strong>Bug Validasi Sirkulasi Peminjaman</strong><br />
• Keparahan: <span style="color: #b45309; font-weight: 700;">S2 - Major</span><br />
• Status Garansi: <span style="color: #047857; font-weight: 700;">Garansi Proyek (Gratis)</span><br />
• Target SLA Tanggap: <strong>&lt; 120 Menit</strong> (Siaga On-Call)<br />
• Integrasi AI: <span style="color: #6d28d9; font-weight: 700;">Tersinkron ke Otomasi Fix Bug AI</span>`,
          time: '09:16',
          inlineButtons: [
            { label: '⚡ Jalankan Auto-Fix AI', action: 'runAiFix', taskId: 'LIB-117' },
            { label: '📋 Buka Detail LIB-117', action: 'openTask', taskId: 'LIB-117' },
            { label: '🚀 Buka Studio AI Hub', action: 'openAiHub', taskId: 'LIB-117' },
            { label: '💬 Chat dengan Jaka', action: 'switchSession', sessionKey: 'dev' }
          ]
        },
        {
          id: 'msg-p-4',
          sender: 'pic',
          senderName: 'Jaka',
          role: 'Backend Dev (On-Call)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          text: 'Selamat pagi Pak Suhardi. Kendala atomic lock dan validasi denda pada microservice sirkulasi sudah kami isolasi di branch <code>fix/lib-117-circulation</code>. Engine Otomasi AI juga telah membuat draft PR dengan 5/5 unit regression test passing. Siap dideploy ke staging sore ini.',
          time: '09:42'
        }
      ],

      // Sesi 2: POS Telematics Bot (@AstaPosTelematicsBot)
      'bot-default-2': [
        {
          id: 'msg-pos-1',
          sender: 'bot',
          senderName: '@AstaPosTelematicsBot',
          role: 'Official POS Support Bot',
          avatar: '',
          text: `<strong>Halo Tim Kopi Kenangan! 👋</strong><br />
Layanan bantuan teknis <strong>@AstaPosTelematicsBot</strong> aktif terhubung dengan proyek <strong>Sistem POS Multi-Outlet (POS-KLN)</strong>.<br /><br />
Siaga melayani pelaporan insiden kasir, struk thermal, integrasi QRIS, dan backend telematika.<br />
Ketik kendala Anda atau gunakan perintah cepat di bawah:`,
          time: '08:00',
          inlineButtons: [
            { label: '🔍 Cek Tiket POS-104', command: '/status POS-104' },
            { label: '⚡ Jalankan AI Fix POS-104', action: 'runAiFix', taskId: 'POS-104' },
            { label: '🚨 Lapor Kendala Kasir', command: '/help' }
          ]
        },
        {
          id: 'msg-pos-2',
          sender: 'client',
          senderName: 'Bu Ana (Store Manager)',
          role: 'Head of Outlet Operations',
          text: 'Halo tim developer, ada kendala saat kasir cetak struk dengan diskon promo 10% (POS-104). Terjadi selisih pembulatan desimal 1 rupiah di total pembayaran. Mohon dibantu perbaikannya.',
          time: '09:05',
          read: true
        },
        {
          id: 'msg-pos-3',
          sender: 'bot',
          senderName: '@AstaPosTelematicsBot (Auto-Triage)',
          role: 'AI Diagnostic Engine',
          text: `✅ <strong>Tiket POS-104 Diterima &amp; Tersinkron ke Otomasi AI:</strong><br />
• Masalah: <strong>Rounding Diskon Desimal (taxEngine.ts)</strong><br />
• Keparahan: <span style="color: #b45309; font-weight: 700;">S2 - Major</span><br />
• Status Alur: <strong>Dianalisis oleh AI</strong><br />
Klik tombol di bawah untuk mengeksekusi patch otomatis:`,
          time: '09:06',
          inlineButtons: [
            { label: '⚡ Jalankan Auto-Fix AI POS-104', action: 'runAiFix', taskId: 'POS-104' },
            { label: '🚀 Buka Studio AI Hub', action: 'openAiHub', taskId: 'POS-104' }
          ]
        }
      ],

      // Sesi 3: Fleet Telematics Bot (@LogistikCareBot)
      'bot-default-3': [
        {
          id: 'msg-log-1',
          sender: 'bot',
          senderName: '@LogistikCareBot',
          role: 'Official Logistics Support Bot',
          avatar: '',
          text: `<strong>Layanan Siaga Insiden Telematika Armada (@LogistikCareBot) 🚛</strong><br />
Terhubung ke proyek <strong>Smart Fleet Telematics &amp; IoT Tracking (IOT)</strong>.<br /><br />
• Target SLA: <strong>&lt; 15 Menit</strong> (Siaga Kritis On-Call)<br />
• Webhook Gateway: <span style="color: #047857; font-weight: 700;">200 OK Active</span><br />
• AI Auto-Triage: <span style="color: #6d28d9; font-weight: 700;">Aktif</span>`,
          time: '07:45',
          inlineButtons: [
            { label: '🔍 Cek Status Server Telematika', command: '/status' },
            { label: '🚨 Lapor Gangguan GPS', command: '/help' },
            { label: '👤 Hubungi Lead Dev', command: '/human' }
          ]
        }
      ],

      // Sesi 4: PM Asisyah
      'pm': [
        {
          id: 'msg-pm-1',
          sender: 'pic',
          senderName: 'Asisyah Sarah Azzahra',
          role: 'Project Manager Lead',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
          text: 'Halo Bapak/Ibu PIC Klien. Berkas dokumen serah terima dan UAT tahap 1 telah kami susun bersama tim QA. Silakan jadwalkan meeting verifikasi bersama tim kami jika sudah siap.',
          time: 'Kemarin 14:20'
        }
      ],

      // Sesi 5: Jaka Lead Dev
      'dev': [
        {
          id: 'msg-dev-1',
          sender: 'pic',
          senderName: 'Jaka Kurnia',
          role: 'Backend Lead & AI Review Gate',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          text: 'Halo! Seluruh patch bug yang dihasilkan oleh Engine Otomasi Fix Bug AI kami uji terlebih dahulu dengan unit regression test sebelum kami merge ke branch staging.',
          time: 'Kemarin 16:10'
        }
      ],

      // Sesi 6: Aldyana Frontend
      'frontend': [
        {
          id: 'msg-fe-1',
          sender: 'pic',
          senderName: 'Aldyana',
          role: 'Frontend Engineer',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
          text: 'Halo tim klien. Penyesuaian responsif layout dan komponen modal UI pada portal mahasiswa React 19 sudah kami perbaiki dan siap diuji.',
          time: '2 jam lalu'
        }
      ]
    };

    this.render();
    this.bindEvents();

    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  }

  // Mendapatkan daftar bot yang terdaftar
  getAllBots() {
    return store.getServiceBots();
  }

  // Mendapatkan kontak tim manusia
  getTeamContacts() {
    return [
      {
        key: 'pm',
        name: 'Asisyah (Project Manajer)',
        role: 'PM Lead · Milestone & Scope',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        online: true,
        snippet: 'Draft BAST UAT tahap 1 sudah kami siapkan...',
        time: 'Kemarin'
      },
      {
        key: 'dev',
        name: 'Jaka (Backend Lead & AI Gate)',
        role: 'Backend Lead · On-Call Engineer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        online: true,
        snippet: 'Patch otomatis AI sudah diverifikasi passing...',
        time: 'Kemarin'
      },
      {
        key: 'frontend',
        name: 'Aldyana (Frontend Dev)',
        role: 'Frontend Engineer · UI/UX',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        online: true,
        snippet: 'Portal OPAC React 19 sudah disesuaikan...',
        time: '2h lalu'
      }
    ];
  }

  // Mendapatkan bot yang aktif saat ini
  getActiveBot() {
    const allBots = this.getAllBots();
    if (this.selectedSessionKey.startsWith('bot-')) {
      const found = allBots.find(b => b.id === this.selectedSessionKey);
      if (found) return found;
    }
    // Jika sedang memilih kontak human atau bot default belum ada, gunakan bot pertama
    return allBots[0] || {
      id: 'bot-default-1',
      name: '@ProjectManjerBot',
      platform: 'telegram',
      platformLabel: 'Telegram Bot API Resmi',
      projectId: 'proj-perpustakaan',
      tokenMasked: '719284...x918',
      webhookUrl: 'https://api.erpasta.id/webhooks/telegram/proj-perpustakaan',
      status: 'active',
      autoAiSync: true,
      slaTargetMinutes: 30,
      totalReportsIngested: 14
    };
  }

  // Mendapatkan riwayat pesan sesi chat yang sedang dibuka
  getCurrentChatMessages() {
    if (!this.chatSessions[this.selectedSessionKey]) {
      this.chatSessions[this.selectedSessionKey] = [];
    }
    return this.chatSessions[this.selectedSessionKey];
  }

  render() {
    const state = store.getState();
    const allBots = this.getAllBots();
    const teamContacts = this.getTeamContacts();
    const activeBot = this.getActiveBot();

    // Proyek aktif: disinkronkan dengan bot aktif jika sedang di sesi bot
    const activeProject = state.projects.find(p => p.id === activeBot.projectId) || store.getActiveProject() || state.projects[0] || {};
    const tasks = state.tasks || [];
    const invoices = state.invoices || [];

    const clientTasks = tasks.filter((t) => t.projectId === activeProject.id);
    const clientPublicTasks = clientTasks.filter((t) => t.visibility === 'client_public' || t.type === 'Bug');
    const runningTasks = clientPublicTasks.filter((t) => t.status !== 'Selesai');
    const doneTasks = clientPublicTasks.filter((t) => t.status === 'Selesai');
    const aiSyncedTasks = clientTasks.filter((t) => t.type === 'Bug' || t.aiSynced || t.prNumber || t.branchName);

    const clientInvoices = invoices.filter((i) => i.projectId === activeProject.id);
    const quotaRemaining = activeProject.maintenanceQuotaHours
      ? Math.max(0, activeProject.maintenanceQuotaHours - (activeProject.maintenanceUsedHours || 0))
      : 25;

    // Filter daftar chat (Bots & Team) sesuai tab dan search
    const q = this.searchQuery.toLowerCase().trim();
    const filteredBots = allBots.filter(b => {
      if (this.chatFilterTab === 'team') return false;
      if (!q) return true;
      const p = state.projects.find(proj => proj.id === b.projectId) || {};
      return b.name.toLowerCase().includes(q) || (b.platformLabel || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q);
    });

    const filteredTeam = teamContacts.filter(t => {
      if (this.chatFilterTab === 'bots') return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q);
    });

    const currentMessages = this.getCurrentChatMessages();
    const isHumanChat = ['pm', 'dev', 'frontend'].includes(this.selectedSessionKey);
    const activeHuman = teamContacts.find(t => t.key === this.selectedSessionKey);

    this.element.innerHTML = `
      <div class="sd-master-container">
        
        <!-- Breadcrumb & Top Action Bar -->
        <div class="sd-breadcrumb-bar">
          <div class="sd-breadcrumb-path">
            <a href="#" id="sdNavHome">Modul Proyek</a>
            <span class="sd-breadcrumb-separator">/</span>
            <span style="font-weight: 700; color: #4338ca;">${activeProject.name || 'Proyek ASTACODE'}</span>
            <span class="sd-breadcrumb-separator">/</span>
            <span>Operasional &amp; Bisnis</span>
            <span class="sd-breadcrumb-separator">/</span>
            <span class="sd-breadcrumb-current">Service Desk &amp; Automasi Klien</span>
          </div>

          <div class="sd-header-actions">
            <!-- Project Switcher Selector -->
            <select id="sdProjectSelect" class="git-input" style="width: auto; padding: 6px 12px; font-weight: 600; background: white; border-radius: 8px; border: 1px solid #cbd5e1;">
              ${(state.projects || []).map((p) => `
                <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                  ${p.code} - ${p.name.length > 28 ? p.name.substring(0, 28) + '...' : p.name}
                </option>
              `).join('')}
            </select>

            <!-- Live Status Badge of Active Session -->
            <span class="sd-status-badge" title="Status aktif sesi">
              <span class="sd-status-dot"></span>
              <span>${isHumanChat ? activeHuman.name : `${activeBot.name} Online · SLA < ${activeBot.slaTargetMinutes || 30}m`}</span>
            </span>

            <!-- Tombol 1: + Buat Bot Baru -->
            <button type="button" id="sdOpenCreateBotBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; background: white; border: 1px solid #cbd5e1; font-weight: 600;">
              ${Icons.plus('', 13)}
              <span>+ Buat Bot Baru</span>
            </button>

            <!-- Tombol 2: 🚨 Lapor Kendala / Bug -->
            <button type="button" id="sdReportBugBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; background: #e11d48; border-color: #e11d48; font-weight: 700;">
              ${Icons.shieldAlert ? Icons.shieldAlert('', 13) : Icons.plus('', 13)}
              <span>🚨 Lapor Kendala / Bug</span>
            </button>

            <!-- Tombol 3: ⚡ Automasi & Webhook -->
            <button type="button" id="sdAutomationRulesBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; background: #faf5ff; border: 1px solid #d8b4fe; color: #7e22ce; font-weight: 600;" title="Pusat Aturan Automasi Service Desk">
              ${Icons.zap('', 13)}
              <span>⚡ Automasi &amp; Webhook</span>
            </button>

            <!-- Tombol 4: 🤖 Ke Otomasi Fix Bug AI Hub -->
            <button type="button" id="sdOpenAiHubBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; font-weight: 600;" title="Pindah ke Modul Otomasi Fix Bug AI">
              ${Icons.cpu('', 13)}
              <span>🤖 Ke Otomasi Fix Bug AI</span>
            </button>

            <!-- Tombol 5: 🧪 Simulator Masuk Laporan -->
            <button type="button" id="sdOpenSimulatorBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 10px; display: inline-flex; align-items: center; gap: 5px; border-radius: 8px;" title="Uji Simulasi Masuk Payload Bot / Sentry">
              ${Icons.telegram('', 13)}
              <span>Simulator</span>
            </button>
          </div>
        </div>

        <!-- 4 Executive Scorecards (KPIs) -->
        <div class="sd-kpi-grid">
          
          <!-- KPI 1: Bot Layanan & Gateway Aktif -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">Bot Layanan Aktif</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-tg">
                ${Icons.telegram('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value" style="font-size: 15.5px; color: #0284c7; display: flex; align-items: center; gap: 6px;">
              <span>${activeBot.name}</span>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 700;">Live</span>
            </div>
            <div class="sd-kpi-subtext">
              <span style="font-weight: 600; color: #0f172a;">${activeBot.platformLabel}</span> · Webhook 200 OK · <strong>${allBots.length} Bot Siaga</strong>
            </div>
          </div>

          <!-- KPI 2: SLA Response Time & Garansi -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">SLA Tanggap &amp; On-Call Alert</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-emerald">
                ${Icons.shieldCheck('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value" style="color: #047857;">
              &lt; ${activeBot.slaTargetMinutes || 15} Menit
            </div>
            <div class="sd-kpi-subtext">
              Target S1: 30m · S2: 120m (100% Kepatuhan SLA Garansi)
            </div>
          </div>

          <!-- KPI 3: Sinkronisasi Otomasi Fix Bug AI -->
          <div class="sd-kpi-card" style="border-left: 3px solid #8b5cf6;">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">Sinkronisasi Otomasi Fix Bug AI</span>
              <div class="sd-kpi-icon-wrap" style="background: #ede9fe; color: #7c3aed;">
                ${Icons.cpu('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value" style="color: #6d28d9;">
              ${aiSyncedTasks.length} Tiket <span style="font-size: 11px; font-weight: 600; color: #7c3aed;">Tersinkron</span>
            </div>
            <div class="sd-kpi-subtext" style="display: flex; align-items: center; justify-content: space-between;">
              <span>Auto-Triage Gemini &amp; Auto-PR Ready</span>
              <span class="sd-ai-sync-pill active">✓ Terhubung</span>
            </div>
          </div>

          <!-- KPI 4: Public Tasks & Status Garansi Klien -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">Tiket Transparansi Klien</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-amber">
                ${Icons.listTodo('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value">
              ${runningTasks.length} <span style="font-size: 12px; font-weight: 600; color: #64748b;">Aktif Berjalan</span>
            </div>
            <div class="sd-kpi-subtext">
              <span style="color: #059669; font-weight: 700;">${doneTasks.length} Tiket Selesai</span> &amp; Lolos UAT
            </div>
          </div>

        </div>

        <!-- Main Workspace (Proportional 3-Column Desk) -->
        <div class="sd-workspace-grid">
          
          <!-- ================================================================ -->
          <!-- Kolom 1: Daftar Chat Semua Bot & Saluran Layanan (320px)        -->
          <!-- ================================================================ -->
          <div class="tg-channel-sidebar">
            <div class="tg-sidebar-header">
              <div class="tg-sidebar-title-row">
                <span class="tg-sidebar-title">
                  ${Icons.telegram('', 16)}
                  <span>Pusat Layanan Chat</span>
                </span>
                <button type="button" id="sdSidebarAddBotBtn" class="finance-btn-secondary" style="font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: 700;" title="Tambah Bot Baru ke List Chat">
                  + Buat Bot
                </button>
              </div>

              <!-- Search Box -->
              <div class="tg-search-box">
                <span class="tg-search-icon">${Icons.search('', 13)}</span>
                <input type="text" id="tgSearchInput" placeholder="Cari bot, nama proyek, atau tiket..." value="${this.searchQuery}" />
              </div>
            </div>

            <!-- Filter Tabs Kategori Chat (Semua / Bot Layanan / Tim Internal) -->
            <div class="tg-filter-tabs">
              <button type="button" class="tg-filter-tab-btn ${this.chatFilterTab === 'all' ? 'active' : ''}" data-tab="all">
                Semua (${allBots.length + teamContacts.length})
              </button>
              <button type="button" class="tg-filter-tab-btn ${this.chatFilterTab === 'bots' ? 'active' : ''}" data-tab="bots">
                🤖 Bot Layanan (${allBots.length})
              </button>
              <button type="button" class="tg-filter-tab-btn ${this.chatFilterTab === 'team' ? 'active' : ''}" data-tab="team">
                👥 Tim Dev (${teamContacts.length})
              </button>
            </div>

            <!-- Daftar Chat (SEMUA BOT & TIM MASUK DI SINI) -->
            <div class="tg-channel-list">
              
              <!-- 1. Bagian Bot Layanan (Semua bot yang ada di sistem) -->
              ${filteredBots.map((bot) => {
                const isSelected = this.selectedSessionKey === bot.id;
                const proj = state.projects.find(p => p.id === bot.projectId) || {};
                const sessionMsgs = this.chatSessions[bot.id] || [];
                const lastMsg = sessionMsgs.length > 0 ? sessionMsgs[sessionMsgs.length - 1] : null;
                const snippet = lastMsg ? (lastMsg.text.replace(/<[^>]*>?/gm, '').substring(0, 48) + '...') : 'Siap menerima laporan kendala...';
                const msgTime = lastMsg ? lastMsg.time : 'Online';

                return `
                  <div class="tg-channel-item ${isSelected ? 'active' : ''}" data-session-key="${bot.id}" data-type="bot" title="${bot.name} - ${proj.name || 'Proyek'}">
                    <div class="tg-avatar-wrap">
                      <div class="tg-avatar-bot">
                        ${bot.platform === 'whatsapp' ? '💬' : bot.platform === 'slack' ? '💼' : Icons.telegram('', 18)}
                      </div>
                      <span class="tg-online-badge"></span>
                    </div>

                    <div class="tg-channel-content">
                      <div class="tg-channel-top-line">
                        <span class="tg-channel-name">
                          ${bot.name}
                          <span class="tg-verified-icon">${Icons.checkCircle('', 12)}</span>
                        </span>
                        <span class="tg-channel-time">${msgTime}</span>
                      </div>

                      <div class="tg-channel-meta-row">
                        <span class="tg-channel-project-tag">${proj.code || 'PROJ'}</span>
                        ${bot.autoAiSync ? '<span class="tg-channel-ai-tag">🤖 Auto-AI</span>' : ''}
                      </div>

                      <span class="tg-channel-snippet">${snippet}</span>
                    </div>
                  </div>
                `;
              }).join('')}

              <!-- 2. Bagian Tim Internal Human On-Call -->
              ${filteredTeam.map((team) => {
                const isSelected = this.selectedSessionKey === team.key;
                const sessionMsgs = this.chatSessions[team.key] || [];
                const lastMsg = sessionMsgs.length > 0 ? sessionMsgs[sessionMsgs.length - 1] : null;
                const snippet = lastMsg ? (lastMsg.text.replace(/<[^>]*>?/gm, '').substring(0, 48) + '...') : team.snippet;
                const msgTime = lastMsg ? lastMsg.time : team.time;

                return `
                  <div class="tg-channel-item ${isSelected ? 'active' : ''}" data-session-key="${team.key}" data-type="human" title="${team.name}">
                    <div class="tg-avatar-wrap">
                      <img src="${team.avatar}" alt="${team.name}" class="tg-avatar-img" />
                      <span class="tg-online-badge"></span>
                    </div>

                    <div class="tg-channel-content">
                      <div class="tg-channel-top-line">
                        <span class="tg-channel-name">${team.name}</span>
                        <span class="tg-channel-time">${msgTime}</span>
                      </div>

                      <div class="tg-channel-meta-row">
                        <span class="tg-channel-human-tag">Internal Team</span>
                      </div>

                      <span class="tg-channel-snippet">${snippet}</span>
                    </div>
                  </div>
                `;
              }).join('')}

              ${filteredBots.length === 0 && filteredTeam.length === 0 ? `
                <div style="padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 11px;">
                  Tidak ada percakapan atau bot yang cocok dengan pencarian "<strong>${this.searchQuery}</strong>".
                </div>
              ` : ''}

            </div>

            <!-- Tiket Terkait & Status Otomasi AI Pada Proyek Aktif -->
            <div class="tg-sidebar-linked-tickets">
              <div class="tg-sidebar-subheading">
                <span>Tiket Terkait [${activeProject.code || 'PROJ'}] (${clientPublicTasks.length})</span>
                <span style="font-size: 10px; color: #4338ca; cursor: pointer;" id="sdQuickSyncAllBtn" title="Sinkronkan seluruh tiket ke Modul Otomasi Fix Bug AI">
                  ⚡ Sync AI
                </span>
              </div>
              <div class="tg-ticket-pills-row">
                ${clientPublicTasks.slice(0, 4).map((t) => {
                  const hasPr = !!t.prNumber;
                  const isAnalyzing = t.status === 'Dianalisis' || t.status === 'In Progress';
                  return `
                    <div class="tg-ticket-mini-pill tg-ticket-shortcut" data-task-id="${t.id}" title="${t.title}">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                        <span style="font-family: var(--font-mono); font-weight: 700; color: #0284c7;">${t.key}</span>
                        ${hasPr ? `
                          <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; background: #ede9fe; color: #6d28d9; font-weight: 700;">${t.prNumber}</span>
                        ` : isAnalyzing ? `
                          <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; background: #fef3c7; color: #b45309; font-weight: 700;">⚡ AI Fix</span>
                        ` : `
                          <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; ${
                            t.status === 'Selesai' ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #475569;'
                          }">${t.status}</span>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Bot Token & Webhook Info Box -->
            <div style="padding: 10px 14px; background: #f0fdf4; border-top: 1px solid #bbf7d0; font-size: 11px; color: #166534; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">Webhook Token Bot:</span>
                <button type="button" id="copyTgCodeBtn" data-code="${activeBot.tokenMasked || 'tok_sec...77a'}" style="font-family: var(--font-mono); font-weight: 700; background: white; border: 1px solid #86efac; border-radius: 4px; padding: 2px 7px; color: #15803d; cursor: pointer;">
                  ${activeBot.tokenMasked || 'tok_sec...77a'}
                </button>
              </div>
              <div style="font-size: 10px; color: #4b5563; word-break: break-all;">
                Endpoint: <code>${activeBot.webhookUrl || 'https://api.erpasta.id/webhooks/bot'}</code>
              </div>
            </div>

          </div>

          <!-- ================================================================ -->
          <!-- Kolom 2: Arena Chat Telegram Proporsional (1fr)                  -->
          <!-- ================================================================ -->
          <div class="tg-chat-arena">
            
            <!-- Chat Header -->
            <div class="tg-chat-header">
              <div class="tg-chat-header-identity">
                <div class="tg-avatar-wrap" style="width: 38px; height: 38px;">
                  ${isHumanChat ? `
                    <img src="${activeHuman.avatar}" alt="${activeHuman.name}" class="tg-avatar-img" />
                  ` : `
                    <div class="tg-avatar-bot" style="font-size: 18px;">
                      ${activeBot.platform === 'whatsapp' ? '💬' : activeBot.platform === 'slack' ? '💼' : Icons.telegram('', 18)}
                    </div>
                  `}
                  <span class="tg-online-badge"></span>
                </div>

                <div class="tg-chat-header-titles">
                  <div class="tg-chat-header-name">
                    <span>${isHumanChat ? activeHuman.name : activeBot.name}</span>
                    <span class="tg-verified-icon">${Icons.checkCircle('', 13)}</span>
                    ${!isHumanChat && activeBot.autoAiSync ? `
                      <span class="sd-ai-sync-pill active" style="margin-left: 6px;">🤖 Auto-Sync AI Aktif</span>
                    ` : ''}
                  </div>
                  <div class="tg-chat-header-status">
                    <span class="sd-status-dot" style="background: #10b981; width: 6px; height: 6px;"></span>
                    <span>${isHumanChat ? activeHuman.role : `Terhubung ke ${activeProject.name || 'Proyek'} · SLA ${activeBot.slaTargetMinutes || 30}m`}</span>
                  </div>
                </div>
              </div>

              <div class="tg-chat-header-tools">
                <button type="button" id="triggerHumanCallBtn" class="git-filter-pill" style="font-size: 11px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 4px; color: #0284c7; border-color: #bae6fd;">
                  ${Icons.user('', 12)}
                  <span>Panggil Human Dev</span>
                </button>
                <button type="button" id="toggleDrawerBtn" class="git-view-btn" style="padding: 6px;" title="Tampilkan/Sembunyikan Panel Informasi Klien">
                  ${Icons.sliders('', 14)}
                </button>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="tg-chat-stream" id="tgChatStream">
              
              <div class="tg-day-divider">Hari ini · Sesi Pelayanan ${isHumanChat ? activeHuman.name : activeBot.name}</div>

              ${currentMessages.map((m) => `
                <div class="tg-message-wrap ${m.sender === 'client' ? 'out' : 'in'}">
                  <div class="tg-bubble ${m.sender === 'client' ? 'out' : 'in'}">
                    
                    ${m.sender !== 'client' ? `
                      <div class="tg-bubble-sender-title">
                        <span>${m.senderName}</span>
                        <span style="font-size: 10px; font-weight: 500; color: #64748b;">(${m.role})</span>
                      </div>
                    ` : ''}

                    <div class="tg-bubble-text">
                      ${m.text}
                    </div>

                    ${m.inlineButtons && m.inlineButtons.length > 0 ? `
                      <div class="tg-inline-keyboard">
                        ${m.inlineButtons.map((btn) => `
                          <button type="button" class="tg-inline-btn ${btn.action === 'runAiFix' ? 'tg-inline-btn-purple' : btn.action === 'openAiHub' ? 'tg-inline-btn-primary' : ''}" 
                            data-command="${btn.command || ''}" 
                            data-action="${btn.action || ''}" 
                            data-task-id="${btn.taskId || ''}"
                            data-session-key="${btn.sessionKey || ''}">
                            ${btn.label}
                          </button>
                        `).join('')}
                      </div>
                    ` : ''}

                    <div class="tg-bubble-footer">
                      <span>${m.time}</span>
                      ${m.sender === 'client' ? `
                        <span class="tg-ticks-read" title="Terkirim &amp; Dibaca">&#10003;&#10003;</span>
                      ` : ''}
                    </div>

                  </div>
                </div>
              `).join('')}

              <!-- Typing Indicator -->
              <div class="tg-typing-indicator ${this.isTyping ? 'active' : ''}" id="tgTypingIndicator">
                <span class="tg-typing-dot"></span>
                <span class="tg-typing-dot"></span>
                <span class="tg-typing-dot"></span>
                <span style="margin-left: 4px;">${isHumanChat ? activeHuman.name : activeBot.name} sedang memproses...</span>
              </div>

            </div>

            <!-- Quick Commands Bar -->
            <div class="tg-quick-commands">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 4px;">Perintah Cepat:</span>
              ${clientPublicTasks.slice(0, 2).map(t => `
                <button type="button" class="tg-command-pill" data-command="/status ${t.key}">/status ${t.key}</button>
                <button type="button" class="tg-command-pill" data-command="/autofix ${t.key}" style="color: #6d28d9; border-color: #ddd6fe; font-weight: 700;">⚡ /autofix ${t.key}</button>
              `).join('')}
              <button type="button" class="tg-command-pill" data-command="/sync">/sync</button>
              <button type="button" class="tg-command-pill" data-command="/help">/help</button>
              <button type="button" class="tg-command-pill" data-command="/human">/human</button>
              <button type="button" class="tg-command-pill" data-command="/invoice">/invoice</button>
              <button type="button" class="tg-command-pill" data-command="/sla">/sla</button>
              <button type="button" id="tgPillReportBug" class="tg-command-pill" style="color: #be123c; border-color: #fecdd3; font-weight: 700;">+ Lapor Bug</button>
            </div>

            <!-- Input Bar -->
            <form id="tgMessageForm" class="tg-input-bar">
              <button type="button" id="tgAttachFileBtn" class="tg-icon-btn" title="Lampirkan Dokumen / Screenshot Bug">
                ${Icons.link('', 16)}
              </button>

              <input type="text" id="tgMsgInput" class="tg-input-field" placeholder="Ketik kendala atau perintah (/status, /autofix, /help, /human)..." autocomplete="off" />

              <button type="button" id="tgEmojiBtn" class="tg-icon-btn" title="Emoji">
                <span style="font-size: 16px;">😊</span>
              </button>

              <button type="submit" class="tg-send-btn" title="Kirim Pesan (Enter)">
                ${Icons.send('', 16)}
              </button>
            </form>

          </div>

          <!-- ================================================================ -->
          <!-- Kolom 3: Transparency Drawer & Widget Otomasi AI (320px)         -->
          <!-- ================================================================ -->
          <div class="sd-transparency-drawer ${this.isDrawerOpen ? '' : 'mobile-show'}">
            
            <!-- Profil Klien & Bot Aktif -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Profil Klien &amp; Bot Aktif</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #047857;">Aktif</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                <div class="sd-info-row">
                  <span class="sd-info-label">Institusi:</span>
                  <span class="sd-info-val" style="text-align: right; max-width: 170px;">${activeProject.clientName || 'Universitas Nusantara'}</span>
                </div>
                <div class="sd-info-row">
                  <span class="sd-info-label">Bot Terhubung:</span>
                  <span class="sd-info-val" style="color: #0284c7; font-weight: 700;">${activeBot.name}</span>
                </div>
                <div class="sd-info-row">
                  <span class="sd-info-label">Masa Garansi:</span>
                  <span class="sd-info-val" style="color: #059669;">s/d ${activeProject.warrantyUntil || '31 Okt 2027'}</span>
                </div>
                <div class="sd-info-row">
                  <span class="sd-info-label">Nilai Kontrak:</span>
                  <span class="sd-info-val" style="font-family: var(--font-mono);">${this.formatIDR(activeProject.contractValue || 185000000)}</span>
                </div>
              </div>

              <!-- Toggle Auto AI Sync -->
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 11px; font-weight: 600; color: #334155;">Sinkronkan ke Otomasi AI:</span>
                <label class="sd-switch">
                  <input type="checkbox" id="toggleAutoAiSyncCheckbox" ${activeBot.autoAiSync ? 'checked' : ''} />
                  <span class="sd-slider"></span>
                </label>
              </div>
            </div>

            <!-- Kuota Maintenance -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Kuota Garansi Maintenance</span>
                <span style="font-family: var(--font-mono); color: #059669;">${quotaRemaining}h / ${activeProject.maintenanceQuotaHours || 25}h</span>
              </div>
              <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 9999px; overflow: hidden; margin: 4px 0;">
                <div style="height: 100%; border-radius: 9999px; background: #10b981; width: ${((quotaRemaining / (activeProject.maintenanceQuotaHours || 25)) * 100)}%;"></div>
              </div>
              <span style="font-size: 10px; color: #64748b;">
                Perbaikan bug dan penyesuaian minor gratis selama masa garansi SLA.
              </span>
            </div>

            <!-- Widget Live Pipeline Otomasi Fix Bug AI -->
            <div class="sd-drawer-section-card" style="border-left: 3px solid #8b5cf6;">
              <div class="sd-drawer-title">
                <span style="display: flex; align-items: center; gap: 5px;">
                  ${Icons.cpu('', 13)}
                  <span>Pipeline Otomasi Fix Bug AI</span>
                </span>
                <button type="button" id="sdDrawerOpenAiHubBtn" style="background: none; border: none; color: #6d28d9; font-size: 10px; font-weight: 700; cursor: pointer;">
                  Buka AI Hub &rarr;
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${aiSyncedTasks.slice(0, 3).map((t) => `
                  <div class="sd-pipeline-step-item" style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-family: var(--font-mono); font-weight: 700; color: #0284c7;">${t.key}</span>
                        <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; ${
                          t.prNumber ? 'background: #ede9fe; color: #6d28d9; font-weight: 700;' : 'background: #f1f5f9; color: #475569;'
                        }">
                          ${t.prNumber ? t.prNumber : t.status}
                        </span>
                      </div>
                      <div style="font-size: 10px; color: #64748b; max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
                        ${t.title}
                      </div>
                    </div>

                    <button type="button" class="sd-action-ai-btn select-to-ai-hub-btn" data-task-id="${t.id}" style="padding: 3px 8px; border-radius: 4px; background: #f5f3ff; border: 1px solid #ddd6fe; color: #7c3aed; font-size: 10px; font-weight: 700; cursor: pointer;" title="Perbaiki langsung dengan AI">
                      ⚡ Fix AI
                    </button>
                  </div>
                `).join('')}

                ${aiSyncedTasks.length === 0 ? `
                  <div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 8px 0;">
                    Belum ada tiket yang masuk ke pipeline AI pada proyek ini.
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Tiket Publik Klien -->
            <div class="sd-drawer-section-card" style="flex: 1;">
              <div class="sd-drawer-title">
                <span>Tiket Klien (${clientPublicTasks.length})</span>
                <span style="font-size: 10px; color: #64748b;">Klik untuk detail</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                ${clientPublicTasks.length === 0 ? `
                  <div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 12px 0;">
                    Belum ada tiket yang dipublikasikan.
                  </div>
                ` : clientPublicTasks.map((t) => `
                  <div class="sd-ticket-card-mini client-task-item" data-task-id="${t.id}" style="padding: 8px 10px; border-radius: 6px; background: white; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.15s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11px; color: #0284c7;">${t.key}</span>
                      <span style="font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; ${
                        t.status === 'Selesai' ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #334155;'
                      }">
                        ${t.status}
                      </span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${t.title}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tagihan & Termin Invoice -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Tagihan &amp; Termin Invoice</span>
                <button type="button" id="sdOpenFinanceBtn" style="background: none; border: none; color: #4338ca; font-size: 10px; font-weight: 700; cursor: pointer;">
                  Keuangan &rarr;
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${clientInvoices.slice(0, 2).map((inv) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 6px 8px; background: white; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <div>
                      <div style="font-weight: 700; font-family: var(--font-mono); color: #0f172a;">${inv.invoiceNumber}</div>
                      <div style="font-size: 10px; color: #64748b;">${inv.type}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; font-family: var(--font-mono); color: #0f172a;">${this.formatIDR(inv.totalAmount)}</div>
                      <span style="font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 3px; ${
                        inv.status === 'Lunas' ? 'background: #dcfce7; color: #15803d;' : 'background: #fef3c7; color: #b45309;'
                      }">
                        ${inv.status}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- MODAL 1: BUAT BOT LAYANAN BARU -->
      ${this.showCreateBotModal ? this.renderCreateBotModal(activeProject) : ''}

      <!-- MODAL 2: BUAT LAPORAN BUG TERSTRUKTUR -->
      ${this.showBugReportModal ? this.renderBugReportModal(activeProject, activeBot) : ''}

      <!-- MODAL 3: PUSAT ATURAN OTOMASI SERVICE DESK -->
      ${this.showAutomationModal ? this.renderAutomationModal(activeBot) : ''}
    `;

    this.scrollToBottom();
  }

  renderCreateBotModal(activeProject) {
    const state = store.getState();
    const projects = state.projects || [];

    return `
      <div class="sd-modal-overlay" id="createBotModalOverlay">
        <div class="sd-modal-box">
          <div class="sd-modal-header">
            <h2 class="sd-modal-title">
              <span style="color: #24a1de;">${Icons.telegram('', 20)}</span>
              <span>Buat &amp; Daftarkan Bot Layanan Baru</span>
            </h2>
            <button type="button" class="sd-modal-close-btn" id="closeCreateBotModalBtn">
              ${Icons.x('', 16)}
            </button>
          </div>

          <form id="createBotForm" class="sd-modal-body">
            <div class="sd-form-grid">
              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Nama / Handle Bot <span style="color: #e11d48;">*</span></span>
                  <span class="sd-form-hint">Harus berakhiran 'Bot'</span>
                </label>
                <input type="text" id="botNameInput" class="sd-form-input" placeholder="@NamaLayananClientBot" required />
              </div>

              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Platform Integrasi <span style="color: #e11d48;">*</span></span>
                </label>
                <select id="botPlatformSelect" class="sd-form-select">
                  <option value="telegram" selected>Telegram Bot API Resmi</option>
                  <option value="whatsapp">WhatsApp Business Cloud API</option>
                  <option value="slack">Slack Incoming Webhook</option>
                  <option value="webhook">Custom REST API Webhook</option>
                </select>
              </div>
            </div>

            <div class="sd-form-grid">
              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Target Proyek <span style="color: #e11d48;">*</span></span>
                </label>
                <select id="botProjectSelect" class="sd-form-select">
                  ${projects.map(p => `
                    <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                      ${p.code} - ${p.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>SLA Tanggap Default</span>
                </label>
                <select id="botSlaSelect" class="sd-form-select">
                  <option value="15">15 Menit (Siaga Kritis / Hotfix)</option>
                  <option value="30" selected>30 Menit (Standar Kontrak S1)</option>
                  <option value="60">60 Menit (Standar S2)</option>
                </select>
              </div>
            </div>

            <div class="sd-form-group">
              <label class="sd-form-label">
                <span>Bot Token / API Secret <span style="color: #e11d48;">*</span></span>
                <span class="sd-form-hint">Dapatkan dari @BotFather atau konsol API</span>
              </label>
              <input type="text" id="botTokenInput" class="sd-form-input" placeholder="719284192:AAHKz91823x918SecureToken..." required />
            </div>

            <div class="sd-toggle-row">
              <div class="sd-toggle-info">
                <div class="sd-toggle-title">
                  <span>🤖 Otomatis Sinkronkan ke Modul Otomasi Fix Bug AI</span>
                  <span class="sd-ai-sync-pill active">Rekomendasi</span>
                </div>
                <div class="sd-toggle-desc">
                  Setiap laporan kendala yang masuk via bot ini akan langsung di-triage oleh Gemini Engine dan dibuatkan branch fix serta draft PR.
                </div>
              </div>
              <label class="sd-switch">
                <input type="checkbox" id="botAutoAiSyncInput" checked />
                <span class="sd-slider"></span>
              </label>
            </div>

            <div class="sd-form-group">
              <label class="sd-form-label">
                <span>Template Pesan Sambutan Klien</span>
              </label>
              <textarea id="botWelcomeInput" class="sd-form-textarea" placeholder="Tuliskan pesan pembuka ketika klien mengetik /start...">Halo Tim Klien! Selamat datang di Service Desk Resmi. Kami siap menerima laporan kendala dan pertanyaan Anda seputar sistem.</textarea>
            </div>

            <div class="sd-modal-footer" style="margin: 0 -22px -20px -22px;">
              <button type="button" class="finance-btn-secondary" id="cancelCreateBotBtn" style="padding: 8px 16px;">Batal</button>
              <button type="submit" class="finance-btn-primary" style="padding: 8px 18px; background: #4f46e5; border-color: #4f46e5; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.plus('', 14)}
                <span>Simpan &amp; Aktifkan Bot</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderBugReportModal(activeProject, activeBot) {
    return `
      <div class="sd-modal-overlay" id="bugReportModalOverlay">
        <div class="sd-modal-box">
          <div class="sd-modal-header">
            <h2 class="sd-modal-title">
              <span style="color: #e11d48;">${Icons.shieldAlert ? Icons.shieldAlert('', 20) : Icons.plus('', 20)}</span>
              <span>Formulir Laporan Bug &amp; Kendala Klien</span>
            </h2>
            <button type="button" class="sd-modal-close-btn" id="closeBugReportModalBtn">
              ${Icons.x('', 16)}
            </button>
          </div>

          <form id="bugReportForm" class="sd-modal-body">
            <div class="sd-form-grid">
              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Proyek <span style="color: #e11d48;">*</span></span>
                </label>
                <input type="text" class="sd-form-input" value="${activeProject.name || 'Proyek ASTACODE'}" disabled style="background: #f1f5f9; cursor: not-allowed;" />
              </div>

              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Tingkat Keparahan (Severity) <span style="color: #e11d48;">*</span></span>
                </label>
                <select id="bugSeveritySelect" class="sd-form-select">
                  <option value="S1 - Critical (Blocker)">S1 - Kritis / Blocker (SLA Respon &lt; 30 Menit)</option>
                  <option value="S2 - Major" selected>S2 - Major / Logika Bisnis (SLA Respon &lt; 120 Menit)</option>
                  <option value="S3 - Minor">S3 - Minor / Tampilan Visual (SLA Respon &lt; 8 Jam)</option>
                </select>
              </div>
            </div>

            <div class="sd-form-group">
              <label class="sd-form-label">
                <span>Judul Kendala / Bug <span style="color: #e11d48;">*</span></span>
              </label>
              <input type="text" id="bugTitleInput" class="sd-form-input" placeholder="Contoh: Error 500 saat validasi kuota peminjaman dengan denda aktif" required />
            </div>

            <div class="sd-form-grid">
              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Lingkungan (Environment)</span>
                </label>
                <select id="bugEnvSelect" class="sd-form-select">
                  <option value="Production" selected>Live Production</option>
                  <option value="Staging">Staging UAT</option>
                  <option value="Development">Development Sandbox</option>
                </select>
              </div>

              <div class="sd-form-group">
                <label class="sd-form-label">
                  <span>Saluran Laporan (Source)</span>
                </label>
                <select id="bugSourceSelect" class="sd-form-select">
                  <option value="Telegram Bot" selected>${activeBot.name} (Bot Aktif)</option>
                  <option value="Portal Klien Web">Portal Klien Web</option>
                  <option value="Sentry Webhook">Sentry Telemetry Exception</option>
                  <option value="WhatsApp">WhatsApp Business PIC</option>
                </select>
              </div>
            </div>

            <div class="sd-form-group">
              <label class="sd-form-label">
                <span>Deskripsi Rinci &amp; Langkah Reproduksi</span>
                <span class="sd-form-hint">Jelaskan payload error atau kronologi kejadian</span>
              </label>
              <textarea id="bugDescInput" class="sd-form-textarea" placeholder="1. Buka modul sirkulasi&#10;2. Masukkan ID Mahasiswa yang memiliki denda&#10;3. Muncul dialog 500 Internal Server Error..." required></textarea>
            </div>

            <div class="sd-toggle-row">
              <div class="sd-toggle-info">
                <div class="sd-toggle-title">
                  <span>⚡ Langsung Picu Engine Otomasi Fix Bug AI</span>
                  <span class="sd-ai-sync-pill active">Otomasi</span>
                </div>
                <div class="sd-toggle-desc">
                  AI akan langsung menganalisis stack trace, mencari akar masalah (Root Cause), dan membuat draft PR patch secara otomatis.
                </div>
              </div>
              <label class="sd-switch">
                <input type="checkbox" id="bugAutoAiFixInput" checked />
                <span class="sd-slider"></span>
              </label>
            </div>

            <div class="sd-modal-footer" style="margin: 0 -22px -20px -22px;">
              <button type="button" class="finance-btn-secondary" id="cancelBugReportBtn" style="padding: 8px 16px;">Batal</button>
              <button type="submit" class="finance-btn-primary" style="padding: 8px 18px; background: #e11d48; border-color: #e11d48; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.send('', 14)}
                <span>Kirim Laporan &amp; Triage</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderAutomationModal(activeBot) {
    return `
      <div class="sd-modal-overlay" id="automationModalOverlay">
        <div class="sd-modal-box">
          <div class="sd-modal-header">
            <h2 class="sd-modal-title">
              <span style="color: #7c3aed;">${Icons.zap('', 20)}</span>
              <span>Pusat Aturan Automasi Service Desk &amp; AI</span>
            </h2>
            <button type="button" class="sd-modal-close-btn" id="closeAutomationModalBtn">
              ${Icons.x('', 16)}
            </button>
          </div>

          <div class="sd-modal-body">
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              Konfigurasikan alur kerja otomatis antara saluran bot klien, SLA garansi, dan Modul Otomasi Fix Bug AI.
            </p>

            <div class="sd-rule-card">
              <div class="sd-rule-header">
                <div class="sd-rule-title">
                  <span>1. Auto-Triage &amp; Klasifikasi Keparahan</span>
                  <span class="sd-ai-sync-pill active">Aktif</span>
                </div>
                <label class="sd-switch">
                  <input type="checkbox" checked />
                  <span class="sd-slider"></span>
                </label>
              </div>
              <span style="font-size: 11px; color: #475569;">
                Menganalisis kata kunci laporan ('down', 'deadlock', 'typo', 'diskon') untuk menentukan severity S1/S2/S3 dan target SLA countdown.
              </span>
            </div>

            <div class="sd-rule-card">
              <div class="sd-rule-header">
                <div class="sd-rule-title">
                  <span>2. Sinkronisasi Dua Arah Otomasi Fix Bug AI</span>
                  <span class="sd-ai-sync-pill active">Aktif</span>
                </div>
                <label class="sd-switch">
                  <input type="checkbox" id="ruleAiSyncToggle" ${activeBot.autoAiSync ? 'checked' : ''} />
                  <span class="sd-slider"></span>
                </label>
              </div>
              <span style="font-size: 11px; color: #475569;">
                Meneruskan tiket bug baru ke Intelligent Orchestrator AI untuk membuat branch git <code>fix/</code>, auto-generate patch, dan menjalankan 5/5 unit tests.
              </span>
            </div>

            <div class="sd-rule-card">
              <div class="sd-rule-header">
                <div class="sd-rule-title">
                  <span>3. Routing Otomatis ke On-Call Engineer</span>
                  <span class="sd-ai-sync-pill active">Aktif</span>
                </div>
                <label class="sd-switch">
                  <input type="checkbox" checked />
                  <span class="sd-slider"></span>
                </label>
              </div>
              <span style="font-size: 11px; color: #475569;">
                Menugaskan tiket severity S1 ke Lead Developer (Jaka) dan mengirim notifikasi darurat via Bot API resmi.
              </span>
            </div>

            <div class="sd-rule-card">
              <div class="sd-rule-header">
                <div class="sd-rule-title">
                  <span>4. Webhook Notifikasi Balasan ke Grup Klien</span>
                  <span class="sd-ai-sync-pill active">Aktif</span>
                </div>
                <label class="sd-switch">
                  <input type="checkbox" checked />
                  <span class="sd-slider"></span>
                </label>
              </div>
              <span style="font-size: 11px; color: #475569;">
                Ketika PR bug disetujui atau di-deploy ke staging, bot secara otomatis mengirim kabar progres ke grup chat klien.
              </span>
            </div>

            <div class="sd-rule-card">
              <div class="sd-rule-header">
                <div class="sd-rule-title">
                  <span>5. SLA Countdown &amp; Safety Escalation</span>
                  <span class="sd-ai-sync-pill active">Aktif</span>
                </div>
                <label class="sd-switch">
                  <input type="checkbox" checked />
                  <span class="sd-slider"></span>
                </label>
              </div>
              <span style="font-size: 11px; color: #475569;">
                Jika tiket S1 belum direspon dalam 30 menit, sistem memicu eskalasi langsung ke Project Manager via alert telepon &amp; webhook.
              </span>
            </div>
          </div>

          <div class="sd-modal-footer">
            <button type="button" class="finance-btn-secondary" id="closeAutomationModalFooterBtn">Tutup</button>
            <button type="button" class="finance-btn-primary" id="saveAutomationRulesBtn" style="background: #7c3aed; border-color: #7c3aed;">
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    `;
  }

  scrollToBottom() {
    setTimeout(() => {
      const stream = this.element.querySelector('#tgChatStream');
      if (stream) {
        stream.scrollTop = stream.scrollHeight;
      }
    }, 50);
  }

  bindEvents() {
    // Click Delegations
    this.element.addEventListener('click', async (e) => {
      // 1. Ganti Sesi Chat (Ketika Klik Salah Satu Bot atau Kontak di Kolom Kiri)
      const channelItem = e.target.closest('.tg-channel-item[data-session-key]');
      if (channelItem) {
        const sessionKey = channelItem.dataset.sessionKey;
        if (sessionKey && sessionKey !== this.selectedSessionKey) {
          this.selectedSessionKey = sessionKey;

          // Jika yang diklik adalah bot, sinkronkan proyek aktif ERP ke proyek bot tersebut
          if (sessionKey.startsWith('bot-')) {
            const allBots = this.getAllBots();
            const bot = allBots.find(b => b.id === sessionKey);
            if (bot && bot.projectId) {
              store.setSelectedProjectId(bot.projectId);
            }
          }

          this.render();
        }
        return;
      }

      // 2. Ganti Tab Filter Chat di Sidebar Kiri (Semua / Bot Layanan / Tim Internal)
      const filterTabBtn = e.target.closest('.tg-filter-tab-btn[data-tab]');
      if (filterTabBtn) {
        this.chatFilterTab = filterTabBtn.dataset.tab;
        this.render();
        return;
      }

      // 3. Klik Command Chip Perintah Cepat
      const cmdPill = e.target.closest('.tg-command-pill[data-command]');
      if (cmdPill) {
        const cmd = cmdPill.dataset.command;
        this.handleUserSendMessage(cmd);
        return;
      }

      // 4. Klik Tombol Inline di Dalam Pesan Bot
      const inlineBtn = e.target.closest('.tg-inline-btn');
      if (inlineBtn) {
        const cmd = inlineBtn.dataset.command;
        const action = inlineBtn.dataset.action;
        const taskId = inlineBtn.dataset.taskId;
        const sessionKey = inlineBtn.dataset.sessionKey;

        if (cmd) {
          this.handleUserSendMessage(cmd);
        } else if (action === 'openTask' && taskId) {
          const task = store.getState().tasks.find((t) => t.id === taskId || t.key === taskId);
          if (task) {
            this.onSelectTask(task);
          } else {
            store.addToast('info', 'Tiket Ditemukan', `Membuka detail tiket ${taskId}...`);
          }
        } else if (action === 'runAiFix' && taskId) {
          await this.triggerAiFixForTask(taskId);
        } else if (action === 'openAiHub') {
          store.setActiveTab('ai');
        } else if (action === 'openGit') {
          store.setActiveTab('github');
        } else if (action === 'openFinance') {
          store.setActiveTab('crm');
        } else if (action === 'switchSession' && sessionKey) {
          this.selectedSessionKey = sessionKey;
          this.render();
        }
        return;
      }

      // 5. Klik Tiket Shortcut di Sidebar atau Drawer
      const ticketShortcut = e.target.closest('.tg-ticket-shortcut') || e.target.closest('.client-task-item');
      if (ticketShortcut) {
        const taskId = ticketShortcut.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          this.onSelectTask(task);
        }
        return;
      }

      // 6. Action: Select to AI Hub Button from Drawer Widget
      const selectAiBtn = e.target.closest('.select-to-ai-hub-btn');
      if (selectAiBtn) {
        const taskId = selectAiBtn.dataset.taskId;
        await this.triggerAiFixForTask(taskId);
        return;
      }

      // 7. Buka Modal Buat Bot Baru
      if (e.target.closest('#sdOpenCreateBotBtn') || e.target.closest('#sdSidebarAddBotBtn')) {
        this.showCreateBotModal = true;
        this.render();
        return;
      }

      // Tutup Modal Buat Bot Baru
      if (e.target.closest('#closeCreateBotModalBtn') || e.target.closest('#cancelCreateBotBtn') || e.target.id === 'createBotModalOverlay') {
        this.showCreateBotModal = false;
        this.render();
        return;
      }

      // 8. Buka Modal Lapor Bug
      if (e.target.closest('#sdReportBugBtn') || e.target.closest('#tgPillReportBug')) {
        this.showBugReportModal = true;
        this.render();
        return;
      }

      // Tutup Modal Lapor Bug
      if (e.target.closest('#closeBugReportModalBtn') || e.target.closest('#cancelBugReportBtn') || e.target.id === 'bugReportModalOverlay') {
        this.showBugReportModal = false;
        this.render();
        return;
      }

      // 9. Buka Modal Aturan Automasi
      if (e.target.closest('#sdAutomationRulesBtn')) {
        this.showAutomationModal = true;
        this.render();
        return;
      }

      // Tutup Modal Aturan Automasi
      if (e.target.closest('#closeAutomationModalBtn') || e.target.closest('#closeAutomationModalFooterBtn') || e.target.id === 'automationModalOverlay') {
        this.showAutomationModal = false;
        this.render();
        return;
      }

      // Simpan Aturan Automasi
      if (e.target.closest('#saveAutomationRulesBtn')) {
        const toggle = this.element.querySelector('#ruleAiSyncToggle');
        const activeBot = this.getActiveBot();
        if (toggle && activeBot) {
          store.updateServiceBot(activeBot.id, { autoAiSync: toggle.checked });
        }
        store.addToast('success', 'Aturan Automasi Tersimpan', 'Seluruh konfigurasi webhook dan triage AI telah disinkronkan.');
        this.showAutomationModal = false;
        this.render();
        return;
      }

      // 10. Buka Tab AI Hub Langsung
      if (e.target.closest('#sdOpenAiHubBtn') || e.target.closest('#sdDrawerOpenAiHubBtn')) {
        store.setActiveTab('ai');
        return;
      }

      // 11. Buka Simulator Modal
      if (e.target.closest('#sdOpenSimulatorBtn')) {
        this.onOpenIntakeModal();
        return;
      }

      // 12. Quick Sync All Tickets to AI Hub
      if (e.target.closest('#sdQuickSyncAllBtn')) {
        this.handleUserSendMessage('/sync');
        return;
      }

      // 13. Trigger Human Call Button
      if (e.target.closest('#triggerHumanCallBtn')) {
        this.handleUserSendMessage('/human');
        return;
      }

      // 14. Copy Telegram Code / Token
      const copyBtn = e.target.closest('#copyTgCodeBtn');
      if (copyBtn) {
        const code = copyBtn.dataset.code;
        navigator.clipboard?.writeText(code);
        store.addToast('info', 'Token Disalin', `Token ${code} disalin ke clipboard.`);
        return;
      }

      // 15. Open Finance Tab
      if (e.target.closest('#sdOpenFinanceBtn')) {
        store.setActiveTab('crm');
        return;
      }

      // 16. Toggle Drawer
      if (e.target.closest('#toggleDrawerBtn')) {
        this.isDrawerOpen = !this.isDrawerOpen;
        const drawer = this.element.querySelector('.sd-transparency-drawer');
        if (drawer) {
          drawer.classList.toggle('mobile-show', this.isDrawerOpen);
        }
        return;
      }

      // 17. Attach file button
      if (e.target.closest('#tgAttachFileBtn')) {
        store.addToast('info', 'Lampiran Berkas', 'Silakan pilih screenshot kendala atau dokumen pendukung KAK.');
        return;
      }

      // 18. Emoji button
      if (e.target.closest('#tgEmojiBtn')) {
        const input = this.element.querySelector('#tgMsgInput');
        if (input) {
          input.value += ' 👍';
          input.focus();
        }
        return;
      }

      // 19. Breadcrumb home click
      if (e.target.closest('#sdNavHome')) {
        e.preventDefault();
        store.setActiveTab('project');
        return;
      }
    });

    // Input Search Box Filtering
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'tgSearchInput') {
        this.searchQuery = e.target.value;
        this.render();
      }
    });

    // Project Switcher
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'sdProjectSelect') {
        const pId = e.target.value;
        store.setSelectedProjectId(pId);
        // Otomatis pilih bot yang sesuai dengan proyek ini jika ada
        const matchingBot = this.getAllBots().find(b => b.projectId === pId);
        if (matchingBot) {
          this.selectedSessionKey = matchingBot.id;
        }
        this.render();
      }

      if (e.target.id === 'toggleAutoAiSyncCheckbox') {
        const activeBot = this.getActiveBot();
        if (activeBot) {
          store.updateServiceBot(activeBot.id, { autoAiSync: e.target.checked });
        }
      }
    });

    // Form Submissions
    this.element.addEventListener('submit', async (e) => {
      // 1. Submit Pesan Chat
      if (e.target.id === 'tgMessageForm') {
        e.preventDefault();
        const input = this.element.querySelector('#tgMsgInput');
        const text = input ? input.value.trim() : '';
        if (text) {
          this.handleUserSendMessage(text);
          if (input) input.value = '';
        }
      }

      // 2. Submit Pembuatan Bot Baru
      if (e.target.id === 'createBotForm') {
        e.preventDefault();
        const nameInput = this.element.querySelector('#botNameInput');
        const platformSelect = this.element.querySelector('#botPlatformSelect');
        const projectSelect = this.element.querySelector('#botProjectSelect');
        const tokenInput = this.element.querySelector('#botTokenInput');
        const slaSelect = this.element.querySelector('#botSlaSelect');
        const autoAiSyncInput = this.element.querySelector('#botAutoAiSyncInput');
        const welcomeInput = this.element.querySelector('#botWelcomeInput');

        if (!nameInput || !nameInput.value.trim()) return;

        const targetPId = projectSelect ? projectSelect.value : store.getState().selectedProjectId;

        // Tambahkan bot baru ke state store
        const newBot = store.addServiceBot({
          name: nameInput.value.trim(),
          platform: platformSelect ? platformSelect.value : 'telegram',
          projectId: targetPId,
          token: tokenInput ? tokenInput.value.trim() : '',
          slaTargetMinutes: slaSelect ? parseInt(slaSelect.value, 10) : 30,
          autoAiSync: autoAiSyncInput ? autoAiSyncInput.checked : true,
          welcomeMessage: welcomeInput ? welcomeInput.value.trim() : ''
        });

        // Buat sesi percakapan awal khusus untuk bot baru ini
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        this.chatSessions[newBot.id] = [
          {
            id: `msg-init-${Date.now()}`,
            sender: 'bot',
            senderName: newBot.name,
            role: `${newBot.platformLabel} Resmi`,
            text: `🎉 <strong>Bot Baru Berhasil Dikonfigurasi &amp; Terdaftar di List Chat!</strong><br />
Layanan <strong>${newBot.name}</strong> kini aktif melayani proyek ini.<br /><br />
${newBot.welcomeMessage}<br /><br />
• Status Gateway: <span style="color: #047857; font-weight: 700;">Online (Webhook 200 OK)</span><br />
• Sinkronisasi AI: <span style="color: #6d28d9; font-weight: 700;">${newBot.autoAiSync ? 'Aktif (Otomasi Fix Bug AI)' : 'Manual'}</span><br />
• Target SLA: <strong>&lt; ${newBot.slaTargetMinutes} Menit</strong>`,
            time: timeNow,
            inlineButtons: [
              { label: '⚡ Uji Status Proyek', command: '/status' },
              { label: '🚨 Lapor Kendala Baru', command: '/help' },
              { label: '🤖 Buka AI Hub', action: 'openAiHub' }
            ]
          }
        ];

        // Jadikan bot baru sebagai sesi aktif dan buka langsung
        this.selectedSessionKey = newBot.id;
        store.setSelectedProjectId(targetPId);
        this.showCreateBotModal = false;
        this.render();
      }

      // 3. Submit Formulir Laporan Bug
      if (e.target.id === 'bugReportForm') {
        e.preventDefault();
        const activeBot = this.getActiveBot();
        const activeProject = store.getState().projects.find(p => p.id === activeBot.projectId) || store.getActiveProject() || {};
        const titleInput = this.element.querySelector('#bugTitleInput');
        const descInput = this.element.querySelector('#bugDescInput');
        const severitySelect = this.element.querySelector('#bugSeveritySelect');
        const envSelect = this.element.querySelector('#bugEnvSelect');
        const sourceSelect = this.element.querySelector('#bugSourceSelect');
        const autoAiFixInput = this.element.querySelector('#bugAutoAiFixInput');

        if (!titleInput || !titleInput.value.trim()) return;

        const isAutoAi = autoAiFixInput ? autoAiFixInput.checked : true;
        const newBug = store.ingestBugReport({
          projectId: activeProject.id,
          botId: activeBot.id,
          title: titleInput.value.trim(),
          description: descInput ? descInput.value.trim() : '',
          severity: severitySelect ? severitySelect.value : 'S2 - Major',
          environment: envSelect ? envSelect.value : 'Production',
          source: sourceSelect ? sourceSelect.value : activeBot.name,
          autoAiFix: isAutoAi,
          autoAiSync: isAutoAi
        });

        this.showBugReportModal = false;

        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const currentMsgs = this.getCurrentChatMessages();
        currentMsgs.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: `${activeBot.name} (Auto-Triage)`,
          role: 'AI Diagnostic & Bug Ingestion',
          text: `🚨 <strong>Laporan Kendala Baru Diterima &amp; Di-Triage:</strong><br />
• ID Tiket: <strong>${newBug.key}</strong><br />
• Judul: <strong>${newBug.title}</strong><br />
• Severity: <strong>${newBug.severity}</strong> (SLA &lt; ${newBug.slaTargetMinutes} Menit)<br />
• Status Alur: <span style="font-weight: 700; color: #4338ca;">${newBug.status}</span><br />
${isAutoAi ? '• 🤖 <strong>Engine Otomasi Fix Bug AI:</strong> Menganalisis stack trace &amp; membuat patch...' : '• Status: Menunggu evaluasi On-Call Engineer'}`,
          time: timeNow,
          inlineButtons: [
            { label: `📋 Buka Tiket ${newBug.key}`, action: 'openTask', taskId: newBug.id },
            { label: '⚡ Jalankan Auto-Fix AI', action: 'runAiFix', taskId: newBug.id },
            { label: '🚀 Buka di Studio AI Hub', action: 'openAiHub', taskId: newBug.id }
          ]
        });

        this.render();
      }
    });
  }

  // Memicu proses perbaikan AI langsung untuk tiket tertentu
  async triggerAiFixForTask(taskId) {
    const task = store.getState().tasks.find((t) => t.id === taskId || t.key === taskId);
    if (!task) return;

    const activeBot = this.getActiveBot();
    this.isTyping = true;
    this.render();

    try {
      store.addToast('info', 'AI Bug Automation', `Memulai analisis AST dan perbaikan otomatis untuk tiket ${task.key}...`);
      await store.runAiFixer(task.id);

      const updatedTask = store.getState().tasks.find((t) => t.id === task.id) || task;
      const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const currentMsgs = this.getCurrentChatMessages();

      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: `${activeBot.name} (AI Fixer)`,
        role: 'Intelligent Orchestrator · Claude & Gemini',
        text: `🤖 <strong>Hasil Otomasi Fix Bug AI untuk [${updatedTask.key}]:</strong><br />
• Status Solusi: <span style="font-weight: 700; color: #047857;">${updatedTask.status}</span><br />
• Cabang Git: <code>${updatedTask.branchName || `fix/${updatedTask.key.toLowerCase()}`}</code><br />
• Pull Request: <strong>${updatedTask.prNumber || 'Draft PR Terbuat'}</strong><br />
• Verifikasi Test: <span style="color: #047857; font-weight: 700;">5/5 Unit Regression Test Lolos (100% Passing)</span><br />
• Kategori: <strong>${updatedTask.difficulty || 'Medium'}</strong> · Garansi Bebas Bug<br /><br />
Patch telah diajukan ke antrean review Lead Developer untuk rilis ke Staging.`,
        time: timeNow,
        inlineButtons: [
          { label: '🚀 Buka di Studio AI Hub', action: 'openAiHub', taskId: updatedTask.id },
          { label: `📋 Buka Detail ${updatedTask.key}`, action: 'openTask', taskId: updatedTask.id },
          { label: '🌿 Cek Cabang Git Terkait', action: 'openGit' }
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.isTyping = false;
      this.render();
    }
  }

  handleUserSendMessage(text) {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const currentMsgs = this.getCurrentChatMessages();

    // Tambahkan pesan user ke sesi chat aktif
    currentMsgs.push({
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: 'Dr. Ahmad Suhardi',
      role: 'Klien (PIC)',
      text,
      time: timeNow,
      read: true
    });

    this.isTyping = true;
    this.render();

    setTimeout(() => {
      this.isTyping = false;
      this.processBotResponse(text);
      this.render();
    }, 450);
  }

  async processBotResponse(userText) {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const lower = userText.toLowerCase().trim();
    const state = store.getState();
    const activeBot = this.getActiveBot();
    const activeProject = state.projects.find(p => p.id === activeBot.projectId) || store.getActiveProject() || {};
    const tasks = state.tasks || [];
    const invoices = state.invoices || [];
    const currentMsgs = this.getCurrentChatMessages();

    // 1. Status Command: /status [TIKET]
    if (lower.startsWith('/status') || lower.includes('lib-') || lower.includes('pos-') || lower.includes('ftsl-') || lower.includes('iot-')) {
      const match = userText.match(/(LIB-\d+|POS-[A-Z0-9]+|FTSL-[A-Z0-9]+|IOT-[A-Z0-9]+)/i);
      const targetKey = match ? match[1].toUpperCase() : (activeProject.code ? `${activeProject.code}-101` : 'LIB-117');
      const task = tasks.find((t) => (t.key || '').toUpperCase() === targetKey);

      if (task) {
        currentMsgs.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: activeBot.name,
          role: 'Status Tracker',
          text: `🔍 <strong>Status Tiket Terkini [${task.key}]</strong><br />
• Judul: <strong>${task.title}</strong><br />
• Status Alur: <span style="font-weight: 700; color: #4338ca;">${task.status}</span><br />
• Prioritas: <strong>${task.priority || 'Sedang'}</strong> (Severity: ${task.severity || 'S2'})<br />
• Integrasi AI: <span style="color: #6d28d9; font-weight: 700;">${task.prNumber ? `PR Dibuat (${task.prNumber})` : 'Tersinkron ke AI Hub'}</span><br />
• Estimasi Selesai: <strong>${task.dueDate || '02/11/2026'}</strong><br />
• Penanggung Jawab (PIC): <strong>Jaka (Backend Dev)</strong>`,
          time: timeNow,
          inlineButtons: [
            { label: `⚡ Auto-Fix AI [${task.key}]`, action: 'runAiFix', taskId: task.id },
            { label: `📋 Buka Detail ${task.key}`, action: 'openTask', taskId: task.id },
            { label: '🚀 Studio AI Hub', action: 'openAiHub', taskId: task.id }
          ]
        });
      } else {
        currentMsgs.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: activeBot.name,
          role: 'Status Tracker',
          text: `⚠️ Tiket <code>${targetKey}</code> tidak ditemukan pada proyek aktif ini. Silakan periksa kembali kode tiket Anda.`,
          time: timeNow
        });
      }
      return;
    }

    // 2. Auto-Fix Command: /autofix [TIKET]
    if (lower.startsWith('/autofix')) {
      const match = userText.match(/(LIB-\d+|POS-[A-Z0-9]+|FTSL-[A-Z0-9]+|IOT-[A-Z0-9]+)/i);
      const targetKey = match ? match[1].toUpperCase() : 'LIB-117';
      const task = tasks.find((t) => (t.key || '').toUpperCase() === targetKey);

      if (task) {
        await this.triggerAiFixForTask(task.id);
      } else {
        currentMsgs.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: activeBot.name,
          role: 'AI Dispatcher',
          text: `⚠️ Tiket <code>${targetKey}</code> tidak ditemukan untuk dieksekusi auto-fix.`,
          time: timeNow
        });
      }
      return;
    }

    // 3. Sync Command: /sync
    if (lower.startsWith('/sync')) {
      const projectBugs = tasks.filter(t => t.projectId === activeProject.id && (t.type === 'Bug' || t.severity));
      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: activeBot.name,
        role: 'AI Synchronization Gateway',
        text: `⚡ <strong>Sinkronisasi Modul Otomasi Fix Bug AI Selesai:</strong><br />
• Total Tiket Bug Disinkronkan: <strong>${projectBugs.length} Tiket</strong><br />
• Pipeline Status: <strong>Siap Analisis &amp; Auto-PR</strong><br />
• Engine: Gemini 2.5 Pro &amp; Claude 3.5 Sonnet Coding Agent<br /><br />
Seluruh tiket bug pada proyek ini dapat diperbaiki secara otomatis melalui Studio AI.`,
        time: timeNow,
        inlineButtons: [
          { label: '🚀 Buka Otomasi Fix Bug AI Hub', action: 'openAiHub' }
        ]
      });
      return;
    }

    // 4. Human Escalation: /human
    if (lower.startsWith('/human') || lower.includes('bicara dengan manusia') || lower.includes('hubungi dev')) {
      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: `${activeBot.name} (Eskalasi)`,
        role: 'Human Handover',
        text: `🚨 <strong>Eskalasi Layanan Darurat Diaktifkan:</strong><br />
Pemberitahuan telah dikirimkan secara instan ke:<br />
1. <strong>Asisyah</strong> (Project Manajer) — SLA Tanggap 15 Menit<br />
2. <strong>Jaka</strong> (Backend Lead &amp; On-Call Engineer)<br /><br />
Anda dapat langsung berdiskusi dengan tim pengembang melalui tombol kontak di bawah:`,
        time: timeNow,
        inlineButtons: [
          { label: '💬 Chat dengan PM Asisyah', action: 'switchSession', sessionKey: 'pm' },
          { label: '💬 Chat dengan Jaka (Lead Dev)', action: 'switchSession', sessionKey: 'dev' }
        ]
      });
      return;
    }

    // 5. Invoice Command: /invoice
    if (lower.startsWith('/invoice') || lower.includes('tagihan') || lower.includes('termin')) {
      const projectInvoices = invoices.filter((i) => i.projectId === activeProject.id);
      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: activeBot.name,
        role: 'Finance Gateway',
        text: `📄 <strong>Informasi Tagihan &amp; Termin (${activeProject.name || 'Proyek'}):</strong><br />
${projectInvoices.map((inv) => `
• <strong>${inv.invoiceNumber}</strong> (${inv.type}): <strong>${this.formatIDR(inv.totalAmount)}</strong> — <span style="color: ${inv.status === 'Lunas' ? '#047857' : '#b45309'}; font-weight: 700;">${inv.status}</span>
`).join('')}<br />
Total Nilai Kontrak: <strong>${this.formatIDR(activeProject.contractValue || 185000000)}</strong>`,
        time: timeNow,
        inlineButtons: [
          { label: '💳 Buka Rincian Keuangan', action: 'openFinance' }
        ]
      });
      return;
    }

    // 6. Help Command: /help
    if (lower.startsWith('/help') || lower.includes('bantuan') || lower.includes('perintah')) {
      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: activeBot.name,
        role: 'Helpdesk Bot',
        text: `ℹ️ <strong>Buku Panduan Layanan Bot (${activeBot.name})</strong>:<br />
• <code>/status [TIKET]</code> — Mengecek progres tiket proyek<br />
• <code>/autofix [TIKET]</code> — Memicu perbaikan otomatis oleh Agen AI<br />
• <code>/sync</code> — Sinkronisasi antrean tiket dengan Modul Otomasi AI<br />
• <code>/human</code> — Eskalasi ke Project Manajer atau On-Call Lead Dev<br />
• <code>/invoice</code> — Ringkasan pembayaran, termin DP, dan invoice UAT<br />
• <code>/sla</code> — Informasi jaminan kecepatan garansi &amp; maintenance<br />
• Atau laporkan kendala secara langsung untuk auto-triage AI.`,
        time: timeNow,
        inlineButtons: [
          { label: '🚨 Lapor Kendala Baru', command: '/help' },
          { label: '🤖 Buka AI Hub', action: 'openAiHub' }
        ]
      });
      return;
    }

    // 7. SLA Command: /sla
    if (lower.startsWith('/sla') || lower.includes('garansi') || lower.includes('maintenance')) {
      currentMsgs.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: activeBot.name,
        role: 'SLA Engine',
        text: `⏱️ <strong>Jaminan Service Level Agreement (SLA) &amp; Garansi:</strong><br />
• Severity 1 (Sistem Down): Respon &lt; <strong>30 Menit</strong><br />
• Severity 2 (Major Bug): Respon &lt; <strong>120 Menit</strong><br />
• Sisa Kuota Maintenance: <strong>${activeProject.maintenanceQuotaHours || 25} Jam</strong> (Gratis)<br />
• Garansi Proyek Aktif Sampai: <strong>${activeProject.warrantyUntil || '31 Oktober 2027'}</strong>`,
        time: timeNow
      });
      return;
    }

    // 8. Default: Auto-Triage as Bug Report and Sync to AI
    const newBug = store.ingestBugReport({
      projectId: activeProject.id,
      botId: activeBot.id,
      title: userText.length > 60 ? userText.substring(0, 60) + '...' : userText,
      description: userText,
      severity: lower.includes('kritis') || lower.includes('down') ? 'S1 - Critical' : 'S2 - Major',
      source: `${activeBot.name} (${activeBot.platformLabel})`,
      telegramChatId: 'tg-client-88219',
      autoAiFix: activeBot.autoAiSync,
      autoAiSync: activeBot.autoAiSync
    });

    currentMsgs.push({
      id: `msg-${Date.now()}`,
      sender: 'bot',
      senderName: `${activeBot.name} (Auto-Triage)`,
      role: 'AI Diagnostic Engine',
      text: `✅ <strong>Laporan Masalah Diterima &amp; Di-Triage:</strong><br />
Tiket baru telah dibuat di antrean delivery:<br />
• ID Tiket: <strong>${newBug.key}</strong><br />
• Severity: <strong>${newBug.severity}</strong><br />
• SLA Target: <strong>&lt; ${newBug.slaTargetMinutes} Menit</strong><br />
• PIC On-Call: <strong>Jaka (Backend Dev)</strong><br />
• Sinkronisasi AI: <span style="color: #6d28d9; font-weight: 700;">${activeBot.autoAiSync ? '⚡ Tersinkron ke Otomasi Fix Bug AI' : 'Manual'}</span><br /><br />
${activeBot.autoAiSync ? 'Engine AI telah mulai menganalisis stack trace untuk pembuatan patch.' : 'Tim engineering telah menerima notifikasi insiden.'}`,
      time: timeNow,
      inlineButtons: [
        { label: `⚡ Auto-Fix AI [${newBug.key}]`, action: 'runAiFix', taskId: newBug.id },
        { label: `📋 Buka Tiket ${newBug.key}`, action: 'openTask', taskId: newBug.id },
        { label: '🚀 Buka di Studio AI Hub', action: 'openAiHub', taskId: newBug.id }
      ]
    });
  }
}
