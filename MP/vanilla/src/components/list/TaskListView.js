/**
 * TaskListView Component (Vanilla ES Module)
 * 
 * Standar ASTACODE CRM & Enterprise Software House UI/UX:
 * - High-density proportional data table with sortable columns
 * - JQL Console & instant query presets (type, status, priority, severity, source)
 * - Bulk actions bar (bulk In Progress, bulk Done, clear selection)
 * - Tri-color status lozenges & priority pills
 * - Seamless integration with TaskDetailView
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';
import { getCanonicalStatus } from '../../utils/workflow.js';
import { swalConfirm, swalSuccess, swalValidation } from '../../utils/swal.js';

export class TaskListView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'list-view-wrapper';

    this.jqlQuery = '';
    this.priorityFilter = 'all';
    this.statusFilter = 'all';
    this.assigneeFilter = 'all';
    this.sortField = 'key';
    this.sortAsc = true;
    this.selectedTaskIds = [];

    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();

    this.unsubscribe = store.subscribe(() => {
      // Re-render only if current tab is list
      if (store.getState().activeTab === 'list') {
        this.render();
      }
    });
  }

  getElement() {
    return this.container;
  }

  getPriorityBadge(priority) {
    switch (priority) {
      case 'Hotfix':
        return `<span class="table-priority-badge badge-hot"><i class="fi fi-rr-flame" style="font-size:10px;"></i> Hotfix</span>`;
      case 'Tertinggi':
        return `<span class="table-priority-badge badge-hot"><i class="fi fi-rr-flame" style="font-size:10px;"></i> Tertinggi</span>`;
      case 'Tinggi':
        return `<span class="table-priority-badge badge-high"><i class="fi fi-rr-arrow-small-up" style="font-size:10px;"></i> Tinggi</span>`;
      case 'Sedang':
        return `<span class="table-priority-badge badge-medium">■ Sedang</span>`;
      case 'Rendah':
      default:
        return `<span class="table-priority-badge badge-low">▼ Rendah</span>`;
    }
  }

  getStatusBadge(status) {
    const canonical = getCanonicalStatus(status);
    switch (canonical) {
      case 'Done':
        return { label: 'DONE', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'Review & Testing':
        return { label: 'REVIEW & TESTING', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'In Development':
        return { label: 'IN DEVELOPMENT', bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' };
      case 'To Do':
        return { label: 'TO DO', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Rejected':
        return { label: 'REJECTED', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'Backlog':
      default:
        return { label: 'BACKLOG', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  }

  getTypeBadge(type) {
    if (type === 'Bug') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #dc2626; font-weight: 700; font-size: 11px;"><i class="fi fi-rr-bug"></i> <span>Bug</span></span>`;
    }
    if (type === 'Feature' || type === 'Story') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #4f46e5; font-weight: 700; font-size: 11px;"><i class="fi fi-rr-sparkles"></i> <span>Fitur</span></span>`;
    }
    if (type === 'Revisi' || type === 'Change Request') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #d97706; font-weight: 700; font-size: 11px;"><i class="fi fi-rr-refresh"></i> <span>Revisi</span></span>`;
    }
    if (type === 'Maintenance') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #0d9488; font-weight: 700; font-size: 11px;"><i class="fi fi-rr-wrench"></i> <span>Maint</span></span>`;
    }
    return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #64748b; font-weight: 600; font-size: 11px;"><i class="fi fi-rr-list-check"></i> <span>Task</span></span>`;
  }

  formatDateDisplay(dStr) {
    if (!dStr) return '-';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
      }
    } catch (e) {}
    return dStr;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject() || (state.projects && state.projects[0]) || {};
    const currentProjectId = activeProject.id || state.selectedProjectId;
    const { tasks, teamMembers, role } = state;
    // Filter strictly for Bug category/type issues belonging to the selected project
    const projectTasks = (tasks || []).filter(t => {
      if (t.projectId !== currentProjectId) return false;
      const isBug = (t.type || '').toLowerCase() === 'bug' || (t.category || '').toLowerCase() === 'bug';
      return isBug;
    });

    // Dropdowns & JQL Filter Logic
    const filteredTasks = projectTasks.filter(task => {
      if (role === 'client' && task.visibility !== 'client_public') return false;

      // Dropdown Priority Filter
      if (this.priorityFilter !== 'all' && (task.priority || '').toLowerCase() !== this.priorityFilter.toLowerCase()) {
        return false;
      }

      // Dropdown Status Filter
      if (this.statusFilter !== 'all') {
        const canonical = getCanonicalStatus(task.status).toLowerCase();
        if (!canonical.includes(this.statusFilter.toLowerCase())) return false;
      }

      // Dropdown Assignee Filter
      if (this.assigneeFilter !== 'all' && task.assigneeId !== this.assigneeFilter) {
        return false;
      }

      // Text / JQL Query Filter
      if (!this.jqlQuery.trim()) return true;

      const lowerQuery = this.jqlQuery.toLowerCase().trim();
      if (lowerQuery.includes('=')) {
        const parts = lowerQuery.split('=').map(s => s.trim());
        const field = parts[0];
        const val = parts[1];
        if (field === 'type') return (task.type || '').toLowerCase() === val;
        if (field === 'priority') return (task.priority || '').toLowerCase() === val;
        if (field === 'status') return (task.status || '').toLowerCase().includes(val);
        if (field === 'difficulty') return (task.difficulty || '').toLowerCase() === val;
        if (field === 'source') return (task.source || '').toLowerCase().includes(val);
        if (field === 'severity') return (task.severity || '').toLowerCase() === val;
        if (field === 'key') return (task.key || '').toLowerCase().includes(val);
      }

      return (
        (task.key || '').toLowerCase().includes(lowerQuery) ||
        (task.title || '').toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery))
      );
    });

    // Sorting Logic
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const valA = a[this.sortField] !== undefined ? a[this.sortField] : '';
      const valB = b[this.sortField] !== undefined ? b[this.sortField] : '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortAsc ? valA - valB : valB - valA;
      }
      if (String(valA) < String(valB)) return this.sortAsc ? -1 : 1;
      if (String(valA) > String(valB)) return this.sortAsc ? 1 : -1;
      return 0;
    });

    const totalEstimate = sortedTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0);
    const totalLogged = sortedTasks.reduce((acc, t) => acc + (Number(t.timeLoggedHours) || 0), 0);
    const doneTasksCount = sortedTasks.filter(t => getCanonicalStatus(t.status) === 'Done').length;
    const criticalBugs = sortedTasks.filter(t => t.type === 'Bug' && (t.priority === 'Hotfix' || t.priority === 'Tertinggi'));
    const inDevBugs = sortedTasks.filter(t => {
      const canonical = getCanonicalStatus(t.status);
      return canonical === 'In Development';
    }).length;
    const reviewBugs = sortedTasks.filter(t => {
      const canonical = getCanonicalStatus(t.status);
      return canonical === 'Review & Testing';
    }).length;
    const inProgressBugs = inDevBugs + reviewBugs;
    const unresolvedBugs = Math.max(0, sortedTasks.length - doneTasksCount);
    const resolutionRate = sortedTasks.length > 0 ? Math.round((doneTasksCount / sortedTasks.length) * 100) : 0;

    this.container.innerHTML = `
      <div class="list-root-container">
        
        <!-- 1. Header & Quick Actions -->
        <div class="list-header-main-row">
          <div class="list-header-left">
            <div class="list-breadcrumbs">
              <i class="fi fi-rr-apps" style="font-size: 11px;"></i>
              <span>Modul Proyek</span>
              <span>/</span>
              <span>${this.escapeHtml(activeProject?.name || 'Proyek')}</span>
              <span>/</span>
              <span class="crumb-current">Issue List</span>
            </div>
            <div class="list-title-wrap">
              <h1 class="list-page-title">Issue List (Daftar Bug &amp; Masalah)</h1>
              <span class="list-status-pill">
                <span style="font-size: 7px; color: #4f46e5;">●</span>
                <span>${projectTasks.length} Masalah [${activeProject?.code || 'PROJ'}]</span>
              </span>
            </div>
          </div>

          <div class="list-header-actions">
            <button id="exportCsvBtn" class="btn btn-secondary" style="font-size: 12px; font-weight: 700; padding: 7px 13px; border-radius: var(--radius-lg); display: inline-flex; align-items: center; gap: 6px;">
              <i class="fi fi-rr-download"></i>
              <span>Ekspor CSV</span>
            </button>
            <button id="listCreateTaskBtn" class="btn btn-primary" style="font-size: 12px; font-weight: 700; padding: 7px 15px; border-radius: var(--radius-lg); display: inline-flex; align-items: center; gap: 6px;">
              <i class="fi fi-rr-plus"></i>
              <span>+ Lapor Bug Baru</span>
            </button>
          </div>
        </div>

        <!-- 2. KPI Summary Cards (Clean, Informative & Flaticon) -->
        <div class="list-metrics-grid">
          
          <!-- Card 1: Total Masalah -->
          <div class="list-metric-card">
            <div class="list-metric-card__header">
              <span class="list-metric-card__label">Total Tiket Masalah</span>
              <span class="list-metric-icon-box list-metric-icon-box--indigo" title="Total Seluruh Bug">
                <i class="fi fi-rr-bug"></i>
              </span>
            </div>
            <div class="list-metric-card__body">
              <div class="list-metric-card__value-row">
                <span class="list-metric-card__value" style="color: #4f46e5;">${projectTasks.length}</span>
                <span class="list-metric-unit">Tiket</span>
              </div>
            </div>
            <div class="list-metric-info-row">
              <span class="list-metric-info-item"><i class="fi fi-rr-flame" style="color:#ef4444; font-size:11px;"></i> <strong>${criticalBugs.length}</strong> Kritis / Hotfix</span>
              <span class="list-metric-info-dot">·</span>
              <span class="list-metric-info-item" style="color:#64748b;"><strong>${sortedTasks.length}</strong> difilter</span>
            </div>
          </div>

          <!-- Card 2: Aktif Ditangani -->
          <div class="list-metric-card">
            <div class="list-metric-card__header">
              <span class="list-metric-card__label">Aktif Ditangani</span>
              <span class="list-metric-icon-box list-metric-icon-box--amber" title="Bug Sedang Dalam Pengerjaan">
                <i class="fi fi-rr-flame"></i>
              </span>
            </div>
            <div class="list-metric-card__body">
              <div class="list-metric-card__value-row">
                <span class="list-metric-card__value" style="color: #d97706;">${inProgressBugs}</span>
                <span class="list-metric-unit">Tiket</span>
              </div>
            </div>
            <div class="list-metric-info-row">
              <span class="list-metric-info-item" title="Sedang dikerjakan tim"><span class="list-metric-status-dot" style="background:#f59e0b;"></span> <strong>${inDevBugs}</strong> In Dev</span>
              <span class="list-metric-info-dot">·</span>
              <span class="list-metric-info-item" title="Tahap QA dan Review"><span class="list-metric-status-dot" style="background:#8b5cf6;"></span> <strong>${reviewBugs}</strong> Review</span>
            </div>
          </div>

          <!-- Card 3: Status Resolusi -->
          <div class="list-metric-card">
            <div class="list-metric-card__header">
              <span class="list-metric-card__label">Status Resolusi</span>
              <span class="list-metric-icon-box list-metric-icon-box--emerald" title="Bug Telah Selesai">
                <i class="fi fi-rr-check-circle"></i>
              </span>
            </div>
            <div class="list-metric-card__body">
              <div class="list-metric-card__value-row">
                <span class="list-metric-card__value" style="color: #059669;">${doneTasksCount}</span>
                <span class="list-metric-unit">Selesai</span>
                <span class="list-metric-chip list-metric-chip--emerald">${resolutionRate}%</span>
              </div>
              <div class="list-metric-card__progress-track">
                <div class="list-metric-card__progress-bar" style="width: ${resolutionRate}%; background: linear-gradient(90deg, #10b981 0%, #059669 100%);"></div>
              </div>
            </div>
            <div class="list-metric-info-row">
              <span class="list-metric-info-item" style="color:#64748b;"><strong>${unresolvedBugs}</strong> tiket belum tuntas</span>
            </div>
          </div>

          <!-- Card 4: Estimasi & Log Waktu -->
          <div class="list-metric-card">
            <div class="list-metric-card__header">
              <span class="list-metric-card__label">Estimasi &amp; Log Waktu</span>
              <span class="list-metric-icon-box list-metric-icon-box--violet" title="Alokasi Jam Kerja">
                <i class="fi fi-rr-clock"></i>
              </span>
            </div>
            <div class="list-metric-card__body">
              <div class="list-metric-card__value-row">
                <span class="list-metric-card__value" style="color: #6d28d9;">${totalEstimate}</span>
                <span class="list-metric-unit">Jam</span>
              </div>
            </div>
            <div class="list-metric-info-row">
              <span class="list-metric-info-item" title="Jam kerja tercatat"><i class="fi fi-rr-stopwatch" style="color:#4f46e5; font-size:11px;"></i> Log: <strong>${totalLogged}j</strong></span>
              <span class="list-metric-info-dot">·</span>
              <span class="list-metric-info-item" title="Sisa jam kerja"><i class="fi fi-rr-hourglass" style="color:#64748b; font-size:11px;"></i> Sisa: <strong>${Math.max(0, totalEstimate - totalLogged)}j</strong></span>
            </div>
          </div>

        </div>

        <!-- 3. Smart Filter & Search Bar Card -->
        <section class="list-filter-card">
          <!-- Primary Controls Row -->
          <div class="list-filter-row">
            <!-- Search Box -->
            <div class="list-search-box">
              <span class="list-search-icon"><i class="fi fi-rr-search"></i></span>
              <input
                type="text"
                id="jqlSearchInput"
                class="list-search-input"
                placeholder="Cari kode tiket (LIB-xxx), ringkasan bug, atau kueri JQL..."
                value="${this.escapeHtml(this.jqlQuery)}"
              />
              ${this.jqlQuery ? `
                <button id="clearJqlBtn" class="list-clear-btn" title="Hapus pencarian">
                  <i class="fi fi-rr-cross-small"></i>
                </button>
              ` : ''}
              <button id="applyJqlBtn" class="list-submit-btn">
                Cari
              </button>
            </div>

            <!-- Dropdown Filters -->
            <div class="list-filter-selects">
              <!-- Prioritas -->
              <div class="list-select-wrap">
                <label for="filterPriority" class="list-select-label">Prioritas:</label>
                <select id="filterPriority" class="list-select-control">
                  <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>Semua Prioritas</option>
                  <option value="Hotfix" ${this.priorityFilter === 'Hotfix' ? 'selected' : ''}>🔥 Hotfix</option>
                  <option value="Tinggi" ${this.priorityFilter === 'Tinggi' ? 'selected' : ''}>▲ Tinggi</option>
                  <option value="Sedang" ${this.priorityFilter === 'Sedang' ? 'selected' : ''}>■ Sedang</option>
                  <option value="Rendah" ${this.priorityFilter === 'Rendah' ? 'selected' : ''}>▼ Rendah</option>
                </select>
              </div>

              <!-- Status -->
              <div class="list-select-wrap">
                <label for="filterStatus" class="list-select-label">Status:</label>
                <select id="filterStatus" class="list-select-control">
                  <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Semua Status</option>
                  <option value="Backlog" ${this.statusFilter === 'Backlog' ? 'selected' : ''}>Backlog</option>
                  <option value="To Do" ${this.statusFilter === 'To Do' ? 'selected' : ''}>To Do</option>
                  <option value="In Development" ${this.statusFilter === 'In Development' ? 'selected' : ''}>In Development</option>
                  <option value="Review & Testing" ${this.statusFilter === 'Review & Testing' ? 'selected' : ''}>Review &amp; Testing</option>
                  <option value="Done" ${this.statusFilter === 'Done' ? 'selected' : ''}>Done</option>
                </select>
              </div>

              <!-- Assignee -->
              <div class="list-select-wrap">
                <label for="filterAssignee" class="list-select-label">PIC:</label>
                <select id="filterAssignee" class="list-select-control">
                  <option value="all" ${this.assigneeFilter === 'all' ? 'selected' : ''}>Semua PIC</option>
                  ${teamMembers.map(m => `
                    <option value="${m.id}" ${this.assigneeFilter === m.id ? 'selected' : ''}>${this.escapeHtml(m.name)}</option>
                  `).join('')}
                </select>
              </div>

              ${(this.priorityFilter !== 'all' || this.statusFilter !== 'all' || this.assigneeFilter !== 'all' || this.jqlQuery) ? `
                <button id="resetAllFiltersBtn" class="list-reset-btn" title="Reset seluruh filter">
                  <i class="fi fi-rr-refresh"></i> Reset
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Quick Preset Filter Chips -->
          <div class="list-presets-row">
            <div class="list-preset-chips-wrap">
              <span class="list-preset-label">Filter Cepat:</span>
              <button class="jql-preset-chip ${!this.jqlQuery && this.priorityFilter === 'all' && this.statusFilter === 'all' ? 'active' : ''}" data-jql="">
                Semua Masalah (${projectTasks.length})
              </button>
              <button class="jql-preset-chip ${this.jqlQuery === 'priority = Hotfix' || this.priorityFilter === 'Hotfix' ? 'active' : ''}" data-jql="priority = Hotfix">
                <i class="fi fi-rr-flame" style="color: #ef4444;"></i> Hotfix / Kritis (${criticalBugs.length})
              </button>
              <button class="jql-preset-chip ${this.jqlQuery === 'status = In Development' || this.statusFilter === 'In Development' ? 'active' : ''}" data-jql="status = In Development">
                <span class="list-metric-status-dot" style="background:#f59e0b;"></span> In Development (${inDevBugs})
              </button>
              <button class="jql-preset-chip ${this.jqlQuery === 'status = Review & Testing' || this.statusFilter === 'Review & Testing' ? 'active' : ''}" data-jql="status = Review & Testing">
                <span class="list-metric-status-dot" style="background:#8b5cf6;"></span> Review &amp; QA (${reviewBugs})
              </button>
              <button class="jql-preset-chip ${this.jqlQuery === 'status = Done' || this.statusFilter === 'Done' ? 'active' : ''}" data-jql="status = Done">
                <i class="fi fi-rr-check" style="color: #10b981;"></i> Selesai (${doneTasksCount})
              </button>
            </div>

            <div class="list-counter-label">
              Menampilkan <strong>${sortedTasks.length}</strong> dari <strong>${projectTasks.length}</strong> tiket
            </div>
          </div>
        </section>

        <!-- 4. Bulk Action Floating / Sticky Toolbar -->
        ${this.selectedTaskIds.length > 0 ? `
          <div class="list-bulk-bar">
            <div class="list-bulk-left">
              <span class="list-bulk-dot"></span>
              <span>${this.selectedTaskIds.length} tiket dipilih</span>
            </div>

            <div class="list-bulk-actions">
              <span style="font-size: 11px; color: var(--slate-400); margin-right: 4px;">Tindakan Massal:</span>
              <button id="bulkInDevBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Maju ke In Development
              </button>
              <button id="bulkReviewBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Maju ke Review & Testing
              </button>
              <button id="bulkDoneBtn" class="btn btn-primary btn-sm" style="background-color: var(--emerald-600); border-color: var(--emerald-600); font-size: 11px; padding: 4px 12px;">
                ✓ Tandai Done
              </button>
              <button id="clearSelectionBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Batalkan Pilihan
              </button>
            </div>
          </div>
        ` : ''}

        <!-- 5. High-Density Proportional Data Table Card -->
        <section class="list-table-card">
          <div class="list-table-header-bar">
            <div style="font-size: 13px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px;">
              <i class="fi fi-rr-list-check" style="color: #4f46e5;"></i>
              <span>Tabel Pekerjaan &amp; Masalah</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">
              Urutan: <strong>${this.sortField.toUpperCase()}</strong> (${this.sortAsc ? 'Menaik ▲' : 'Menurun ▼'})
            </div>
          </div>

          <div class="list-table-scroll-container">
            <table class="jql-data-table">
              <thead>
                <tr>
                  <th style="width: 38px; text-align: center;">
                    <input
                      type="checkbox"
                      id="selectAllCheckbox"
                      ${this.selectedTaskIds.length === sortedTasks.length && sortedTasks.length > 0 ? 'checked' : ''}
                      style="cursor: pointer; width: 15px; height: 15px; accent-color: var(--indigo-600);"
                    />
                  </th>
                  <th class="sortable" data-sort="key" style="width: 95px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>KUNCI</span>
                      ${this.sortField === 'key' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="title" style="min-width: 280px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>RINGKASAN / JUDUL TIKET</span>
                      ${this.sortField === 'title' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="type" style="width: 90px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>TIPE</span>
                      ${this.sortField === 'type' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="status" style="width: 125px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>STATUS</span>
                      ${this.sortField === 'status' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="priority" style="width: 110px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>PRIORITAS</span>
                      ${this.sortField === 'priority' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th style="width: 130px;">ASSIGNEE (PIC)</th>
                  <th class="sortable" data-sort="estimateHours" style="width: 80px; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <span>ESTIMASI</span>
                      ${this.sortField === 'estimateHours' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="timeLoggedHours" style="width: 80px; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <span>TERCATAT</span>
                      ${this.sortField === 'timeLoggedHours' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="dueDate" style="width: 105px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>JATUH TEMPO</span>
                      ${this.sortField === 'dueDate' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th style="width: 75px; text-align: center;">AKSI</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTasks.length === 0 ? `
                  <tr>
                    <td colspan="11" style="padding: 56px 20px; text-align: center; color: #64748b; font-size: 13px; background: #ffffff;">
                      <i class="fi fi-rr-search" style="font-size: 32px; color: #cbd5e1; display: block; margin-bottom: 10px;"></i>
                      <p style="font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">Tidak ada tiket masalah yang cocok dengan filter</p>
                      <p style="font-size: 12px; margin: 0 0 12px 0;">Coba sesuaikan kata kunci pencarian atau ubah preset filter.</p>
                      <button id="resetEmptyFilterBtn" class="btn btn-secondary btn-sm" style="font-size: 11.5px; padding: 5px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fi fi-rr-refresh"></i> <span>Reset Semua Filter</span>
                      </button>
                    </td>
                  </tr>
                ` : sortedTasks.map(task => {
                  const assignee = teamMembers.find(m => m.id === task.assigneeId);
                  const isSelected = this.selectedTaskIds.includes(task.id);
                  const statusBadge = this.getStatusBadge(task.status);

                  return `
                    <tr class="list-task-row ${isSelected ? 'selected' : ''}" data-task-id="${task.id}" style="cursor: pointer;">
                      
                      <!-- Checkbox Kolom -->
                      <td style="text-align: center;" onclick="event.stopPropagation();">
                        <input
                          type="checkbox"
                          class="task-row-checkbox"
                          data-id="${task.id}"
                          ${isSelected ? 'checked' : ''}
                          style="cursor: pointer; width: 15px; height: 15px; accent-color: var(--indigo-600);"
                        />
                      </td>

                      <!-- Kunci Tiket -->
                      <td>
                        <a href="javascript:void(0)" class="table-key-badge open-task-detail-link" data-task-id="${task.id}" title="Klik untuk membuka detail">
                          ${task.key}
                        </a>
                      </td>

                      <!-- Judul / Ringkasan Tiket -->
                      <td>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span class="table-task-title open-task-detail-link" data-task-id="${task.id}" title="${this.escapeHtml(task.title)}">
                            ${this.escapeHtml(task.title)}
                          </span>
                          ${task.epicId ? `
                            <span style="font-size: 10px; color: #64748b; font-weight: 600;">
                              <i class="fi fi-rr-layers" style="font-size: 9px; margin-right: 2px;"></i> ${task.epicId}
                            </span>
                          ` : ''}
                        </div>
                      </td>

                      <!-- Tipe Tiket -->
                      <td>
                        ${this.getTypeBadge(task.type)}
                      </td>

                      <!-- Status Lozenge -->
                      <td>
                        <span class="issue-status-lozenge" style="background-color: ${statusBadge.bg}; color: ${statusBadge.color}; border: 1px solid ${statusBadge.border};">
                          ${statusBadge.label}
                        </span>
                      </td>

                      <!-- Prioritas -->
                      <td>
                        ${this.getPriorityBadge(task.priority)}
                      </td>

                      <!-- Assignee / PIC -->
                      <td>
                        ${assignee ? `
                          <div class="table-assignee-pill" title="${this.escapeHtml(assignee.name)} (${assignee.role})">
                            <img src="${assignee.avatar}" alt="${this.escapeHtml(assignee.name)}" class="table-assignee-avatar" />
                            <span style="font-size: 12px; font-weight: 500; color: var(--text-primary);">${this.escapeHtml(assignee.name.split(' ')[0])}</span>
                          </div>
                        ` : `
                          <span style="font-size: 11.5px; color: var(--text-muted); font-style: italic;">Unassigned</span>
                        `}
                      </td>

                      <!-- Estimasi Jam -->
                      <td class="table-hours-cell">
                        ${task.estimateHours || 1}h
                      </td>

                      <!-- Jam Tercatat (Logged) -->
                      <td class="table-hours-cell" style="color: ${task.timeLoggedHours ? 'var(--indigo-600)' : 'var(--text-muted)'};">
                        ${task.timeLoggedHours || 0}h
                      </td>

                      <!-- Tanggal Jatuh Tempo -->
                      <td style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); white-space: nowrap;">
                        ${this.formatDateDisplay(task.dueDate)}
                      </td>

                      <!-- Tombol Detail -->
                      <td style="text-align: center;" onclick="event.stopPropagation();">
                        <button class="open-task-detail-btn btn-detail-clean" data-task-id="${task.id}" title="Buka Detail">
                          <span>Detail</span>
                          <i class="fi fi-rr-arrow-right"></i>
                        </button>
                      </td>

                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    `;
  }

  attachEvents() {
    this.container.addEventListener('click', async (e) => {
      // Row click or Detail Link -> Open Task Detail
      const row = e.target.closest('.list-task-row');
      const openDetailBtn = e.target.closest('.open-task-detail-btn') || e.target.closest('.open-task-detail-link');
      if (openDetailBtn) {
        const taskId = openDetailBtn.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
        return;
      }

      if (row && !e.target.closest('.task-row-checkbox') && !e.target.closest('#selectAllCheckbox')) {
        const taskId = row.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
        return;
      }

      // Checkbox click
      const chk = e.target.closest('.task-row-checkbox');
      if (chk) {
        const taskId = chk.dataset.id;
        if (chk.checked) {
          if (!this.selectedTaskIds.includes(taskId)) this.selectedTaskIds.push(taskId);
        } else {
          this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId);
        }
        this.render();
        return;
      }

      // Select all checkbox
      const selectAll = e.target.closest('#selectAllCheckbox');
      if (selectAll) {
        if (selectAll.checked) {
          this.selectedTaskIds = store.getProjectTasks().map(t => t.id);
        } else {
          this.selectedTaskIds = [];
        }
        this.render();
        return;
      }

      // Clear selection
      if (e.target.closest('#clearSelectionBtn')) {
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Bulk In Development
      if (e.target.closest('#bulkInDevBtn')) {
        const confirmed = await swalConfirm({
          title: 'Maju ke In Development?',
          html: `Pindahkan <b>${this.selectedTaskIds.length} tiket</b> ke status <b>In Development</b>?<br><small style="color:#64748b;">(Hanya tiket berstatus To Do yang sah dimajukan)</small>`,
          confirmText: 'Ya, Pindahkan',
          confirmColor: '#4f46e5'
        });
        if (confirmed) {
          let count = 0;
          this.selectedTaskIds.forEach(id => {
            if (store.updateTaskStatus(id, 'In Development')) count++;
          });
          if (count > 0) {
            swalSuccess('Berhasil Dimajukan', `<b>${count} tiket</b> berhasil dipindahkan ke In Development.`);
          }
          this.selectedTaskIds = [];
          this.render();
        }
        return;
      }

      // Bulk Review & Testing
      if (e.target.closest('#bulkReviewBtn')) {
        const confirmed = await swalConfirm({
          title: 'Maju ke Review & Testing?',
          html: `Ajukan <b>${this.selectedTaskIds.length} tiket</b> ke status <b>Review & Testing</b>?<br><small style="color:#64748b;">(Hanya tiket berstatus In Development yang sah dimajukan)</small>`,
          confirmText: 'Ya, Ajukan Review',
          confirmColor: '#f59e0b'
        });
        if (confirmed) {
          let count = 0;
          this.selectedTaskIds.forEach(id => {
            if (store.updateTaskStatus(id, 'Review & Testing')) count++;
          });
          if (count > 0) {
            swalSuccess('Berhasil Dimajukan', `<b>${count} tiket</b> diajukan ke Review & Testing.`);
          }
          this.selectedTaskIds = [];
          this.render();
        }
        return;
      }

      // Bulk Done
      if (e.target.closest('#bulkDoneBtn')) {
        const confirmed = await swalConfirm({
          title: 'Tandai Selesai (Done)?',
          html: `Pindahkan <b>${this.selectedTaskIds.length} tiket</b> ke status <b>Done</b>?<br><small style="color:#dc2626;">Perhatian: Status Done terkunci dan tidak dapat dikembalikan lagi.</small>`,
          confirmText: 'Ya, Tandai Done',
          confirmColor: '#10b981'
        });
        if (confirmed) {
          let count = 0;
          this.selectedTaskIds.forEach(id => {
            if (store.updateTaskStatus(id, 'Done')) count++;
          });
          if (count > 0) {
            swalSuccess('Berhasil Selesai', `<b>${count} tiket</b> telah tuntas dan berstatus Done.`);
          }
          this.selectedTaskIds = [];
          this.render();
        }
        return;
      }

      // Reset All Filters
      if (e.target.closest('#resetAllFiltersBtn') || e.target.closest('#resetEmptyFilterBtn')) {
        this.jqlQuery = '';
        this.priorityFilter = 'all';
        this.statusFilter = 'all';
        this.assigneeFilter = 'all';
        this.render();
        return;
      }

      // Preset click
      const presetBtn = e.target.closest('.jql-preset-chip');
      if (presetBtn) {
        const jql = presetBtn.dataset.jql || '';
        if (jql.includes('priority = Hotfix')) {
          this.priorityFilter = 'Hotfix';
          this.statusFilter = 'all';
          this.jqlQuery = '';
        } else if (jql.includes('status = In Development')) {
          this.statusFilter = 'In Development';
          this.priorityFilter = 'all';
          this.jqlQuery = '';
        } else if (jql.includes('status = Review & Testing')) {
          this.statusFilter = 'Review & Testing';
          this.priorityFilter = 'all';
          this.jqlQuery = '';
        } else if (jql.includes('status = Done')) {
          this.statusFilter = 'Done';
          this.priorityFilter = 'all';
          this.jqlQuery = '';
        } else if (jql === '') {
          this.priorityFilter = 'all';
          this.statusFilter = 'all';
          this.assigneeFilter = 'all';
          this.jqlQuery = '';
        } else {
          this.jqlQuery = jql;
        }
        this.render();
        return;
      }

      // Clear JQL / Search
      if (e.target.closest('#clearJqlBtn')) {
        this.jqlQuery = '';
        this.render();
        return;
      }

      // Apply JQL Button
      if (e.target.closest('#applyJqlBtn')) {
        const input = this.container.querySelector('#jqlSearchInput');
        if (input) {
          this.jqlQuery = input.value;
          this.render();
        }
        return;
      }

      // Export CSV
      if (e.target.closest('#exportCsvBtn')) {
        store.addToast('success', 'Ekspor CSV Berhasil', 'Data Issue List JQL berhasil diunduh ke format spreadsheet.');
        return;
      }

      // Create Task Button
      if (e.target.closest('#listCreateTaskBtn')) {
        store.openCreateTaskModal();
        return;
      }

      // Sortable Header Click
      const sortHeader = e.target.closest('.sortable');
      if (sortHeader) {
        const field = sortHeader.dataset.sort;
        if (this.sortField === field) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortField = field;
          this.sortAsc = true;
        }
        this.render();
        return;
      }
    });

    // Dropdown Filters Change Event
    this.container.addEventListener('change', (e) => {
      if (e.target.id === 'filterPriority') {
        this.priorityFilter = e.target.value;
        this.render();
      }
      if (e.target.id === 'filterStatus') {
        this.statusFilter = e.target.value;
        this.render();
      }
      if (e.target.id === 'filterAssignee') {
        this.assigneeFilter = e.target.value;
        this.render();
      }
      if (e.target.id === 'issueListProjectSwitcher') {
        const newPid = e.target.value;
        store.setSelectedProjectId(newPid);
        this.selectedTaskIds = [];
        this.render();
      }
    });

    // JQL Search Input Event
    this.container.addEventListener('input', (e) => {
      if (e.target.id === 'jqlSearchInput') {
        this.jqlQuery = e.target.value;
      }
    });

    this.container.addEventListener('keydown', (e) => {
      if (e.target.id === 'jqlSearchInput' && e.key === 'Enter') {
        this.render();
      }
    });
  }
}
