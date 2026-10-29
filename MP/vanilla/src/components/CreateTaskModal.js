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
    const projectSprints = (state.sprints || []).filter((s) => s.projectId === this.projectId);
    const activeSprint = projectSprints.find((s) => s.status === 'active') || projectSprints[0];

    const issueTypes = [
      {
        id: 'Task',
        label: 'Task Teknis',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`
      },
      {
        id: 'Feature',
        label: 'Fitur Baru',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
      },
      {
        id: 'Bug',
        label: 'Bug / Error',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`
      },
      {
        id: 'Revisi',
        label: 'Revisi (CR)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`
      },
      {
        id: 'Maintenance',
        label: 'Maintenance',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
      }
    ];

    const priorityCards = [
      { id: 'Hotfix', label: 'Hotfix', sub: 'Kritis / Segera', dotClass: 'p-dot-hotfix', activeClass: 'p-hotfix' },
      { id: 'Tinggi', label: 'Tinggi', sub: 'Prioritas Utama', dotClass: 'p-dot-tinggi', activeClass: 'p-tinggi' },
      { id: 'Sedang', label: 'Sedang', sub: 'Standar Sprint', dotClass: 'p-dot-sedang', activeClass: 'p-sedang' },
      { id: 'Rendah', label: 'Rendah', sub: 'Backlog Minor', dotClass: 'p-dot-rendah', activeClass: 'p-rendah' }
    ];

    const projectCodePrefix = activeProject.code ? activeProject.code.split('-')[0] : 'PRJ';

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--create">
        
        <!-- Modal Header -->
        <div class="create-issue-header">
          <div class="create-issue-title-group">
            <div class="create-issue-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div>
              <div class="create-issue-header-top">
                <h2 class="create-issue-title">Buat Issue Baru</h2>
                <span class="create-issue-project-badge">
                  ${projectCodePrefix} · ${this.escapeHtml(activeProject.name || 'Proyek Aktif')}
                </span>
              </div>
              <p class="create-issue-subtitle">
                Distribusikan spesifikasi task, fitur, atau laporan bug ke sprint kerja dan backlog engineering.
              </p>
            </div>
          </div>

          <button type="button" id="createModalCloseBtn" class="modal-header__close-btn" title="Tutup (Esc)">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Form Body (Proportional 2-Column Software House Layout) -->
        <form id="createTaskForm" class="create-issue-form" novalidate>
          
          <!-- Top Full-Width Classification Bar -->
          <div class="create-issue-type-bar">
            <div class="create-field-label" style="margin-bottom: 8px;">
              <span>KLASIFIKASI TIPE ISSUE <span class="req-star">*</span></span>
              <span class="create-label-hint">Pilih kategori tiket untuk menyesuaikan workflow &amp; SLA</span>
            </div>
            <div class="create-type-chips">
              ${issueTypes.map((t) => `
                <button
                  type="button"
                  class="create-type-chip ${this.type === t.id ? `active type-${t.id.toLowerCase()}` : ''}"
                  data-type="${t.id}"
                >
                  <span class="chip-icon">${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="create-issue-body">
            
            <!-- Left Column: Primary Specification & Technical Context -->
            <div class="create-issue-left">
              
              <!-- 1. Ringkasan / Judul Pekerjaan -->
              <div class="create-field-group">
                <label class="create-field-label" for="taskTitleInput">
                  <span>RINGKASAN / JUDUL ISSUE <span class="req-star">*</span></span>
                  <span class="create-label-hint">Format: <code>[Modul] Judul pekerjaan</code></span>
                </label>
                <input
                  type="text"
                  id="taskTitleInput"
                  required
                  placeholder="Contoh: [Backend] Sinkronisasi stok multi-warehouse dengan Redis lock..."
                  value="${this.escapeHtml(this.title)}"
                  class="create-input create-input-title"
                />
              </div>

              <!-- 2. Deskripsi & Spesifikasi Teknis (Unified Editor Box) -->
              <div class="create-field-group">
                <label class="create-field-label" for="taskDescTextarea">
                  <span>DESKRIPSI &amp; ACCEPTANCE CRITERIA</span>
                  <span class="create-label-hint">Mendukung Markdown</span>
                </label>
                <div class="create-editor-box">
                  <div class="create-editor-toolbar">
                    <div class="editor-toolbar-left">
                      <button type="button" class="md-helper-btn" data-tag="bold" title="Tebal (Bold)"><strong>B</strong></button>
                      <button type="button" class="md-helper-btn" data-tag="italic" title="Miring (Italic)"><em>I</em></button>
                      <button type="button" class="md-helper-btn" data-tag="code" title="Potongan Kode">&lt;/&gt;</button>
                      <button type="button" class="md-helper-btn" data-tag="list" title="Daftar Poin">• List</button>
                    </div>
                    <span class="editor-toolbar-tag">Spesifikasi Teknis &amp; DoD</span>
                  </div>
                  <textarea
                    id="taskDescTextarea"
                    rows="5"
                    placeholder="Jelaskan kebutuhan fungsional, arsitektur data, endpoint API, serta kriteria penerimaan (Acceptance Criteria)..."
                    class="create-editor-textarea"
                  >${this.escapeHtml(this.description)}</textarea>
                </div>
              </div>

              <!-- 3. Standar Tiket Bug Software House (Tampil Otomatis saat Tipe = Bug) -->
              ${this.type === 'Bug' ? `
                <div class="create-bug-triage-box">
                  <div class="create-bug-triage-header">
                    <div class="create-bug-triage-title">
                      <i class="fi fi-rr-bug"></i>
                      <span>Standar Triage Bug Software House (SOP QA &amp; Dev)</span>
                    </div>
                    <span class="create-bug-iso-badge">ISO QA Ready</span>
                  </div>

                  <!-- Severity, Env, Warranty in 3 Columns -->
                  <div class="create-grid-3">
                    <div class="create-field-group">
                      <label class="create-sub-label">Keparahan (Severity) *</label>
                      <select id="bugSeveritySelect" class="create-input create-input--sm">
                        <option value="S1 - Critical (Blocker)" ${this.severity === 'S1 - Critical (Blocker)' ? 'selected' : ''}>S1 - Critical (SLA &lt; 4J)</option>
                        <option value="S2 - Major" ${this.severity === 'S2 - Major' ? 'selected' : ''}>S2 - Major (SLA 24J)</option>
                        <option value="S3 - Minor" ${this.severity === 'S3 - Minor' ? 'selected' : ''}>S3 - Minor (SLA 3H)</option>
                        <option value="S4 - Trivial" ${this.severity === 'S4 - Trivial' ? 'selected' : ''}>S4 - Trivial (UI/Typo)</option>
                      </select>
                    </div>

                    <div class="create-field-group">
                      <label class="create-sub-label">Environment *</label>
                      <select id="bugEnvSelect" class="create-input create-input--sm">
                        <option value="Production" ${this.environment === 'Production' ? 'selected' : ''}>Production (Live)</option>
                        <option value="Staging" ${this.environment === 'Staging' ? 'selected' : ''}>Staging (Pre-Release)</option>
                        <option value="QA / Testing" ${this.environment === 'QA / Testing' ? 'selected' : ''}>QA / Testing Lab</option>
                        <option value="Development" ${this.environment === 'Development' ? 'selected' : ''}>Development Local</option>
                      </select>
                    </div>

                    <div class="create-field-group">
                      <label class="create-sub-label">Status Garansi *</label>
                      <select id="bugWarrantySelect" class="create-input create-input--sm">
                        <option value="Garansi Proyek (Gratis)" ${this.warrantyStatus === 'Garansi Proyek (Gratis)' ? 'selected' : ''}>Garansi Proyek (Gratis)</option>
                        <option value="Kuota Maintenance" ${this.warrantyStatus === 'Kuota Maintenance' ? 'selected' : ''}>Potong Kuota Retainer</option>
                        <option value="Non-Garansi (Billable)" ${this.warrantyStatus === 'Non-Garansi (Billable)' ? 'selected' : ''}>Non-Garansi (Billable)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Reproduction Steps -->
                  <div class="create-field-group">
                    <label class="create-sub-label">Langkah Reproduksi (Steps to Reproduce)</label>
                    <textarea
                      id="bugReproStepsTextarea"
                      rows="2"
                      placeholder="1. Buka halaman katalog&#10;2. Input parameter pencarian&#10;3. Amati response HTTP 500..."
                      class="create-textarea"
                      style="font-family: var(--font-mono); font-size: 11.5px; min-height: 54px;"
                    >${this.escapeHtml(this.reproStepsText)}</textarea>
                  </div>

                  <!-- Expected vs Actual -->
                  <div class="create-grid-2">
                    <div class="create-field-group">
                      <label class="create-sub-label">Hasil Diharapkan (Expected)</label>
                      <input
                        type="text"
                        id="bugExpectedInput"
                        placeholder="Menampilkan daftar atau state kosong"
                        value="${this.escapeHtml(this.expectedBehavior)}"
                        class="create-input create-input--sm"
                      />
                    </div>
                    <div class="create-field-group">
                      <label class="create-sub-label">Hasil Aktual (Actual Error)</label>
                      <input
                        type="text"
                        id="bugActualInput"
                        placeholder="Contoh: HTTP 500 QueryException"
                        value="${this.escapeHtml(this.actualBehavior)}"
                        class="create-input create-input--sm"
                      />
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- 4. Checklist Subtasks Awal -->
              <div class="create-field-group">
                <div class="create-field-label">
                  <span>CHECKLIST SUBTASK AWAL (${this.initialSubtasks.length})</span>
                  <span class="create-label-hint">Opsional · Breakdown langkah kerja</span>
                </div>
                
                <div class="create-subtask-input-row">
                  <input
                    type="text"
                    id="newSubtaskTitleInput"
                    placeholder="Ketik rincian subtask (misal: Buat unit test & dokumentasi Swagger)..."
                    class="create-input"
                  />
                  <button type="button" id="addInitialSubtaskBtn" class="create-subtask-add-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Tambah</span>
                  </button>
                </div>

                ${this.initialSubtasks.length > 0 ? `
                  <div class="create-subtask-list">
                    ${this.initialSubtasks.map((st, idx) => `
                      <div class="create-subtask-item">
                        <span class="create-subtask-item-text">
                          <span class="subtask-num">${idx + 1}.</span>
                          ${this.escapeHtml(st)}
                        </span>
                        <button type="button" class="remove-subtask-item-btn" data-index="${idx}" title="Hapus subtask">
                          ${Icons.x('', 12)}
                        </button>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

            </div>

            <!-- Right Column: Metadata, Categorization & People -->
            <div class="create-issue-right">
              <div class="create-meta-panel">
                <div class="create-meta-panel-header">
                  <span>ATRIBUT &amp; PENJADWALAN</span>
                  <span class="meta-badge">Routing</span>
                </div>

                <!-- Target Proyek & Epik -->
                <div class="create-field-group">
                  <label class="create-field-label" for="taskTargetProjectSelect">
                    <span>PROYEK TARGET <span class="req-star">*</span></span>
                  </label>
                  <select id="taskTargetProjectSelect" class="create-input create-select-bold">
                    ${state.projects.map((p) => `
                      <option value="${p.id}" ${p.id === this.projectId ? 'selected' : ''}>
                        ${p.code} — ${p.name}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Prioritas Kartu -->
                <div class="create-field-group">
                  <label class="create-field-label">
                    <span>TINGKAT PRIORITAS</span>
                  </label>
                  <div class="create-priority-grid">
                    ${priorityCards.map((p) => `
                      <div
                        class="create-priority-card ${this.priority === p.id ? `active ${p.activeClass}` : ''}"
                        data-priority="${p.id}"
                      >
                        <span class="p-dot ${p.dotClass}"></span>
                        <div class="p-card-text">
                          <div class="p-card-title">${p.label}</div>
                          <div class="p-card-sub">${p.sub}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Assignee (PIC Developer) -->
                <div class="create-field-group">
                  <div class="create-field-label">
                    <span>PENANGGUNG JAWAB (PIC)</span>
                    <button type="button" id="assignToMeCreateBtn" class="create-inline-link">Assign ke Saya</button>
                  </div>
                  <select id="taskAssigneeSelect" class="create-input">
                    ${teamMembers.map((m) => `
                      <option value="${m.id}" ${m.id === this.assigneeId ? 'selected' : ''}>
                        ${m.name} — ${m.role}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Tautkan ke Epik -->
                <div class="create-field-group">
                  <label class="create-field-label" for="taskEpicSelect">
                    <span>TAUTKAN KE EPIK MODUL</span>
                  </label>
                  <select id="taskEpicSelect" class="create-input">
                    <option value="">— Tanpa Epik Khusus —</option>
                    ${projectEpics.map((ep) => `
                      <option value="${ep.id}" ${ep.id === this.epicId ? 'selected' : ''}>
                        ${ep.title || ep.name}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Estimasi (Jam) & Jatuh Tempo (Due Date) Grid -->
                <div class="create-grid-2">
                  <div class="create-field-group">
                    <label class="create-field-label" for="taskHoursInput">
                      <span>ESTIMASI BEBAN</span>
                    </label>
                    <div class="create-input-suffix-wrap">
                      <input
                        type="number"
                        id="taskHoursInput"
                        min="1"
                        max="160"
                        value="${this.estimateHours}"
                        class="create-input create-input-mono"
                      />
                      <span class="create-input-suffix">Jam</span>
                    </div>
                  </div>

                  <div class="create-field-group">
                    <label class="create-field-label" for="taskDueDateInput">
                      <span>TENGGAT (DUE)</span>
                    </label>
                    <input
                      type="date"
                      id="taskDueDateInput"
                      value="${this.dueDate}"
                      class="create-input create-input-mono"
                    />
                  </div>
                </div>

                <!-- Penempatan & Visibilitas Grid -->
                <div class="create-grid-2">
                  <div class="create-field-group">
                    <label class="create-field-label" for="taskSprintSelect">
                      <span>PENEMPATAN</span>
                    </label>
                    <select id="taskSprintSelect" class="create-input">
                      <option value="${activeSprint ? activeSprint.id : 'sprint-1'}">${activeSprint ? activeSprint.name : 'Sprint Aktif'} (Kanban)</option>
                      <option value="backlog">Backlog Pool</option>
                    </select>
                  </div>

                  <div class="create-field-group">
                    <label class="create-field-label" for="taskVisibilitySelect">
                      <span>VISIBILITAS</span>
                    </label>
                    <select id="taskVisibilitySelect" class="create-input">
                      <option value="client_public" ${this.visibility === 'client_public' ? 'selected' : ''}>
                        Publik &amp; Klien
                      </option>
                      <option value="internal" ${this.visibility === 'internal' ? 'selected' : ''}>
                        Internal Tim
                      </option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="create-issue-footer">
            <label class="create-another-toggle">
              <input type="checkbox" id="createAnotherCheck" ${this.createAnother ? 'checked' : ''} />
              <span>Buat issue lain setelah ini</span>
              <span class="create-another-hint">Mode input beruntun</span>
            </label>

            <div class="create-footer-actions">
              <button
                type="button"
                id="createModalCancelBtn"
                class="create-btn-cancel"
              >
                Batal
              </button>

              <button
                type="submit"
                class="create-btn-submit"
              >
                ${Icons.check('', 15)}
                <span>Buat Issue</span>
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

    // Assign to me button
    const assignToMeBtn = this.container.querySelector('#assignToMeCreateBtn');
    if (assignToMeBtn) {
      assignToMeBtn.addEventListener('click', () => {
        const assigneeSelect = this.container.querySelector('#taskAssigneeSelect');
        if (assigneeSelect) {
          assigneeSelect.value = 'user-pm';
          this.assigneeId = 'user-pm';
        }
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
        if (!title) {
          if (titleInput) {
            titleInput.style.borderColor = '#ef4444';
            titleInput.focus();
          }
          store.addToast('warning', 'Judul Wajib Diisi', 'Silakan masukkan ringkasan atau judul tiket pekerjaan.');
          return;
        }
        if (titleInput) {
          titleInput.style.borderColor = '';
        }

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
