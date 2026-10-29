/**
 * FinanceInvoicesView.js
 * Invoicing and Financial Sync Module in 100% Native Vanilla JS.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';
import { CreateMilestoneInvoiceModal } from './CreateMilestoneInvoiceModal.js';

export class FinanceInvoicesView {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'finance-view';

    this.selectedInvoice = null;
    this.showCreateModal = false;
    this.statusFilter = 'all';
    this.selectedTaskIds = [];
    this.invoiceType = 'Maintenance Berkala';

    this.milestoneModal = new CreateMilestoneInvoiceModal();
    document.body.appendChild(this.milestoneModal.getElement());

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
    const { invoices, projects, tasks, selectedProjectId } = state;

    const unbilledCompletedTasks = tasks.filter(
      (t) => t.projectId === selectedProjectId && t.status === 'Selesai' && !t.billedInvoiceId
    );

    const filteredInvoices = invoices.filter((inv) => {
      if (this.statusFilter === 'all') return true;
      return inv.status === this.statusFilter;
    });

    const totalContractValue = projects.reduce((acc, p) => acc + (Number(p.contractValue) || 0), 0);
    const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
    const totalPaid = invoices.filter(inv => inv.status === 'Lunas').reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
    const pendingInvoices = invoices.filter(inv => inv.status !== 'Lunas');
    const totalPending = pendingInvoices.reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);

    this.element.innerHTML = `
      <div class="finance-container">
        <!-- 1. Top Banner -->
        <div class="finance-banner">
          <div class="finance-banner-left">
            <div class="finance-icon-box">
              ${Icons.dollarSign('', 24)}
            </div>
            <div>
              <div class="finance-banner-title">
                <h1>Modul Invoice &amp; Sinkronisasi Finance</h1>
                <span class="finance-badge-emerald">SOP Progres &ge; 10%</span>
                <span class="finance-badge-indigo">Notifikasi Terpadu Finance &amp; CRM</span>
              </div>
              <p class="finance-banner-desc">
                Penerbitan tagihan termin custom persen &amp; nominal dengan syarat capaian progres &ge; 10%. Otomatis mengirim notifikasi ke divisi Finance &amp; CRM pada tiap project yang dikerjakan.
              </p>
            </div>
          </div>

          <div class="finance-banner-actions">
            <button id="openMilestoneBtn" class="finance-btn-primary" style="background: #0052cc; color: white;">
              <span style="color: #6ee7b7;">${Icons.percent('', 14)}</span>
              <span>+ Terbitkan Invoice Termin (Progres &ge; 10%)</span>
            </button>
            <button id="openCreateCompletedTasksBtn" class="finance-btn-secondary">
              ${Icons.plus('', 14)}
              <span>Invoice Task Selesai (${unbilledCompletedTasks.length})</span>
            </button>
          </div>
        </div>

        <!-- 2. Financial KPI Summary Cards -->
        <div class="finance-kpi-grid">
          <div class="finance-kpi-card">
            <div class="finance-kpi-header">
              <span class="finance-kpi-title">Portofolio Kontrak</span>
              <span class="finance-kpi-icon finance-kpi-icon--blue">${Icons.folder('', 16)}</span>
            </div>
            <div class="finance-kpi-value">${this.formatIDR(totalContractValue)}</div>
            <div class="finance-kpi-subtext">Total nilai dari ${projects.length} proyek aktif</div>
          </div>

          <div class="finance-kpi-card">
            <div class="finance-kpi-header">
              <span class="finance-kpi-title">Tagihan Diterbitkan</span>
              <span class="finance-kpi-icon finance-kpi-icon--indigo">${Icons.fileText('', 16)}</span>
            </div>
            <div class="finance-kpi-value">${this.formatIDR(totalInvoiced)}</div>
            <div class="finance-kpi-subtext">${invoices.length} tagihan &amp; termin diterbitkan</div>
          </div>

          <div class="finance-kpi-card">
            <div class="finance-kpi-header">
              <span class="finance-kpi-title">Pembayaran Lunas</span>
              <span class="finance-kpi-icon finance-kpi-icon--emerald">${Icons.checkCircle('', 16)}</span>
            </div>
            <div class="finance-kpi-value" style="color: #059669;">${this.formatIDR(totalPaid)}</div>
            <div class="finance-kpi-subtext">${invoices.filter(i => i.status === 'Lunas').length} tagihan telah lunas diverifikasi</div>
          </div>

          <div class="finance-kpi-card">
            <div class="finance-kpi-header">
              <span class="finance-kpi-title">Sisa Piutang / Menunggu</span>
              <span class="finance-kpi-icon finance-kpi-icon--amber">${Icons.clock('', 16)}</span>
            </div>
            <div class="finance-kpi-value" style="color: #d97706;">${this.formatIDR(totalPending)}</div>
            <div class="finance-kpi-subtext">${pendingInvoices.length} tagihan dalam proses review / jatuh tempo</div>
          </div>
        </div>

        <!-- 2. Projects Milestone Status Grid (Perpustakaan, Futsal, POS) -->
        <div class="finance-milestone-card">
          <div class="finance-milestone-header">
            <div>
              <div class="finance-milestone-title">
                <span style="color: #059669;">${Icons.trendingUp('', 16)}</span>
                <span>Status Kelayakan Penagihan Termin Proyek (SOP Progres &gt; 10%)</span>
              </div>
              <p style="font-size: 12px; color: var(--color-zinc-500); margin: 2px 0 0 0;">
                Evaluasi progres tiap project secara real-time. Invoice termin hanya dapat diterbitkan bila progres melebihi ambang 10%.
              </p>
            </div>
            <div style="font-size: 11px; color: var(--color-zinc-500);">
              Ambang Batas Minimum: <strong style="color: #047857;">&gt; 10%</strong>
            </div>
          </div>

          <div class="finance-projects-grid">
            ${projects.map((proj) => {
              const progress = store.getProjectProgress(proj.id);
              const isEligible = progress > 10;
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedTasksCount = projTasks.filter((t) => t.status === 'Selesai').length;

              return `
                <div class="finance-project-item ${isEligible ? 'eligible' : 'ineligible'}">
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div class="finance-proj-top">
                      <div>
                        <span class="finance-proj-code">${proj.code}</span>
                        <div class="finance-proj-name" title="${proj.name}">${proj.name}</div>
                        <div class="finance-proj-client">${proj.clientName}</div>
                      </div>
                      <div class="finance-status-pill ${isEligible ? 'pass' : 'fail'}">
                        ${isEligible ? `${Icons.checkCircle('', 12)} Lolos (&gt; 10%)` : `${Icons.alertTriangle('', 12)} Belum (&le; 10%)`}
                      </div>
                    </div>

                    <div class="finance-proj-stat">
                      <span style="color: var(--color-zinc-500);">Nilai Kontrak:</span>
                      <span style="font-family: var(--font-mono); font-weight: 700; color: var(--color-zinc-900);">${this.formatIDR(proj.contractValue)}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-zinc-500);">
                      <span>Task Selesai:</span>
                      <span style="font-family: var(--font-mono); font-weight: 500; color: var(--color-zinc-700);">${completedTasksCount} / ${projTasks.length} task</span>
                    </div>

                    <!-- Progress Gauge -->
                    <div class="finance-progress-container">
                      <div class="finance-progress-header">
                        <span style="color: var(--color-zinc-500);">Capaian Progres:</span>
                        <span style="font-family: var(--font-mono); font-weight: 700; color: var(--color-zinc-900);">${progress}%</span>
                      </div>
                      <div class="finance-progress-bar-bg">
                        <div class="finance-threshold-line" title="Batas Minimum SOP 10%"></div>
                        <div class="finance-progress-fill ${isEligible ? 'green' : 'amber'}" style="width: ${Math.min(100, Math.max(3, progress))}%;"></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    ${isEligible ? `
                      <button class="finance-btn-primary issue-milestone-btn" data-project-id="${proj.id}" style="width: 100%; justify-content: center;">
                        <span style="color: #34d399;">${Icons.percent('', 14)}</span>
                        <span>Terbitkan Invoice (${progress}%)</span>
                        ${Icons.arrowRight('', 14)}
                      </button>
                    ` : `
                      <button disabled class="finance-btn-secondary" style="width: 100%; justify-content: center; cursor: not-allowed; opacity: 0.7; color: var(--color-zinc-400);">
                        <span style="color: #f59e0b;">${Icons.alertTriangle('', 14)}</span>
                        <span>Belum Mencapai 10% (${progress}%)</span>
                      </button>
                      <p style="font-size: 10px; color: #92400e; text-align: center; margin: 4px 0 0 0;">
                        Selesaikan minimal 1 task di Kanban Board untuk membuka penagihan.
                      </p>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Automated Dual-Notification Banner -->
        <div class="finance-info-banner">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${Icons.bell('', 16)}
          </div>
          <div>
            <div style="font-weight: 700; color: #312e81; display: flex; align-items: center; gap: 8px;">
              <span>Alur Otomasi Notifikasi Ganda ke Finance &amp; CRM:</span>
              <span style="font-size: 10px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 9999px; background: white; color: #4338ca; border: 1px solid #c7d2fe; font-weight: 600;">
                Dual-Channel Broadcast
              </span>
            </div>
            <p style="font-size: 11px; margin: 4px 0 0 0; line-height: 1.5; color: rgba(49, 46, 129, 0.85);">
              Setiap kali invoice termin berhasil diterbitkan, sistem otomatis mendispatch notifikasi real-time ke modul <strong>Finance</strong> (verifikasi piutang) dan modul <strong>CRM</strong> (update timeline pembayaran klien), serta langsung mengupdate lonceng notifikasi di TopBar.
            </p>
          </div>
        </div>

        <!-- 4. Invoices List Section -->
        <div class="finance-table-card">
          <div class="finance-table-header">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--color-zinc-900);">
                Daftar Tagihan &amp; Riwayat Invoice (${invoices.length})
              </div>
              <div style="font-size: 12px; color: var(--color-zinc-500);">
                Mata Uang: IDR (Rupiah) · Pajak Pertambahan Nilai (PPN): 11% UU HPP
              </div>
            </div>

            <!-- Filter Pills -->
            <div class="finance-filter-pills">
              ${[
                { id: 'all', label: `Semua (${invoices.length})` },
                { id: 'Terkirim ke Finance', label: `Terkirim ke Finance (${invoices.filter(i => i.status === 'Terkirim ke Finance').length})` },
                { id: 'Disetujui PM', label: 'Disetujui PM' },
                { id: 'Terkirim ke Klien', label: 'Terkirim ke Klien' },
                { id: 'Lunas', label: 'Lunas' }
              ].map(tab => `
                <button class="finance-filter-btn ${this.statusFilter === tab.id ? 'active' : ''}" data-filter="${tab.id}">
                  ${tab.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="finance-invoices-cards-grid">
            ${filteredInvoices.length === 0 ? `
              <div style="padding: 32px; text-align: center; color: var(--color-zinc-400); font-size: 12px;">
                Tidak ada invoice pada status ini.
              </div>
            ` : filteredInvoices.map(inv => {
              const isPaid = inv.status === 'Lunas';
              const isSentToFinance = inv.status === 'Terkirim ke Finance';
              const isSentToClient = inv.status === 'Terkirim ke Klien';
              const isApprovedPm = inv.status === 'Disetujui PM';

              return `
                <div class="finance-invoice-card ${isPaid ? 'finance-invoice-card--paid' : ''}">
                  <div class="finance-invoice-card__header">
                    <div class="finance-invoice-card__id-group">
                      <span class="finance-invoice-num">${inv.invoiceNumber}</span>
                      
                      <!-- Status Badge -->
                      <span class="finance-status-pill ${
                        isPaid ? 'pass' : isSentToFinance ? 'teal' : isApprovedPm ? 'blue' : isSentToClient ? 'purple' : 'amber'
                      }">
                        ${isSentToFinance ? Icons.send('', 12) : ''}
                        ${isPaid ? Icons.checkCircle('', 12) : ''}
                        <span>${inv.status}</span>
                      </span>

                      ${inv.percentage ? `
                        <span class="finance-termin-pill">
                          Termin ${inv.percentage}%
                        </span>
                      ` : ''}

                      <span style="font-size: 12px; color: #475569; font-weight: 600;">
                        ${inv.type}
                      </span>
                    </div>

                    <div class="finance-invoice-card__amount">
                      <span class="finance-amount-val">${this.formatIDR(inv.totalAmount)}</span>
                      <span class="finance-amount-sub">Total Nett (PPN 11% inc.)</span>
                    </div>
                  </div>

                  <div class="finance-invoice-card__body">
                    <div class="finance-body-col">
                      <span class="finance-body-label">Klien &amp; Proyek:</span>
                      <span class="finance-body-val">
                        <strong style="color: #0f172a;">${inv.clientName}</strong>
                      </span>
                      <span class="finance-body-meta">ID Proyek: <strong>${inv.projectId || 'Software'}</strong></span>
                    </div>

                    <div class="finance-body-col">
                      <span class="finance-body-label">Rincian Finansial:</span>
                      <span class="finance-body-val">Subtotal: ${this.formatIDR(inv.subtotal)}</span>
                      <span class="finance-body-meta">PPN (11% UU HPP): ${this.formatIDR(inv.taxPpn)} · ${inv.items.length} item</span>
                    </div>

                    <div class="finance-body-col">
                      <span class="finance-body-label">Jatuh Tempo &amp; Status:</span>
                      <span class="finance-body-val" style="font-weight: 700; color: ${isPaid ? '#059669' : '#b45309'}; font-family: var(--font-mono);">
                        ${inv.dueDate || '-'}
                      </span>
                      <span class="finance-body-meta">${isPaid ? '<i class="fi fi-rr-check"></i> Lunas Terverifikasi' : 'Menunggu Pelunasan / Review'}</span>
                    </div>
                  </div>

                  ${inv.notes ? `
                    <div class="finance-invoice-card__notes">
                      ${Icons.fileText('', 12)}
                      <span>Catatan: &ldquo;${inv.notes}&rdquo;</span>
                    </div>
                  ` : ''}

                  <div class="finance-invoice-card__actions">
                    <button class="finance-btn-secondary view-invoice-btn" data-invoice-id="${inv.id}">
                      ${Icons.fileText('', 13)}
                      <span>Buka &amp; Cetak Faktur</span>
                    </button>

                    <div class="finance-action-group">
                      ${inv.status === 'Draft' ? `
                        <button class="finance-btn-primary transition-status-btn" data-invoice-id="${inv.id}" data-target-status="Disetujui PM" style="background: #0052cc;">
                          ${Icons.check('', 12)}
                          <span>Setujui (PM)</span>
                        </button>
                      ` : ''}

                      ${inv.status === 'Disetujui PM' ? `
                        <button class="finance-btn-primary transition-status-btn" data-invoice-id="${inv.id}" data-target-status="Terkirim ke Finance" style="background: #0d9488;">
                          ${Icons.send('', 12)}
                          <span>Kirim ke Finance</span>
                        </button>
                      ` : ''}

                      ${inv.status === 'Terkirim ke Finance' ? `
                        <button class="finance-btn-primary transition-status-btn" data-invoice-id="${inv.id}" data-target-status="Terkirim ke Klien" style="background: #4f46e5;">
                          ${Icons.send('', 12)}
                          <span>Kirim ke Klien</span>
                        </button>
                        <button class="finance-btn-primary transition-status-btn" data-invoice-id="${inv.id}" data-target-status="Lunas" style="background: #059669;">
                          ${Icons.check('', 12)}
                          <span>Tandai Lunas</span>
                        </button>
                      ` : ''}

                      ${inv.status === 'Terkirim ke Klien' ? `
                        <button class="finance-btn-primary transition-status-btn" data-invoice-id="${inv.id}" data-target-status="Lunas" style="background: #059669;">
                          ${Icons.check('', 12)}
                          <span>Tandai Lunas</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Detail Print / View Invoice Modal -->
      ${this.selectedInvoice ? this.renderInvoiceDetailModal(this.selectedInvoice) : ''}
    `;
  }

  renderInvoiceDetailModal(inv) {
    return `
      <div class="finance-modal-overlay" id="invoiceDetailModalOverlay">
        <div class="finance-modal-box" style="max-width: 680px; padding: 28px; gap: 20px;">
          <!-- Top info -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid var(--color-zinc-200);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--color-zinc-900); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
                  DM
                </div>
                <div>
                  <h2 style="font-weight: 700; font-size: 14px; margin: 0; color: var(--color-zinc-900);">PT Digital Manjer Solusindo</h2>
                  <p style="font-size: 11px; color: var(--color-zinc-500); margin: 0;">Software House &amp; Cloud Architecture</p>
                </div>
              </div>
              <div style="font-size: 11px; color: var(--color-zinc-500); margin-top: 8px; line-height: 1.4;">
                <p style="margin: 0;">Cyber 2 Tower Lt. 18, Jakarta Selatan</p>
                <p style="margin: 0;">NPWP: 01.883.912.4-012.000</p>
                <p style="margin: 0;">Email: billing@digitalmanjer.dev</p>
              </div>
            </div>

            <div style="text-align: right;">
              <span style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--color-zinc-900); display: block;">
                ${inv.invoiceNumber}
              </span>
              <span style="display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 9999px; background: #d1fae5; color: #065f46;">
                Status: ${inv.status}
              </span>
              <p style="font-size: 11px; color: var(--color-zinc-500); margin: 4px 0 0 0;">Jenis: ${inv.type}</p>
              ${inv.percentage ? `<p style="font-size: 11px; font-weight: 600; color: #4338ca; margin: 2px 0 0 0;">Termin ${inv.percentage}%</p>` : ''}
            </div>
          </div>

          <!-- Client & Dates -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; background: var(--color-zinc-50); padding: 14px; border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8);">
            <div>
              <span style="color: var(--color-zinc-500); display: block; margin-bottom: 2px;">Ditagihkan Kepada:</span>
              <span style="font-weight: 700; color: var(--color-zinc-900); display: block;">${inv.clientName}</span>
              <span style="color: var(--color-zinc-600);">ID Proyek: ${inv.projectId}</span>
            </div>
            <div style="text-align: right;">
              <div><span style="color: var(--color-zinc-500);">Tanggal Terbit: </span><strong>${inv.issueDate}</strong></div>
              <div><span style="color: var(--color-zinc-500);">Jatuh Tempo: </span><strong style="color: #be123c;">${inv.dueDate}</strong></div>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-zinc-200); color: var(--color-zinc-500); font-weight: 600;">
                <th style="padding: 8px 0;">Deskripsi Layanan / Tiket</th>
                <th style="padding: 8px 0; text-align: right;">Kuantitas</th>
                <th style="padding: 8px 0; text-align: right;">Tarif (IDR)</th>
                <th style="padding: 8px 0; text-align: right;">Jumlah (IDR)</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map(item => `
                <tr style="border-bottom: 1px solid var(--color-zinc-100);">
                  <td style="padding: 10px 0; font-weight: 500; color: var(--color-zinc-800);">${item.description}</td>
                  <td style="padding: 10px 0; text-align: right; color: var(--color-zinc-600);">${item.hoursOrUnits} ${item.taskId ? 'jam' : 'paket'}</td>
                  <td style="padding: 10px 0; text-align: right; color: var(--color-zinc-600);">${this.formatIDR(item.ratePerUnit)}</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: var(--color-zinc-900);">${this.formatIDR(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--color-zinc-200);">
            <div style="width: 250px; display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; color: var(--color-zinc-600);">
                <span>Subtotal:</span>
                <span style="font-weight: 600; color: var(--color-zinc-900);">${this.formatIDR(inv.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: var(--color-zinc-600);">
                <span>PPN (11% UU HPP):</span>
                <span style="font-weight: 600; color: var(--color-zinc-900);">${this.formatIDR(inv.taxPpn)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; padding-top: 6px; border-top: 1px solid var(--color-zinc-200);">
                <span>Total Tagihan (Nett):</span>
                <span style="color: #059669;">${this.formatIDR(inv.totalAmount)}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--color-zinc-200);">
            <button id="closeInvoiceDetailBtn" class="finance-btn-secondary">Tutup</button>
            <button id="printInvoiceBtn" class="finance-btn-primary">
              ${Icons.printer('', 14)}
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('#openMilestoneBtn')) {
        this.milestoneModal.open(store.getState().selectedProjectId);
      }

      const issueBtn = e.target.closest('.issue-milestone-btn');
      if (issueBtn) {
        const pId = issueBtn.dataset.projectId;
        this.milestoneModal.open(pId);
      }

      const filterBtn = e.target.closest('.finance-filter-btn');
      if (filterBtn) {
        this.statusFilter = filterBtn.dataset.filter;
        this.render();
      }

      const viewBtn = e.target.closest('.view-invoice-btn');
      if (viewBtn) {
        const invId = viewBtn.dataset.invoiceId;
        const inv = store.getState().invoices.find(i => i.id === invId);
        if (inv) {
          this.selectedInvoice = inv;
          this.render();
        }
      }

      const transBtn = e.target.closest('.transition-status-btn');
      if (transBtn) {
        const invId = transBtn.dataset.invoiceId;
        const status = transBtn.dataset.targetStatus;
        store.updateInvoiceStatus(invId, status);
      }

      if (e.target.closest('#closeInvoiceDetailBtn') || e.target.id === 'invoiceDetailModalOverlay') {
        this.selectedInvoice = null;
        this.render();
      }

      if (e.target.closest('#printInvoiceBtn')) {
        window.print();
      }
    });
  }
}
