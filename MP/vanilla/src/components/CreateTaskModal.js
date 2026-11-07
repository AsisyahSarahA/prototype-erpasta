/**
 * CreateTaskModal Component (100% Native Vanilla JS ES Module)
 * ASTACODE PM — CREATE NEW ISSUE MODAL REDESIGN
 * 
 * Sesuai panduan UI/UX Redesign Brief (UI/UX_REDESIGN_BRIEF_CREATE_NEW_ISSUE_MODAL.MD):
 * 1. Layout & Proporsi 2 Kolom Enterprise SaaS (~62% Form Utama : ~38% Atribut & Penjadwalan).
 * 2. Header Ringkas & Contextual Metadata Proyek Aktif tanpa gradien berlebih.
 * 3. Klasifikasi Tipe Issue: Segmented Control Intuitif (Task Teknis, Fitur Baru, Bug/Error, Revisi CR, Maintenance).
 * 4. Form Utama: Judul Issue (fokus utama), Deskripsi & Acceptance Criteria (Markdown Toolbar), SOP Bug Triage kontekstual, dan Subtask Builder dengan Empty State informatif.
 * 5. Panel Atribut Terkelompokkan berdasarkan Konteks:
 *    - Proyek & Ownership (Target Proyek, PIC, Tautkan Epik).
 *    - Prioritas & Penjadwalan (4 Kartu Prioritas Semantik, Sprint, Tenggat Waktu).
 *    - Beban Kerja & Akses (Estimasi Jam, Visibilitas Akses).
 * 6. Sticky Footer: Opsi "Buat issue lain setelah ini", Tombol Batal, dan Tombol Utama "Buat Tiket" berhirarki tinggi.
 * 7. Nol AI Slop: Tanpa gradien dekoratif, tanpa glassmorphism, konsistensi ikon Lucide flat SVG.
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';
import { swalValidation, swalSuccess } from '../utils/swal.js';

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
        // Auto-focus pada input judul setelah modal terbuka
        setTimeout(() => {
          const titleInput = this.container.querySelector('#taskTitleInput');
          if (titleInput) titleInput.focus();
        }, 60);
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
        icon: Icons.checkSquare('', 14)
      },
      {
        id: 'Feature',
        label: 'Fitur Baru',
        icon: Icons.sparkles('', 14)
      },
      {
        id: 'Bug',
        label: 'Bug / Error',
        icon: Icons.bug('', 14)
      },
      {
        id: 'Revisi',
        label: 'Revisi (CR)',
        icon: Icons.rotateCcw('', 14)
      },
      {
        id: 'Maintenance',
        label: 'Maintenance',
        icon: Icons.wrench('', 14)
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
      <div class="modal-dialog modal-dialog--create" role="dialog" aria-modal="true" aria-labelledby="createIssueModalTitle">
        
        <!-- A. Modal Header Ringkas & Contextual Metadata -->
        <div class="create-issue-header">
          <div class="create-issue-title-group">
            <div class="create-issue-icon-box">
              ${Icons.listTodo('', 18)}
            </div>
            <div>
              <div class="create-issue-header-top">
                <h2 id="createIssueModalTitle" class="create-issue-title">Buat Issue Baru</h2>
                <span class="create-issue-project-badge">
                  <span class="meta-dot"></span>
                  <span>${projectCodePrefix} · ${this.escapeHtml(activeProject.name || 'Proyek Aktif')}</span>
                </span>
              </div>
              <p class="create-issue-subtitle">
                Distribusikan spesifikasi teknis, fitur, atau laporan bug ke sprint kerja dan backlog engineering.
              </p>
            </div>
          </div>

          <button type="button" id="createModalCloseBtn" class="modal-header__close-btn" title="Tutup (Esc)">
            ${Icons.x('', 16)}
          </button>
        </div>

        <!-- Form Body Container -->
        <form id="createTaskForm" class="create-issue-form" novalidate>
          
          <!-- B. Issue Classification (Segmented Control Berkontras Bersih) -->
          <div class="create-issue-type-bar">
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

          <!-- Main Scrollable Content Area -->
          <div class="create-issue-body">
            
            <!-- C. Main Form Area (~62% Proposional) -->
            <div class="create-issue-left">
              
              <!-- 1. Ringkasan / Judul Issue (Fokus Utama) -->
              <div class="create-field-group">
                <label class="create-field-label" for="taskTitleInput">
                  <span>JUDUL / RINGKASAN ISSUE <span class="req-star">*</span></span>
                  <span class="create-label-hint">Format ringkas: <code>[Modul] Deskripsi tugas</code></span>
                </label>
                <input
                  type="text"
                  id="taskTitleInput"
                  required
                  placeholder="Contoh: [Backend] Sinkronisasi stok multi-gudang dengan Redis distributed lock..."
                  value="${this.escapeHtml(this.title)}"
                  class="create-input create-input-title"
                />
                <span id="taskTitleError" class="create-field-error" style="display:none;"></span>
              </div>

              <!-- 2. Deskripsi & Acceptance Criteria (Minimal Functional Editor) -->
              <div class="create-field-group">
                <label class="create-field-label" for="taskDescTextarea">
                  <span>DESKRIPSI &amp; ACCEPTANCE CRITERIA</span>
                  <span class="create-label-hint">Mendukung format Markdown</span>
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
                    placeholder="Jelaskan kebutuhan fungsional, arsitektur data, endpoint API, serta kriteria penyelesaian (Acceptance Criteria)..."
                    class="create-editor-textarea"
                  >${this.escapeHtml(this.description)}</textarea>
                </div>
              </div>

              <!-- 3. Standar Bug Triage Software House (Tampil Otomatis jika Tipe = Bug) -->
              ${this.type === 'Bug' ? `
                <div class="create-bug-triage-box">
                  <div class="create-bug-triage-header">
                    <div class="create-bug-triage-title">
                      ${Icons.bug('', 14)}
                      <span>Standar Triage Bug (SOP QA &amp; Dev)</span>
                    </div>
                    <span class="create-bug-iso-badge">SLA Enforcement</span>
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
                      placeholder="1. Buka halaman katalog&#10;2. Masukkan parameter pencarian&#10;3. Amati response server HTTP 500..."
                      class="create-textarea"
                      style="font-family: var(--font-mono, monospace); font-size: 11.5px; min-height: 54px;"
                    >${this.escapeHtml(this.reproStepsText)}</textarea>
                  </div>

                  <!-- Expected vs Actual -->
                  <div class="create-grid-2">
                    <div class="create-field-group">
                      <label class="create-sub-label">Hasil Diharapkan (Expected)</label>
                      <input
                        type="text"
                        id="bugExpectedInput"
                        placeholder="Contoh: Menampilkan hasil pencarian valid"
                        value="${this.escapeHtml(this.expectedBehavior)}"
                        class="create-input create-input--sm"
                      />
                    </div>
                    <div class="create-field-group">
                      <label class="create-sub-label">Hasil Aktual (Actual Error)</label>
                      <input
                        type="text"
                        id="bugActualInput"
                        placeholder="Contoh: HTTP 500 Internal Server Error"
                        value="${this.escapeHtml(this.actualBehavior)}"
                        class="create-input create-input--sm"
                      />
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- 4. Checklist Subtask Awal (Dengan Empty State Bermakna) -->
              <div class="create-field-group">
                <div class="create-field-label">
                  <span>CHECKLIST SUBTASK AWAL (${this.initialSubtasks.length})</span>
                  <span class="create-label-hint">Pecah lingkup pekerjaan ke langkah-langkah terukur</span>
                </div>
                
                <div class="create-subtask-input-row">
                  <input
                    type="text"
                    id="newSubtaskTitleInput"
                    placeholder="Ketik rincian subtask lalu tekan Enter atau klik Tambah..."
                    class="create-input"
                  />
                  <button type="button" id="addInitialSubtaskBtn" class="create-subtask-add-btn">
                    ${Icons.plus('', 13)}
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
                ` : `
                  <div class="create-subtask-empty">
                    <span class="create-subtask-empty-icon">${Icons.listTodo('', 14)}</span>
                    <span>Belum ada subtask ditambahkan. Anda dapat membuat subtask sekarang atau menambahkannya nanti.</span>
                  </div>
                `}
              </div>

            </div>

            <!-- D. Attributes & Scheduling Panel (~38% Terkelompokkan Berdasarkan Konteks) -->
            <div class="create-issue-right">
              <div class="create-meta-panel">

                <!-- Grup 1: Project & Ownership -->
                <div class="create-meta-group">
                  <div class="create-meta-group-title">
                    <span>PROYEK &amp; OWNERSHIP</span>
                  </div>

                  <!-- Target Proyek -->
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

                  <!-- Penanggung Jawab (PIC Developer) -->
                  <div class="create-field-group">
                    <div class="create-field-label">
                      <span>PENANGGUNG JAWAB (PIC)</span>
                      <button type="button" id="assignToMeCreateBtn" class="create-inline-link">Tugaskan ke Saya</button>
                    </div>
                    <select id="taskAssigneeSelect" class="create-input">
                      ${teamMembers.map((m) => `
                        <option value="${m.id}" ${m.id === this.assigneeId ? 'selected' : ''}>
                          ${m.name} — ${m.role}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Tautkan ke Epik Modul -->
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
                </div>

                <!-- Grup 2: Priority & Scheduling -->
                <div class="create-meta-group">
                  <div class="create-meta-group-title">
                    <span>PRIORITAS &amp; PENJADWALAN</span>
                  </div>

                  <!-- Tingkat Prioritas (4 Kartu Semantik Bersih) -->
                  <div class="create-field-group">
                    <label class="create-field-label">
                      <span>TINGKAT PRIORITAS</span>
                    </label>
                    <div class="create-priority-grid">
                      ${priorityCards.map((p) => `
                        <div
                          class="create-priority-card ${this.priority === p.id ? `active ${p.activeClass}` : ''}"
                          data-priority="${p.id}"
                          role="button"
                          tabindex="0"
                        >
                          <span class="p-dot ${p.dotClass}"></span>
                          <span class="p-card-title">${p.label}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Penempatan Sprint & Tenggat Waktu -->
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
                      <label class="create-field-label" for="taskDueDateInput">
                        <span>TENGGAT WAKTU</span>
                      </label>
                      <input
                        type="date"
                        id="taskDueDateInput"
                        value="${this.dueDate}"
                        class="create-input create-input-mono"
                      />
                    </div>
                  </div>
                </div>

                <!-- Grup 3: Workload & Visibility -->
                <div class="create-meta-group">
                  <div class="create-meta-group-title">
                    <span>BEBAN KERJA &amp; AKSES</span>
                  </div>

                  <div class="create-grid-2">
                    <!-- Estimasi Beban (Jam) -->
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

                    <!-- Visibilitas Akses -->
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

          </div>

          <!-- E. Sticky Footer Selalu Terlihat -->
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
                <span>Buat Tiket</span>
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

    // Type Selector Chips (Segmented Controls)
    this.container.querySelectorAll('.create-type-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.type = chip.dataset.type;
        this.saveFormDraft();
        this.render();
      });
    });

    // Priority Cards
    this.container.querySelectorAll('.create-priority-card').forEach((card) => {
      const handleSelect = () => {
        this.priority = card.dataset.priority;
        this.container.querySelectorAll('.create-priority-card').forEach((c) => {
          c.classList.remove('active', 'p-hotfix', 'p-tinggi', 'p-sedang', 'p-rendah');
        });
        card.classList.add('active', `p-${this.priority.toLowerCase()}`);
      };

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });

    // Project change: update epics and maintain draft
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
          store.addToast('info', 'Penugasan Mandiri', 'Tiket ini dialokasikan ke Anda (Project Manager).');
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
        const newCursorPos = start + replacement.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    });

    // Add initial subtask
    const addSubBtn = this.container.querySelector('#addInitialSubtaskBtn');
    const subInput = this.container.querySelector('#newSubtaskTitleInput');
    if (addSubBtn && subInput) {
      const handleAddSub = () => {
        const val = subInput.value.trim();
        if (!val) {
          swalValidation('Subtask Kosong', 'Silakan ketik judul subtask sebelum menambahkan ke daftar.');
          return;
        }
        this.initialSubtasks.push(val);
        subInput.value = '';
        this.saveFormDraft();
        this.render();
        setTimeout(() => {
          const nextInput = this.container.querySelector('#newSubtaskTitleInput');
          if (nextInput) nextInput.focus();
        }, 30);
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
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        this.initialSubtasks.splice(idx, 1);
        this.saveFormDraft();
        this.render();
      });
    });

    // Form submit validation & dispatch
    const form = this.container.querySelector('#createTaskForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = this.container.querySelector('#taskTitleInput');
        const titleError = this.container.querySelector('#taskTitleError');
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
            titleInput.classList.add('create-input--error');
            titleInput.focus();
          }
          if (titleError) {
            titleError.textContent = 'Judul tiket wajib diisi.';
            titleError.style.display = 'block';
          }
          swalValidation('Judul Tiket Wajib Diisi', 'Silakan masukkan ringkasan atau judul tiket pekerjaan sebelum menyimpan.');
          return;
        }

        if (titleInput) titleInput.classList.remove('create-input--error');
        if (titleError) titleError.style.display = 'none';

        const description = descInput ? descInput.value.trim() : '';
        const rawHours = hoursInput ? Number(hoursInput.value) : 4;
        if (hoursInput && hoursInput.value !== '' && (isNaN(rawHours) || rawHours <= 0)) {
          swalValidation('Estimasi Jam Tidak Valid', 'Estimasi jam pengerjaan harus berupa angka lebih besar dari 0.');
          return;
        }
        const estimateHours = rawHours || 4;
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

        // Format initial subtasks
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
          status: 'Backlog',
          subtasks: subtasks.length > 0 ? subtasks : undefined
        });

        swalSuccess('Tiket Berhasil Dibuat', `Issue <b>${title}</b> telah didaftarkan ke status <b>Backlog</b>.`);

        // Mode Input Beruntun (Create Another)
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

    if (this.type === 'Bug') {
      const sevSelect = this.container.querySelector('#bugSeveritySelect');
      const envSelect = this.container.querySelector('#bugEnvSelect');
      const warSelect = this.container.querySelector('#bugWarrantySelect');
      const reproText = this.container.querySelector('#bugReproStepsTextarea');
      const expInput = this.container.querySelector('#bugExpectedInput');
      const actInput = this.container.querySelector('#bugActualInput');

      if (sevSelect) this.severity = sevSelect.value;
      if (envSelect) this.environment = envSelect.value;
      if (warSelect) this.warrantyStatus = warSelect.value;
      if (reproText) this.reproStepsText = reproText.value;
      if (expInput) this.expectedBehavior = expInput.value;
      if (actInput) this.actualBehavior = actInput.value;
    }
  }

  getElement() {
    return this.container;
  }
}
