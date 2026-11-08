/**
 * KanbanBoard.js — Papan Kanban & List Tabel Proyek
 * Modeled after ASTACODE CRM Pipeline & Jira Software Cloud:
 * - Dual View Modes: Papan Kanban (Drag & Drop) & List Tabel (Data Terstruktur)
 * - Top KPI Summary: Total Tiket, Pengerjaan (In Development), Selesai (Done), Sprint Aktif, Bug Kritis S1/S2
 * - Multi-Filter Row: Dual View Toggle, Quick Search, PIC/Assignee, Tipe Tiket, Prioritas, Epic/Modul
 * - 6 Workflow Columns: Backlog, To Do, In Development, Review & Testing, Done, Rejected
 * - Strict Transition Validation with visual drag-and-drop feedback (Allowed vs Forbidden Targets)
 * - Terminal State controls (Done locks card with Reopen; Rejected allows Restore to Backlog)
 */

import { store } from '../state/store.js';
import {
  KANBAN_STAGES,
  WORKFLOW_TRANSITION_RULES,
  getCanonicalStatus,
  validateStatusTransition
} from '../utils/workflow.js';
import { swalConfirm, swalSuccess } from '../utils/swal.js';

const ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  grip: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  kanban: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/></svg>`,
  table: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  arrowUpDown: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`,
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  rotateCcw: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
  flag: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
};

