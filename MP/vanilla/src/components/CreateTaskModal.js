/**
 * CreateTaskModal Component (100% Native Vanilla JS ES Module)
 * ASTACODE PM — CREATE NEW ISSUE MODAL (ATLASSIAN JIRA CLOUD STANDARD)
 * 
 * Standar Otentik Jira Cloud & Enterprise Software House:
 * 1. Layout Single-Column Linear Terfokus (max-width: 760px) — Tidak memecah form ke 2 kolom yang melelahkan pandangan.
 * 2. Alur Pengisian Top-to-Bottom Alami (Mental Model Jira):
 *    - Header: Judul "Buat Issue" + Penanda kolom wajib + Tombol Tutup (X).
 *    - Proyek Target (Dropdown dengan ikon proyek).
 *    - Tipe Issue (5 Kategori resmi dengan ikon & warna Atlassian Jira).
 *    - Status Alur Transparan: Backlog (Titik Awal sesuai Strict Forward-Only).
 *    - Ringkasan / Judul Issue (Auto-focus, visual hierarchy tinggi).
 *    - Deskripsi & Acceptance Criteria (Markdown Toolbar + Spesifikasi & DoD).
 *    - Bug Triage Protocol (Kondisional otomatis jika tipe = Bug: Severity, Env, Garansi, Repro Steps, Expected vs Actual).
 *    - Atribut Rapi Seimbang (Grid 2 Kolom: PIC + Tugaskan ke Saya, Prioritas 4 Segmen, Sprint, Epik, Tenggat Waktu, Estimasi Jam, Visibilitas).
 *    - Checklist Subtask Awal dengan empty state compact.
 * 3. Sticky Footer Jira Standard:
 *    - Checkbox "Buat issue lain setelah ini" (Mode cepat input beruntun).
 *    - Tombol Batal & Tombol Utama "Buat" (Atlassian Blue).
 * 4. Kompatibilitas 100% dengan seluruh ID, selector, dan event handler JavaScript existing.
 * 5. Validasi Dialog Elegan & Konsisten dengan SweetAlert2 CDN.
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
        icon: Icons.checkSquare('', 14),
        badgeClass: 'jira-type-task'
      },
      {
        id: 'Feature',
        label: 'Fitur Baru',
        icon: Icons.sparkles('', 14),
        badgeClass: 'jira-type-feature'
      },
      {
        id: 'Bug',
        label: 'Bug / Error',
        icon: Icons.bug('', 14),
        badgeClass: 'jira-type-bug'
      },
      {
        id: 'Revisi',
        label: 'Revisi (CR)',
        icon: Icons.rotateCcw('', 14),
        badgeClass: 'jira-type-revisi'
      },
      {
        id: 'Maintenance',
        label: 'Maintenance',
        icon: Icons.wrench('', 14),
        badgeClass: 'jira-type-maintenance'
      }
    ];

    const priorityList = [
      { id: 'Hotfix', label: 'Hotfix', sub: 'Kritis / Blocker', dotClass: 'p-dot-hotfix', activeClass: 'p-hotfix' },
      { id: 'Tinggi', label: 'Tinggi', sub: 'Prioritas Utama', dotClass: 'p-dot-tinggi', activeClass: 'p-tinggi' },
      { id: 'Sedang', label: 'Sedang', sub: 'Standar Sprint', dotClass: 'p-dot-sedang', activeClass: 'p-sedang' },
      { id: 'Rendah', label: 'Rendah', sub: 'Minor Backlog', dotClass: 'p-dot-rendah', activeClass: 'p-rendah' }
    ];

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--jira" role="dialog" aria-modal="true" aria-labelledby="createIssueModalTitle">
        
        <!-- ====================================================================
             HEADER MODAL (JIRA CLOUD STANDARD)
             ==================================================================== -->
        <div class="jira-modal-header">
          <div class="jira-modal-header-left">
            <h2 id="createIssueModalTitle" class="jira-modal-title">Buat Issue</h2>
            <span class="jira-required-hint"><span class="req-star">*</span> Kolom wajib diisi</span>
          </div>
          <button type="button" id="createModalCloseBtn" class="jira-modal-close-btn" title="Tutup modal (Esc)" aria-label="Tutup">
            ${Icons.x('', 16)}
          </button>
        </div>

        <!-- ====================================================================
             FORM BODY (SINGLE-COLUMN VERTICAL NATURAL FLOW)
             ==================================================================== -->
        <form id="createTaskForm" class="jira-modal-form" novalidate>
          <div class="jira-modal-body">
            
            <!-- 1. Proyek Target -->
            <div class="jira-form-row">
              <label class="jira-label" for="taskTargetProjectSelect">
                Proyek <span class="req-star">*</span>
              </label>
              <div class="jira-select-wrap">
                <span class="jira-select-icon">${Icons.folder ? Icons.folder('', 15) : Icons.briefcase('', 15)}</span>
                <select id="taskTargetProjectSelect" class="jira-select jira-select--with-icon">
                  ${state.projects.map((p) => `
                    <option value="${p.id}" ${p.id === this.projectId ? 'selected' : ''}>
                      [${p.code}] ${p.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- 2. Tipe Issue (Jira Segmented Issue Type Chips) -->
            <div class="jira-form-row">
              <label class="jira-label">
                Tipe Issue <span class="req-star">*</span>
              </label>
              <div class="jira-type-selector">
                ${issueTypes.map((t) => `
                  <button
                    type="button"
                    class="create-type-chip jira-type-btn ${this.type === t.id ? `active ${t.badgeClass}` : ''}"
                    data-type="${t.id}"
                    title="${t.label}"
                  >
                    <span class="chip-icon">${t.icon}</span>
                    <span class="chip-text">${t.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="jira-divider"></div>

            <!-- 3. Status Alur Transparan (Strict Forward-Only Indicator) -->
            <div class="jira-form-row">
              <label class="jira-label">Status Awal</label>
              <div class="jira-status-display">
                <span class="jira-status-badge">
                  <span class="status-dot"></span>
                  <span>Backlog</span>
                </span>
                <span class="jira-status-desc">🔒 Tiket baru otomatis masuk ke Backlog untuk dianalisis (Strict Forward-Only).</span>
              </div>
            </div>

            <!-- 4. Ringkasan / Judul Issue (Fokus Utama) -->
            <div class="jira-form-row">
              <div class="jira-label-row">
                <label class="jira-label" for="taskTitleInput">
                  Ringkasan Issue <span class="req-star">*</span>
                </label>
                <span class="jira-hint">Format ringkas: <code>[Modul] Deskripsi pekerjaan</code></span>
              </div>
              <input
                type="text"
                id="taskTitleInput"
                required
                placeholder="Contoh: [Backend] Sinkronisasi stok multi-gudang dengan Redis distributed lock..."
                value="${this.escapeHtml(this.title)}"
                class="jira-input jira-input-summary"
                autocomplete="off"
              />
              <span id="taskTitleError" class="jira-field-error" style="display:none;"></span>
            </div>

            <!-- 5. Deskripsi & Acceptance Criteria (Markdown Toolbar) -->
            <div class="jira-form-row">
              <div class="jira-label-row">
                <label class="jira-label" for="taskDescTextarea">
                  Deskripsi &amp; Acceptance Criteria
                </label>
                <span class="jira-hint">Mendukung format Markdown &amp; DoD</span>
              </div>
              <div class="jira-editor">
                <div class="jira-editor-toolbar">
                  <div class="jira-toolbar-actions">
                    <button type="button" class="md-helper-btn" data-tag="bold" title="Tebal (Bold)"><strong>B</strong></button>
                    <button type="button" class="md-helper-btn" data-tag="italic" title="Miring (Italic)"><em>I</em></button>
                    <button type="button" class="md-helper-btn" data-tag="code" title="Potongan Kode (Inline Code)">&lt;/&gt;</button>
                    <button type="button" class="md-helper-btn" data-tag="list" title="Daftar Poin (List)">• List</button>
                  </div>
                  <span class="jira-toolbar-badge">Spesifikasi Teknis &amp; DoD</span>
                </div>
                <textarea
                  id="taskDescTextarea"
                  rows="5"
                  placeholder="Jelaskan kebutuhan fungsional, arsitektur data, endpoint API, serta kriteria penyelesaian (Definition of Done / DoD)..."
                  class="jira-textarea"
                >${this.escapeHtml(this.description)}</textarea>
              </div>
            </div>

            <!-- 6. Standar Triage Bug (Tampil Khusus saat Tipe = Bug) -->
            ${this.type === 'Bug' ? `
              <div class="jira-bug-section">
                <div class="jira-bug-header">
                  <div class="jira-bug-title">
                    ${Icons.bug('', 15)}
                    <span>Standar Triage Bug (SOP QA &amp; Dev)</span>
                  </div>
                  <span class="jira-bug-iso-badge">SLA Enforcement</span>
                </div>

                <div class="jira-grid-3">
                  <div class="jira-form-row">
                    <label class="jira-sub-label" for="bugSeveritySelect">Keparahan (Severity) *</label>
                    <select id="bugSeveritySelect" class="jira-select jira-select--sm">
                      <option value="S1 - Critical (Blocker)" ${this.severity === 'S1 - Critical (Blocker)' ? 'selected' : ''}>S1 - Critical (SLA &lt; 4 Jam)</option>
                      <option value="S2 - Major" ${this.severity === 'S2 - Major' ? 'selected' : ''}>S2 - Major (SLA 24 Jam)</option>
                      <option value="S3 - Minor" ${this.severity === 'S3 - Minor' ? 'selected' : ''}>S3 - Minor (SLA 3 Hari)</option>
                      <option value="S4 - Trivial" ${this.severity === 'S4 - Trivial' ? 'selected' : ''}>S4 - Trivial (UI/Typo)</option>
                    </select>
                  </div>

                  <div class="jira-form-row">
                    <label class="jira-sub-label" for="bugEnvSelect">Environment *</label>
                    <select id="bugEnvSelect" class="jira-select jira-select--sm">
                      <option value="Production" ${this.environment === 'Production' ? 'selected' : ''}>Production (Live Server)</option>
                      <option value="Staging" ${this.environment === 'Staging' ? 'selected' : ''}>Staging (Pre-Release)</option>
                      <option value="QA / Testing" ${this.environment === 'QA / Testing' ? 'selected' : ''}>QA / Testing Lab</option>
                      <option value="Development" ${this.environment === 'Development' ? 'selected' : ''}>Development Local</option>
                    </select>
                  </div>

                  <div class="jira-form-row">
                    <label class="jira-sub-label" for="bugWarrantySelect">Status Garansi *</label>
                    <select id="bugWarrantySelect" class="jira-select jira-select--sm">
                      <option value="Garansi Proyek (Gratis)" ${this.warrantyStatus === 'Garansi Proyek (Gratis)' ? 'selected' : ''}>Garansi Proyek (Gratis)</option>
                      <option value="Kuota Maintenance" ${this.warrantyStatus === 'Kuota Maintenance' ? 'selected' : ''}>Potong Retainer</option>
                      <option value="Non-Garansi (Billable)" ${this.warrantyStatus === 'Non-Garansi (Billable)' ? 'selected' : ''}>Non-Garansi (Billable)</option>
                    </select>
                  </div>
                </div>

                <div class="jira-form-row">
                  <label class="jira-sub-label" for="bugReproStepsTextarea">Langkah Reproduksi (Steps to Reproduce)</label>
                  <textarea
                    id="bugReproStepsTextarea"
                    rows="2"
                    placeholder="1. Buka modul pendaftaran&#10;2. Masukkan parameter...&#10;3. Amati error HTTP 500..."
                    class="jira-textarea jira-textarea-mono"
                  >${this.escapeHtml(this.reproStepsText)}</textarea>
                </div>

                <div class="jira-grid-2">
                  <div class="jira-form-row">
                    <label class="jira-sub-label" for="bugExpectedInput">Hasil Diharapkan (Expected)</label>
                    <input
                      type="text"
                      id="bugExpectedInput"
                      placeholder="Contoh: Transaksi berhasil disimpan"
                      value="${this.escapeHtml(this.expectedBehavior)}"
                      class="jira-input jira-input--sm"
                    />
                  </div>
                  <div class="jira-form-row">
                    <label class="jira-sub-label" for="bugActualInput">Hasil Aktual (Actual Error)</label>
                    <input
                      type="text"
                      id="bugActualInput"
                      placeholder="Contoh: HTTP 500 Internal Server Error"
                      value="${this.escapeHtml(this.actualBehavior)}"
                      class="jira-input jira-input--sm"
                    />
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- 7. Atribut & Penjadwalan (Grid 2 Kolom Seimbang) -->
            <div class="jira-attributes-grid">
              
              <!-- Penanggung Jawab (PIC) -->
              <div class="jira-form-row">
                <div class="jira-label-row">
                  <label class="jira-label" for="taskAssigneeSelect">Penanggung Jawab (PIC)</label>
                  <button type="button" id="assignToMeCreateBtn" class="jira-text-action">Tugaskan ke Saya</button>
                </div>
                <div class="jira-select-wrap">
                  <span class="jira-select-icon">${Icons.user ? Icons.user('', 14) : ''}</span>
                  <select id="taskAssigneeSelect" class="jira-select jira-select--with-icon">
                    ${teamMembers.map((m) => `
                      <option value="${m.id}" ${m.id === this.assigneeId ? 'selected' : ''}>
                        ${m.name} (${m.role})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <!-- Tingkat Prioritas (4 Segmen Semantik) -->
              <div class="jira-form-row">
                <label class="jira-label">Prioritas</label>
                <div class="jira-priority-pills">
                  ${priorityList.map((p) => `
                    <button
                      type="button"
                      class="create-priority-card create-priority-segment jira-p-pill ${this.priority === p.id ? `active ${p.activeClass}` : ''}"
                      data-priority="${p.id}"
                      title="${p.sub}"
                    >
                      <span class="p-dot ${p.dotClass}"></span>
                      <span class="p-card-title">${p.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Penempatan Sprint -->
              <div class="jira-form-row">
                <label class="jira-label" for="taskSprintSelect">Penempatan Sprint</label>
                <select id="taskSprintSelect" class="jira-select">
                  ${projectSprints.map((s) => {
                    const shortName = s.name.split(':')[0].trim();
                    const statusTag = s.status === 'active' ? 'Aktif' : 'Rencana';
                    return `
                      <option value="${s.id}" ${s.status === 'active' ? 'selected' : ''} title="${s.name}">
                        ${shortName} (${statusTag})
                      </option>
                    `;
                  }).join('')}
                  <option value="backlog" ${projectSprints.length === 0 ? 'selected' : ''}>Backlog Pool (Tanpa Sprint)</option>
                </select>
              </div>

              <!-- Tautkan ke Epik Modul -->
              <div class="jira-form-row">
                <label class="jira-label" for="taskEpicSelect">Epik Modul</label>
                <select id="taskEpicSelect" class="jira-select">
                  <option value="">— Tanpa Epik Khusus —</option>
                  ${projectEpics.map((ep) => {
                    const fullTitle = ep.title || ep.name || '';
                    const shortTitle = fullTitle.length > 36 ? fullTitle.substring(0, 34) + '...' : fullTitle;
                    return `
                      <option value="${ep.id}" ${ep.id === this.epicId ? 'selected' : ''} title="${fullTitle}">
                        ${ep.key ? `[${ep.key}] ` : ''}${shortTitle}
                      </option>
                    `;
                  }).join('')}
                </select>
              </div>

              <!-- Tenggat Waktu (Due Date) -->
              <div class="jira-form-row">
                <label class="jira-label" for="taskDueDateInput">Tenggat Waktu</label>
                <input
                  type="date"
                  id="taskDueDateInput"
                  value="${this.dueDate}"
                  class="jira-input jira-input-mono"
                />
              </div>

              <!-- Estimasi Beban (Jam) -->
              <div class="jira-form-row">
                <label class="jira-label" for="taskHoursInput">Estimasi Jam</label>
                <div class="jira-input-suffix-wrap">
                  <input
                    type="number"
                    id="taskHoursInput"
                    min="1"
                    max="160"
                    value="${this.estimateHours}"
                    class="jira-input jira-input-mono"
                  />
                  <span class="jira-input-suffix">Jam</span>
                </div>
              </div>

            </div>

            <!-- 8. Visibilitas Akses -->
            <div class="jira-form-row">
              <label class="jira-label" for="taskVisibilitySelect">Visibilitas Akses</label>
              <select id="taskVisibilitySelect" class="jira-select">
                <option value="client_public" ${this.visibility === 'client_public' ? 'selected' : ''}>
                  Publik &amp; Klien (Terlihat di Portal Klien)
                </option>
                <option value="internal" ${this.visibility === 'internal' ? 'selected' : ''}>
                  Internal Tim Saja
                </option>
              </select>
            </div>

            <!-- 9. Checklist Subtask Awal -->
            <div class="jira-form-row">
              <div class="jira-label-row">
                <label class="jira-label">
                  Checklist Subtask (${this.initialSubtasks.length})
                </label>
                <span class="jira-hint">Langkah-langkah terukur pengerjaan tugas</span>
              </div>
              
              <div class="jira-subtask-input-bar">
                <input
                  type="text"
                  id="newSubtaskTitleInput"
                  placeholder="Ketik rincian subtask lalu tekan Enter atau klik Tambah..."
                  class="jira-input"
                />
                <button type="button" id="addInitialSubtaskBtn" class="jira-btn-add-subtask">
                  ${Icons.plus('', 13)}
                  <span>Tambah</span>
                </button>
              </div>

              ${this.initialSubtasks.length > 0 ? `
                <div class="jira-subtask-list">
                  ${this.initialSubtasks.map((st, idx) => `
                    <div class="jira-subtask-item">
                      <div class="jira-subtask-item-left">
                        <span class="subtask-num">${idx + 1}.</span>
                        <span class="subtask-title">${this.escapeHtml(st)}</span>
                      </div>
                      <button type="button" class="remove-subtask-item-btn jira-subtask-del" data-index="${idx}" title="Hapus subtask">
                        ${Icons.x('', 12)}
                      </button>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="jira-subtask-empty">
                  <span class="jira-subtask-empty-icon">${Icons.listTodo('', 14)}</span>
                  <span>Belum ada subtask. Anda dapat menambahkan subtask sekarang atau nanti langsung di papan kanban.</span>
                </div>
              `}
            </div>

          </div>

          <!-- ====================================================================
               STICKY FOOTER (ATLASSIAN JIRA STANDARD)
               ==================================================================== -->
          <div class="jira-modal-footer">
            <label class="jira-create-another">
              <input type="checkbox" id="createAnotherCheck" ${this.createAnother ? 'checked' : ''} />
              <span class="create-another-text">Buat issue lain setelah ini</span>
            </label>

            <div class="jira-footer-actions">
              <button
                type="button"
                id="createModalCancelBtn"
                class="jira-btn-cancel"
              >
                Batal
              </button>

              <button
                type="submit"
                id="createIssueSubmitBtn"
                class="jira-btn-create"
              >
                ${Icons.check('', 15)}
                <span>Buat</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    `;

    this.attachEvents();
  }

  escapeHtml(text = '') {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
        this.saveFormDraft();
        this.render();
      });
    });

    // Priority Segments
    this.container.querySelectorAll('.create-priority-card, .create-priority-segment').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.priority = btn.dataset.priority;
        this.container.querySelectorAll('.create-priority-card, .create-priority-segment').forEach((b) => {
          b.classList.remove('active', 'p-hotfix', 'p-tinggi', 'p-sedang', 'p-rendah');
        });
        btn.classList.add('active', `p-${this.priority.toLowerCase()}`);
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
          swalSuccess('Ditugaskan ke Anda', 'Tiket ini dialokasikan ke Anda sebagai Penanggung Jawab (PIC).');
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
          swalValidation('Subtask Kosong', 'Silakan ketik rincian subtask sebelum menambahkan ke daftar.');
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
        const sprintSelect = this.container.querySelector('#taskSprintSelect');
        const createAnotherCheck = this.container.querySelector('#createAnotherCheck');

        const title = titleInput ? titleInput.value.trim() : '';
        if (!title) {
          if (titleInput) {
            titleInput.classList.add('jira-input--error');
            titleInput.focus();
          }
          if (titleError) {
            titleError.textContent = 'Ringkasan issue wajib diisi.';
            titleError.style.display = 'block';
          }
          swalValidation('Ringkasan Issue Wajib Diisi', 'Silakan masukkan ringkasan atau judul tiket sebelum menyimpan.');
          return;
        }

        if (titleInput) titleInput.classList.remove('jira-input--error');
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

        const sprintIdVal = sprintSelect ? sprintSelect.value : undefined;
        const sprintId = (sprintIdVal && sprintIdVal !== 'backlog') ? sprintIdVal : undefined;

        store.createTask({
          projectId: this.projectId,
          sprintId,
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

        swalSuccess('Issue Berhasil Dibuat', `Issue <b>${this.escapeHtml(title)}</b> telah didaftarkan ke status <b>Backlog</b>.`);

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
