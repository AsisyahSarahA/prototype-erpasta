/**
 * ClientPortalView.js
 * ASTACODE ERP - Enterprise Service Desk & Client Transparency Portal
 * 
 * Features:
 * 1. Proportional SaaS Layout conforming to crm-theme.css & global.css
 * 2. 4 Executive Scorecards (Active Telegram Bot, SLA Tanggap, Garansi Quota, Tiket Publik)
 * 3. 3-Column Telegram Web Service Desk Arena:
 *    - Left: Chat Channels, Contacts, Linked Tickets & Linking Code
 *    - Center: Interactive Telegram Chat Stream with Wallpaper, Bubbles, Inline Buttons, Quick Commands & Input
 *    - Right: Collapsible Transparency Drawer (Client Profile, Quota Progress, Public Tickets, Invoices)
 * 4. Interactive Telegram Bot (@ProjectManjerBot) Engine:
 *    - Command parser: /status [TIKET], /help, /human, /invoice, /sla
 *    - Auto-triage for new bug reports (integrates with store.submitBugIntake)
 *    - Simulated typing indicator & read ticks (✓✓)
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class ClientPortalView {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'client-view';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => store.openIntakeModal());
    this.onSelectInvoice = options.onSelectInvoice || (() => store.setActiveTab('finance'));

    // State
    this.activeChannel = 'bot'; // 'bot' | 'pm' | 'dev' | 'frontend'
    this.searchQuery = '';
    this.isTyping = false;
    this.isDrawerOpen = true;

    // Chat Message History for @ProjectManjerBot
    this.messages = [
      {
        id: 'msg-1',
        sender: 'bot',
        senderName: '@ProjectManjerBot',
        role: 'Official Telegram Service Desk',
        avatar: '',
        text: `<strong>Halo Tim Perwakilan Klien! 👋</strong><br />
Selamat datang di <strong>Service Desk Resmi ASTACODE (@ProjectManjerBot)</strong>.<br /><br />
Kanal ini terverifikasi terhubung dengan proyek aktif Anda. Anda dapat memantau progres tiket secara real-time, melaporkan kendala, mengecek status SLA, dan mengunduh berkas termin.<br /><br />
Perintah Cepat yang Tersedia:<br />
• <code>/status [TIKET]</code> — Lacak progres pengerjaan tiket<br />
• <code>/human</code> — Eskalasi ke Project Manajer / Lead Dev On-Call<br />
• <code>/invoice</code> — Ringkasan tagihan &amp; termin pembayaran<br />
• <code>/help</code> — Daftar lengkap panduan bot<br />
Atau ketik langsung kendala Anda untuk auto-triage AI.`,
        time: '08:30',
        inlineButtons: [
          { label: '🔍 Cek Tiket LIB-116', command: '/status LIB-116' },
          { label: '🔍 Cek Tiket LIB-117', command: '/status LIB-117' },
          { label: '👤 Panggil Human Lead', command: '/human' }
        ]
      },
      {
        id: 'msg-2',
        sender: 'client',
        senderName: 'Dr. Ahmad Suhardi',
        role: 'Kepala Perpustakaan (PIC)',
        text: 'Selamat pagi tim ASTACODE. Kami sedang menguji simulasi peminjaman buku pada portal mahasiswa (LIB-117). Ditemukan error validasi kuota peminjaman saat mahasiswa memiliki denda aktif. Mohon dicek apakah ini masuk garansi dan kapan estimasi patch-nya?',
        time: '09:15',
        read: true
      },
      {
        id: 'msg-3',
        sender: 'bot',
        senderName: '@ProjectManjerBot (Auto-Triage)',
        role: 'AI Service Bot',
        text: `<strong>Laporan Terverifikasi &amp; Di-Triage Otomatis:</strong><br />
• ID Tiket: <strong>LIB-117</strong><br />
• Klasifikasi: <strong>Bug Validasi Sirkulasi Peminjaman</strong><br />
• Keparahan: <span style="color: #b45309; font-weight: 700;">S2 - Major</span><br />
• Status Garansi: <span style="color: #047857; font-weight: 700;">Garansi Proyek (Gratis)</span><br />
• Target SLA Tanggap: <strong>&lt; 120 Menit</strong> (Siaga On-Call)<br />
• PIC Ditugaskan: <strong>Jaka (Backend Dev)</strong>`,
        time: '09:16',
        inlineButtons: [
          { label: '📋 Buka Detail LIB-117', action: 'openTask', taskId: 'LIB-117' },
          { label: '🌿 Lihat Cabang Git', action: 'openGit' },
          { label: '💬 Chat dengan Jaka', action: 'switchChannel', channel: 'dev' }
        ]
      },
      {
        id: 'msg-4',
        sender: 'pic',
        senderName: 'Jaka',
        role: 'Backend Dev (On-Call)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        text: 'Selamat pagi Pak Suhardi. Kendala atomic lock dan validasi denda pada microservice sirkulasi sudah kami isolasi di branch <code>feature/katalog-microservice</code>. Unit regression test sudah 100% passing. Siap dideploy ke staging sore ini untuk pengetesan bersama tim perpustakaan.',
        time: '09:42'
      }
    ];

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

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject() || (state.projects && state.projects[0]) || {};
    const tasks = state.tasks || [];
    const invoices = state.invoices || [];

    const clientTasks = tasks.filter((t) => t.projectId === activeProject.id);
    const clientPublicTasks = clientTasks.filter((t) => t.visibility === 'client_public' || t.type === 'Bug');
    const runningTasks = clientPublicTasks.filter((t) => t.status !== 'Selesai');
    const doneTasks = clientPublicTasks.filter((t) => t.status === 'Selesai');

    const clientInvoices = invoices.filter((i) => i.projectId === activeProject.id);
    const quotaRemaining = activeProject.maintenanceQuotaHours
      ? Math.max(0, activeProject.maintenanceQuotaHours - (activeProject.maintenanceUsedHours || 0))
      : 25;

    this.element.innerHTML = `
      <div class="sd-master-container">
        
        <!-- Breadcrumb & Top Bar -->
        <div class="sd-breadcrumb-bar">
          <div class="sd-breadcrumb-path">
            <a href="#" id="sdNavHome">Modul Proyek</a>
            <span class="sd-breadcrumb-separator">/</span>
            <span style="font-weight: 600; color: #4338ca;">${activeProject.name || 'Proyek ASTACODE'}</span>
            <span class="sd-breadcrumb-separator">/</span>
            <span>Operasional &amp; Bisnis</span>
            <span class="sd-breadcrumb-separator">/</span>
            <span class="sd-breadcrumb-current">Service Desk / Klien</span>
          </div>

          <div class="sd-header-actions">
            <!-- Project Switcher -->
            <select id="sdProjectSelect" class="git-input" style="width: auto; padding: 5px 12px; font-weight: 600; background: white;">
              ${(state.projects || []).map((p) => `
                <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                  ${p.code} - ${p.name.length > 30 ? p.name.substring(0, 30) + '...' : p.name}
                </option>
              `).join('')}
            </select>

            <span class="sd-status-badge">
              <span class="sd-status-dot"></span>
              <span>@ProjectManjerBot Online (SLA &lt; 30m)</span>
            </span>

            <button type="button" id="sdOpenSimulatorBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.telegram('', 13)}
              <span>Uji Simulator Bot</span>
            </button>

            <button type="button" id="sdReportBugBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 13)}
              <span>+ Lapor Kendala Baru</span>
            </button>
          </div>
        </div>

        <!-- 4 Executive Scorecards (KPIs) -->
        <div class="sd-kpi-grid">
          
          <!-- KPI 1: Telegram Bot Channel -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">Kanal Telegram Resmi</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-tg">
                ${Icons.telegram('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value" style="font-size: 16px; color: #0284c7;">
              @ProjectManjerBot
            </div>
            <div class="sd-kpi-subtext">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #0369a1;">LNK-${activeProject.code || 'PROJ'}-88219</span> · Terverifikasi
            </div>
          </div>

          <!-- KPI 2: SLA Response Time -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">SLA Tanggap Cepat</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-emerald">
                ${Icons.shieldCheck('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value" style="color: #047857;">
              &lt; 15 Menit
            </div>
            <div class="sd-kpi-subtext">
              Target S1: 30m · S2: 120m (100% Terpenuhi)
            </div>
          </div>

          <!-- KPI 3: Quota Garansi & Maintenance -->
          <div class="sd-kpi-card">
            <div class="sd-kpi-top">
              <span class="sd-kpi-label">Kuota Garansi &amp; Maintenance</span>
              <div class="sd-kpi-icon-wrap sd-kpi-icon-indigo">
                ${Icons.clock('', 16)}
              </div>
            </div>
            <div class="sd-kpi-value">
              ${quotaRemaining} Jam <span style="font-size: 12px; font-weight: 600; color: #64748b;">Tersisa</span>
            </div>
            <div class="sd-kpi-subtext">
              Garansi Aktif s/d ${activeProject.warrantyUntil || '2027-10-31'}
            </div>
          </div>

          <!-- KPI 4: Public Tasks & Invoices -->
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
              <span style="color: #059669; font-weight: 700;">${doneTasks.length} Tiket Selesai</span> &amp; Terverifikasi
            </div>
          </div>

        </div>

        <!-- Main Workspace (Proportional Telegram 3-Column Desk) -->
        <div class="sd-workspace-grid">
          
          <!-- Column 1: Telegram Channel & Sessions Sidebar -->
          <div class="tg-channel-sidebar">
            <div class="tg-sidebar-header">
              <div class="tg-sidebar-title-row">
                <span class="tg-sidebar-title">
                  ${Icons.telegram('', 16)}
                  <span>Kanal Layanan Chat</span>
                </span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #047857;">
                  Live
                </span>
              </div>

              <div class="tg-search-box">
                <span class="tg-search-icon">${Icons.search('', 13)}</span>
                <input type="text" id="tgSearchInput" placeholder="Cari percakapan atau tiket..." value="${this.searchQuery}" />
              </div>
            </div>

            <!-- Channels List -->
            <div class="tg-channel-list">
              
              <!-- Channel 1: Bot (Default) -->
              <div class="tg-channel-item ${this.activeChannel === 'bot' ? 'active' : ''}" data-channel="bot">
                <div class="tg-avatar-wrap">
                  <div class="tg-avatar-bot">
                    ${Icons.telegram('', 20)}
                  </div>
                  <span class="tg-online-badge"></span>
                </div>
                <div class="tg-channel-content">
                  <div class="tg-channel-top-line">
                    <span class="tg-channel-name">
                      @ProjectManjerBot
                      <span class="tg-verified-icon">${Icons.checkCircle('', 12)}</span>
                    </span>
                    <span class="tg-channel-time">09:42</span>
                  </div>
                  <span class="tg-channel-snippet">Jaka: Unit regression test sudah 100% passing...</span>
                </div>
              </div>

              <!-- Channel 2: PM Asisyah -->
              <div class="tg-channel-item ${this.activeChannel === 'pm' ? 'active' : ''}" data-channel="pm">
                <div class="tg-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" alt="Asisyah" class="tg-avatar-img" />
                  <span class="tg-online-badge"></span>
                </div>
                <div class="tg-channel-content">
                  <div class="tg-channel-top-line">
                    <span class="tg-channel-name">Asisyah (PM)</span>
                    <span class="tg-channel-time">Kemarin</span>
                  </div>
                  <span class="tg-channel-snippet">Draft BAST UAT tahap 1 sudah kami siapkan...</span>
                </div>
              </div>

              <!-- Channel 3: Jaka Lead Dev -->
              <div class="tg-channel-item ${this.activeChannel === 'dev' ? 'active' : ''}" data-channel="dev">
                <div class="tg-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Jaka" class="tg-avatar-img" />
                  <span class="tg-online-badge"></span>
                </div>
                <div class="tg-channel-content">
                  <div class="tg-channel-top-line">
                    <span class="tg-channel-name">Jaka (Backend Lead)</span>
                    <span class="tg-channel-time">Kemarin</span>
                  </div>
                  <span class="tg-channel-snippet">Konfigurasi Redis atomic lock sudah selesai ditest...</span>
                </div>
              </div>

              <!-- Channel 4: Aldyana Frontend -->
              <div class="tg-channel-item ${this.activeChannel === 'frontend' ? 'active' : ''}" data-channel="frontend">
                <div class="tg-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" alt="Aldyana" class="tg-avatar-img" />
                </div>
                <div class="tg-channel-content">
                  <div class="tg-channel-top-line">
                    <span class="tg-channel-name">Aldyana (Frontend)</span>
                    <span class="tg-channel-time">2h lalu</span>
                  </div>
                  <span class="tg-channel-snippet">Portal OPAC React 19 sudah disesuaikan...</span>
                </div>
              </div>

            </div>

            <!-- Linked Tickets Section in Left Sidebar -->
            <div class="tg-sidebar-linked-tickets">
              <div class="tg-sidebar-subheading">
                <span>Tiket Terkait (${clientPublicTasks.length})</span>
                <span style="font-size: 10px; color: #4338ca; cursor: pointer;" id="sdViewAllTicketsLink">Semua &rarr;</span>
              </div>
              <div class="tg-ticket-pills-row">
                ${clientPublicTasks.slice(0, 4).map((t) => `
                  <div class="tg-ticket-mini-pill tg-ticket-shortcut" data-task-id="${t.id}" title="${t.title}">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: #0284c7;">${t.key}</span>
                    <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; ${
                      t.status === 'Selesai' ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #475569;'
                    }">
                      ${t.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Bot Linking Info -->
            <div style="padding: 10px 14px; background: #e0f2fe; border-top: 1px solid #bae6fd; font-size: 11px; color: #0369a1; display: flex; justify-content: space-between; align-items: center;">
              <span>Kode Tautan Telegram:</span>
              <button type="button" id="copyTgCodeBtn" data-code="LNK-${activeProject.code || 'PROJ'}-88219" style="font-family: var(--font-mono); font-weight: 700; background: white; border: 1px solid #7dd3fc; border-radius: 4px; padding: 2px 8px; color: #0284c7; cursor: pointer;">
                LNK-${activeProject.code || 'PROJ'}-88219
              </button>
            </div>

          </div>

          <!-- Column 2: Center Telegram Chat Arena -->
          <div class="tg-chat-arena">
            
            <!-- Telegram Chat Header -->
            <div class="tg-chat-header">
              <div class="tg-chat-header-identity">
                <div class="tg-avatar-wrap" style="width: 38px; height: 38px;">
                  ${this.activeChannel === 'bot' ? `
                    <div class="tg-avatar-bot" style="font-size: 18px;">${Icons.telegram('', 18)}</div>
                  ` : `
                    <img src="${this.getChannelAvatar()}" alt="${this.getChannelName()}" class="tg-avatar-img" />
                  `}
                  <span class="tg-online-badge"></span>
                </div>

                <div class="tg-chat-header-titles">
                  <div class="tg-chat-header-name">
                    <span>${this.getChannelName()}</span>
                    <span class="tg-verified-icon">${Icons.checkCircle('', 13)}</span>
                  </div>
                  <div class="tg-chat-header-status">
                    <span class="sd-status-dot" style="background: #10b981; width: 6px; height: 6px;"></span>
                    <span>${this.getChannelSubtitle(activeProject)}</span>
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

            <!-- Telegram Chat Messages Stream -->
            <div class="tg-chat-stream" id="tgChatStream">
              
              <div class="tg-day-divider">Hari ini, 29 Oktober 2026</div>

              ${this.messages.map((m) => `
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
                          <button type="button" class="tg-inline-btn" 
                            data-command="${btn.command || ''}" 
                            data-action="${btn.action || ''}" 
                            data-task-id="${btn.taskId || ''}"
                            data-channel="${btn.channel || ''}">
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
                <span style="margin-left: 4px;">@ProjectManjerBot sedang mengetik...</span>
              </div>

            </div>

            <!-- Telegram Quick Commands Bar -->
            <div class="tg-quick-commands">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 4px;">Perintah Cepat:</span>
              <button type="button" class="tg-command-pill" data-command="/status LIB-117">/status LIB-117</button>
              <button type="button" class="tg-command-pill" data-command="/status LIB-116">/status LIB-116</button>
              <button type="button" class="tg-command-pill" data-command="/help">/help</button>
              <button type="button" class="tg-command-pill" data-command="/human">/human</button>
              <button type="button" class="tg-command-pill" data-command="/invoice">/invoice</button>
              <button type="button" class="tg-command-pill" data-command="/sla">/sla</button>
              <button type="button" id="tgPillReportBug" class="tg-command-pill" style="color: #4338ca; border-color: #c7d2fe; font-weight: 700;">+ Lapor Bug</button>
            </div>

            <!-- Telegram Input Bar -->
            <form id="tgMessageForm" class="tg-input-bar">
              <button type="button" id="tgAttachFileBtn" class="tg-icon-btn" title="Lampirkan Dokumen / Screenshot Bug">
                ${Icons.link('', 16)}
              </button>

              <input type="text" id="tgMsgInput" class="tg-input-field" placeholder="Tulis pesan atau ketik perintah Telegram bot (/status, /help, /human)..." autocomplete="off" />

              <button type="button" id="tgEmojiBtn" class="tg-icon-btn" title="Emoji">
                <span style="font-size: 16px;">😊</span>
              </button>

              <button type="submit" class="tg-send-btn" title="Kirim Pesan (Enter)">
                ${Icons.send('', 16)}
              </button>
            </form>

          </div>

          <!-- Column 3: Client Transparency & Info Drawer -->
          <div class="sd-transparency-drawer ${this.isDrawerOpen ? '' : 'mobile-show'}">
            
            <!-- Client Profile Card -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Profil Klien &amp; Kontrak</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #047857;">Aktif</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                <div class="sd-info-row">
                  <span class="sd-info-label">Institusi:</span>
                  <span class="sd-info-val" style="text-align: right; max-width: 170px;">${activeProject.clientName || 'Universitas Nusantara'}</span>
                </div>
                <div class="sd-info-row">
                  <span class="sd-info-label">Kontak PIC:</span>
                  <span class="sd-info-val">${activeProject.clientEmail || 'perpustakaan@nusantara.ac.id'}</span>
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
            </div>

            <!-- Maintenance Quota Progress Bar -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Kuota Maintenance Bulanan</span>
                <span style="font-family: var(--font-mono); color: #059669;">${quotaRemaining}h / ${activeProject.maintenanceQuotaHours || 25}h</span>
              </div>
              <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 9999px; overflow: hidden; margin: 4px 0;">
                <div style="height: 100%; border-radius: 9999px; background: #10b981; width: ${((quotaRemaining / (activeProject.maintenanceQuotaHours || 25)) * 100)}%;"></div>
              </div>
              <span style="font-size: 10px; color: #64748b;">
                Perbaikan bug dan penyesuaian minor gratis selama masa garansi SLA.
              </span>
            </div>

            <!-- Public Tickets List -->
            <div class="sd-drawer-section-card" style="flex: 1;">
              <div class="sd-drawer-title">
                <span>Progres Tiket Publik (${clientPublicTasks.length})</span>
                <span style="font-size: 10px; color: #64748b;">Klik untuk detail</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
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

            <!-- Invoices Summary -->
            <div class="sd-drawer-section-card">
              <div class="sd-drawer-title">
                <span>Tagihan &amp; Termin Invoice</span>
                <button type="button" id="sdOpenFinanceBtn" style="background: none; border: none; color: #4338ca; font-size: 10px; font-weight: 700; cursor: pointer;">
                  Buka Keuangan &rarr;
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
    `;

    this.scrollToBottom();
  }

  getChannelName() {
    switch (this.activeChannel) {
      case 'pm': return 'Asisyah (Project Manajer)';
      case 'dev': return 'Jaka (Backend Lead & On-Call)';
      case 'frontend': return 'Aldyana (Frontend Dev)';
      default: return '@ProjectManjerBot (Kanal Resmi)';
    }
  }

  getChannelAvatar() {
    switch (this.activeChannel) {
      case 'pm': return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100';
      case 'dev': return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100';
      case 'frontend': return 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100';
      default: return '';
    }
  }

  getChannelSubtitle(activeProject) {
    switch (this.activeChannel) {
      case 'pm': return 'Online · Konsultasi Milestone, Scope & Termin';
      case 'dev': return 'Online · On-Call Engineer Siaga';
      case 'frontend': return 'Online · UI/UX & Feedback Frontend';
      default: return `Terhubung ke ${activeProject?.name?.substring(0, 32) || 'Proyek'} · SLA Tanggap 15m`;
    }
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
    this.element.addEventListener('click', (e) => {
      // 1. Switch Channel
      const channelItem = e.target.closest('.tg-channel-item');
      if (channelItem) {
        const channel = channelItem.dataset.channel;
        if (channel && channel !== this.activeChannel) {
          this.activeChannel = channel;
          this.render();
        }
        return;
      }

      // 2. Click Quick Command Chip
      const cmdPill = e.target.closest('.tg-command-pill[data-command]');
      if (cmdPill) {
        const cmd = cmdPill.dataset.command;
        this.handleUserSendMessage(cmd);
        return;
      }

      // 3. Click Inline Telegram Button
      const inlineBtn = e.target.closest('.tg-inline-btn');
      if (inlineBtn) {
        const cmd = inlineBtn.dataset.command;
        const action = inlineBtn.dataset.action;
        const taskId = inlineBtn.dataset.taskId;
        const channel = inlineBtn.dataset.channel;

        if (cmd) {
          this.handleUserSendMessage(cmd);
        } else if (action === 'openTask' && taskId) {
          const task = store.getState().tasks.find((t) => t.id === taskId || t.key === taskId);
          if (task) {
            this.onSelectTask(task);
          } else {
            store.addToast('info', 'Tiket Ditemukan', `Membuka detail tiket ${taskId}...`);
          }
        } else if (action === 'openGit') {
          store.setActiveTab('github');
        } else if (action === 'switchChannel' && channel) {
          this.activeChannel = channel;
          this.render();
        }
        return;
      }

      // 4. Click Mini Ticket Shortcut in Sidebar or Drawer
      const ticketShortcut = e.target.closest('.tg-ticket-shortcut') || e.target.closest('.client-task-item');
      if (ticketShortcut) {
        const taskId = ticketShortcut.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          this.onSelectTask(task);
        }
        return;
      }

      // 5. Open Intake Simulator Modal
      if (e.target.closest('#sdOpenSimulatorBtn')) {
        this.onOpenIntakeModal();
        return;
      }

      // 6. Report Bug Button
      if (e.target.closest('#sdReportBugBtn') || e.target.closest('#tgPillReportBug')) {
        this.onOpenIntakeModal();
        return;
      }

      // 7. Trigger Human Call Button
      if (e.target.closest('#triggerHumanCallBtn')) {
        this.handleUserSendMessage('/human');
        return;
      }

      // 8. Copy Telegram Code
      const copyBtn = e.target.closest('#copyTgCodeBtn');
      if (copyBtn) {
        const code = copyBtn.dataset.code;
        navigator.clipboard?.writeText(code);
        store.addToast('info', 'Kode Tautan Disalin', `Kode ${code} disalin ke clipboard.`);
        return;
      }

      // 9. Open Finance Tab
      if (e.target.closest('#sdOpenFinanceBtn')) {
        store.setActiveTab('finance');
        return;
      }

      // 10. Toggle Drawer
      if (e.target.closest('#toggleDrawerBtn')) {
        this.isDrawerOpen = !this.isDrawerOpen;
        const drawer = this.element.querySelector('.sd-transparency-drawer');
        if (drawer) {
          drawer.classList.toggle('mobile-show', this.isDrawerOpen);
        }
        return;
      }

      // 11. Attach file button
      if (e.target.closest('#tgAttachFileBtn')) {
        store.addToast('info', 'Lampiran Berkas', 'Silakan pilih screenshot kendala atau dokumen pendukung KAK.');
        return;
      }

      // 12. Emoji button
      if (e.target.closest('#tgEmojiBtn')) {
        const input = this.element.querySelector('#tgMsgInput');
        if (input) {
          input.value += ' 👍';
          input.focus();
        }
        return;
      }

      // 13. Breadcrumb home click
      if (e.target.closest('#sdNavHome')) {
        e.preventDefault();
        store.setActiveTab('project');
        return;
      }
    });

    // Project Switcher
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'sdProjectSelect') {
        store.setSelectedProjectId(e.target.value);
      }
    });

    // Telegram Message Form Submit
    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'tgMessageForm') {
        e.preventDefault();
        const input = this.element.querySelector('#tgMsgInput');
        const text = input ? input.value.trim() : '';
        if (text) {
          this.handleUserSendMessage(text);
          if (input) input.value = '';
        }
      }
    });
  }

  handleUserSendMessage(text) {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Append client message
    this.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: 'Dr. Ahmad Suhardi',
      role: 'Klien (PIC)',
      text,
      time: timeNow,
      read: true
    });

    // Trigger typing indicator
    this.isTyping = true;
    this.render();

    setTimeout(() => {
      this.isTyping = false;
      this.processBotResponse(text);
      this.render();
    }, 450);
  }

  processBotResponse(userText) {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const lower = userText.toLowerCase().trim();
    const state = store.getState();
    const activeProject = store.getActiveProject() || {};
    const tasks = state.tasks || [];
    const invoices = state.invoices || [];

    // 1. Status Command: /status [TIKET]
    if (lower.startsWith('/status') || lower.includes('lib-') || lower.includes('pos-') || lower.includes('ftsl-')) {
      const match = userText.match(/(LIB-\d+|POS-[A-Z0-9]+|FTSL-[A-Z0-9]+)/i);
      const targetKey = match ? match[1].toUpperCase() : 'LIB-116';
      const task = tasks.find((t) => (t.key || '').toUpperCase() === targetKey);

      if (task) {
        this.messages.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: '@ProjectManjerBot',
          role: 'Status Tracker',
          text: `🔍 <strong>Status Tiket Terkini [${task.key}]</strong><br />
• Judul: <strong>${task.title}</strong><br />
• Status Alur: <span style="font-weight: 700; color: #4338ca;">${task.status}</span><br />
• Prioritas: <strong>${task.priority || 'Sedang'}</strong><br />
• Tipe: <strong>${task.type}</strong><br />
• Estimasi Selesai: <strong>${task.dueDate || '02/11/2026'}</strong><br />
• Penanggung Jawab (PIC): <strong>Jaka (Backend Dev)</strong>`,
          time: timeNow,
          inlineButtons: [
            { label: `📋 Buka Detail ${task.key}`, action: 'openTask', taskId: task.id },
            { label: '🌿 Cek Cabang Git Terkait', action: 'openGit' }
          ]
        });
      } else {
        this.messages.push({
          id: `msg-${Date.now()}`,
          sender: 'bot',
          senderName: '@ProjectManjerBot',
          role: 'Status Tracker',
          text: `⚠️ Tiket <code>${targetKey}</code> tidak ditemukan pada proyek aktif ini. Silakan periksa kembali kode tiket Anda atau ketik <code>/status LIB-116</code>.`,
          time: timeNow,
          inlineButtons: [
            { label: '🔍 Cek Tiket LIB-116', command: '/status LIB-116' }
          ]
        });
      }
      return;
    }

    // 2. Human Escalation: /human
    if (lower.startsWith('/human') || lower.includes('bicara dengan manusia') || lower.includes('hubungi dev')) {
      this.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: '@ProjectManjerBot (Eskalasi)',
        role: 'Human Handover',
        text: `🚨 <strong>Eskalasi Layanan Darurat Diaktifkan:</strong><br />
Pemberitahuan telah dikirimkan secara instan ke:<br />
1. <strong>Asisyah</strong> (Project Manajer) — SLA Tanggap 15 Menit<br />
2. <strong>Jaka</strong> (Backend Lead &amp; On-Call Engineer)<br /><br />
Anda dapat langsung berdiskusi dengan tim pengembang melalui tombol kontak di bawah:`,
        time: timeNow,
        inlineButtons: [
          { label: '💬 Chat dengan PM Asisyah', action: 'switchChannel', channel: 'pm' },
          { label: '💬 Chat dengan Jaka (Lead Dev)', action: 'switchChannel', channel: 'dev' }
        ]
      });
      return;
    }

    // 3. Invoice Command: /invoice
    if (lower.startsWith('/invoice') || lower.includes('tagihan') || lower.includes('termin')) {
      const projectInvoices = invoices.filter((i) => i.projectId === activeProject.id);
      this.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: '@ProjectManjerBot',
        role: 'Finance Gateway',
        text: `📄 <strong>Informasi Tagihan &amp; Termin (${activeProject.name || 'Proyek'}):</strong><br />
${projectInvoices.map((inv) => `
• <strong>${inv.invoiceNumber}</strong> (${inv.type}): <strong>${this.formatIDR(inv.totalAmount)}</strong> — <span style="color: ${inv.status === 'Lunas' ? '#047857' : '#b45309'}; font-weight: 700;">${inv.status}</span>
`).join('')}<br />
Total Nilai Kontrak: <strong>${this.formatIDR(activeProject.contractValue || 185000000)}</strong>`,
        time: timeNow,
        inlineButtons: [
          { label: '💳 Lihat Rincian di Modul Keuangan', action: 'openFinance' }
        ]
      });
      return;
    }

    // 4. Help Command: /help
    if (lower.startsWith('/help') || lower.includes('bantuan') || lower.includes('perintah')) {
      this.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: '@ProjectManjerBot',
        role: 'Helpdesk Bot',
        text: `ℹ️ <strong>Buku Panduan Layanan Telegram Bot (@ProjectManjerBot)</strong>:<br />
• <code>/status [TIKET]</code> — Mengecek progres tiket (contoh: <code>/status LIB-116</code>)<br />
• <code>/human</code> — Eskalasi ke Project Manajer atau On-Call Lead Dev<br />
• <code>/invoice</code> — Ringkasan pembayaran, termin DP, dan invoice UAT<br />
• <code>/sla</code> — Informasi jaminan kecepatan garansi &amp; maintenance<br />
• Atau laporkan kendala secara langsung untuk auto-triage AI.`,
        time: timeNow,
        inlineButtons: [
          { label: '🔍 Cek Status LIB-116', command: '/status LIB-116' },
          { label: '🚨 Hubungi Human PIC', command: '/human' }
        ]
      });
      return;
    }

    // 5. SLA Command: /sla
    if (lower.startsWith('/sla') || lower.includes('garansi') || lower.includes('maintenance')) {
      this.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: '@ProjectManjerBot',
        role: 'SLA Engine',
        text: `⏱️ <strong>Jaminan Service Level Agreement (SLA) &amp; Garansi:</strong><br />
• Severity 1 (Sistem Down): Respon &lt; <strong>30 Menit</strong><br />
• Severity 2 (Major Bug): Respon &lt; <strong>120 Menit</strong><br />
• Sisa Kuota Maintenance: <strong>${activeProject.maintenanceQuotaHours || 25} Jam</strong> (Gratis)<br />
• Garansi Proyek Aktif Sampai: <strong>${activeProject.warrantyUntil || '31 Oktober 2027'}</strong>`,
        time: timeNow,
        inlineButtons: [
          { label: '+ Lapor Kendala Baru', command: '/help' }
        ]
      });
      return;
    }

    // 6. Default: Auto-Triage as a Bug Report or Inquiry
    const newBug = (store.submitBugIntake ? store.submitBugIntake : store.ingestBugReport).call(store, {
      projectId: activeProject.id,
      title: userText.length > 60 ? userText.substring(0, 60) + '...' : userText,
      description: userText,
      severity: lower.includes('kritis') || lower.includes('down') ? 'S1 - Critical' : 'S2 - Major',
      source: 'Telegram Bot',
      telegramChatId: 'tg-client-88219'
    });

    this.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'bot',
      senderName: '@ProjectManjerBot (Auto-Triage)',
      role: 'AI Ingestion',
      text: `✅ <strong>Laporan Masalah Diterima &amp; Di-Triage:</strong><br />
Tiket baru telah dibuat di backlog proyek:<br />
• ID Tiket: <strong>${newBug.key}</strong><br />
• Severity: <strong>${newBug.severity}</strong><br />
• SLA Target: <strong>&lt; ${newBug.slaTargetMinutes} Menit</strong><br />
• PIC On-Call: <strong>Jaka (Backend Dev)</strong><br /><br />
Tim developer telah menerima notifikasi otomatis dan tiket telah masuk ke papan Kanban.`,
      time: timeNow,
      inlineButtons: [
        { label: `📋 Buka Tiket ${newBug.key}`, action: 'openTask', taskId: newBug.id },
        { label: '🔍 Pantau Status', command: `/status ${newBug.key}` }
      ]
    });
  }
}