export class KanbanBoard {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'kanban-page-wrapper';
    this.stepper = null;
    this.unsubscribe = null;
    this.draggedTaskId = null;
    this.viewMode = 'kanban'; // 'kanban' | 'table'
    this.sortField = 'key';
    this.sortAsc = true;
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
    const epics = (state.epics || []).filter(
      (e) => !activeProject || !e.projectId || e.projectId === activeProject.id
    );

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
      if (state.filterSprint && state.filterSprint !== 'all') {
        if (state.filterSprint === 'backlog_pool') {
          if (t.sprintId) return false;
        } else if (t.sprintId !== state.filterSprint) {
          return false;
        }
      }
      return true;
    });

    // KPI Metrics calculation (Canonical Workflow Aware)
    const totalCount = filteredTasks.length;
    const inDevelopmentCount = filteredTasks.filter(
      (t) => getCanonicalStatus(t.status) === 'In Development'
    ).length;
    const doneCount = filteredTasks.filter(
      (t) => getCanonicalStatus(t.status) === 'Done'
    ).length;
    const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const criticalBugs = filteredTasks.filter(
      (t) => t.type === 'Bug' && (t.severity?.startsWith('S1') || t.severity?.startsWith('S2') || t.priority === 'Hotfix')
    );
    const projectSprints = (state.sprints || []).filter((s) => activeProject && s.projectId === activeProject.id);
    const activeSprintObj = projectSprints.find((s) => s.status === 'active') || projectSprints[0];
    let selectedSprintObj = activeSprintObj;
    if (state.filterSprint && state.filterSprint !== 'all' && state.filterSprint !== 'backlog_pool') {
      selectedSprintObj = projectSprints.find((s) => s.id === state.filterSprint) || activeSprintObj;
    }
    const isSprintFiltered = Boolean(state.filterSprint && state.filterSprint !== 'all');
    const isSprintActive = isSprintFiltered;
    const isPicActive = Boolean(state.filterAssignee && state.filterAssignee !== 'all');
    const isTypeActive = Boolean(state.filterType && state.filterType !== 'all');
    const isPriorityActive = Boolean(state.filterPriority && state.filterPriority !== 'all');
    const isEpicActive = Boolean(state.filterEpic && state.filterEpic !== 'all');
    const hasActiveFilters = Boolean(
      (state.searchQuery && state.searchQuery.trim().length > 0) ||
      isSprintActive ||
      isPicActive ||
      isTypeActive ||
      isPriorityActive ||
      isEpicActive
    );
    const selectedSprintLabel = isSprintFiltered
      ? (state.filterSprint === 'backlog_pool' ? 'Backlog Pool' : 'Sprint Terpilih')
      : 'Sprint Aktif';
    const selectedSprintName = state.filterSprint === 'backlog_pool'
      ? 'Backlog Pool (Tanpa Sprint)'
      : (selectedSprintObj ? selectedSprintObj.name : `Sprint 1: ${activeProject ? activeProject.name : 'MVP'}`);

    // Columns HTML for 6 Kanban Stages
    const columnsHtml = KANBAN_STAGES.map((stage, stageIdx) => {
      const stageTasks = filteredTasks.filter((t) => getCanonicalStatus(t.status) === stage.primaryStatus);
      const totalHours = stageTasks.reduce((acc, curr) => acc + (Number(curr.estimateHours) || 0), 0);

      const cardsHtml = stageTasks.length === 0
        ? `
          <div class="kanban-empty-col">
            Belum ada tiket
          </div>
        `
        : stageTasks.map((task) => {
            const canonicalStatus = getCanonicalStatus(task.status);
            const assignee = teamMembers.find((m) => m.id === task.assigneeId) || { name: 'Unassigned', avatar: 'UA' };
            const epic = epics.find((e) => e.id === task.epicId);
            const totalSubtasks = (task.subtasks || []).length;
            const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
            const subtaskPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (canonicalStatus === 'Done' ? 100 : 0);

            let typeBadgeClass = 'badge-blue';
            let typeLabel = task.type || 'Task';
            if (task.type === 'Bug') {
              typeBadgeClass = 'badge-red';
              typeLabel = 'Bug';
            } else if (task.type === 'Story' || task.type === 'Feature') {
              typeBadgeClass = 'badge-emerald';
              typeLabel = task.type;
            } else if (task.type === 'Epic') {
              typeBadgeClass = 'badge-purple';
              typeLabel = 'Epic';
            }

            let priorityBadgeClass = 'badge-slate';
            let priorityLabel = task.priority || 'Sedang';
            if (task.priority === 'Hotfix' || task.priority === 'Tertinggi') {
              priorityBadgeClass = 'badge-hot';
              priorityLabel = 'Hotfix';
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

            // Workflow transitions buttons based on Strict Forward-Only rules
            let actionsHtml = '';
            if (canonicalStatus === 'Rejected' || canonicalStatus === 'Done') {
              actionsHtml = `
                <span
                  class="kanban-locked-badge"
                  title="Status akhir (${canonicalStatus}) terkunci dan tidak dapat dikembalikan ke tahap sebelumnya"
                >
                  ${ICONS.lock}
                  <span>Final</span>
                </span>
                <button
                  class="btn-open-detail kanban-detail-btn"
                  data-task-id="${task.id}"
                  title="Buka detail tiket"
                >
                  <span>Detail</span>
                  ${ICONS.arrowRight}
                </button>
              `;
            } else {
              let nextTarget = null;
              let nextTooltip = 'Tidak dapat maju';

              if (canonicalStatus === 'Backlog') {
                nextTarget = 'To Do';
                nextTooltip = 'Selesai analisis & setujui ke To Do (Siap Dikerjakan)';
              } else if (canonicalStatus === 'To Do') {
                nextTarget = 'In Development';
                nextTooltip = 'Ambil tiket dan mulai koding (Maju ke In Development)';
              } else if (canonicalStatus === 'In Development') {
                nextTarget = 'Review & Testing';
                nextTooltip = 'Selesai koding & ajukan PR (Maju ke Review & Testing)';
              } else if (canonicalStatus === 'Review & Testing') {
                nextTarget = 'Done';
                nextTooltip = 'Lolos pengujian dan verifikasi (Maju ke Done)';
              }

              actionsHtml = `
                <button
                  class="btn-open-detail kanban-detail-btn"
                  data-task-id="${task.id}"
                  title="Buka detail tiket"
                >
                  <span>Detail</span>
                  ${ICONS.arrowRight}
                </button>

                <button
                  class="btn-shift-next kanban-shift-btn"
                  data-task-id="${task.id}"
                  data-target-status="${nextTarget || ''}"
                  ${!nextTarget ? 'disabled' : ''}
                  title="${nextTooltip}"
                >
                  ${ICONS.chevronRight}
                </button>

                <button
                  class="btn-quick-reject kanban-reject-btn"
                  data-task-id="${task.id}"
                  data-target-status="Rejected"
                  title="Tolak atau batalkan tiket (Pindah ke Rejected)"
                >
                  ${ICONS.xCircle}
                </button>
              `;
            }

            return `
              <div
                class="kanban-card ${canonicalStatus === 'Rejected' ? 'kanban-card--rejected' : ''} ${canonicalStatus === 'Done' ? 'kanban-card--done' : ''}"
                draggable="true"
                data-task-id="${task.id}"
                data-canonical-status="${canonicalStatus}"
                data-stage-idx="${stageIdx}"
                title="Klik untuk membuka detail tiket atau drag ke kolom tujuan yang diizinkan"
              >
                <!-- 1. Card Header: Grip, Key, Type on Left | Priority & SLA on Right -->
                <div class="kanban-card-top">
                  <div class="kanban-card-top-left">
                    <span class="drag-handle" title="Geser kartu">
                      ${ICONS.grip}
                    </span>
                    <span class="badge badge-slate kanban-card-key">
                      ${task.key}
                    </span>
                    <span class="badge ${typeBadgeClass}" style="font-size:10px;">
                      ${typeLabel}
                    </span>
                  </div>
                  <div class="kanban-card-top-right">
                    <span class="badge ${priorityBadgeClass}" style="font-size:10px;">
                      ${priorityLabel}
                    </span>
                    ${slaBadgeHtml}
                  </div>
                </div>

                <!-- 2. Title -->
                <h4 class="kanban-card-title" title="${(task.title || '').replace(/"/g, '&quot;')}">
                  ${task.title}
                </h4>

                <!-- 3. Project Code & Module/Epic Pill -->
                <div class="kanban-card-meta">
                  <span class="kanban-card-proj-code">${activeProject ? activeProject.code : 'PROJ'}</span>
                  <span class="kanban-card-epic-name" title="${epic ? epic.title : 'Modul Umum'}">
                    ${epic ? epic.title : 'Modul Umum'}
                  </span>
                </div>

                <!-- 4. Structured Hours & Subtasks Progress Block -->
                <div class="kanban-card-stats-box">
                  <div class="kanban-card-stats-row">
                    <span class="kanban-card-hours">
                      <strong>${task.estimateHours || 4} Jam</strong>
                      <span class="kanban-card-logged">(${task.timeLoggedHours || 0}h log)</span>
                    </span>
                    <span class="kanban-card-subtask-label">
                      ${totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} subtask` : '0/0 subtask'}
                    </span>
                  </div>
                  <div class="kanban-card-progress">
                    <div class="kanban-card-progress-bar" style="width: ${subtaskPct}%;"></div>
                  </div>
                </div>

                <!-- 5. Assignee & Action Buttons Footer -->
                <div class="kanban-card-footer">
                  <div class="kanban-card-assignee" title="PIC: ${assignee.name}">
                    <div class="kanban-card-avatar">
                      ${assignee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span class="kanban-card-assignee-name">
                      ${assignee.name.split(' ')[0]}
                    </span>
                  </div>

                  <div class="kanban-card-actions">
                    ${actionsHtml}
                  </div>
                </div>
              </div>
            `;
          }).join('');

      return `
        <div
          class="kanban-column"
          data-stage-id="${stage.id}"
          data-primary-status="${stage.primaryStatus}"
          data-stage-idx="${stageIdx}"
        >
          <!-- Column Sticky Header -->
          <div class="kanban-column-header">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="kanban-column-dot" style="background-color:${stage.color};"></span>
                <span style="font-size:12.5px;font-weight:800;color:var(--text-primary);letter-spacing:-.01em;">
                  ${stage.name}
                </span>
                <span class="kanban-col-info-icon" title="${stage.description}">
                  ${ICONS.info}
                </span>
              </div>
              <span class="badge badge-slate" style="font-size:10px;font-weight:700;">
                ${stageTasks.length}
              </span>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
              <span>${totalHours} Jam Estimasi</span>
              <span style="font-size:10px;font-weight:600;color:${stage.color};">Tahap ${stageIdx + 1}/6</span>
            </div>
          </div>

          <!-- Column Cards Scroll Container (Drop Zone) -->
          <div
            class="kanban-cards-scroll"
            data-stage-id="${stage.id}"
            data-primary-status="${stage.primaryStatus}"
            data-stage-idx="${stageIdx}"
          >
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <!-- Top KPI Summary & Filter Card -->
      <div class="kanban-summary-card">
        <!-- Row 1: Structured KPI Metrics Strip -->
        <div class="kanban-kpi-strip">
          <div class="kanban-kpi-metrics">
            <div class="kanban-kpi-stat">
              <span class="kanban-kpi-label">Total Tiket</span>
              <strong class="kanban-kpi-val">${totalCount} Tiket</strong>
            </div>

            <div class="kanban-kpi-divider"></div>

            <div class="kanban-kpi-stat">
              <span class="kanban-kpi-label">Pengerjaan</span>
              <strong class="kanban-kpi-val kanban-kpi-val--indigo">${inDevelopmentCount} Tiket</strong>
            </div>

            <div class="kanban-kpi-divider"></div>

            <div class="kanban-kpi-stat">
              <span class="kanban-kpi-label">Selesai</span>
              <strong class="kanban-kpi-val kanban-kpi-val--emerald">${doneCount} (${completionPct}%)</strong>
            </div>

            <div class="kanban-kpi-divider"></div>

            <div class="kanban-kpi-stat kanban-kpi-stat--sprint" id="kanban-kpi-sprint-card" style="cursor: pointer;" title="Klik untuk fokus memfilter sprint aktif">
              <span class="kanban-kpi-label">${selectedSprintLabel}</span>
              <strong class="kanban-kpi-sprint-text">${selectedSprintName}</strong>
            </div>

            <div class="kanban-kpi-divider"></div>

            <!-- View Mode Switcher (Papan Kanban & List Tabel) di sebelah teks Sprint Aktif -->
            <div class="kanban-view-switcher" title="Beralih mode tampilan pekerjaan">
              <button
                type="button"
                class="kanban-view-btn btn-toggle-view ${this.viewMode === 'kanban' ? 'active' : ''}"
                data-view="kanban"
                title="Tampilan Papan Kanban (6 Kolom Workflow Sesuai SOP & Drag-Drop)"
              >
                ${ICONS.kanban}
                <span>Papan Kanban</span>
              </button>
              <button
                type="button"
                class="kanban-view-btn btn-toggle-view ${this.viewMode === 'table' ? 'active' : ''}"
                data-view="table"
                title="Tampilan List Tabel (Daftar Terstruktur & Pengurutan)"
              >
                ${ICONS.table}
                <span>List Tabel</span>
              </button>
            </div>
          </div>

          ${criticalBugs.length > 0 ? `
            <div class="kanban-kpi-alert kanban-kpi-alert--danger" title="${criticalBugs.length} tiket Bug S1/S2 atau Hotfix membutuhkan penanganan segera">
              ${ICONS.alertTriangle}
              <span>${criticalBugs.length} Bug Kritis S1/S2 Menunggu Penanganan</span>
            </div>
          ` : `
            <div class="kanban-kpi-alert kanban-kpi-alert--safe">
              ${ICONS.checkCircle}
              <span>0 Bug Kritis S1/S2</span>
            </div>
          `}
        </div>

        <!-- Row 2: Filter Controls Row (Pencarian Cepat & Filter Dropdown Tanpa Tabrakan) -->
        <div class="kanban-filter-row">
          <!-- Search input -->
          <div class="kanban-search-wrap">
            <span class="kanban-search-icon">
              ${ICONS.search}
            </span>
            <input
              id="kanban-search-box"
              type="text"
              class="form-input kanban-search-input"
              placeholder="Cari tiket, PIC, modul..."
              value="${state.searchQuery || ''}"
            />
          </div>

          <!-- Select dropdowns -->
          <div class="kanban-filters-group">
            <!-- Sprint Filter Dropdown -->
            <div class="kanban-filter-item ${isSprintActive ? 'kanban-filter-item--active' : ''}" title="Filter tiket berdasarkan Sprint kerja">
              <span class="kanban-filter-icon">${ICONS.calendar}</span>
              <span class="kanban-filter-label">Sprint</span>
              <select id="kanban-filter-sprint" class="form-select kanban-filter-select kanban-filter-select--sprint">
                <option value="all" ${!isSprintActive ? 'selected' : ''}>Semua</option>
                ${projectSprints.map((s) => {
                  const shortSprint = s.name.split(':')[0].trim();
                  const statusTag = s.status === 'active' ? 'Aktif' : s.status === 'completed' ? 'Selesai' : 'Rencana';
                  return `<option value="${s.id}" title="${s.name}" ${state.filterSprint === s.id ? 'selected' : ''}>${shortSprint} (${statusTag})</option>`;
                }).join('')}
                <option value="backlog_pool" title="Backlog Pool (Tanpa Sprint)" ${state.filterSprint === 'backlog_pool' ? 'selected' : ''}>Backlog Pool</option>
              </select>
            </div>

            <!-- PIC Filter Dropdown -->
            <div class="kanban-filter-item ${isPicActive ? 'kanban-filter-item--active' : ''}" title="Filter tiket berdasarkan Penanggung Jawab (PIC)">
              <span class="kanban-filter-icon">${ICONS.user}</span>
              <span class="kanban-filter-label">PIC</span>
              <select id="kanban-filter-pic" class="form-select kanban-filter-select kanban-filter-select--pic">
                <option value="all" ${!isPicActive ? 'selected' : ''}>Semua</option>
                ${teamMembers.map((m) => {
                  const firstName = m.name.split(' ')[0];
                  const shortRole = m.role ? m.role.split(' ')[0] : '';
                  return `<option value="${m.id}" title="${m.name} (${m.role})" ${state.filterAssignee === m.id ? 'selected' : ''}>${firstName}${shortRole ? ` (${shortRole})` : ''}</option>`;
                }).join('')}
              </select>
            </div>

            <!-- Tipe Filter Dropdown -->
            <div class="kanban-filter-item ${isTypeActive ? 'kanban-filter-item--active' : ''}" title="Filter tiket berdasarkan Tipe">
              <span class="kanban-filter-icon">${ICONS.tag}</span>
              <span class="kanban-filter-label">Tipe</span>
              <select id="kanban-filter-type" class="form-select kanban-filter-select kanban-filter-select--type">
                <option value="all" ${!isTypeActive ? 'selected' : ''}>Semua</option>
                <option value="Feature" ${state.filterType === 'Feature' ? 'selected' : ''}>Feature</option>
                <option value="Story" ${state.filterType === 'Story' ? 'selected' : ''}>Story</option>
                <option value="Task" ${state.filterType === 'Task' ? 'selected' : ''}>Task</option>
                <option value="Bug" ${state.filterType === 'Bug' ? 'selected' : ''}>Bug</option>
              </select>
            </div>

            <!-- Prioritas Filter Dropdown -->
            <div class="kanban-filter-item ${isPriorityActive ? 'kanban-filter-item--active' : ''}" title="Filter tiket berdasarkan Prioritas">
              <span class="kanban-filter-icon">${ICONS.flag}</span>
              <span class="kanban-filter-label">Prioritas</span>
              <select id="kanban-filter-priority" class="form-select kanban-filter-select kanban-filter-select--priority">
                <option value="all" ${!isPriorityActive ? 'selected' : ''}>Semua</option>
                <option value="Hotfix" ${state.filterPriority === 'Hotfix' ? 'selected' : ''}>Hotfix</option>
                <option value="Tinggi" ${state.filterPriority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
                <option value="Sedang" ${state.filterPriority === 'Sedang' ? 'selected' : ''}>Sedang</option>
                <option value="Rendah" ${state.filterPriority === 'Rendah' ? 'selected' : ''}>Rendah</option>
              </select>
            </div>

            <!-- Modul (Epic) Filter Dropdown -->
            <div class="kanban-filter-item ${isEpicActive ? 'kanban-filter-item--active' : ''}" title="Filter tiket berdasarkan Modul / Epik">
              <span class="kanban-filter-icon">${ICONS.layers}</span>
              <span class="kanban-filter-label">Modul</span>
              <select id="kanban-filter-epic" class="form-select kanban-filter-select kanban-filter-select--epic">
                <option value="all" ${!isEpicActive ? 'selected' : ''}>Semua</option>
                ${epics.map((e) => {
                  const epicKeyShort = (e.key || '').replace(/^[^-]+-/, '');
                  const shortTitle = (e.title || '').length > 18 ? e.title.substring(0, 16) + '...' : (e.title || '');
                  return `<option value="${e.id}" title="${e.title}" ${state.filterEpic === e.id ? 'selected' : ''}>${epicKeyShort ? `${epicKeyShort}: ` : ''}${shortTitle}</option>`;
                }).join('')}
              </select>
            </div>

            ${hasActiveFilters ? `
              <button id="kanban-reset-filters" class="btn btn-secondary btn-sm kanban-reset-btn" title="Kembalikan semua filter ke default">
                ${ICONS.rotateCcw}
                <span>Reset</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Main Body: Papan Kanban atau List Tabel Sesuai Mode Aktif -->
      ${this.viewMode === 'kanban' ? `
        <!-- Kanban Columns Board Area -->
        <div class="kanban-board-scroll">
          ${columnsHtml}
        </div>
      ` : `
        <!-- List Tabel Area -->
        ${this.renderTableView(filteredTasks, teamMembers, epics, activeProject)}
      `}
    `;

    this.attachEvents();
  }

  renderTableView(filteredTasks, teamMembers, epics, activeProject) {
    const priorityWeight = {
      'Hotfix': 5,
      'Tertinggi': 4,
      'Tinggi': 3,
      'Sedang': 2,
      'Rendah': 1
    };

    const getStageForTask = (task) => {
      const canonical = getCanonicalStatus(task.status);
      const stage = KANBAN_STAGES.find((s) => s.primaryStatus === canonical);
      return stage || KANBAN_STAGES[0];
    };

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let valA, valB;
      switch (this.sortField) {
        case 'key':
          valA = a.key || '';
          valB = b.key || '';
          return this.sortAsc ? valA.localeCompare(valB, undefined, { numeric: true }) : valB.localeCompare(valA, undefined, { numeric: true });
        case 'title':
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
          return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'epic': {
          const epicA = (epics.find((e) => e.id === a.epicId)?.title || '').toLowerCase();
          const epicB = (epics.find((e) => e.id === b.epicId)?.title || '').toLowerCase();
          return this.sortAsc ? epicA.localeCompare(epicB) : epicB.localeCompare(epicA);
        }
        case 'type':
          valA = a.type || '';
          valB = b.type || '';
          return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'status': {
          const idxA = KANBAN_STAGES.indexOf(getStageForTask(a));
          const idxB = KANBAN_STAGES.indexOf(getStageForTask(b));
          return this.sortAsc ? idxA - idxB : idxB - idxA;
        }
        case 'priority': {
          const weightA = priorityWeight[a.priority] || 0;
          const weightB = priorityWeight[b.priority] || 0;
          return this.sortAsc ? weightA - weightB : weightB - weightA;
        }
        case 'assignee': {
          const nameA = (teamMembers.find((m) => m.id === a.assigneeId)?.name || '').toLowerCase();
          const nameB = (teamMembers.find((m) => m.id === b.assigneeId)?.name || '').toLowerCase();
          return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        case 'estimateHours':
          valA = Number(a.estimateHours) || 0;
          valB = Number(b.estimateHours) || 0;
          return this.sortAsc ? valA - valB : valB - valA;
        case 'subtasks': {
          const totalA = (a.subtasks || []).length;
          const doneA = (a.subtasks || []).filter((s) => s.completed).length;
          const pctA = totalA > 0 ? doneA / totalA : 0;
          const totalB = (b.subtasks || []).length;
          const doneB = (b.subtasks || []).filter((s) => s.completed).length;
          const pctB = totalB > 0 ? doneB / totalB : 0;
          return this.sortAsc ? pctA - pctB : pctB - pctA;
        }
        default:
          return 0;
      }
    });

    const getSortIndicator = (field) => {
      if (this.sortField !== field) {
        return `<span style="opacity:0.35;">${ICONS.arrowUpDown}</span>`;
      }
      return `<span style="color:var(--indigo-600);">${this.sortAsc ? '▲' : '▼'}</span>`;
    };

    const rowsHtml = sortedTasks.length === 0
      ? `
        <tr>
          <td colspan="10" class="kanban-table-empty">
            <div style="padding: 32px 16px; text-align: center;">
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                Tidak ada tiket pekerjaan yang cocok
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                Ubah kueri pencarian atau reset filter untuk menampilkan pekerjaan.
              </div>
            </div>
          </td>
        </tr>
      `
      : sortedTasks.map((task) => {
          const assignee = teamMembers.find((m) => m.id === task.assigneeId) || { name: 'Unassigned', avatar: 'UA' };
          const epic = epics.find((e) => e.id === task.epicId);
          const stage = getStageForTask(task);
          const stageIdx = KANBAN_STAGES.indexOf(stage);
          const canonicalStatus = getCanonicalStatus(task.status);
          const totalSubtasks = (task.subtasks || []).length;
          const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
          const subtaskPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (canonicalStatus === 'Done' ? 100 : 0);

          let typeBadgeClass = 'badge-blue';
          let typeLabel = task.type || 'Task';
          if (task.type === 'Bug') {
            typeBadgeClass = 'badge-red';
            typeLabel = 'Bug';
          } else if (task.type === 'Story' || task.type === 'Feature') {
            typeBadgeClass = 'badge-emerald';
            typeLabel = task.type;
          } else if (task.type === 'Epic') {
            typeBadgeClass = 'badge-purple';
            typeLabel = 'Epic';
          }

          let priorityBadgeClass = 'badge-slate';
          let priorityLabel = task.priority || 'Sedang';
          if (task.priority === 'Hotfix' || task.priority === 'Tertinggi') {
            priorityBadgeClass = 'badge-hot';
            priorityLabel = 'Hotfix';
          } else if (task.priority === 'Tinggi') {
            priorityBadgeClass = 'badge-high';
            priorityLabel = 'Tinggi';
          } else if (task.priority === 'Sedang') {
            priorityBadgeClass = 'badge-medium';
            priorityLabel = 'Sedang';
          }

          const initials = assignee.name.split(' ').map((n) => n[0]).slice(0, 2).join('');

          // Table action buttons (Strict Forward-Only)
          let actionsHtml = '';
          if (canonicalStatus === 'Rejected' || canonicalStatus === 'Done') {
            actionsHtml = `
              <span
                class="kanban-locked-badge"
                title="Status akhir (${canonicalStatus}) terkunci dan tidak dapat dikembalikan ke tahap sebelumnya"
              >
                ${ICONS.lock}
                <span>Final</span>
              </span>
              <button
                class="btn-open-detail kanban-detail-btn"
                data-task-id="${task.id}"
                title="Lihat detail lengkap pekerjaan"
              >
                <span>Detail</span>
                ${ICONS.arrowRight}
              </button>
            `;
          } else {
            let nextTarget = null;
            if (canonicalStatus === 'Backlog') {
              nextTarget = 'To Do';
            } else if (canonicalStatus === 'To Do') {
              nextTarget = 'In Development';
            } else if (canonicalStatus === 'In Development') {
              nextTarget = 'Review & Testing';
            } else if (canonicalStatus === 'Review & Testing') {
              nextTarget = 'Done';
            }

            actionsHtml = `
              <button
                class="btn-open-detail kanban-detail-btn"
                data-task-id="${task.id}"
                title="Lihat detail lengkap pekerjaan"
              >
                <span>Detail</span>
                ${ICONS.arrowRight}
              </button>

              <button
                class="btn-shift-next kanban-shift-btn"
                data-task-id="${task.id}"
                data-target-status="${nextTarget || ''}"
                ${!nextTarget ? 'disabled' : ''}
                title="${nextTarget ? `Lanjut ke ${nextTarget}` : 'Tidak dapat maju'}"
              >
                ${ICONS.chevronRight}
              </button>

              <button
                class="btn-quick-reject kanban-reject-btn"
                data-task-id="${task.id}"
                data-target-status="Rejected"
                title="Tolak / batalkan tiket"
              >
                ${ICONS.xCircle}
              </button>
            `;
          }

          return `
            <tr class="kanban-table-row" data-task-id="${task.id}" title="Klik baris untuk membuka detail pekerjaan">
              <!-- 1. Kunci Tiket -->
              <td style="width: 100px;">
                <span class="kanban-table-key-link" data-task-id="${task.id}" title="Klik untuk membuka detail">
                  ${task.key}
                </span>
              </td>

              <!-- 2. Ringkasan Judul -->
              <td style="min-width: 260px;">
                <div style="font-weight: 700; color: var(--text-primary); line-height: 1.35; margin-bottom: 2px;">
                  ${task.title}
                </div>
                ${task.description ? `
                  <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3; max-width: 480px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${task.description}
                  </div>
                ` : ''}
              </td>

              <!-- 3. Modul / Epic -->
              <td style="width: 140px;">
                <span class="kanban-table-epic-tag" title="${epic ? epic.title : 'Modul Umum'}">
                  ${epic ? epic.title : 'Modul Umum'}
                </span>
              </td>

              <!-- 4. Tipe -->
              <td style="width: 90px;">
                <span class="badge ${typeBadgeClass}" style="font-size: 10.5px;">
                  ${typeLabel}
                </span>
              </td>

              <!-- 5. Tahap Alur Kerja (Status) -->
              <td style="width: 140px;">
                <span
                  class="kanban-stage-lozenge"
                  style="background: ${stage.color}1f; color: ${stage.color}; border: 1px solid ${stage.color}3f;"
                  title="Tahap ${stageIdx + 1}/6: ${stage.name} - ${stage.description}"
                >
                  <span class="kanban-stage-dot" style="background-color: ${stage.color};"></span>
                  <span>${stage.name}</span>
                </span>
              </td>

              <!-- 6. Prioritas -->
              <td style="width: 95px;">
                <span class="badge ${priorityBadgeClass}" style="font-size: 10.5px;">
                  ${priorityLabel}
                </span>
              </td>

              <!-- 7. PIC -->
              <td style="width: 140px;">
                <div class="kanban-table-assignee" title="PIC: ${assignee.name}">
                  <div class="kanban-table-avatar">${initials}</div>
                  <span style="font-size: 11.5px; font-weight: 600; color: var(--text-primary);">${assignee.name}</span>
                </div>
              </td>

              <!-- 8. Estimasi Jam -->
              <td style="width: 105px; font-family: var(--font-mono, monospace); font-size: 11.5px;">
                <strong style="color: var(--text-primary);">${task.estimateHours || 4}h</strong>
                <span style="color: var(--text-muted); font-size: 10.5px;">(${task.timeLoggedHours || 0}h log)</span>
              </td>

              <!-- 9. Subtask Progress -->
              <td style="width: 120px;">
                <div class="kanban-table-progress-wrap">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="kanban-table-progress-text">${completedSubtasks}/${totalSubtasks}</span>
                    <span class="kanban-table-progress-text" style="font-weight:700;">${subtaskPct}%</span>
                  </div>
                  <div class="kanban-table-progress-bar-bg">
                    <div class="kanban-table-progress-bar-fill" style="width: ${subtaskPct}%;"></div>
                  </div>
                </div>
              </td>

              <!-- 10. Aksi Cepat (Shift & Detail) -->
              <td style="width: 140px; text-align: right;" onclick="event.stopPropagation();">
                <div class="kanban-card-actions" style="justify-content: flex-end;">
                  ${actionsHtml}
                </div>
              </td>
            </tr>
          `;
        }).join('');

    return `
      <div class="kanban-table-container">
        <!-- Sub-header bar of table -->
        <div class="kanban-table-header-info">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:700;color:var(--text-primary);">Daftar Terstruktur Pekerjaan</span>
            <span class="badge badge-slate" style="font-size:10.5px;">${sortedTasks.length} Tiket</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
            Urutan: <strong style="color:var(--indigo-600);">${this.sortField.toUpperCase()}</strong> (${this.sortAsc ? 'Menaik ▲' : 'Menurun ▼'})
          </div>
        </div>

        <div class="kanban-table-scroll">
          <table class="kanban-data-table">
            <thead>
              <tr>
                <th class="sortable kanban-th-sort" data-sort="key" style="width:100px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>KUNCI</span>
                    ${getSortIndicator('key')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="title" style="min-width:260px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>RINGKASAN PEKERJAAN</span>
                    ${getSortIndicator('title')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="epic" style="width:140px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>MODUL / EPIC</span>
                    ${getSortIndicator('epic')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="type" style="width:90px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>TIPE</span>
                    ${getSortIndicator('type')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="status" style="width:140px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>TAHAP ALUR</span>
                    ${getSortIndicator('status')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="priority" style="width:95px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>PRIORITAS</span>
                    ${getSortIndicator('priority')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="assignee" style="width:140px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>PIC / ASSIGNEE</span>
                    ${getSortIndicator('assignee')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="estimateHours" style="width:105px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>ESTIMASI</span>
                    ${getSortIndicator('estimateHours')}
                  </div>
                </th>
                <th class="sortable kanban-th-sort" data-sort="subtasks" style="width:120px;">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span>SUBTASK</span>
                    ${getSortIndicator('subtasks')}
                  </div>
                </th>
                <th style="width:140px;text-align:right;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Dual View Mode Toggle buttons
    this.container.querySelectorAll('.btn-toggle-view').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view && view !== this.viewMode) {
          this.viewMode = view;
          this.render();
        }
      });
    });

    // Table Header Sort buttons
    this.container.querySelectorAll('.kanban-th-sort').forEach((th) => {
      th.addEventListener('click', () => {
        const sortField = th.dataset.sort;
        if (sortField) {
          if (this.sortField === sortField) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortField = sortField;
            this.sortAsc = true;
          }
          this.render();
        }
      });
    });

    // Table Row click -> Open Task Detail
    this.container.querySelectorAll('.kanban-table-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (
          e.target.closest('.btn-shift-prev') ||
          e.target.closest('.btn-shift-next') ||
          e.target.closest('.btn-open-detail') ||
          e.target.closest('.btn-quick-reject') ||
          e.target.closest('.btn-restore-task') ||
          e.target.closest('.btn-reopen-task') ||
          e.target.closest('.kanban-table-key-link')
        ) {
          return;
        }
        const taskId = row.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Table key link click -> Open Task Detail
    this.container.querySelectorAll('.kanban-table-key-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = link.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#kanban-search-box');
    if (searchInput) {
      if (this._lastSearchFocused) {
        searchInput.focus();
        const len = searchInput.value.length;
        searchInput.setSelectionRange(len, len);
        this._lastSearchFocused = false;
      }
      searchInput.addEventListener('focus', () => {
        this._isSearchFocused = true;
      });
      searchInput.addEventListener('blur', () => {
        this._isSearchFocused = false;
      });
      searchInput.addEventListener('input', (e) => {
        this._lastSearchFocused = true;
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

    // Sprint Filter Dropdown
    const sprintSelect = this.container.querySelector('#kanban-filter-sprint');
    if (sprintSelect) {
      sprintSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        store.setState({ filterSprint: val, selectedSprintId: val });
      });
    }

    // Interactive Sprint KPI Card Click -> Focus to Active Sprint
    const sprintKpiCard = this.container.querySelector('#kanban-kpi-sprint-card');
    if (sprintKpiCard) {
      sprintKpiCard.addEventListener('click', () => {
        const state = store.getState();
        const activeProj = store.getActiveProject();
        const activeSprint = (state.sprints || []).find(
          (s) => activeProj && s.projectId === activeProj.id && s.status === 'active'
        );
        if (activeSprint) {
          const nextVal = state.filterSprint === activeSprint.id ? 'all' : activeSprint.id;
          store.setState({ filterSprint: nextVal, selectedSprintId: nextVal });
        }
      });
    }

    const resetBtn = this.container.querySelector('#kanban-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        store.resetFilters();
      });
    }

    // Card click -> Open Task Detail Workspace View (Kanban mode)
    this.container.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (
          e.target.closest('.btn-shift-prev') ||
          e.target.closest('.btn-shift-next') ||
          e.target.closest('.btn-open-detail') ||
          e.target.closest('.btn-quick-reject') ||
          e.target.closest('.btn-restore-task') ||
          e.target.closest('.btn-reopen-task')
        ) {
          return;
        }
        const taskId = card.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Detail button inside card or table row
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

    // Shift next button (Strict Forward-Only: works for both Kanban cards and Table rows)
    this.container.querySelectorAll('.btn-shift-next').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const targetStatus = btn.dataset.targetStatus;
        if (taskId && targetStatus) {
          store.updateTaskStatus(taskId, targetStatus, `Dipindahkan maju ke ${targetStatus}`);
        }
      });
    });

    // Quick reject button (Backlog, To Do, In Development, Review & Testing -> Rejected via SweetAlert2)
    this.container.querySelectorAll('.btn-quick-reject').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const confirmed = await swalConfirm({
          title: 'Tolak / Batalkan Tiket?',
          html: `Apakah Anda yakin ingin menolak tiket <b>[${task.key}] ${task.title}</b>?<br><br><small style="color:#dc2626;">Perhatian: Tiket yang dipindahkan ke <b>Rejected</b> akan terkunci permanen dan tidak dapat dikembalikan ke status sebelumnya.</small>`,
          icon: 'warning',
          confirmText: 'Ya, Tolak Tiket',
          cancelText: 'Batal',
          confirmColor: '#dc2626'
        });

        if (confirmed) {
          const ok = store.updateTaskStatus(taskId, 'Rejected', 'Ditolak / Dibatalkan oleh pengguna via Aksi Cepat');
          if (ok) {
            swalSuccess('Tiket Ditolak', `Tiket <b>${task.key}</b> telah dipindahkan ke status <b>Rejected</b>.`);
          }
        }
      });
    });

    // Native Drag and Drop (Kanban mode only)
    if (this.viewMode === 'kanban') {
      this.container.querySelectorAll('.kanban-card').forEach((card) => {
        card.addEventListener('dragstart', (e) => {
          this.draggedTaskId = card.dataset.taskId;
          const draggedTask = store.getState().tasks.find((t) => t.id === this.draggedTaskId);
          const sourceStatus = getCanonicalStatus(draggedTask ? draggedTask.status : 'Backlog');
          const rule = WORKFLOW_TRANSITION_RULES[sourceStatus] || { allowed: [] };
          const allowedTargets = rule.allowed || [];

          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', this.draggedTaskId);

          // Highlight target columns
          this.container.querySelectorAll('.kanban-column').forEach((col) => {
            const primaryStatus = col.dataset.primaryStatus;
            if (primaryStatus === sourceStatus) {
              col.classList.add('col-target-current');
            } else if (allowedTargets.includes(primaryStatus)) {
              col.classList.add('col-target-allowed');
            } else {
              col.classList.add('col-target-forbidden');
            }
          });
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          this.container.querySelectorAll('.kanban-column').forEach((col) => {
            col.classList.remove('col-target-current', 'col-target-allowed', 'col-target-forbidden');
          });
          this.container.querySelectorAll('.kanban-cards-scroll').forEach((el) => {
            el.classList.remove('drag-over', 'drag-over-allowed', 'drag-over-forbidden');
          });
        });
      });

      this.container.querySelectorAll('.kanban-cards-scroll').forEach((dropZone) => {
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          // Keep dropEffect='move' so browser allows drop event to fire and trigger SweetAlert2 validation on forbidden columns
          e.dataTransfer.dropEffect = 'move';
          const targetStatus = dropZone.dataset.primaryStatus;
          const draggedTask = store.getState().tasks.find((t) => t.id === this.draggedTaskId);
          const sourceStatus = getCanonicalStatus(draggedTask ? draggedTask.status : 'Backlog');
          const validation = validateStatusTransition(sourceStatus, targetStatus);

          if (validation.allowed) {
            dropZone.classList.add('drag-over-allowed');
            dropZone.classList.remove('drag-over-forbidden');
          } else {
            dropZone.classList.add('drag-over-forbidden');
            dropZone.classList.remove('drag-over-allowed');
          }
        });

        dropZone.addEventListener('dragleave', () => {
          dropZone.classList.remove('drag-over', 'drag-over-allowed', 'drag-over-forbidden');
        });

        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('drag-over', 'drag-over-allowed', 'drag-over-forbidden');
          const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
          const targetStatus = dropZone.dataset.primaryStatus;

          if (taskId && targetStatus) {
            const success = store.updateTaskStatus(
              taskId,
              targetStatus,
              `Drag & drop ke kolom ${targetStatus}`
            );

            if (!success) {
              // Trigger visual error shake on the card
              const cardEl = this.container.querySelector(`.kanban-card[data-task-id="${taskId}"]`);
              if (cardEl) {
                cardEl.classList.add('card-shake-error');
                setTimeout(() => cardEl.classList.remove('card-shake-error'), 800);
              }
            }
          }
        });
      });
    }
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (this.stepper && typeof this.stepper.destroy === 'function') {
      this.stepper.destroy();
    }
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
