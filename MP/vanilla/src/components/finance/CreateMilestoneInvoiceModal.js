/**
 * CreateMilestoneInvoiceModal.js
 * Modal for creating custom percentage & nominal progress invoices (SOP Progress > 10%).
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class CreateMilestoneInvoiceModal {
  constructor() {
    this.isOpen = false;
    this.targetProjectId = 'proj-perpustakaan';
    this.percentage = 30;
    this.customNominal = 55500000;
    this.title = '';
    this.dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    this.notes = '';

    this.element = document.createElement('div');
    this.element.className = 'finance-modal-overlay';
    this.element.style.display = 'none';

    this.bindEvents();
  }

  getElement() {
    return this.element;
  }

  open(projectId) {
    const state = store.getState();
    this.targetProjectId = projectId || state.selectedProjectId || 'proj-perpustakaan';
    const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
    this.percentage = 30;
    this.customNominal = Math.round((proj ? proj.contractValue : 185000000) * 0.3);
    this.title = `Termin ${this.percentage}%: Capaian Progres Proyek ${proj ? proj.name : ''}`;
    this.notes = '';
    this.isOpen = true;
    this.element.style.display = 'flex';
    this.render();
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
  }

  formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  }

  render() {
    if (!this.isOpen) return;

    const state = store.getState();
    const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
    const currentProgress = store.getProjectProgress(proj ? proj.id : '');
    const isProgressEligible = currentProgress >= 10;

    const subtotal = this.customNominal;
    const taxPpn = Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxPpn;

    this.element.innerHTML = `
      <div class="finance-modal-box">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid var(--color-zinc-100); display: flex; align-items: center; justify-content: space-between; background: white;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #059669; color: white; display: flex; align-items: center; justify-content: center;">
              ${Icons.dollarSign('', 18)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 15px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
                  Terbitkan Invoice Termin & Kirim ke Finance
                </h2>
                <span class="finance-badge-emerald">SOP Progres &ge; 10%</span>
              </div>
              <p style="font-size: 12px; color: var(--color-zinc-500); margin: 2px 0 0 0;">
                Penerbitan tagihan termin custom persen & nominal dengan notifikasi terpadu ke Finance dan CRM.
              </p>
            </div>
          </div>
          <button id="closeMilestoneModalBtn" style="background: none; border: none; cursor: pointer; color: var(--color-zinc-400); padding: 6px; border-radius: 8px;">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Form Body -->
        <form id="milestoneInvoiceForm" style="padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
          <!-- 1. Project Selector & Status Card -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Pilih Proyek Aktif:</label>
            <select id="milestoneProjectSelect" style="width: 100%; font-size: 12px; font-weight: 500; padding: 10px 12px; border-radius: 12px; background: var(--color-zinc-50); border: 1px solid rgba(228, 228, 231, 0.8);">
              ${state.projects.map(p => `
                <option value="${p.id}" ${p.id === this.targetProjectId ? 'selected' : ''}>
                  ${p.code} · ${p.name} (Progres: ${store.getProjectProgress(p.id)}%)
                </option>
              `).join('')}
            </select>

            <!-- Status Box -->
            <div style="padding: 16px; border-radius: 12px; border: 1px solid ${isProgressEligible ? 'rgba(167, 243, 208, 0.8)' : 'rgba(253, 230, 138, 0.8)'}; background: ${isProgressEligible ? 'rgba(236, 253, 245, 0.5)' : 'rgba(254, 243, 199, 0.6)'};">
              <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(228, 228, 231, 0.5);">
                <div>
                  <div style="font-size: 12px; font-weight: 700; color: var(--color-zinc-900);">${proj ? proj.clientName : ''}</div>
                  <div style="font-size: 11px; color: var(--color-zinc-500); font-family: var(--font-mono);">Nilai Kontrak: <strong>${this.formatIDR(proj ? proj.contractValue : 0)}</strong></div>
                </div>
                <div class="finance-status-pill ${isProgressEligible ? 'pass' : 'fail'}">
                  ${isProgressEligible ? `${Icons.checkCircle('', 12)} Lolos Syarat (&ge; 10%)` : `${Icons.alertTriangle('', 12)} Belum Lolos (&lt; 10%)`}
                </div>
              </div>

              <div style="padding-top: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-zinc-600);">
                  <span>Ambang Batas Syarat Terbit Invoice: &ge; 10%</span>
                  <span style="font-family: var(--font-mono); font-weight: 700;">${currentProgress}% Tercapai</span>
                </div>
                <div class="finance-progress-bar-bg">
                  <div class="finance-threshold-line"></div>
                  <div class="finance-progress-fill ${isProgressEligible ? 'green' : 'amber'}" style="width: ${Math.max(3, currentProgress)}%;"></div>
                </div>
              </div>

              ${!isProgressEligible ? `
                <div style="margin-top: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #fcd34d; font-size: 12px; color: #92400e; display: flex; gap: 8px;">
                  <div style="color: #f59e0b;">${Icons.alertTriangle('', 16)}</div>
                  <div>
                    <strong>Ketentuan SOP Penagihan Belum Terpenuhi:</strong>
                    <p style="margin: 4px 0 0 0; font-size: 11px; line-height: 1.4;">
                      Invoice termin hanya dapat diterbitkan setelah progres pengerjaan melebihi <strong>10%</strong> (progres saat ini baru <strong>${currentProgress}%</strong>). Selesaikan minimal 1 task di Kanban Board untuk membuka akses penagihan.
                    </p>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- 2. Inputs & Presets (disabled if ineligible) -->
          <div style="${!isProgressEligible ? 'opacity: 0.4; pointer-events: none;' : ''}; display: flex; flex-direction: column; gap: 16px;">
            <!-- Presets -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Pilih Preset Termin Cepat:</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                ${[
                  { label: 'Termin DP (15%)', percent: 15 },
                  { label: 'Termin 1 (25%)', percent: 25 },
                  { label: 'Termin 2 (30%)', percent: 30 },
                  { label: 'Termin UAT (50%)', percent: 50 }
                ].map(p => `
                  <button type="button" class="preset-btn" data-percent="${p.percent}" style="padding: 8px; font-size: 12px; font-weight: 500; border-radius: 10px; border: 1px solid rgba(228, 228, 231, 0.8); cursor: pointer; background: ${this.percentage === p.percent ? 'var(--color-zinc-900)' : 'var(--color-zinc-50)'}; color: ${this.percentage === p.percent ? 'white' : 'var(--color-zinc-700)'};">
                    ${p.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Percentage & Nominal -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700); display: flex; justify-content: space-between;">
                  <span>Kustom Persentase (%):</span>
                  <span style="font-family: var(--font-mono); color: #059669; font-weight: 700;">${this.percentage}%</span>
                </label>
                <input id="percentageInput" type="number" min="1" max="100" step="0.5" value="${this.percentage}" style="padding: 10px 12px; font-size: 13px; font-weight: 700; font-family: var(--font-mono); border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); background: var(--color-zinc-50);" />
                <input id="percentageRange" type="range" min="5" max="100" step="1" value="${this.percentage}" style="width: 100%; accent-color: var(--color-zinc-900); cursor: pointer;" />
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700); display: flex; justify-content: space-between;">
                  <span>Kustom Nominal Tagihan (IDR):</span>
                  <span style="font-size: 10px; color: var(--color-zinc-400);">Sinkron Otomatis</span>
                </label>
                <input id="nominalInput" type="text" value="${this.customNominal.toLocaleString('id-ID')}" style="padding: 10px 12px; font-size: 13px; font-weight: 700; font-family: var(--font-mono); border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); background: var(--color-zinc-50);" />
                <div style="font-size: 10px; color: var(--color-zinc-400); text-align: right;">
                  Dihitung dari ${this.percentage}% x ${this.formatIDR(proj ? proj.contractValue : 0)}
                </div>
              </div>
            </div>

            <!-- Breakdown -->
            <div style="padding: 16px; border-radius: 12px; background: var(--color-zinc-50); border: 1px solid rgba(228, 228, 231, 0.8); display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; color: var(--color-zinc-600);">
                <span>Nilai Termin Pokok (Subtotal):</span>
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-zinc-900);">${this.formatIDR(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: var(--color-zinc-600);">
                <span>Pajak Pertambahan Nilai (PPN 11% UU HPP):</span>
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-zinc-900);">${this.formatIDR(taxPpn)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; padding-top: 8px; border-top: 1px solid rgba(228, 228, 231, 0.8);">
                <span>Total Tagihan Nett yang Diteruskan:</span>
                <span style="font-family: var(--font-mono); color: #059669;">${this.formatIDR(totalAmount)}</span>
              </div>
            </div>

            <!-- Title & Notes -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Judul Tagihan / Capaian Milestone:</label>
              <input id="milestoneTitleInput" type="text" value="${this.title}" required style="padding: 10px 12px; font-size: 12px; border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); background: var(--color-zinc-50);" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Tanggal Jatuh Tempo:</label>
                <input id="milestoneDueDateInput" type="date" value="${this.dueDate}" required style="padding: 10px 12px; font-size: 12px; border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); background: var(--color-zinc-50);" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Catatan Rekening:</label>
                <input id="milestoneNotesInput" type="text" placeholder="Rekening BCA 883-091-2391 a/n PT Digital Manjer" value="${this.notes}" style="padding: 10px 12px; font-size: 12px; border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); background: var(--color-zinc-50);" />
              </div>
            </div>

            <!-- Dual notification info -->
            <div style="padding: 12px; border-radius: 12px; background: rgba(238, 242, 255, 0.8); border: 1px solid rgba(199, 210, 254, 0.8); font-size: 11px; color: #1e1b4b; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #3730a3;">
                ${Icons.sparkles('', 14)}
                <span>Otomatisasi Notifikasi Ganda ke Finance & CRM:</span>
              </div>
              <p style="margin: 0; line-height: 1.4;">
                Saat diterbitkan, status invoice langsung diset ke <strong>'Terkirim ke Finance'</strong> dan sistem otomatis mengirim notifikasi ke antrean Finance dan CRM.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--color-zinc-100);">
            <button type="button" id="cancelMilestoneModalBtn" style="padding: 8px 16px; font-size: 12px; font-weight: 500; border-radius: 10px; border: none; background: transparent; color: var(--color-zinc-600); cursor: pointer;">
              Batal
            </button>
            <button type="submit" id="submitMilestoneBtn" ${!isProgressEligible ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 12px; font-weight: 600; border-radius: 10px; border: none; background: ${isProgressEligible ? 'var(--color-zinc-900)' : 'var(--color-zinc-300)'}; color: white; cursor: ${isProgressEligible ? 'pointer' : 'not-allowed'};">
              ${Icons.send('', 14)}
              <span>Terbitkan & Kirim ke Finance</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    this.element.addEventListener('click', (e) => {
      if (e.target.closest('#closeMilestoneModalBtn') || e.target.closest('#cancelMilestoneModalBtn')) {
        this.close();
      }

      const presetBtn = e.target.closest('.preset-btn');
      if (presetBtn) {
        const pct = parseFloat(presetBtn.dataset.percent);
        this.percentage = pct;
        const state = store.getState();
        const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
        this.customNominal = Math.round((proj ? proj.contractValue : 185000000) * (pct / 100));
        this.render();
      }
    });

    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'milestoneProjectSelect') {
        this.targetProjectId = e.target.value;
        const state = store.getState();
        const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
        this.customNominal = Math.round((proj ? proj.contractValue : 185000000) * (this.percentage / 100));
        this.title = `Termin ${this.percentage}%: Capaian Progres Proyek ${proj ? proj.name : ''}`;
        this.render();
      }

      if (e.target.id === 'percentageInput' || e.target.id === 'percentageRange') {
        this.percentage = parseFloat(e.target.value) || 0;
        const state = store.getState();
        const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
        this.customNominal = Math.round((proj ? proj.contractValue : 185000000) * (this.percentage / 100));
        this.render();
      }
    });

    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'nominalInput') {
        const rawVal = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
        this.customNominal = rawVal;
        const state = store.getState();
        const proj = state.projects.find(p => p.id === this.targetProjectId) || state.projects[0];
        if (proj && proj.contractValue > 0) {
          this.percentage = Math.min(100, Math.max(1, Number(((rawVal / proj.contractValue) * 100).toFixed(1))));
          const pctInput = this.element.querySelector('#percentageInput');
          const pctRange = this.element.querySelector('#percentageRange');
          if (pctInput) pctInput.value = this.percentage;
          if (pctRange) pctRange.value = this.percentage;
        }
      }

      if (e.target.id === 'milestoneTitleInput') this.title = e.target.value;
      if (e.target.id === 'milestoneDueDateInput') this.dueDate = e.target.value;
      if (e.target.id === 'milestoneNotesInput') this.notes = e.target.value;
    });

    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'milestoneInvoiceForm') {
        e.preventDefault();
        const currentProgress = store.getProjectProgress(this.targetProjectId);
        if (currentProgress <= 10) return;

        const res = store.createCustomProgressInvoice({
          projectId: this.targetProjectId,
          percentage: this.percentage,
          customAmount: this.customNominal,
          title: this.title.trim(),
          notes: this.notes.trim() || undefined,
          dueDate: this.dueDate
        });

        if (res && res.success) {
          this.close();
        }
      }
    });
  }
}
