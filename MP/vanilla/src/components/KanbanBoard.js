/**
 * KanbanBoard.js — Papan Kanban Proyek
 * Modeled 100% after ASTACODE CRM Pipeline Kanban (crm/js/components/crm/PipelineKanban.js):
 * - Top KPI Summary Bar: Total Tiket, In Progress, Selesai (%), Bug Kritis (S1/S2), Sprint Aktif
 * - Multi-Filter Row: Quick Search, PIC/Assignee, Tipe Tiket, Prioritas, Epic/Modul
 * - 6 Workflow Columns: Backlog, To Do, In Progress, Code Review, QA Staging, Selesai
 * - CRM-Style Cards: Drag Handle, Key Badge, Type Badge, Priority Pill, SLA Badge, Subtask Progress,
 *                    Assignee Avatar, Prev/Next Shift Buttons, and Detail Click Trigger
 * - Native Drag & Drop with interactive status updates
 */

import { store } from '../state/store.js';

const ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  grip: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`
};

const STAGES = [
  { id: 'backlog', name: 'Backlog', color: '#94a3b8', primaryStatus: 'Backlog', matchStatuses: ['Backlog', 'Baru'] },
  { id: 'todo', name: 'To Do', color: '#3b82f6', primaryStatus: 'To Do', matchStatuses: ['To Do', 'Dianalisis'] },
  { id: 'in_progress', name: 'In Progress', color: '#6366f1', primaryStatus: 'In Progress', matchStatuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'] },
  { id: 'code_review', name: 'Review PR', color: '#f59e0b', primaryStatus: 'In Review', matchStatuses: ['In Review', 'Menunggu Persetujuan'] },
  { id: 'qa_staging', name: 'QA Staging', color: '#8b5cf6', primaryStatus: 'QA/Testing', matchStatuses: ['QA/Testing', 'Deploy Staging', 'Disetujui'] },
  { id: 'done', name: 'Selesai', color: '#10b981', primaryStatus: 'Selesai', matchStatuses: ['Selesai', 'Deploy Production', 'Dipantau'] }
];

export class KanbanBoard {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'kanban-page-wrapper';
    this.unsubscribe = null;
    this.draggedTaskId = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const tasks = store.getProjectTasks();
    const activeProject = store.getActiveProject();
    const teamMembers = state.teamMembers || [];
    const epics = state.epics || [];

    // Filter tasks
    const q = (state.searchQuery || '').toLowerCase().trim();
    const filteredTasks = tasks.filter((t) => {
      if (q) {
        const matchKey = t.key ? t.key.toLowerCase().includes(q) : false;
        const matchTitle = t.title ? t.title.toLowerCase().includes(q) : false;
        const matchDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        if (!matchKey && !matchTitle && !matchDesc) return false;
      }
      if (state.filterAssignee && state.filterAssignee !== 'all') {
        if (t.assigneeId !== state.filterAssignee) return false;
      }
      if (state.filterType && state.filterType !== 'all') {
        if (t.type !== state.filterType) return false;
      }
      if (state.filterPriority && state.filterPriority !== 'all') {
        if (t.priority !== state.filterPriority) return false;
      }
      if (state.filterEpic && state.filterEpic !== 'all') {
        if (t.epicId !== state.filterEpic) return false;
      }
      return true;
    });

    // KPI Metrics calculation
    const totalCount = filteredTasks.length;
    const inProgressCount = filteredTasks.filter((t) => ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'].includes(t.status)).length;
    const doneCount = filteredTasks.filter((t) => ['Selesai', 'Deploy Production', 'Dipantau'].includes(t.status)).length;
    const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const criticalBugs = filteredTasks.filter((t) => t.type === 'Bug' && (t.severity?.startsWith('S1') || t.severity?.startsWith('S2') || t.priority === 'Hotfix'));

    // Columns HTML
    const columnsHtml = STAGES.map((stage, stageIdx) => {
      const stageTasks = filteredTasks.filter((t) => stage.matchStatuses.includes(t.status));
      const totalHours = stageTasks.reduce((acc, curr) => acc + (Number(curr.estimateHours) || 0), 0);

      const cardsHtml = stageTasks.length === 0
        ? `
          <div style="height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed var(--border);border-radius:var(--radius-lg);text-align:center;padding:12px;color:var(--text-muted);font-size:11px;">
            Belum ada tiket
          </div>
        `
        : stageTasks.map((task) => {
            const assignee = teamMembers.find((m) => m.id === task.assigneeId) || { name: 'Unassigned', avatar: 'UA' };
            const epic = epics.find((e) => e.id === task.epicId);
            const totalSubtasks = (task.subtasks || []).length;
            const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
            const subtaskPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

            let typeBadgeClass = 'badge-blue';
            let typeLabel = task.type || 'Task';
            if (task.type === 'Bug') {
              typeBadgeClass = 'badge-red';
              typeLabel = '🐞 Bug';
            } else if (task.type === 'Story') {
              typeBadgeClass = 'badge-emerald';
              typeLabel = '📖 Story';
            } else if (task.type === 'Epic') {
              typeBadgeClass = 'badge-purple';
              typeLabel = '⚡ Epic';
            }

            let priorityBadgeClass = 'badge-slate';
            let priorityLabel = task.priority || 'Sedang';
            if (task.priority === 'Hotfix' || task.priority === 'Tertinggi') {
              priorityBadgeClass = 'badge-hot';
              priorityLabel = '🔥 Hotfix';
            } else if (task.priority === 'Tinggi') {
              priorityBadgeClass = 'badge-high';
              priorityLabel = 'Tinggi';
            } else if (task.priority === 'Sedang') {
              priorityBadgeClass = 'badge-medium';
              priorityLabel = 'Sedang';
            }

            const slaBadgeHtml = task.slaTargetMinutes
              ? `<span class="badge badge-amber" style="font-size:10px;display:inline-flex;align-items:center;gap:3px;" title="Target SLA Penanganan: ${task.slaTargetMinutes} menit">
                  ${ICONS.clock}
                  <span>SLA ${task.slaTargetMinutes}m</span>
                </span>`
              : '';

            return `
              <div
                class="kanban-card"
                draggable="true"
                data-task-id="${task.id}"
                data-stage-idx="${stageIdx}"
                title="Klik untuk melihat detail tiket atau drag ke kolom lain"
              >
                <!-- Card Header: Grip, Key, Type, Priority, SLA -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <div style="display:flex;align-items:center;gap:5px;">
                    <span class="drag-handle" style="display:inline-flex;align-items:center;color:var(--text-muted);opacity:0.6;cursor:grab;">
                      ${ICONS.grip}
                    </span>
                    <span class="badge badge-slate" style="font-family:var(--font-mono);font-size:10px;font-weight:700;">
                      ${task.key}
                    </span>
                    <span class="badge ${typeBadgeClass}" style="font-size:10px;">
                      ${typeLabel}
                    </span>
                  </div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span class="badge ${priorityBadgeClass}" style="font-size:10px;">
                      ${priorityLabel}
                    </span>
                    ${slaBadgeHtml}
                  </div>
                </div>

                <!-- Title & Epic/Modul Tag -->
                <h4 class="kanban-card-title">
                  ${task.title}
                </h4>
                <div class="kanban-card-meta">
                  <span style="color:var(--indigo-600);font-weight:600;">${activeProject ? activeProject.code : 'PROJ'}</span>
                  ${epic ? `<span style="opacity:0.5;"> · </span><span style="color:var(--text-secondary);">${epic.title}</span>` : ''}
                </div>

                <!-- Hours Estimate & Subtasks Gauge -->
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:6px;">
                  <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary);">
                    ${task.estimateHours || 4} Jam
                    <span style="font-weight:400;color:var(--text-muted);font-size:10px;">(${task.timeLoggedHours || 0}h log)</span>
                  </span>
                  ${totalSubtasks > 0 ? `
                    <span style="font-size:10.5px;color:var(--text-secondary);font-weight:600;">
                      ${completedSubtasks}/${totalSubtasks} subtask
                    </span>
                  ` : ''}
                </div>

                ${totalSubtasks > 0 ? `
                  <div class="kanban-card-progress">
                    <div class="kanban-card-progress-bar" style="width: ${subtaskPct}%;"></div>
                  </div>
                ` : ''}

                <!-- Assignee & Action Buttons Row -->
                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border-light);margin-top:4px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:22px;height:22px;border-radius:var(--radius-full);background:linear-gradient(135deg,var(--indigo-600),#3b82f6);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:800;">
                      ${assignee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span style="font-size:11px;color:var(--text-secondary);font-weight:500;">
                      ${assignee.name.split(' ')[0]}
                    </span>
                  </div>

                  <!-- Quick shift & Detail link -->
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button
                      class="btn-shift-prev"
                      data-task-id="${task.id}"
                      data-stage-idx="${stageIdx}"
                      ${stageIdx === 0 ? 'disabled style="opacity:0.2;cursor:not-allowed;"' : ''}
                      title="Kembalikan ke status sebelumnya"
                      style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;display:flex;"
                    >
                      ${ICONS.chevronLeft}
                    </button>

                    <button
                      class="btn-open-detail"
                      data-task-id="${task.id}"
                      style="border:none;background:transparent;color:var(--indigo-600);font-size:11px;font-weight:700;display:flex;align-items:center;gap:2px;cursor:pointer;padding:0;"
                    >
                      <span>Detail</span>
                      ${ICONS.arrowRight}
                    </button>

                    <button
                      class="btn-shift-next"
                      data-task-id="${task.id}"
                      data-stage-idx="${stageIdx}"
                      ${stageIdx === STAGES.length - 1 ? 'disabled style="opacity:0.2;cursor:not-allowed;"' : ''}
                      title="Pindahkan ke status berikutnya"
                      style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;display:flex;"
                    >
                      ${ICONS.chevronRight}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('');

      return `
        <div class="kanban-column" data-stage-id="${stage.id}" data-stage-idx="${stageIdx}">
          <!-- Column Sticky Header -->
          <div class="kanban-column-header">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="kanban-column-dot" style="background-color:${stage.color};"></span>
                <span style="font-size:12.5px;font-weight:800;color:var(--text-primary);letter-spacing:-.01em;">
                  ${stage.name}
                </span>
              </div>
              <span class="badge badge-slate" style="font-size:10px;font-weight:700;">
                ${stageTasks.length}
              </span>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
              <span>${totalHours} Jam Estimasi</span>
              <span style="font-size:10px;font-weight:600;color:var(--indigo-600);">Tahap ${stageIdx + 1}/6</span>
            </div>
          </div>

          <!-- Column Cards Scroll Container -->
          <div class="kanban-cards-scroll" data-stage-id="${stage.id}" data-stage-idx="${stageIdx}">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <!-- Top KPI Summary & Filter Bar (Matching CRM Pipeline Kanban) -->
      <div style="padding:12px 20px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:10px;flex-shrink:0;">
        <!-- KPI Metrics Row -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-size:12px;">
          <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:var(--text-muted);font-weight:500;">Total Tiket:</span>
              <strong style="font-size:14px;font-family:var(--font-mono);color:var(--text-primary);">${totalCount} Tiket</strong>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border-left:1px solid var(--border);padding-left:16px;">
              <span style="color:var(--text-muted);font-weight:500;">Pengerjaan:</span>
              <strong style="font-size:14px;font-family:var(--font-mono);color:var(--indigo-600);">${inProgressCount} Tiket</strong>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border-left:1px solid var(--border);padding-left:16px;">
              <span style="color:var(--text-muted);font-weight:500;">Selesai:</span>
              <strong style="font-size:14px;font-family:var(--font-mono);color:var(--emerald-600);">${doneCount} (${completionPct}%)</strong>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border-left:1px solid var(--border);padding-left:16px;">
              <span style="color:var(--text-muted);font-weight:500;">Sprint Aktif:</span>
              <strong style="color:var(--text-primary);">${(state.sprints && state.sprints[0]) ? state.sprints[0].name : 'Sprint 1 - MVP'}</strong>
            </div>
          </div>

          ${criticalBugs.length > 0 ? `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-md);background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:var(--red-500);font-size:11px;font-weight:700;">
              ${ICONS.alertTriangle}
              <span>${criticalBugs.length} Bug Kritis S1/S2 Menunggu Penanganan</span>
            </div>
          ` : ''}
        </div>

        <!-- Filter Controls Row -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding-top:6px;border-top:1px solid var(--border-light);">
          <!-- Search input -->
          <div style="position:relative;flex:1;max-width:340px;">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
              ${ICONS.search}
            </span>
            <input
              id="kanban-search-box"
              type="text"
              class="form-input"
              style="padding-left:32px;font-size:12px;padding-top:6px;padding-bottom:6px;width:100%;"
              placeholder="Filter cepat judul, key tiket, deskripsi..."
              value="${state.searchQuery || ''}"
            />
          </div>

          <!-- Select dropdowns -->
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">PIC:</span>
              <select id="kanban-filter-pic" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="all" ${state.filterAssignee === 'all' ? 'selected' : ''}>Semua PIC</option>
                ${teamMembers.map((m) => `<option value="${m.id}" ${state.filterAssignee === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">Tipe:</span>
              <select id="kanban-filter-type" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="all" ${state.filterType === 'all' ? 'selected' : ''}>Semua Tipe</option>
                <option value="Story" ${state.filterType === 'Story' ? 'selected' : ''}>📖 Story</option>
                <option value="Task" ${state.filterType === 'Task' ? 'selected' : ''}>⚡ Task</option>
                <option value="Bug" ${state.filterType === 'Bug' ? 'selected' : ''}>🐞 Bug</option>
                <option value="Epic" ${state.filterType === 'Epic' ? 'selected' : ''}>⚡ Epic</option>
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">Prioritas:</span>
              <select id="kanban-filter-priority" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="all" ${state.filterPriority === 'all' ? 'selected' : ''}>Semua Prioritas</option>
                <option value="Hotfix" ${state.filterPriority === 'Hotfix' ? 'selected' : ''}>🔥 Hotfix</option>
                <option value="Tinggi" ${state.filterPriority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
                <option value="Sedang" ${state.filterPriority === 'Sedang' ? 'selected' : ''}>Sedang</option>
                <option value="Rendah" ${state.filterPriority === 'Rendah' ? 'selected' : ''}>Rendah</option>
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">Modul:</span>
              <select id="kanban-filter-epic" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="all" ${state.filterEpic === 'all' ? 'selected' : ''}>Semua Modul</option>
                ${epics.map((e) => `<option value="${e.id}" ${state.filterEpic === e.id ? 'selected' : ''}>${e.title}</option>`).join('')}
              </select>
            </div>

            ${(state.searchQuery || state.filterAssignee !== 'all' || state.filterType !== 'all' || state.filterPriority !== 'all' || state.filterEpic !== 'all') ? `
              <button id="kanban-reset-filters" class="btn btn-secondary btn-sm" style="font-size:11px;padding:4px 10px;">
                Reset Filter
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Kanban Columns Board Area -->
      <div class="kanban-board-scroll">
        ${columnsHtml}
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Search input
    const searchInput = this.container.querySelector('#kanban-search-box');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
      });
    }

    // Filter dropdowns
    const picSelect = this.container.querySelector('#kanban-filter-pic');
    if (picSelect) {
      picSelect.addEventListener('change', (e) => {
        store.setFilterAssignee(e.target.value);
      });
    }

    const typeSelect = this.container.querySelector('#kanban-filter-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        store.setFilterType(e.target.value);
      });
    }

    const prioritySelect = this.container.querySelector('#kanban-filter-priority');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        store.setFilterPriority(e.target.value);
      });
    }

    const epicSelect = this.container.querySelector('#kanban-filter-epic');
    if (epicSelect) {
      epicSelect.addEventListener('change', (e) => {
        store.setFilterEpic(e.target.value);
      });
    }

    const resetBtn = this.container.querySelector('#kanban-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        store.resetFilters();
      });
    }

    // Card click -> Open Task Detail Workspace View
    this.container.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-shift-prev') || e.target.closest('.btn-shift-next')) {
          return;
        }
        const taskId = card.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Detail button inside card
    this.container.querySelectorAll('.btn-open-detail').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Shift previous button
    this.container.querySelectorAll('.btn-shift-prev').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const currentStageIdx = Number(btn.dataset.stageIdx);
        if (currentStageIdx > 0) {
          const targetStage = STAGES[currentStageIdx - 1];
          store.updateTaskStatus(taskId, targetStage.primaryStatus, `Dipindahkan mundur ke tahap ${targetStage.name}`);
        }
      });
    });

    // Shift next button
    this.container.querySelectorAll('.btn-shift-next').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const currentStageIdx = Number(btn.dataset.stageIdx);
        if (currentStageIdx < STAGES.length - 1) {
          const targetStage = STAGES[currentStageIdx + 1];
          store.updateTaskStatus(taskId, targetStage.primaryStatus, `Dipindahkan maju ke tahap ${targetStage.name}`);
        }
      });
    });

    // Native Drag and Drop
    this.container.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.dataset.taskId;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedTaskId);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.container.querySelectorAll('.kanban-cards-scroll').forEach((el) => {
          el.classList.remove('drag-over');
        });
      });
    });

    this.container.querySelectorAll('.kanban-cards-scroll').forEach((dropZone) => {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
        const targetStageIdx = Number(dropZone.dataset.stageIdx);
        const targetStage = STAGES[targetStageIdx];
        if (taskId && targetStage) {
          store.updateTaskStatus(taskId, targetStage.primaryStatus, `Drag & drop ke kolom ${targetStage.name}`);
        }
      });
    });
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
