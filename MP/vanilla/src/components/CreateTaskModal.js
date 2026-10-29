/**
 * CreateTaskModal Component (100% Native Vanilla JS ES Module)
 * Enterprise-Grade Jira / Linear "Create Issue" Dialog:
 * - Proportional 2-Column SaaS Layout (60% Primary Specifications, 40% Metadata & People)
 * - Visual Issue Type Pills (Task, Feature, Bug, Revisi, Maintenance)
 * - Software House Bug Triage Standard (Severity S1-S4, Environment, Warranty, Steps to Reproduce, Expected vs Actual)
 * - Initial Subtasks Checklist Builder
 * - 4 Visual Priority Cards with Status Dots (Hotfix, Tinggi, Sedang, Rendah)
 * - Team Assignee with Avatar & Role
 * - Epic Module Selector matching Target Project
 * - "Create Another" Rapid Ticket Ingestion Workflow
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';

export class CreateTaskModal {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'modal-backdrop';
    this.unsubscribe = null;

    // Form Local State
    const state = store.getState();
    this.projectId = state.selectedProjectId || (state.projects[0] ? state.projects[0].id : 'proj-perpustakaan');
    this.type = 'Task';
    this.title = '';
    this.description = '';
    this.priority = 'Sedang';
    this.assigneeId = (state.teamMembers && state.teamMembers[1] ? state.teamMembers[1].id : 'user-dev-1');
    this.epicId = '';
    this.estimateHours = 4;
    this.dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    this.visibility = 'client_public';
    this.createAnother = false;

    // Initial Subtasks
    this.initialSubtasks = [];

    // Bug tracking fields
    this.severity = 'S2 - Major';
    this.environment = 'Production';
    this.warrantyStatus = 'Garansi Proyek (Gratis)';
    this.reproStepsText = '';
    this.expectedBehavior = '';
    this.actualBehavior = '';

    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.update();
    });

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        store.closeCreateTaskModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.getState().isCreateTaskModalOpen) {
        store.closeCreateTaskModal();
      }
    });
  }

  update() {
    const isOpen = store.getState().isCreateTaskModalOpen;
    if (isOpen) {
      if (!this.container.classList.contains('modal-backdrop--open')) {
        this.projectId = store.getState().selectedProjectId || this.projectId;
        this.container.classList.add('modal-backdrop--open');
        this.render();
      }
    } else {
      this.container.classList.remove('modal-backdrop--open');
    }
  }

  render() {
    const state = store.getState();
    const activeProject = state.projects.find((p) => p.id === this.projectId) || state.projects[0] || {};
    const projectEpics = state.epics.filter((e) => e.projectId === this.projectId);
    const teamMembers = state.teamMembers || [];

    const issueTypes = [
      { id: 'Task', label: 'Task Standar', icon: '⚡' },
      { id: 'Feature', label: 'Feature Baru', icon: '✨' },
      { id: 'Bug', label: 'Bug / Kerusakan', icon: '🐛' },
      { id: 'Revisi', label: 'Revisi (CR)', icon: '🔧' },
      { id: 'Maintenance', label: 'Maintenance', icon: '🛠️' }
    ];

    const priorityCards = [
      { id: 'Hotfix', label: 'Hotfix', sub: 'Kritis / Segera', dotClass: 'p-dot-hotfix', activeClass: 'p-hotfix' },
      { id: 'Tinggi', label: 'Tinggi', sub: 'Fitur Utama', dotClass: 'p-dot-tinggi', activeClass: 'p-tinggi' },
      { id: 'Sedang', label: 'Sedang', sub: 'Standar Sprint', dotClass: 'p-dot-sedang', activeClass: 'p-sedang' },
      { id: 'Rendah', label: 'Rendah', sub: 'Backlog Minor', dotClass: 'p-dot-rendah', activeClass: 'p-rendah' }
    ];

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--create">
        
        <!-- Modal Header -->
        <div class="create-issue-header">
          <div class="create-issue-title-group">
            <div class="create-issue-icon-box">
              <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 800;">
                ${activeProject.code ? activeProject.code.split('-')[0] : 'AST'}
              </span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em;">
                  Buat Masalah (Create Issue)
                </h2>
                <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 9999px;">
                  ${activeProject.code || 'PROJ'}
                </span>
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
                Tambahkan task, fitur, bug, atau perbaikan teknis ke backlog dan sprint aktif tim.
              </p>
            </div>
          </div>

          <button id="createModalCloseBtn" class="modal-header__close-btn" title="Batal (Esc)">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Form Body (Proportional 2-Column Split) -->
        <form id="createTaskForm" style="display: flex; flex-direction: column; flex: 1; min-height: 0;">
          
          <div class="create-issue-body">
            
            <!-- Left Column: Primary Content & Technical Specs (60%) -->
            <div class="create-issue-left">
              
              <!-- 1. Tipe Masalah (Pills) -->
              <div class="create-field-group">
                <label class="create-field-label">
                  <span>Tipe Masalah (Issue Type) *</span>
                  <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: none;">Pilih klasifikasi tiket</span>
                </label>
                <div class="create-type-chips">
                  ${issueTypes.map((t) => `
                    <button
                      type="button"
                      class="create-type-chip ${this.type === t.id ? `active type-${t.id.toLowerCase()}` : ''}"
                      data-type="${t.id}"
                    >
                      <span>${t.icon}</span>
                      <span>${t.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- 2. Ringkasan / Judul Pekerjaan -->
              <div class="create-field-group">
                <label class="create-field-label">
                  <span>Ringkasan / Judul Pekerjaan *</span>
                </label>
                <input
                  type="text"
                  id="taskTitleInput"
                  required
                  placeholder="Contoh: Sinkronisasi data stok barang multi-warehouse..."
                  value="${this.escapeHtml(this.title)}"
                  class="create-input create-input-title"
                />
                <span style="font-size: 11px; color: #64748b;">
                  Gunakan format ringkas, contoh: <code>[Backend] Integrasi Redis atomic lock</code> atau <code>[UI] Redesign modal</code>
                </span>
              </div>

              <!-- 3. Deskripsi & Spesifikasi Teknis -->
              <div class="create-field-group">
                <div class="create-field-label">
                  <span>Deskripsi &amp; Konteks Teknis</span>
                  <div style="display: flex; gap: 4px;">
                    <button type="button" class="md-helper-btn git-view-btn" data-tag="bold" style="padding: 2px 6px; font-size: 11px; font-weight: bold;">B</button>
                    <button type="button" class="md-helper-btn git-view-btn" data-tag="italic" style="padding: 2px 6px; font-size: 11px; font-style: italic;">I</button>
                    <button type="button" class="md-helper-btn git-view-btn" data-tag="code" style="padding: 2px 6px; font-size: 11px; font-family: monospace;">&lt;/&gt;</button>
                    <button type="button" class="md-helper-btn git-view-btn" data-tag="list" style="padding: 2px 6px; font-size: 11px;">• List</button>
                  </div>
                </div>
                <textarea
                  id="taskDescTextarea"
                  rows="4"
                  placeholder="Jelaskan kebutuhan fungsional, arsitektur data, endpoint API, kriteria penerimaan (Acceptance Criteria)..."
                  class="create-textarea"
                >${this.escapeHtml(this.description)}</textarea>
              </div>

              <!-- 4. Standar Tiket Bug Software House (Tampil Otomatis saat Tipe = Bug) -->
              ${this.type === 'Bug' ? `
                <div style="padding: 16px; border-radius: 12px; border: 1.5px solid #fca5a5; background-color: #fff1f2; display: flex; flex-direction: column; gap: 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #fecdd3; padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #b91c1c; font-weight: 700; font-size: 13px;">
                      <span>🐛</span>
                      <span>Standar Triage Bug Software House (SOP QA &amp; Dev)</span>
                    </div>
                    <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: white; color: #b91c1c; border: 1px solid #fca5a5;">
                      ISO QA Ready
                    </span>
                  </div>

                  <!-- Severity, Env, Warranty in 3 Columns -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div class="create-field-group">
                      <label style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Keparahan (Severity) *</label>
                      <select id="bugSeveritySelect" class="create-input" style="font-size: 11px; padding: 6px 8px; font-weight: 700;">
                        <option value="S1 - Critical (Blocker)" ${this.severity === 'S1 - Critical (Blocker)' ? 'selected' : ''}>S1 - Critical (Blocker, SLA &lt; 4 Jam)</option>
                        <option value="S2 - Major" ${this.severity === 'S2 - Major' ? 'selected' : ''}>S2 - Major (Fitur Utama, SLA 24 Jam)</option>
                        <option value="S3 - Minor" ${this.severity === 'S3 - Minor' ? 'selected' : ''}>S3 - Minor (Workaround Ada, SLA 3 Hari)</option>
                        <option value="S4 - Trivial" ${this.severity === 'S4 - Trivial' ? 'selected' : ''}>S4 - Trivial (Kosmetik/Typo)</option>
                      </select>
                    </div>

                    <div class="create-field-group">
                      <label style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Lingkungan Terdampak *</label>
                      <select id="bugEnvSelect" class="create-input" style="font-size: 11px; padding: 6px 8px;">
                        <option value="Production" ${this.environment === 'Production' ? 'selected' : ''}>Production (Live Server)</option>
                        <option value="Staging" ${this.environment === 'Staging' ? 'selected' : ''}>Staging (Pre-Release)</option>
                        <option value="QA / Testing" ${this.environment === 'QA / Testing' ? 'selected' : ''}>QA / Testing Lab</option>
                        <option value="Development" ${this.environment === 'Development' ? 'selected' : ''}>Development Local</option>
                      </select>
                    </div>

                    <div class="create-field-group">
                      <label style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Kategori Biaya / Garansi *</label>
                      <select id="bugWarrantySelect" class="create-input" style="font-size: 11px; padding: 6px 8px;">
                        <option value="Garansi Proyek (Gratis)" ${this.warrantyStatus === 'Garansi Proyek (Gratis)' ? 'selected' : ''}>Garansi Proyek (Rp 0 - Bebas Biaya)</option>
                        <option value="Kuota Maintenance" ${this.warrantyStatus === 'Kuota Maintenance' ? 'selected' : ''}>Potong Kuota Retainer</option>
                        <option value="Non-Garansi (Billable)" ${this.warrantyStatus === 'Non-Garansi (Billable)' ? 'selected' : ''}>Non-Garansi (Ditagihkan)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Reproduction Steps -->
                  <div class="create-field-group">
                    <label style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
                      Langkah Reproduksi Masalah (Steps to Reproduce)
                    </label>
                    <textarea
                      id="bugReproStepsTextarea"
                      rows="2"
                      placeholder="1. Buka halaman katalog buku&#10;2. Masukkan kata kunci pencarian > 50 karakter&#10;3. Klik cari dan amati pesan exception..."
                      class="create-textarea"
                      style="font-family: var(--font-mono); font-size: 11px; min-height: 60px;"
                    >${this.escapeHtml(this.reproStepsText)}</textarea>
                  </div>

                  <!-- Expected vs Actual -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="create-field-group">
                      <label style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Hasil Diharapkan (Expected)</label>
                      <input
                        type="text"
                        id="bugExpectedInput"
                        placeholder="Contoh: Menampilkan hasil atau notifikasi kosong"
                        value="${this.escapeHtml(this.expectedBehavior)}"
                        class="create-input"
                        style="font-size: 11px;"
                      />
                    </div>
                    <div class="create-field-group">
                      <label style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Hasil Aktual (Actual Error)</label>
                      <input
                        type="text"
                        id="bugActualInput"
                        placeholder="Contoh: HTTP 500 Uncaught QueryException"
                        value="${this.escapeHtml(this.actualBehavior)}"
                        class="create-input"
                        style="font-size: 11px;"
                      />
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- 5. Checklist Subtasks Awal -->
              <div class="create-field-group">
                <div class="create-field-label">
                  <span>Checklist Subtask Awal (${this.initialSubtasks.length})</span>
                  <span style="font-size: 10px; color: #64748b; text-transform: none;">Opsional</span>
                </div>
                
                <div style="display: flex; gap: 8px;">
                  <input
                    type="text"
                    id="newSubtaskTitleInput"
                    placeholder="Tambah subtask: contoh 'Tulis unit test regression'..."
                    class="create-input"
                    style="font-size: 12px; padding: 7px 10px;"
                  />
                  <button type="button" id="addInitialSubtaskBtn" class="finance-btn-secondary" style="padding: 6px 12px; font-size: 11px; white-space: nowrap;">
                    + Tambah
                  </button>
                </div>

                ${this.initialSubtasks.length > 0 ? `
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                    ${this.initialSubtasks.map((st, idx) => `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">
                        <span style="color: #334155;"><strong>${idx + 1}.</strong> ${this.escapeHtml(st)}</span>
                        <button type="button" class="remove-subtask-item-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px;">
                          ${Icons.x('', 12)}
                        </button>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

            </div>

            <!-- Right Column: Metadata, Categorization & People (40%) -->
            <div class="create-issue-right">
              
              <!-- Target Proyek -->
              <div class="create-field-group">
                <label class="create-field-label">Proyek Target *</label>
                <select id="taskTargetProjectSelect" class="create-input" style="font-weight: 600;">
                  ${state.projects.map((p) => `
                    <option value="${p.id}" ${p.id === this.projectId ? 'selected' : ''}>
                      ${p.code} · ${p.name.length > 28 ? p.name.substring(0, 28) + '...' : p.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Prioritas Kartu -->
              <div class="create-field-group">
                <label class="create-field-label">Tingkat Prioritas</label>
                <div class="create-priority-grid">
                  ${priorityCards.map((p) => `
                    <div
                      class="create-priority-card ${this.priority === p.id ? `active ${p.activeClass}` : ''}"
                      data-priority="${p.id}"
                    >
                      <span class="p-dot ${p.dotClass}"></span>
                      <div>
                        <div style="font-size: 12px; font-weight: 700;">${p.label}</div>
                        <div style="font-size: 9.5px; opacity: 0.8;">${p.sub}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Tautkan ke Epik -->
              <div class="create-field-group">
                <label class="create-field-label">Tautkan ke Epik Modul</label>
                <select id="taskEpicSelect" class="create-input">
                  <option value="">-- (Tanpa Epik Khusus) --</option>
                  ${projectEpics.map((ep) => `
                    <option value="${ep.id}" ${ep.id === this.epicId ? 'selected' : ''}>
                      ${ep.title || ep.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Assignee (PIC Developer) -->
              <div class="create-field-group">
                <label class="create-field-label">Penanggung Jawab (Assignee PIC)</label>
                <select id="taskAssigneeSelect" class="create-input">
                  ${teamMembers.map((m) => `
                    <option value="${m.id}" ${m.id === this.assigneeId ? 'selected' : ''}>
                      ${m.name} (${m.role})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Estimasi (Jam) & Jatuh Tempo (Due Date) Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="create-field-group">
                  <label class="create-field-label">Estimasi Waktu</label>
                  <div style="position: relative;">
                    <input
                      type="number"
                      id="taskHoursInput"
                      min="1"
                      max="160"
                      value="${this.estimateHours}"
                      class="create-input"
                      style="font-family: var(--font-mono); font-weight: 700; padding-right: 32px;"
                    />
                    <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 700; color: #64748b;">
                      Jam
                    </span>
                  </div>
                </div>

                <div class="create-field-group">
                  <label class="create-field-label">Jatuh Tempo (Due)</label>
                  <input
                    type="date"
                    id="taskDueDateInput"
                    value="${this.dueDate}"
                    class="create-input"
                    style="font-family: var(--font-mono); font-size: 11.5px;"
                  />
                </div>
              </div>

              <!-- Visibilitas Tiket -->
              <div class="create-field-group">
                <label class="create-field-label">Visibilitas Akses</label>
                <select id="taskVisibilitySelect" class="create-input">
                  <option value="client_public" ${this.visibility === 'client_public' ? 'selected' : ''}>
                    🌐 Publik (Klien &amp; Service Desk)
                  </option>
                  <option value="internal" ${this.visibility === 'internal' ? 'selected' : ''}>
                    🔒 Internal Tim Saja (Confidential)
                  </option>
                </select>
              </div>

              <!-- Target Alur / Penempatan -->
              <div class="create-field-group">
                <label class="create-field-label">Penempatan Awal</label>
                <select id="taskSprintSelect" class="create-input">
                  <option value="sprint-1">Sprint 1: Fondasi Aktif (Papan Kanban)</option>
                  <option value="backlog">Backlog Pool (Perencanaan Nanti)</option>
                </select>
              </div>

            </div>

          </div>

          <!-- Modal Footer -->
          <div class="create-issue-footer">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; cursor: pointer; user-select: none;">
              <input type="checkbox" id="createAnotherCheck" ${this.createAnother ? 'checked' : ''} style="accent-color: #4338ca; width: 15px; height: 15px;" />
              <span>Buat tiket lain setelah ini</span>
            </label>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button
                type="button"
                id="createModalCancelBtn"
                class="finance-btn-secondary"
                style="padding: 7px 16px; font-size: 12px;"
              >
                Batal
              </button>

              <button
                type="submit"
                class="finance-btn-primary"
                style="padding: 7px 20px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;"
              >
                ${Icons.check('', 14)}
                <span>Buat Masalah</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    `;

    this.attachEvents();
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#createModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => store.closeCreateTaskModal());

    const cancelBtn = this.container.querySelector('#createModalCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => store.closeCreateTaskModal());

    // Type Selector Chips
    this.container.querySelectorAll('.create-type-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.type = chip.dataset.type;
        // Save form draft
        this.saveFormDraft();
        this.render();
      });
    });

    // Priority Cards
    this.container.querySelectorAll('.create-priority-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.priority = card.dataset.priority;
        this.container.querySelectorAll('.create-priority-card').forEach((c) => {
          c.classList.remove('active', 'p-hotfix', 'p-tinggi', 'p-sedang', 'p-rendah');
        });
        card.classList.add('active', `p-${this.priority.toLowerCase()}`);
      });
    });

    // Project change: update epics
    const projectSelect = this.container.querySelector('#taskTargetProjectSelect');
    if (projectSelect) {
      projectSelect.addEventListener('change', (e) => {
        this.projectId = e.target.value;
        this.epicId = '';
        this.saveFormDraft();
        this.render();
      });
    }

    // Markdown helpers
    this.container.querySelectorAll('.md-helper-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textarea = this.container.querySelector('#taskDescTextarea');
        if (!textarea) return;
        const tag = btn.dataset.tag;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end) || 'teks';

        let replacement = selected;
        if (tag === 'bold') replacement = `**${selected}**`;
        if (tag === 'italic') replacement = `*${selected}*`;
        if (tag === 'code') replacement = `\`${selected}\``;
        if (tag === 'list') replacement = `\n- ${selected}`;

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
      });
    });

    // Add initial subtask
    const addSubBtn = this.container.querySelector('#addInitialSubtaskBtn');
    const subInput = this.container.querySelector('#newSubtaskTitleInput');
    if (addSubBtn && subInput) {
      const handleAddSub = () => {
        const val = subInput.value.trim();
        if (val) {
          this.initialSubtasks.push(val);
          subInput.value = '';
          this.saveFormDraft();
          this.render();
        }
      };

      addSubBtn.addEventListener('click', handleAddSub);
      subInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddSub();
        }
      });
    }

    // Remove initial subtask
    this.container.querySelectorAll('.remove-subtask-item-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.dataset.index);
        this.initialSubtasks.splice(idx, 1);
        this.saveFormDraft();
        this.render();
      });
    });

    // Form submit
    const form = this.container.querySelector('#createTaskForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = this.container.querySelector('#taskTitleInput');
        const descInput = this.container.querySelector('#taskDescTextarea');
        const hoursInput = this.container.querySelector('#taskHoursInput');
        const dueDateInput = this.container.querySelector('#taskDueDateInput');
        const visSelect = this.container.querySelector('#taskVisibilitySelect');
        const assigneeSelect = this.container.querySelector('#taskAssigneeSelect');
        const epicSelect = this.container.querySelector('#taskEpicSelect');
        const createAnotherCheck = this.container.querySelector('#createAnotherCheck');

        const title = titleInput ? titleInput.value.trim() : '';
        if (!title) return;

        const description = descInput ? descInput.value.trim() : '';
        const estimateHours = hoursInput ? Number(hoursInput.value) || 4 : 4;
        const dueDate = dueDateInput ? dueDateInput.value : '';
        const visibility = visSelect ? visSelect.value : 'client_public';
        const assigneeId = assigneeSelect ? assigneeSelect.value : '';
        const epicId = epicSelect ? epicSelect.value : '';
        this.createAnother = createAnotherCheck ? createAnotherCheck.checked : false;

        // If bug, get bug fields
        let severity = undefined;
        let environment = undefined;
        let warrantyStatus = undefined;
        let reproductionSteps = undefined;
        let expectedBehavior = undefined;
        let actualBehavior = undefined;

        if (this.type === 'Bug') {
          const sevSelect = this.container.querySelector('#bugSeveritySelect');
          const envSelect = this.container.querySelector('#bugEnvSelect');
          const warSelect = this.container.querySelector('#bugWarrantySelect');
          const reproText = this.container.querySelector('#bugReproStepsTextarea');
          const expInput = this.container.querySelector('#bugExpectedInput');
          const actInput = this.container.querySelector('#bugActualInput');

          severity = sevSelect ? sevSelect.value : 'S2 - Major';
          environment = envSelect ? envSelect.value : 'Production';
          warrantyStatus = warSelect ? warSelect.value : 'Garansi Proyek (Gratis)';
          expectedBehavior = expInput ? expInput.value.trim() : undefined;
          actualBehavior = actInput ? actInput.value.trim() : undefined;

          if (reproText && reproText.value.trim()) {
            reproductionSteps = reproText.value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        const taskPriority = this.type === 'Bug'
          ? (severity === 'S1 - Critical (Blocker)' ? 'Hotfix' : severity === 'S2 - Major' ? 'Tinggi' : 'Sedang')
          : this.priority;

        // Format subtasks
        const subtasks = this.initialSubtasks.map((titleText, idx) => ({
          id: `sub-${Date.now()}-${idx}`,
          title: titleText,
          completed: false
        }));

        store.createTask({
          projectId: this.projectId,
          type: this.type,
          title,
          description,
          priority: taskPriority,
          severity,
          environment,
          warrantyStatus,
          reproductionSteps,
          expectedBehavior,
          actualBehavior,
          assigneeId,
          epicId: epicId || undefined,
          estimateHours,
          dueDate,
          visibility,
          source: 'Manual',
          status: this.type === 'Bug' ? 'Baru' : 'Backlog',
          subtasks: subtasks.length > 0 ? subtasks : undefined
        });

        // If create another is enabled, keep open with cleared fields
        if (this.createAnother) {
          this.title = '';
          this.description = '';
          this.initialSubtasks = [];
          this.reproStepsText = '';
          this.expectedBehavior = '';
          this.actualBehavior = '';
          this.render();
          const titleInputRef = this.container.querySelector('#taskTitleInput');
          if (titleInputRef) titleInputRef.focus();
        } else {
          this.title = '';
          this.description = '';
          this.initialSubtasks = [];
          this.reproStepsText = '';
          this.expectedBehavior = '';
          this.actualBehavior = '';
          store.closeCreateTaskModal();
        }
      });
    }
  }

  saveFormDraft() {
    const titleInput = this.container.querySelector('#taskTitleInput');
    const descInput = this.container.querySelector('#taskDescTextarea');
    const hoursInput = this.container.querySelector('#taskHoursInput');
    const dueDateInput = this.container.querySelector('#taskDueDateInput');
    const visSelect = this.container.querySelector('#taskVisibilitySelect');
    const assigneeSelect = this.container.querySelector('#taskAssigneeSelect');
    const epicSelect = this.container.querySelector('#taskEpicSelect');

    if (titleInput) this.title = titleInput.value;
    if (descInput) this.description = descInput.value;
    if (hoursInput) this.estimateHours = Number(hoursInput.value) || 4;
    if (dueDateInput) this.dueDate = dueDateInput.value;
    if (visSelect) this.visibility = visSelect.value;
    if (assigneeSelect) this.assigneeId = assigneeSelect.value;
    if (epicSelect) this.epicId = epicSelect.value;
  }

  getElement() {
    return this.container;
  }
}
