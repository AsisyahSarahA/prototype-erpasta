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

export class TaskListView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'list-view-wrapper';

    this.jqlQuery = '';
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
        return `<span class="table-priority-badge badge-hot">${Icons.flame('', 12)} Hotfix</span>`;
      case 'Tertinggi':
        return `<span class="table-priority-badge badge-hot">Tertinggi</span>`;
      case 'Tinggi':
        return `<span class="table-priority-badge badge-high">▲ Tinggi</span>`;
      case 'Sedang':
        return `<span class="table-priority-badge badge-medium">■ Sedang</span>`;
      case 'Rendah':
      default:
        return `<span class="table-priority-badge badge-low">▼ Rendah</span>`;
    }
  }

  getStatusBadge(status) {
    switch (status) {
      case 'Selesai':
      case 'Deploy Production':
      case 'Dipantau':
        return { label: 'SELESAI', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' };
      case 'In Progress':
      case 'Diperbaiki Agen':
        return { label: 'IN PROGRESS', bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' };
      case 'In Review':
      case 'Menunggu Persetujuan':
        return { label: 'IN REVIEW', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' };
      case 'QA/Testing':
      case 'Deploy Staging':
        return { label: 'QA STAGING', bg: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' };
      case 'Perlu Manual':
      case 'Ditolak':
        return { label: 'PERLU MANUAL', bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' };
      default:
        return { label: 'TO DO', bg: 'var(--bg-secondary, #f1f5f9)', color: 'var(--text-secondary, #64748b)' };
    }
  }

  getTypeBadge(type) {
    if (type === 'Bug') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: var(--red-500); font-weight: 700; font-size: 11px;">${Icons.bug('', 13)} <span>Bug</span></span>`;
    }
    if (type === 'Feature' || type === 'Story') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: var(--indigo-600); font-weight: 700; font-size: 11px;">${Icons.sparkles('', 13)} <span>Fitur</span></span>`;
    }
    if (type === 'Revisi' || type === 'Change Request') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: var(--amber-600); font-weight: 700; font-size: 11px;">${Icons.refresh('', 13)} <span>Revisi</span></span>`;
    }
    if (type === 'Maintenance') {
      return `<span style="display: inline-flex; align-items: center; gap: 5px; color: #0d9488; font-weight: 700; font-size: 11px;">${Icons.wrench('', 13)} <span>Maint</span></span>`;
    }
    return `<span style="display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary); font-weight: 600; font-size: 11px;">${Icons.checkSquare('', 13)} <span>Task</span></span>`;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const { tasks, selectedProjectId, teamMembers, role } = state;
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

    // JQL Filter Logic
    const filteredTasks = projectTasks.filter(task => {
      if (role === 'client' && task.visibility !== 'client_public') return false;
      if (!this.jqlQuery.trim()) return true;

      const lowerQuery = this.jqlQuery.toLowerCase();
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
    const doneTasksCount = sortedTasks.filter(t => t.status === 'Selesai' || t.status === 'Deploy Production').length;
    const criticalBugs = sortedTasks.filter(t => t.type === 'Bug' && (t.priority === 'Hotfix' || t.priority === 'Tertinggi'));

    this.container.innerHTML = `
      <div class="list-root-container">
        
        <!-- 1. Top Header & KPI Bar -->
        <section class="list-top-card">
          <!-- Main Title & Action Row -->
          <div class="list-header-main-row">
            <div class="list-header-left">
              <div class="list-breadcrumbs">
                <span>Modul Proyek</span>
                <span>/</span>
                <span>${this.escapeHtml(activeProject?.name || 'Sistem Perpustakaan Digital Kampus')}</span>
                <span>/</span>
                <span class="crumb-current">Daftar Pekerjaan (JQL)</span>
              </div>
              <div class="list-title-wrap">
                <h1 class="list-page-title">Daftar Masalah &amp; Kueri JQL (Issue Navigator)</h1>
                <span class="list-status-pill">
                  <span style="font-size: 8px;">●</span>
                  <span>Total ${projectTasks.length} Masalah</span>
                </span>
              </div>
            </div>

            <div class="list-header-actions">
              <button id="exportCsvBtn" class="btn btn-secondary" style="font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: var(--radius-lg);">
                ${Icons.fileText('', 14)}
                <span>Ekspor CSV</span>
              </button>
              <button id="listCreateTaskBtn" class="btn btn-primary" style="font-size: 12px; font-weight: 700; padding: 7px 14px; border-radius: var(--radius-lg);">
                ${Icons.plus('', 14)}
                <span>+ Buat Masalah</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Metrics -->
          <div class="list-kpi-bar">
            <div class="list-kpi-group">
              <div class="list-kpi-item">
                <span class="list-kpi-label">Total Masalah:</span>
                <span class="list-kpi-val">${projectTasks.length} Tiket</span>
              </div>

              <div class="list-kpi-divider"></div>

              <div class="list-kpi-item">
                <span class="list-kpi-label">Hasil Filter:</span>
                <span class="list-kpi-val" style="color: var(--indigo-600);">${sortedTasks.length} Tiket (${totalEstimate} Jam)</span>
              </div>

              <div class="list-kpi-divider"></div>

              <div class="list-kpi-item">
                <span class="list-kpi-label">Jam Tercatat:</span>
                <span class="list-kpi-val" style="color: var(--text-secondary);">${totalLogged} Jam Log</span>
              </div>

              <div class="list-kpi-divider"></div>

              <div class="list-kpi-item">
                <span class="list-kpi-label">Selesai:</span>
                <span class="list-kpi-val" style="color: var(--emerald-600);">${doneTasksCount} Tiket</span>
              </div>
            </div>

            ${criticalBugs.length > 0 ? `
              <div style="display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: var(--radius-full); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: var(--red-500); font-size: 11px; font-weight: 700;">
                ${Icons.flame('', 12)}
                <span>${criticalBugs.length} Tiket Bug Kritis / Hotfix</span>
              </div>
            ` : ''}
          </div>
        </section>

        <!-- 2. JQL Query Console Card -->
        <section class="jql-console-card">
          <div class="jql-console-header">
            <div class="jql-console-title-wrap">
              <div class="jql-console-icon">
                ${Icons.terminal('', 15)}
              </div>
              <div>
                <h3 class="jql-console-title">Konsol Pencarian Bahasa Kueri (JQL Query Console)</h3>
                <p class="jql-console-sub">
                  Filter cerdas dengan kueri seperti <code>type = Bug</code>, <code>priority = Hotfix</code>, <code>status = Menunggu Persetujuan</code>, atau judul pekerjaan.
                </p>
              </div>
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600;">
              Menampilkan <strong>${sortedTasks.length}</strong> dari <strong>${projectTasks.length}</strong> tiket
            </div>
          </div>

          <!-- JQL Input Box -->
          <div class="jql-input-box">
            <span class="jql-input-icon">
              ${Icons.search('', 15)}
            </span>
            <input
              type="text"
              id="jqlSearchInput"
              class="jql-search-input"
              placeholder="Contoh JQL: 'type = Bug', 'priority = Hotfix', 'status = Menunggu Persetujuan', atau ketik kata kunci..."
              value="${this.escapeHtml(this.jqlQuery)}"
            />
            <div class="jql-input-actions">
              ${this.jqlQuery ? `
                <button id="clearJqlBtn" class="jql-clear-btn" title="Hapus Kueri JQL">
                  ${Icons.x('', 14)}
                </button>
              ` : ''}
              <button id="applyJqlBtn" class="jql-submit-btn">
                Cari (Enter)
              </button>
            </div>
          </div>

          <!-- Preset Filter Chips -->
          <div class="jql-presets-bar">
            <span class="jql-preset-label">Preset:</span>
            <button class="jql-preset-chip ${this.jqlQuery === '' ? 'active' : ''}" data-jql="">
              Semua Masalah
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'type = Bug' ? 'active' : ''}" data-jql="type = Bug">
              ${Icons.bug('', 12)} type = Bug
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'priority = Hotfix' ? 'active' : ''}" data-jql="priority = Hotfix">
              ${Icons.flame('', 12)} priority = Hotfix
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'status = Menunggu Persetujuan' ? 'active' : ''}" data-jql="status = Menunggu Persetujuan">
              status = Menunggu Persetujuan
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'status = In Progress' ? 'active' : ''}" data-jql="status = In Progress">
              status = In Progress
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'status = QA/Testing' ? 'active' : ''}" data-jql="status = QA/Testing">
              status = QA/Testing
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'severity = S1' ? 'active' : ''}" data-jql="severity = S1">
              severity = S1
            </button>
            <button class="jql-preset-chip ${this.jqlQuery === 'source = Telegram Bot' ? 'active' : ''}" data-jql="source = Telegram Bot">
              source = Telegram Bot
            </button>
          </div>
        </section>

        <!-- 3. Bulk Action Floating / Sticky Toolbar -->
        ${this.selectedTaskIds.length > 0 ? `
          <div class="list-bulk-bar">
            <div class="list-bulk-left">
              <span class="list-bulk-dot"></span>
              <span>${this.selectedTaskIds.length} tiket dipilih</span>
            </div>

            <div class="list-bulk-actions">
              <span style="font-size: 11px; color: var(--slate-400); margin-right: 4px;">Tindakan Massal:</span>
              <button id="bulkInProgressBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Pindahkan ke In Progress
              </button>
              <button id="bulkDoneBtn" class="btn btn-primary btn-sm" style="background-color: var(--emerald-600); border-color: var(--emerald-600); font-size: 11px; padding: 4px 12px;">
                ✓ Tandai Selesai
              </button>
              <button id="clearSelectionBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Batalkan Pilihan
              </button>
            </div>
          </div>
        ` : ''}

        <!-- 4. High-Density Proportional Data Table Card -->
        <section class="list-table-card">
          <div class="list-table-header-bar">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
              ${Icons.listTodo('text-indigo-600', 15)}
              <span>Tabel Pekerjaan</span>
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
                  <th class="sortable" data-sort="key" style="width: 90px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>KUNCI</span>
                      ${this.sortField === 'key' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="title" style="min-width: 240px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>RINGKASAN / JUDUL TIKET</span>
                      ${this.sortField === 'title' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="type" style="width: 100px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>TIPE</span>
                      ${this.sortField === 'type' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="status" style="width: 130px;">
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
                  <th style="width: 140px;">ASSIGNEE (PIC)</th>
                  <th class="sortable" data-sort="estimateHours" style="width: 90px; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <span>ESTIMASI</span>
                      ${this.sortField === 'estimateHours' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="timeLoggedHours" style="width: 90px; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <span>TERCATAT</span>
                      ${this.sortField === 'timeLoggedHours' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="dueDate" style="width: 110px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>JATUH TEMPO</span>
                      ${this.sortField === 'dueDate' ? (this.sortAsc ? '▲' : '▼') : Icons.arrowUpDown('', 11)}
                    </div>
                  </th>
                  <th style="width: 80px; text-align: center;">AKSI</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTasks.length === 0 ? `
                  <tr>
                    <td colspan="11" style="padding: 48px 20px; text-align: center; color: var(--text-muted); font-size: 13px; font-style: italic;">
                      Tidak ada pekerjaan yang cocok dengan kueri filter JQL "${this.escapeHtml(this.jqlQuery)}".
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
                        <span class="table-task-title open-task-detail-link" data-task-id="${task.id}" title="${this.escapeHtml(task.title)}">
                          ${this.escapeHtml(task.title)}
                        </span>
                      </td>

                      <!-- Tipe Tiket -->
                      <td>
                        ${this.getTypeBadge(task.type)}
                      </td>

                      <!-- Status Lozenge -->
                      <td>
                        <span class="issue-status-lozenge" style="background-color: ${statusBadge.bg}; color: ${statusBadge.color};">
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
                        ${task.dueDate || '02/11/2026'}
                      </td>

                      <!-- Tombol Detail -->
                      <td style="text-align: center;" onclick="event.stopPropagation();">
                        <button class="open-task-detail-btn" data-task-id="${task.id}" style="border: none; background: transparent; color: var(--indigo-600); font-size: 11px; font-weight: 700; cursor: pointer; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;">
                          <span>Detail</span>
                          ${Icons.chevronRight('', 12)}
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
    this.container.addEventListener('click', (e) => {
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

      // Bulk In Progress
      if (e.target.closest('#bulkInProgressBtn')) {
        this.selectedTaskIds.forEach(id => {
          store.updateTaskStatus(id, 'In Progress');
        });
        store.addToast('success', 'Perubahan Massal Berhasil', `${this.selectedTaskIds.length} tiket diubah ke In Progress.`);
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Bulk Done
      if (e.target.closest('#bulkDoneBtn')) {
        this.selectedTaskIds.forEach(id => {
          store.updateTaskStatus(id, 'Selesai');
        });
        store.addToast('success', 'Perubahan Massal Berhasil', `${this.selectedTaskIds.length} tiket ditandai Selesai.`);
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Preset click
      const presetBtn = e.target.closest('.jql-preset-chip');
      if (presetBtn) {
        this.jqlQuery = presetBtn.dataset.jql || '';
        this.render();
        return;
      }

      // Clear JQL
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
        store.addToast('success', 'Ekspor CSV Berhasil', 'Data daftar masalah JQL berhasil diunduh ke format spreadsheet.');
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
