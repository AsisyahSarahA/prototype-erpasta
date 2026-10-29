/**
 * IntakeSimulatorModal.js
 * Multi-Channel Intake & Automated Bug Ingestion Simulator
 * Sesuai PRD v3.0: Kanal Telegram Bot API Resmi (@ProjectManjerBot), Sentry Webhook, & Web Portal.
 * 100% Native Vanilla JS (ES Modules), zero external bundler.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class IntakeSimulatorModal {
  constructor(options = {}) {
    this.isOpen = false;
    this.activeTab = 'telegram';
    this.onTaskCreated = options.onTaskCreated || (() => {});

    // State bot Telegram
    this.tgLinkedProjectCode = 'POS-KLN';
    this.tgMessages = [
      {
        sender: 'bot',
        text: '<strong>Halo dari @ProjectManjerBot!</strong>\nKanal Telegram resmi Project Manjer untuk pelaporan bug & transparansi status proyek.\n\nAkun Anda terverifikasi terhubung dengan proyek <strong>POS-KLN (Point of Sale Kuliner)</strong>.\n\nKetik perintah:\n• <code>/help</code> — Petunjuk perintah bot\n• <code>/status POS-B101</code> — Cek status tiket real-time\n• <code>/human</code> — Eskalasi darurat ke Lead Developer\n• Atau ketik langsung kendala Anda untuk auto-triage.',
        time: '10:00'
      }
    ];
    this.tgInput = 'Tombol cetak struk error 500 saat diskon 10% diterapkan pada kasir';
    this.selectedSentryPreset = 'preset1';

    this.element = document.createElement('div');
    this.element.className = 'intake-modal-overlay';
    this.element.style.display = 'none';

    this.bindEvents();

    store.subscribe((state) => {
      if (state.isIntakeModalOpen && !this.isOpen) {
        this.open();
      } else if (!state.isIntakeModalOpen && this.isOpen) {
        this.isOpen = false;
        this.element.style.display = 'none';
      }
    });
  }

  getElement() {
    return this.element;
  }

  open() {
    this.isOpen = true;
    this.element.style.display = 'flex';
    this.render();
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
    store.closeIntakeModal();
  }

  render() {
    if (!this.isOpen) return;

    const state = store.getState();
    const { projects } = state;

    this.element.innerHTML = `
      <div class="intake-modal-box">
        <!-- Header -->
        <div class="intake-modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #24a1de; color: white; display: flex; align-items: center; justify-content: center;">
              ${Icons.telegram('', 20)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 15px; font-weight: 700; color: #172b4d; margin: 0;">
                  Simulator Multi-Channel Intake &amp; Bug Ingestion
                </h2>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #ebf5fb; color: #24a1de; border: 1px solid #bce2f7;">
                  PRD v3.0 Telegram
                </span>
              </div>
              <p style="font-size: 12px; color: #6b778c; margin: 2px 0 0 0;">
                Uji coba alur masuk laporan bug dari Telegram Bot API (@ProjectManjerBot), Webhook Sentry, dan Portal Web.
              </p>
            </div>
          </div>

          <button id="closeIntakeModalBtn" style="background: none; border: none; cursor: pointer; color: #6b778c; padding: 4px;">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Channel Tabs -->
        <div style="display: flex; border-bottom: 1px solid #ebecf0; background: #fafbfc; padding: 0 24px;">
          ${[
            { id: 'telegram', label: 'Telegram Bot API (@ProjectManjerBot)', icon: Icons.telegram('', 14) },
            { id: 'sentry', label: 'Sentry Webhook Exception', icon: Icons.terminal('', 14) },
            { id: 'web', label: 'Formulir Web Portal Klien', icon: Icons.globe('', 14) }
          ].map(t => `
            <button class="intake-channel-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 12px; font-weight: ${this.activeTab === t.id ? '700' : '500'}; color: ${this.activeTab === t.id ? '#0052cc' : '#5e6c84'}; border-bottom: 2px solid ${this.activeTab === t.id ? '#0052cc' : 'transparent'}; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer;">
              <span>${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Tab Body -->
        <div style="padding: 20px 24px; overflow-y: auto;">
          ${this.renderTabBody(projects)}
        </div>
      </div>
    `;

    // Auto scroll chat
    if (this.activeTab === 'telegram') {
      const container = this.element.querySelector('#tgChatContainer');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  renderTabBody(projects) {
    if (this.activeTab === 'telegram') {
      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Bot Info Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #ebf5fb; border-radius: 8px; border: 1px solid #bce2f7; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #24a1de; display: flex;">${Icons.telegram('', 16)}</span>
              <span style="color: #172b4d; font-weight: 600;">@ProjectManjerBot</span>
              <span style="color: #006644; background: #e3fcef; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
                <i class="fi fi-rr-check" style="font-size: 10px; margin-right: 2px;"></i>Terverifikasi
              </span>
            </div>
            <div style="color: #5e6c84; font-size: 11px;">
              Chat ID: <code style="font-family: var(--font-mono); color: #172b4d;">tg-client-88219</code> · Proyek: <strong>${this.tgLinkedProjectCode}</strong>
            </div>
          </div>

          <!-- Telegram Chat Messages Container -->
          <div class="intake-chat-container" id="tgChatContainer" style="border-radius: 8px; border: 1px solid #dfe1e6;">
            ${this.tgMessages.map(m => `
              <div class="intake-chat-msg ${m.sender}">
                <div>${m.text.replace(/\n/g, '<br/>')}</div>
                <div class="intake-chat-time">${m.time}</div>
              </div>
            `).join('')}
          </div>

          <!-- Fast Command Chips -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 11px;">
            <span style="color: #6b778c; font-weight: 600;">Perintah Cepat:</span>
            <button type="button" class="telegram-command-pill" data-cmd="/help">
              /help
            </button>
            <button type="button" class="telegram-command-pill" data-cmd="/status">
              /status
            </button>
            <button type="button" class="telegram-command-pill" data-cmd="/human">
              /human (Eskalasi)
            </button>
            <button type="button" class="quick-tg-btn" data-text="#POS-KLN Printer struk kasir thermal tidak keluar kertas" style="background: #f4f5f7; border: 1px solid #dfe1e6; border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer; color: #172b4d;">
              #POS-KLN Printer Struk
            </button>
            <button type="button" class="quick-tg-btn" data-text="#LIB-DIG Filter katalog buku berdasarkan tahun terbit tidak merespon" style="background: #f4f5f7; border: 1px solid #dfe1e6; border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer; color: #172b4d;">
              #LIB-DIG Filter Buku
            </button>
          </div>

          <!-- Input Bar -->
          <form id="tgChatForm" style="display: flex; gap: 8px;">
            <input id="tgChatInput" type="text" value="${this.tgInput}" placeholder="Ketik kendala Anda atau /help, /status..." style="flex: 1; padding: 10px 14px; font-size: 13px; border-radius: 8px; border: 1px solid #dfe1e6; outline: none;" />
            <button type="submit" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; border: none; background: #24a1de; color: white; font-weight: 600; cursor: pointer;">
              ${Icons.send('', 14)}
              <span>Kirim</span>
            </button>
          </form>
        </div>
      `;
    }

    if (this.activeTab === 'sentry') {
      const presets = {
        preset1: {
          title: 'TypeError: calculateTaxPB1 is undefined in taxEngine.ts',
          projectCode: 'POS-KLN',
          severity: 'S2 - Major',
          env: 'Production'
        },
        preset2: {
          title: 'PostgresDeadlock: transaction 889211 deadlocked in inventory lock',
          projectCode: 'POS-KLN',
          severity: 'S1 - Critical (Blocker)',
          env: 'Production'
        },
        preset3: {
          title: 'MidtransWebhookTimeout: HTTP 504 Gateway Timeout on /api/webhooks/qris',
          projectCode: 'ECOMM-LF',
          severity: 'S2 - Major',
          env: 'Production'
        }
      };

      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 12px; font-weight: 600; color: #172b4d;">Pilih Tangkapan Exception Sentry:</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${Object.entries(presets).map(([k, v]) => `
                <label style="padding: 12px; border-radius: 8px; border: 1px solid ${this.selectedSentryPreset === k ? '#0052cc' : '#dfe1e6'}; background: ${this.selectedSentryPreset === k ? '#deebff' : 'white'}; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="radio" name="sentryPreset" value="${k}" ${this.selectedSentryPreset === k ? 'checked' : ''} style="accent-color: #0052cc;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #172b4d; font-family: var(--font-mono);">${v.title}</div>
                      <div style="font-size: 11px; color: #5e6c84; margin-top: 2px;">Kode Proyek: <strong>${v.projectCode}</strong> · Lingkungan: <strong>${v.env}</strong></div>
                    </div>
                  </div>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #ffebe6; color: #bf2600;">
                    ${v.severity}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>

          <button id="triggerSentryBtn" style="padding: 10px 18px; border-radius: 8px; border: none; background: #e11d48; color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            ${Icons.zap('', 14)}
            <span>Simulasi Kirim Payload Sentry Webhook</span>
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'web') {
      return `
        <form id="webIntakeForm" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 12px; font-weight: 600; color: #172b4d;">Proyek Terdaftar:</label>
              <select id="webProjectSelect" style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #dfe1e6;">
                ${projects.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('')}
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 12px; font-weight: 600; color: #172b4d;">Tingkat Keparahan (Severity):</label>
              <select id="webSeveritySelect" style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #dfe1e6;">
                <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker - SLA 30 Menit)</option>
                <option value="S2 - Major" selected>S2 - Major (SLA 2 Jam)</option>
                <option value="S3 - Minor">S3 - Minor (SLA 8 Jam)</option>
                <option value="S4 - Trivial">S4 - Trivial / Kosmetik</option>
              </select>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 12px; font-weight: 600; color: #172b4d;">Judul Kendala / Bug:</label>
            <input id="webTitleInput" type="text" placeholder="Contoh: Transaksi pembayaran QRIS tidak otomatis update status" required style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #dfe1e6;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 12px; font-weight: 600; color: #172b4d;">Deskripsi &amp; Langkah Reproduksi (Expected vs Actual):</label>
            <textarea id="webDescInput" rows="3" placeholder="1. Buka menu kasir\n2. Klik bayar QRIS\n3. Actual: Struk tidak tercetak, status pending" required style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #dfe1e6; resize: vertical;"></textarea>
          </div>

          <button type="submit" style="padding: 10px 18px; border-radius: 8px; border: none; background: #0052cc; color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            ${Icons.send('', 14)}
            <span>Kirim Tiket Laporan ke Portal</span>
          </button>
        </form>
      `;
    }

    return '';
  }

  handleTelegramCommand(cmd) {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    this.tgMessages.push({ sender: 'user', text: cmd, time });

    const trimmed = cmd.trim();
    if (trimmed === '/help') {
      this.tgMessages.push({
        sender: 'bot',
        text: '<strong>Panduan Perintah @ProjectManjerBot:</strong>\n\n• <code>/help</code> — Menampilkan panduan ini.\n• <code>/status [KUNCI-TIKET]</code> — Mengecek status pengerjaan tiket (contoh: <code>/status POS-B101</code>).\n• <code>/human</code> — Eskalasi darurat ke PIC PM & Developer Lead on-call.\n• <code>/unlink</code> — Memutus tautan akun Telegram ini dari proyek.\n• <code>#KODE-PROYEK [pesan]</code> — Lapor kendala proyek spesifik.\n\nSesuai SLA kontrak, tiket S1 ditanggapi &lt; 30 menit dan S2 &lt; 2 jam.',
        time
      });
    } else if (trimmed.startsWith('/status')) {
      const parts = trimmed.split(' ');
      const state = store.getState();
      const key = parts[1] ? parts[1].toUpperCase() : null;

      if (key) {
        const found = state.tasks.find(t => t.key.toUpperCase() === key);
        if (found) {
          this.tgMessages.push({
            sender: 'bot',
            text: `<strong>Status Tiket ${found.key}:</strong>\n• Judul: ${found.title}\n• Status: <strong>${found.status}</strong>\n• Prioritas: ${found.priority}\n• Ditangani oleh: ${found.assigneeId || 'Tim Developer'}\n• Terakhir update: ${new Date(found.lastStatusUpdated || found.createdAt).toLocaleTimeString('id-ID')}\n\nTiket dapat dipantau di Portal Klien.`,
            time
          });
        } else {
          this.tgMessages.push({
            sender: 'bot',
            text: `Tiket dengan key <strong>${key}</strong> tidak ditemukan di database proyek. Pastikan penulisan key benar (contoh: <code>POS-B101</code>).`,
            time
          });
        }
      } else {
        const activeProj = store.getActiveProject();
        const pTasks = state.tasks.filter(t => t.projectId === activeProj.id && t.visibility === 'client_public');
        const activeCount = pTasks.filter(t => t.status !== 'Selesai').length;
        this.tgMessages.push({
          sender: 'bot',
          text: `<strong>Ringkasan Proyek ${activeProj.name}:</strong>\n• Total tiket publik: ${pTasks.length}\n• Sedang dikerjakan: ${activeCount} task\n• Selesai: ${pTasks.length - activeCount} task\n\nGunakan <code>/status [KUNCI-TIKET]</code> untuk rincian tiket tertentu.`,
          time
        });
      }
    } else if (trimmed === '/human') {
      this.tgMessages.push({
        sender: 'bot',
        text: '<strong>Eskalasi ke Manusia Diteruskan:</strong>\nNotifikasi darurat telah dikirim ke Telegram Project Manager (<strong>Parhan - PM Lead</strong>) dan On-Call Tech Lead. Tim kami akan menghubungi Anda segera melalui kanal resmi ini.',
        time
      });
    } else if (trimmed === '/unlink') {
      this.tgMessages.push({
        sender: 'bot',
        text: 'Tautan akun Telegram telah dinonaktifkan. Untuk menghubungkan kembali, masukkan token otorisasi dari Portal Klien.',
        time
      });
    }
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element || e.target.closest('#closeIntakeModalBtn')) {
        this.close();
      }

      const channelBtn = e.target.closest('.intake-channel-btn');
      if (channelBtn) {
        this.activeTab = channelBtn.dataset.tab;
        this.render();
      }

      // Command pills
      const cmdPill = e.target.closest('.telegram-command-pill');
      if (cmdPill) {
        const cmd = cmdPill.dataset.cmd;
        this.handleTelegramCommand(cmd);
        this.render();
      }

      // Quick text chips
      const quickBtn = e.target.closest('.quick-tg-btn');
      if (quickBtn) {
        this.tgInput = quickBtn.dataset.text;
        const inputEl = this.element.querySelector('#tgChatInput');
        if (inputEl) inputEl.value = this.tgInput;
      }

      // Sentry trigger
      if (e.target.closest('#triggerSentryBtn')) {
        const presets = {
          preset1: {
            title: 'TypeError: calculateTaxPB1 is undefined in taxEngine.ts',
            projectCode: 'POS-KLN',
            severity: 'S2 - Major',
            env: 'Production',
            details: 'TypeError: Cannot read properties of undefined (reading \'calculateTaxPB1\') at processReceipt (taxEngine.ts:42)'
          },
          preset2: {
            title: 'PostgresDeadlock: transaction 889211 deadlocked in inventory lock',
            projectCode: 'POS-KLN',
            severity: 'S1 - Critical (Blocker)',
            env: 'Production',
            details: 'error: deadlock detected (40P01) Process 4122 waits for ShareLock'
          },
          preset3: {
            title: 'MidtransWebhookTimeout: HTTP 504 Gateway Timeout on /api/webhooks/qris',
            projectCode: 'ECOMM-LF',
            severity: 'S2 - Major',
            env: 'Production',
            details: 'AxiosError: timeout of 10000ms exceeded on POST /api/webhooks/qris'
          }
        };

        const chosen = presets[this.selectedSentryPreset] || presets.preset1;
        const state = store.getState();
        const proj = state.projects.find(p => p.code.includes(chosen.projectCode)) || state.projects[0];

        const task = store.ingestBugReport({
          projectId: proj.id,
          title: `[Sentry] ${chosen.title}`,
          description: chosen.details,
          source: 'Sentry',
          priority: chosen.severity.startsWith('S1') ? 'Hotfix' : 'Tinggi',
          severity: chosen.severity,
          environment: chosen.env
        });

        this.close();
        if (this.onTaskCreated && task) this.onTaskCreated(task.id);
      }
    });

    this.element.addEventListener('change', (e) => {
      if (e.target.name === 'sentryPreset') {
        this.selectedSentryPreset = e.target.value;
      }
    });

    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'tgChatForm') {
        e.preventDefault();
        const inputEl = this.element.querySelector('#tgChatInput');
        const text = inputEl ? inputEl.value.trim() : '';
        if (!text) return;

        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        if (text.startsWith('/')) {
          this.handleTelegramCommand(text);
          if (inputEl) inputEl.value = '';
          this.tgInput = '';
          this.render();
          return;
        }

        // Regular message
        this.tgMessages.push({ sender: 'user', text, time });
        this.tgInput = '';

        // Match project code or use linked project
        const match = text.match(/#([A-Z0-9-]+)\s+(.*)/i);
        const code = match ? match[1].toUpperCase() : this.tgLinkedProjectCode;
        const desc = match ? match[2] : text;

        const state = store.getState();
        const proj = state.projects.find(p => p.code.toUpperCase().includes(code) || code.includes(p.code.toUpperCase())) || state.projects[0];

        setTimeout(() => {
          const task = store.ingestBugReport({
            projectId: proj.id,
            title: `[Telegram Bot] ${desc.slice(0, 50)}...`,
            description: `Laporan masuk via @ProjectManjerBot (Telegram Bot API resmi):\n\n"${desc}"\n\nIdentitas Telegram: @client_pic (Chat ID: tg-client-88219, Terverifikasi)`,
            source: 'Telegram Bot',
            priority: 'Tinggi',
            severity: 'S2 - Major'
          });

          this.tgMessages.push({
            sender: 'bot',
            text: `<strong>Laporan Terverifikasi &amp; Diterima!</strong>\n• Tiket Baru: <strong>${task.key}</strong>\n• Proyek: <strong>${proj.name}</strong>\n• SLA Target Tanggap: <strong>&lt; 2 Jam</strong> (S2 - Major)\n• Alur: AI Diagnostic Package dibuat otomatis &amp; developer on-call diberitahu.\n\nGunakan <code>/status ${task.key}</code> untuk melacak perkembangan tiket ini.`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          });
          this.render();
          if (this.onTaskCreated && task) this.onTaskCreated(task.id);
        }, 500);

        this.render();
      }

      if (e.target.id === 'webIntakeForm') {
        e.preventDefault();
        const pId = this.element.querySelector('#webProjectSelect')?.value;
        const sev = this.element.querySelector('#webSeveritySelect')?.value;
        const title = this.element.querySelector('#webTitleInput')?.value || '';
        const desc = this.element.querySelector('#webDescInput')?.value || '';

        const task = store.ingestBugReport({
          projectId: pId,
          title,
          description: desc,
          source: 'Web Portal',
          priority: sev.startsWith('S1') ? 'Hotfix' : 'Tinggi',
          severity: sev
        });

        this.close();
        if (this.onTaskCreated && task) this.onTaskCreated(task.id);
      }
    });
  }
}
