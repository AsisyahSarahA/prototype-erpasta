/**
 * BacklogView Component (100% Native Vanilla JS ES Module)
 *
 * Standar ASTACODE CRM & Enterprise Software House UI/UX:
 * - Top Sticky Unified Header: Breadcrumbs, Status Pill, KPI Metrics, Live Search & Role/Type Chips
 * - Left Collapsible Epics Rail: Clean Progress Bars, Epic Count Badges, 1-Click Interactive Filtering
 * - 5-Role Developer Capacity Matrix: Aldyana (Frontend), Jaka (Backend), Parhan (QA), Azi (Fullstack), Asisyah (PM)
 * - Tri-Color Story Points & Hours Breakdown (To Do, In Progress, Done)
 * - Proportional Active Sprint & Backlog Pool Containers with Independent & Global Scroll
 * - Seamless Integration with TaskDetailView and CreateTaskModal
 */

import { store } from "../../state/store.js";
import { Icons } from "../../utils/icons.js";

export class BacklogView {
  constructor(options = {}) {
    this.element = document.createElement("div");
    this.element.className = "backlog-view-container";

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenCreateTask = options.onOpenCreateTask || (() => store.openCreateTaskModal());

    this.filterAssignee = "all";
    this.filterEpic = "all";
    this.filterType = "all";
    this.searchQuery = "";
    this.isEpicsPanelOpen = true;
    this.isSprintCollapsed = false;
    this.isBacklogCollapsed = false;
    this.isWorkloadCollapsed = false;
    this.isCreateSprintModalOpen = false;
    this.isCreateEpicModalOpen = false;
    this.sprintDurationDays = 14;
    this.selectedEpicColor = "#4f46e5";

    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && (this.isCreateSprintModalOpen || this.isCreateEpicModalOpen)) {
        this.isCreateSprintModalOpen = false;
        this.isCreateEpicModalOpen = false;
        this.render();
      }
    });

    store.subscribe(() => {
      // Re-render only if current view is backlog to avoid redundant processing
      if (store.getState().activeTab === "backlog") {
        this.render();
      }
    });
  }

  getElement() {
    return this.element;
  }

  getRoleBadge(roleName = "") {
    const r = (roleName || "").toLowerCase();
    if (r.includes("backend")) {
      return { label: "Backend Dev", bg: "rgba(99, 102, 241, 0.1)", color: "#4f46e5" };
    }
    if (r.includes("frontend")) {
      return { label: "Frontend Dev", bg: "rgba(6, 182, 212, 0.1)", color: "#0891b2" };
    }
    if (r.includes("qa") || r.includes("test")) {
      return { label: "QA Engineer", bg: "rgba(16, 185, 129, 0.1)", color: "#059669" };
    }
    if (r.includes("manajer") || r.includes("manager") || r.includes("pm")) {
      return { label: "Project Manajer", bg: "rgba(245, 158, 11, 0.1)", color: "#d97706" };
    }
    return { label: "Full stack", bg: "rgba(139, 92, 246, 0.1)", color: "#7c3aed" };
  }

  getStatusBadge(status) {
    switch (status) {
      case "Selesai":
      case "Deploy Production":
      case "Dipantau":
        return { label: "SELESAI", bg: "rgba(16, 185, 129, 0.12)", color: "#059669" };
      case "In Progress":
      case "Diperbaiki Agen":
        return { label: "IN PROGRESS", bg: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" };
      case "In Review":
      case "Menunggu Persetujuan":
        return { label: "IN REVIEW", bg: "rgba(245, 158, 11, 0.12)", color: "#d97706" };
      case "QA/Testing":
      case "Deploy Staging":
        return { label: "QA STAGING", bg: "rgba(139, 92, 246, 0.12)", color: "#7c3aed" };
      case "Perlu Manual":
      case "Ditolak":
        return { label: "PERLU MANUAL", bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" };
      default:
        return { label: "TO DO", bg: "var(--bg-secondary, #f1f5f9)", color: "var(--text-secondary, #64748b)" };
    }
  }

  escapeHtml(text = "") {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const projectTasks = store.getProjectTasks();
    const projectSprints = (state.sprints || []).filter((s) => s.projectId === state.selectedProjectId);
    const projectEpics = store.getProjectEpics();
    const teamMembers = state.teamMembers || [];

    const activeSprint = projectSprints.find((s) => s.status === "active") ||
      projectSprints[0] || {
        id: "sprint-default",
        name: `${activeProject?.code || "PRJ"} Sprint 1 (Aktif)`,
        startDate: "12 Okt 2026",
        endDate: "26 Okt 2026",
      };

    const matchesFilters = (t) => {
      if (this.filterAssignee !== "all" && t.assigneeId !== this.filterAssignee) return false;
      if (this.filterEpic !== "all") {
        if (this.filterEpic === "none") {
          if (t.epicId) return false;
        } else if (t.epicId !== this.filterEpic) {
          return false;
        }
      }
      if (this.filterType !== "all") {
        if (this.filterType === "Bug" && t.type !== "Bug") return false;
        if (this.filterType !== "Bug" && t.type !== this.filterType) return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchesKey = (t.key || "").toLowerCase().includes(q);
        const matchesTitle = (t.title || "").toLowerCase().includes(q);
        if (!matchesKey && !matchesTitle) return false;
      }
      return true;
    };

    const activeSprintTasks = projectTasks.filter((t) => t.sprintId === activeSprint?.id && matchesFilters(t));
    const backlogPoolTasks = projectTasks.filter((t) => (!t.sprintId || t.sprintId !== activeSprint?.id) && matchesFilters(t));

    // Calculate story points / hours breakdown
    const calcBreakdown = (taskList) => {
      let todo = 0,
        inprog = 0,
        done = 0;
      taskList.forEach((t) => {
        const h = Number(t.estimateHours) || 1;
        if (t.status === "Selesai" || t.status === "Deploy Production" || t.status === "Dipantau") {
          done += h;
        } else if (["In Progress", "In Review", "QA/Testing", "Deploy Staging", "Diperbaiki Agen"].includes(t.status)) {
          inprog += h;
        } else {
          todo += h;
        }
      });
      return { todo, inprog, done, total: todo + inprog + done };
    };

    const sprintPoints = calcBreakdown(activeSprintTasks);
    const backlogPoints = calcBreakdown(backlogPoolTasks);

    // KPI summary metrics
    const totalSprintHours = sprintPoints.total;
    const totalBacklogHours = backlogPoints.total;
    const allTotalTasks = projectTasks.length;
    const allTotalHours = projectTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 1), 0);
    const criticalBugs = projectTasks.filter((t) => t.type === "Bug" && (t.priority === "Hotfix" || t.priority === "Tertinggi"));
    const selectedEpicObj = projectEpics.find((e) => e.id === this.filterEpic);
    const selectedMemberObj = teamMembers.find((m) => m.id === this.filterAssignee);

    this.element.innerHTML = `
      <div class="backlog-root">
        
        <!-- 1. Top Sticky Unified Header -->
        <header class="backlog-top-header">
          
          <!-- Baris 1: Breadcrumbs, Title & Action Buttons -->
          <div class="backlog-header-main-row">
            <div class="backlog-header-left">
              <div class="backlog-breadcrumbs">
                <span>Modul Proyek</span>
                <span>/</span>
                <span>${this.escapeHtml(activeProject?.name || "Sistem Perpustakaan Digital Kampus")}</span>
                <span>/</span>
                <span class="crumb-current">Backlog &amp; Sprints</span>
              </div>
              <div class="backlog-title-wrap">
                <h1 class="backlog-page-title">Backlog &amp; Perencanaan Sprint</h1>
                <span class="backlog-active-pill">
                  <span style="font-size: 8px;">●</span>
                  <span>${this.escapeHtml(activeSprint?.name || `${activeProject?.code || "PRJ"} Sprint 1`)} Aktif</span>
                </span>
              </div>
            </div>

            <div class="backlog-header-actions">
              <button id="createSprintBtn" class="btn btn-secondary" style="font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-lg);">
                ${Icons.plus("", 13)}
                <span>Buat Sprint</span>
              </button>

              <button id="completeSprintBtn" class="btn btn-secondary" style="font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-lg);">
                ${Icons.checkCircle("", 13)}
                <span>Selesaikan Sprint</span>
              </button>

              <button id="openCreateTaskBacklogBtn" class="btn btn-primary" style="font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: var(--radius-lg);">
                ${Icons.plus("", 13)}
                <span>Buat Tiket</span>
              </button>
            </div>
          </div>

          <!-- Baris 2: KPI Metrics Summary Bar (Matching CRM & Kanban) -->
          <div class="backlog-kpi-bar">
            <div class="backlog-kpi-group">
              <div class="backlog-kpi-item">
                <span class="backlog-kpi-label">Total Tiket:</span>
                <span class="backlog-kpi-val">${allTotalTasks} Tiket (${allTotalHours} Jam)</span>
              </div>

              <div class="backlog-kpi-divider"></div>

              <div class="backlog-kpi-item">
                <span class="backlog-kpi-label">Sprint Aktif:</span>
                <span class="backlog-kpi-val" style="color: var(--indigo-600);">${activeSprintTasks.length} Tiket (${totalSprintHours}h)</span>
              </div>

              <div class="backlog-kpi-divider"></div>

              <div class="backlog-kpi-item">
                <span class="backlog-kpi-label">Backlog Pool:</span>
                <span class="backlog-kpi-val" style="color: var(--text-secondary);">${backlogPoolTasks.length} Tiket (${totalBacklogHours}h)</span>
              </div>

              <div class="backlog-kpi-divider"></div>

              <div class="backlog-kpi-item">
                <span class="backlog-kpi-label">Selesai di Sprint:</span>
                <span class="backlog-kpi-val" style="color: var(--emerald-600);">
                  ${activeSprintTasks.filter((t) => t.status === "Selesai" || t.status === "Deploy Production").length} Tiket (${sprintPoints.done}h)
                </span>
              </div>
            </div>

            ${
              criticalBugs.length > 0
                ? `
              <div style="display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: var(--radius-full); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: var(--red-500); font-size: 11px; font-weight: 700;">
                ${Icons.flame("", 12)}
                <span>${criticalBugs.length} Tiket Bug Kritis / Hotfix</span>
              </div>
            `
                : ""
            }
          </div>

          <!-- Baris 3: Controls Bar (Epics Toggle, Search Input & Quick Filters) -->
          <div class="backlog-controls-row">
            <div class="backlog-controls-left">
              <div class="backlog-search-box">
                <span class="backlog-search-icon">${Icons.search("", 13)}</span>
                <input
                  id="backlogSearchInput"
                  class="backlog-search-input"
                  type="text"
                  placeholder="Cari berdasarkan judul atau ID (${(activeProject?.code || 'PRJ').split('-')[0]}-xxx)..."
                  value="${this.escapeHtml(this.searchQuery)}"
                />
              </div>

              <div class="backlog-filter-chips">
                <button class="backlog-chip-btn ${this.filterType === "all" && this.filterAssignee === "all" ? "active" : ""}" id="filterAllBtn">
                  Semua
                </button>
                <button class="backlog-chip-btn ${this.filterAssignee === "user-pm" ? "active" : ""}" id="filterMyIssuesBtn">
                  ${Icons.user("", 12)} Tugas Saya
                </button>
                <button class="backlog-chip-btn ${this.filterType === "Bug" ? "active" : ""}" id="filterBugBtn">
                  ${Icons.bug("", 12)} Bug &amp; Hotfix
                </button>
              </div>

              ${
                this.filterEpic !== "all"
                  ? `
                <div class="backlog-active-filter-tag">
                  <span>Epik: ${this.escapeHtml(selectedEpicObj?.title || "Tanpa Epik")}</span>
                  <button id="clearEpicFilterBtn" title="Hapus filter epik">✕</button>
                </div>
              `
                  : ""
              }

              ${
                this.filterAssignee !== "all"
                  ? `
                <div class="backlog-active-filter-tag">
                  <span>PIC: ${this.escapeHtml(selectedMemberObj?.name || "Terpilih")}</span>
                  <button id="resetRoleFilterBtn" title="Hapus filter PIC">✕</button>
                </div>
              `
                  : ""
              }
            </div>

            <div class="backlog-controls-right">
              Menampilkan <strong>${activeSprintTasks.length + backlogPoolTasks.length}</strong> dari <strong>${allTotalTasks}</strong> tiket
            </div>
          </div>

        </header>

        <!-- 2. Workspace Body: Epics Rail + Scrollable Content Area -->
        <div class="backlog-workspace-body">
          
          <!-- Sisi Kiri: Epics Drawer (Collapsible) -->
          <aside class="backlog-epics-drawer ${this.isEpicsPanelOpen ? "" : "collapsed"}">
            <div class="epics-drawer-header">
              <span class="epics-drawer-title">
                ${Icons.layers("", 13)}
                <span>EPIK PROYEK (${projectEpics.length})</span>
              </span>
            </div>

            <div class="epics-drawer-list">
              <!-- Semua Masalah -->
              <div class="epic-nav-item ${this.filterEpic === "all" ? "active" : ""}" data-epic-id="all">
                <div class="epic-nav-top-row">
                  <span class="epic-nav-title">
                    <span>Semua Masalah Proyek</span>
                  </span>
                  <span class="epic-nav-ratio">${projectTasks.length}</span>
                </div>
              </div>

              <!-- Tanpa Epik -->
              <div class="epic-nav-item ${this.filterEpic === "none" ? "active" : ""}" data-epic-id="none">
                <div class="epic-nav-top-row">
                  <span class="epic-nav-title" style="color: var(--text-muted);">
                    <span>Tanpa Epik</span>
                  </span>
                  <span class="epic-nav-ratio">
                    ${projectTasks.filter((t) => !t.epicId).length}
                  </span>
                </div>
              </div>

              <div style="height: 1px; background-color: var(--border-light); margin: 3px 0;"></div>

              <!-- Daftar Epik Proyek -->
              ${projectEpics
                .map((epic) => {
                  const epicTasks = projectTasks.filter((t) => t.epicId === epic.id);
                  const doneCount = epicTasks.filter((t) => t.status === "Selesai" || t.status === "Deploy Production").length;
                  const percentDone = epicTasks.length > 0 ? Math.round((doneCount / epicTasks.length) * 100) : 0;
                  const isSelected = this.filterEpic === epic.id;

                  return `
                  <div class="epic-nav-item ${isSelected ? "active" : ""}" data-epic-id="${epic.id}">
                    <div class="epic-nav-top-row">
                      <span class="epic-nav-title" title="${this.escapeHtml(epic.title)}">
                        <span class="epic-dot" style="background-color: ${epic.color || "#4f46e5"};"></span>
                        <span style="overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(epic.title)}</span>
                      </span>
                      <span class="epic-nav-ratio">
                        ${doneCount}/${epicTasks.length}
                      </span>
                    </div>

                    <div class="epic-progress-bar">
                      <div class="epic-progress-fill" style="width: ${percentDone}%; background-color: ${epic.color || "#10b981"};"></div>
                    </div>
                  </div>
                `;
                })
                .join("")}
            </div>

            <!-- Bottom Add Epic Action -->
            <div class="epics-drawer-footer">
              <button id="addEpicBtn" class="btn btn-secondary" style="width: 100%; font-size: 11.5px; font-weight: 700; justify-content: center; border-radius: var(--radius-lg);">
                ${Icons.plus("", 13)}
                <span>+ Buat Epik Baru</span>
              </button>
            </div>
          </aside>

          <!-- Sisi Kanan: Area Scrollable Workspace -->
          <main class="backlog-scroll-area" id="backlogScrollArea">
            
            <!-- 1. Matriks Kapasitas 5 Role Developer (Jira/CRM Resource Allocation) -->
            <section class="workload-matrix-card">
              <div class="workload-matrix-header">
                <div class="workload-matrix-title-wrap">
                  <div class="workload-matrix-title">
                    ${Icons.users("text-indigo-600", 15)}
                    <span>Matriks Kapasitas Tim Developer (5 Roles Allocation)</span>
                  </div>
                  <span class="workload-matrix-sub">
                    Beban mingguan maks 40h/role. Klik profil untuk filter tiket.
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  ${
                    this.filterAssignee !== "all"
                      ? `
                    <button id="resetRoleFilterBtn2" class="btn btn-secondary btn-sm" style="font-size: 10.5px; font-weight: 700; padding: 3px 8px;">
                      Reset Filter Role
                    </button>
                  `
                      : ""
                  }

                  <button id="toggleWorkloadBtn" class="btn btn-secondary btn-sm" style="font-size: 10.5px; font-weight: 600; padding: 3px 8px;" title="Buka/Tutup Ringkasan Matriks Kapasitas">
                    ${this.isWorkloadCollapsed ? "+ Buka Matriks" : "– Sembunyikan"}
                  </button>
                </div>
              </div>

              ${
                !this.isWorkloadCollapsed
                  ? `
                <div class="workload-grid">
                  ${teamMembers
                    .map((m) => {
                      const mTasks = projectTasks.filter((t) => t.assigneeId === m.id);
                      const mHours = mTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0);
                      const capLimit = m.capacity || 40;
                      const capPercent = Math.min(Math.round((mHours / capLimit) * 100), 100);
                      const roleBadge = this.getRoleBadge(m.role);
                      const isSelected = this.filterAssignee === m.id;
                      const isOverloaded = mHours > capLimit;

                      return `
                      <div class="workload-dev-card ${isSelected ? "active" : ""}" data-member-id="${m.id}" title="Klik untuk memfilter tiket milik ${this.escapeHtml(m.name)}">
                        <div class="workload-dev-card__top">
                          <div class="workload-dev-card__user">
                            <img src="${m.avatar}" alt="${this.escapeHtml(m.name)}" class="workload-dev-card__avatar" />
                            <span class="workload-dev-card__name">${this.escapeHtml(m.name)}</span>
                          </div>
                          <span class="issue-role-pill" style="background: ${roleBadge.bg}; color: ${roleBadge.color}; font-size: 8.5px;">
                            ${roleBadge.label}
                          </span>
                        </div>

                        <div class="workload-dev-card__meta">
                          <span class="workload-dev-card__tasks">${mTasks.length} Tiket</span>
                          <span class="workload-dev-card__hours" style="color: ${isOverloaded ? "#ef4444" : "var(--text-primary)"};">
                            ${mHours}h / ${capLimit}h
                          </span>
                        </div>

                        <div class="workload-dev-card__bar">
                          <div
                            class="workload-dev-card__bar-fill"
                            style="width: ${capPercent}%; background: ${isOverloaded ? "linear-gradient(90deg, #ef4444, #dc2626)" : capPercent > 75 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #3b82f6, #10b981)"};"
                          ></div>
                        </div>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              `
                  : ""
              }
            </section>

            <!-- 2. Active Sprint Container -->
            <section class="sprint-panel-card" id="activeSprintCard">
              <div class="sprint-card-header" data-toggle="sprint" title="Klik untuk expand / collapse Sprint Aktif">
                <div class="sprint-card-header__left">
                  <button id="toggleSprintBtn" class="sprint-toggle-btn" title="Buka/Tutup Sprint Aktif">
                    ${this.isSprintCollapsed ? Icons.chevronRight("", 16) : Icons.chevronDown("", 16)}
                  </button>
                  <div class="sprint-card-title">
                    <span>${this.escapeHtml(activeSprint?.name || "LIB Sprint 1 (Aktif)")}</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); font-family: var(--font-mono);">
                      (${activeSprintTasks.length} Tiket • ${totalSprintHours}h)
                    </span>
                    <span class="backlog-active-pill" style="font-size: 10px; padding: 2px 7px;">
                      ● AKTIF
                    </span>
                  </div>
                  <span class="sprint-dates-text">
                    ${Icons.calendar("", 12)}
                    <span>${activeSprint?.startDate || "12 Okt 2026"} – ${activeSprint?.endDate || "26 Okt 2026"} (14 Hari)</span>
                  </span>
                </div>

                <div class="sprint-card-header__right">
                  <!-- Tri-Color Story Points Lozenge -->
                  <div class="points-tri-color" title="To Do: ${sprintPoints.todo}h, In Progress: ${sprintPoints.inprog}h, Done: ${sprintPoints.done}h">
                    <span class="points-tri-color__item points-tri-color__todo" title="To Do">${sprintPoints.todo}</span>
                    <span class="points-tri-color__item points-tri-color__inprogress" title="In Progress">${sprintPoints.inprog}</span>
                    <span class="points-tri-color__item points-tri-color__done" title="Selesai">${sprintPoints.done}</span>
                  </div>

                  <button id="completeSprintHeaderBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-md);">
                    Selesaikan Sprint
                  </button>
                </div>
              </div>

              ${
                !this.isSprintCollapsed
                  ? `
                <div class="issue-rows-list">
                  ${
                    activeSprintTasks.length === 0
                      ? `
                    <div style="padding: 28px 20px; text-align: center; color: var(--text-muted); font-size: 12.5px; font-style: italic;">
                      Tidak ada masalah pada sprint ini. Tarik atau pindahkan tiket dari backlog pool di bawah dengan tombol [+ Ke Sprint].
                    </div>
                  `
                      : activeSprintTasks.map((t) => this.renderIssueRow(t, teamMembers, projectEpics, true)).join("")
                  }
                </div>

                <div class="quick-create-inline inline-create-trigger" data-sprint-id="${activeSprint?.id}">
                  ${Icons.plus("text-indigo-600", 13)}
                  <span>+ Tambah tiket masalah di sprint aktif ini</span>
                </div>
              `
                  : ""
              }
            </section>

            <!-- 3. Backlog Pool Container -->
            <section class="sprint-panel-card" id="backlogPoolCard">
              <div class="sprint-card-header" data-toggle="backlog" title="Klik untuk expand / collapse Backlog Pool">
                <div class="sprint-card-header__left">
                  <button id="toggleBacklogBtn" class="sprint-toggle-btn" title="Buka/Tutup Backlog Pool">
                    ${this.isBacklogCollapsed ? Icons.chevronRight("", 16) : Icons.chevronDown("", 16)}
                  </button>
                  <div class="sprint-card-title">
                    <span>Backlog Pool</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); font-family: var(--font-mono);">
                      (${backlogPoolTasks.length} Tiket • ${totalBacklogHours}h)
                    </span>
                  </div>
                </div>

                <div class="sprint-card-header__right">
                  <!-- Tri-Color Story Points Lozenge -->
                  <div class="points-tri-color" title="To Do: ${backlogPoints.todo}h, In Progress: ${backlogPoints.inprog}h, Done: ${backlogPoints.done}h">
                    <span class="points-tri-color__item points-tri-color__todo" title="To Do">${backlogPoints.todo}</span>
                    <span class="points-tri-color__item points-tri-color__inprogress" title="In Progress">${backlogPoints.inprog}</span>
                    <span class="points-tri-color__item points-tri-color__done" title="Selesai">${backlogPoints.done}</span>
                  </div>

                  <button id="createSprintHeaderBtn" class="btn btn-secondary btn-sm" style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-md);">
                    + Buat Sprint Baru
                  </button>
                </div>
              </div>

              ${
                !this.isBacklogCollapsed
                  ? `
                <div class="issue-rows-list">
                  ${
                    backlogPoolTasks.length === 0
                      ? `
                    <div style="padding: 28px 20px; text-align: center; color: var(--text-muted); font-size: 12.5px; font-style: italic;">
                      Seluruh tiket telah dialokasikan ke sprint aktif atau tidak sesuai filter pencarian.
                    </div>
                  `
                      : backlogPoolTasks.map((t) => this.renderIssueRow(t, teamMembers, projectEpics, false, activeSprint?.id)).join("")
                  }
                </div>

                <div class="quick-create-inline inline-create-trigger" data-sprint-id="">
                  ${Icons.plus("text-indigo-600", 13)}
                  <span>+ Tambah tiket baru di backlog pool</span>
                </div>
              `
                  : ""
              }
            </section>

          </main>
        ${this.renderCreateSprintModal(activeProject, projectSprints, backlogPoolTasks, totalBacklogHours)}
        ${this.renderCreateEpicModal(activeProject, projectEpics, teamMembers)}
        </div>

      </div>
    `;
  }

  renderCreateSprintModal(activeProject, projectSprints, backlogPoolTasks, totalBacklogHours) {
    if (!this.isCreateSprintModalOpen) return "";

    const projCode = activeProject?.code ? activeProject.code.split("-")[0] : "PRJ";
    const nextSprintNum = (projectSprints?.length || 0) + 1;
    const defaultSprintName = `Sprint ${nextSprintNum}: Pengembangan Fitur & Stabilisasi ${projCode}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const endDateObj = new Date(Date.now() + (this.sprintDurationDays || 14) * 86400000);
    const defaultEndStr = endDateObj.toISOString().split("T")[0];
    const previewBacklogTasks = (backlogPoolTasks || []).slice(0, 6);

    return `
      <div
        id="backlogCreateSprintBackdrop"
        style="position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;"
      >
        <div
          class="card"
          style="width:100%;max-width:680px;max-height:90vh;background:var(--bg-card, #ffffff);border:1px solid var(--border, #e2e8f0);border-radius:16px;box-shadow:0 24px 48px rgba(15,23,42,0.24);display:flex;flex-direction:column;overflow:hidden;animation:modalSlideUp 0.18s ease;"
        >
          <!-- Modal Header -->
          <div style="padding:18px 24px;background:linear-gradient(135deg, rgba(79,70,229,0.07), rgba(59,130,246,0.04));border-bottom:1px solid var(--border, #e2e8f0);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;">
              <div style="width:40px;height:40px;border-radius:10px;background:var(--indigo-600, #4f46e5);color:#ffffff;display:grid;place-items:center;flex-shrink:0;box-shadow:0 4px 10px rgba(79,70,229,0.25);">
                ${Icons.calendar("", 18)}
              </div>
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text-primary, #0f172a);">
                    Buat Sprint Baru
                  </h3>
                  <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(79,70,229,0.1);color:var(--indigo-600, #4f46e5);border:1px solid rgba(79,70,229,0.2);">
                    ${this.escapeHtml(projCode)} · ${this.escapeHtml(activeProject?.name || "Proyek Aktif")}
                  </span>
                </div>
                <p style="margin:2px 0 0 0;font-size:12px;color:var(--text-muted, #64748b);">
                  Atur durasi iterasi, target pencapaian (Sprint Goal), kapasitas jam, dan alokasi tiket awal dari Backlog Pool.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="closeCreateSprintModalBtn"
              style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border, #e2e8f0);background:var(--bg-card, #fff);color:var(--text-muted, #64748b);cursor:pointer;display:grid;place-items:center;font-size:15px;font-weight:700;flex-shrink:0;"
              title="Tutup Modal (Esc)"
            >
              ✕
            </button>
          </div>

          <!-- Modal Form Body -->
          <form id="createSprintModalForm" style="padding:20px 24px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;flex:1;">
            <!-- Baris 1: Nama Sprint & Preset Cepat -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Nama Sprint <span style="color:#ef4444;">*</span>
                </label>
                <span style="font-size:10.5px;color:var(--text-muted, #64748b);">Urutan ke-${nextSprintNum} pada proyek ini</span>
              </div>
              <input
                type="text"
                id="modalSprintNameInput"
                value="${this.escapeHtml(defaultSprintName)}"
                placeholder="Contoh: Sprint 15: Integrasi QRIS & Optimasi Query Database..."
                style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:13px;font-weight:600;color:var(--text-primary, #0f172a);"
                required
              />
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;">
                <span style="font-size:10.5px;color:var(--text-muted);font-weight:600;">Template Cepat:</span>
                <button type="button" class="sprint-preset-chip" data-sprint-title="Sprint ${nextSprintNum}: Fondasi Arsitektur API & Core Microservices" data-sprint-goal="Menyelesaikan REST API utama, autentikasi RBAC, dan skema database terdistribusi." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + Fondasi API & Backend
                </button>
                <button type="button" class="sprint-preset-chip" data-sprint-title="Sprint ${nextSprintNum}: Integrasi UI Frontend & Stabilisasi Bug" data-sprint-goal="Menyelesaikan integrasi komponen antarmuka, state management, dan perbaikan bug kritis S1/S2." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + Integrasi UI & Stabilisasi
                </button>
                <button type="button" class="sprint-preset-chip" data-sprint-title="Sprint ${nextSprintNum}: Pengujian Regresi QA, Load Test & UAT" data-sprint-goal="Verifikasi stress test beban tinggi, kelulusan seluruh skenario QA Staging, dan sign-off UAT klien." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + QA Staging & UAT Rilis
                </button>
              </div>
            </div>

            <!-- Baris 2: Durasi Siklus & Status Awal (Grid 2 Kolom Proporsional) -->
            <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Durasi Siklus Sprint
                </label>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
                  ${[
                    { days: 7, label: "1 Minggu (7H)" },
                    { days: 14, label: "2 Minggu (14H)" },
                    { days: 21, label: "3 Minggu (21H)" },
                  ]
                    .map(
                      (d) => `
                    <button
                      type="button"
                      class="sprint-duration-btn"
                      data-days="${d.days}"
                      style="padding:8px 6px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;border:1px solid ${
                        this.sprintDurationDays === d.days ? "var(--indigo-600, #4f46e5)" : "var(--border, #cbd5e1)"
                      };background:${
                        this.sprintDurationDays === d.days ? "rgba(79,70,229,0.1)" : "var(--bg-secondary, #f8fafc)"
                      };color:${this.sprintDurationDays === d.days ? "var(--indigo-600, #4f46e5)" : "var(--text-secondary, #475569)"};"
                    >
                      ${d.label}
                    </button>
                  `
                    )
                    .join("")}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Status Eksekusi Sprint
                </label>
                <select
                  id="modalSprintStatusSelect"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-weight:600;color:var(--text-primary, #0f172a);"
                >
                  <option value="future" selected>Direncanakan (Future Sprint)</option>
                  <option value="active">● Aktifkan Langsung (Active Sprint)</option>
                </select>
              </div>
            </div>

            <!-- Baris 3: Tanggal Mulai, Tanggal Selesai, & Target Kapasitas Jam (Grid 3 Kolom Proporsional) -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Tanggal Mulai <span style="color:#ef4444;">*</span>
                </label>
                <input
                  type="date"
                  id="modalSprintStartInput"
                  value="${todayStr}"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);"
                  required
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Tanggal Selesai <span style="color:#ef4444;">*</span>
                </label>
                <input
                  type="date"
                  id="modalSprintEndInput"
                  value="${defaultEndStr}"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);"
                  required
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Kapasitas Tim (Jam)
                </label>
                <input
                  type="number"
                  id="modalSprintCapacityInput"
                  value="160"
                  min="20"
                  max="800"
                  step="10"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);"
                />
              </div>
            </div>

            <!-- Baris 4: Target & Sasaran Sprint (Sprint Goal) -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                Sasaran &amp; Deliverable Utama (Sprint Goal) <span style="color:#ef4444;">*</span>
              </label>
              <textarea
                id="modalSprintGoalInput"
                rows="2"
                placeholder="Jelaskan fokus pencapaian utama sprint ini, kriteria keberhasilan rilis, dan modul yang ditargetkan selesai..."
                style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;color:var(--text-primary);resize:vertical;"
                required
              >Menyelesaikan deliverable prioritas tinggi pada backlog serta memastikan kualitas rilis staging lulus verifikasi QA.</textarea>
            </div>

            <!-- Baris 5: Alokasi Tiket Awal dari Backlog Pool (Opsional) -->
            <div style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:10px;background:var(--bg-secondary, #f8fafc);border:1px solid var(--border, #e2e8f0);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-primary, #0f172a);">
                  Tarik Tiket dari Backlog Pool ke Sprint Ini (Opsional)
                </span>
                <span style="font-size:11px;font-weight:700;color:var(--indigo-600);font-family:var(--font-mono);">
                  Tersedia: ${backlogPoolTasks.length} Tiket (${totalBacklogHours}h)
                </span>
              </div>

              ${
                previewBacklogTasks.length === 0
                  ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;padding:6px 0;">Tidak ada tiket di Backlog Pool saat ini.</div>`
                  : `
                <div style="display:flex;flex-direction:column;gap:6px;max-height:145px;overflow-y:auto;padding-right:4px;">
                  ${previewBacklogTasks
                    .map(
                      (t) => `
                    <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:7px;background:var(--bg-card, #fff);border:1px solid var(--border, #e2e8f0);cursor:pointer;font-size:12px;">
                      <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
                        <input type="checkbox" class="sprint-backlog-task-chk" value="${t.id}" style="width:15px;height:15px;accent-color:var(--indigo-600);cursor:pointer;flex-shrink:0;" />
                        <span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:var(--indigo-600);flex-shrink:0;">${t.key}</span>
                        <span style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(t.title)}</span>
                      </div>
                      <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--text-muted);flex-shrink:0;">${t.estimateHours || 4}h</span>
                    </label>
                  `
                    )
                    .join("")}
                </div>
              `
              }
            </div>

            <!-- Modal Footer -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:1px solid var(--border, #e2e8f0);flex-wrap:wrap;">
              <span style="font-size:11.5px;color:var(--text-muted);">
                💡 Sprint baru akan langsung muncul di daftar perencanaan proyek.
              </span>
              <div style="display:flex;align-items:center;gap:10px;">
                <button
                  type="button"
                  id="cancelCreateSprintModalBtn"
                  class="btn btn-secondary"
                  style="padding:8px 16px;border-radius:8px;font-size:12.5px;font-weight:700;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  style="padding:8px 18px;border-radius:8px;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;gap:6px;"
                >
                  ${Icons.plus("", 14)}
                  <span>Simpan Sprint</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderCreateEpicModal(activeProject, projectEpics, teamMembers) {
    if (!this.isCreateEpicModalOpen) return "";

    const projCode = activeProject?.code ? activeProject.code.split("-")[0] : "PRJ";
    const nextEpicNum = (projectEpics?.length || 0) + 1;
    const defaultEpicKey = `${projCode}-EPIC-${nextEpicNum}`;

    const colorOptions = [
      { hex: "#4f46e5", name: "Indigo" },
      { hex: "#0284c7", name: "Sky Blue" },
      { hex: "#0d9488", name: "Teal" },
      { hex: "#059669", name: "Emerald" },
      { hex: "#d97706", name: "Amber" },
      { hex: "#e11d48", name: "Rose" },
      { hex: "#7c3aed", name: "Purple" },
    ];

    return `
      <div
        id="backlogCreateEpicBackdrop"
        style="position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;"
      >
        <div
          class="card"
          style="width:100%;max-width:640px;max-height:90vh;background:var(--bg-card, #ffffff);border:1px solid var(--border, #e2e8f0);border-radius:16px;box-shadow:0 24px 48px rgba(15,23,42,0.24);display:flex;flex-direction:column;overflow:hidden;animation:modalSlideUp 0.18s ease;"
        >
          <!-- Modal Header -->
          <div style="padding:18px 24px;background:linear-gradient(135deg, rgba(79,70,229,0.07), rgba(13,148,136,0.05));border-bottom:1px solid var(--border, #e2e8f0);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;">
              <div style="width:40px;height:40px;border-radius:10px;background:${this.selectedEpicColor || "#4f46e5"};color:#ffffff;display:grid;place-items:center;flex-shrink:0;box-shadow:0 4px 10px rgba(79,70,229,0.25);">
                ${Icons.layers("", 18)}
              </div>
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text-primary, #0f172a);">
                    Buat Epik Modul Baru
                  </h3>
                  <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(79,70,229,0.1);color:var(--indigo-600, #4f46e5);border:1px solid rgba(79,70,229,0.2);">
                    ${this.escapeHtml(defaultEpicKey)}
                  </span>
                </div>
                <p style="margin:2px 0 0 0;font-size:12px;color:var(--text-muted, #64748b);">
                  Kelompokkan fitur besar, arsitektur modul, dan penanggung jawab teknis ke dalam satu Epik terstruktur.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="closeCreateEpicModalBtn"
              style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border, #e2e8f0);background:var(--bg-card, #fff);color:var(--text-muted, #64748b);cursor:pointer;display:grid;place-items:center;font-size:15px;font-weight:700;flex-shrink:0;"
              title="Tutup Modal (Esc)"
            >
              ✕
            </button>
          </div>

          <!-- Modal Form Body -->
          <form id="createEpicModalForm" style="padding:20px 24px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;flex:1;">
            <!-- Baris 1: Kode Epik & Judul Epik (Grid Proporsional 1 : 2.6) -->
            <div style="display:grid;grid-template-columns:150px 1fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Kode Epik <span style="color:#ef4444;">*</span>
                </label>
                <input
                  type="text"
                  id="modalEpicKeyInput"
                  value="${this.escapeHtml(defaultEpicKey)}"
                  style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #c7d2fe;background:#eef2ff;font-size:12.5px;font-family:var(--font-mono);font-weight:800;color:var(--indigo-600);"
                  required
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Nama / Judul Epik Modul <span style="color:#ef4444;">*</span>
                </label>
                <input
                  type="text"
                  id="modalEpicTitleInput"
                  placeholder="Contoh: Integrasi Payment Gateway QRIS & Webhook..."
                  style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:13px;font-weight:600;color:var(--text-primary, #0f172a);"
                  required
                />
              </div>
            </div>

            <!-- Template Cepat Epik -->
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:-6px;">
              <span style="font-size:10.5px;color:var(--text-muted);font-weight:600;">Template Cepat:</span>
              <button type="button" class="epic-preset-chip" data-epic-title="Integrasi Payment Gateway QRIS & Rekonsiliasi Otomatis" data-epic-desc="Layanan pembayaran QRIS dinamis, callback webhook asinkron, dan mutasi transaksi real-time." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                + Payment Gateway & QRIS
              </button>
              <button type="button" class="epic-preset-chip" data-epic-title="Autentikasi Terpusat RBAC, JWT & Keamanan API" data-epic-desc="Manajemen hak akses multi-role, proteksi rate limiter endpoint, dan audit log keamanan." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                + Autentikasi & Keamanan RBAC
              </button>
              <button type="button" class="epic-preset-chip" data-epic-title="Dashboard Analitik Eksekutif & Laporan Ekspor" data-epic-desc="Visualisasi metrik performa operasional real-time serta ekspor laporan PDF/Excel." style="border:1px solid rgba(79,70,229,0.25);background:rgba(79,70,229,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700;cursor:pointer;">
                + Dashboard & Pelaporan
              </button>
            </div>

            <!-- Baris 2: Kategori Arsitektur, PIC Lead Modul, & Estimasi Jam (Grid 3 Kolom Proporsional) -->
            <div style="display:grid;grid-template-columns:1fr 1.2fr 0.8fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Kategori Modul
                </label>
                <select
                  id="modalEpicCategorySelect"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-weight:600;color:var(--text-primary);"
                >
                  <option value="Fullstack Module">Fullstack Module</option>
                  <option value="Backend & API">Backend &amp; API</option>
                  <option value="Frontend & UI">Frontend &amp; UI</option>
                  <option value="Infrastructure & DevOps">Infrastructure &amp; DevOps</option>
                  <option value="QA & Performance">QA &amp; Performance</option>
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  PIC / Lead Modul
                </label>
                <select
                  id="modalEpicLeadSelect"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-weight:600;color:var(--text-primary);"
                >
                  ${teamMembers
                    .map(
                      (m) => `
                    <option value="${m.id}">${this.escapeHtml(m.name)} (${this.escapeHtml(m.role)})</option>
                  `
                    )
                    .join("")}
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Target Beban (Jam)
                </label>
                <input
                  type="number"
                  id="modalEpicHoursInput"
                  value="40"
                  min="4"
                  max="500"
                  step="4"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);"
                />
              </div>
            </div>

            <!-- Baris 3: Warna Identitas Epik -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                Warna Identitas Badge Epik
              </label>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                ${colorOptions
                  .map(
                    (c) => `
                  <button
                    type="button"
                    class="epic-color-swatch"
                    data-color="${c.hex}"
                    style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;cursor:pointer;font-size:11.5px;font-weight:700;border:2px solid ${
                      this.selectedEpicColor === c.hex ? c.hex : "var(--border, #e2e8f0)"
                    };background:${this.selectedEpicColor === c.hex ? `${c.hex}15` : "var(--bg-secondary, #f8fafc)"};color:var(--text-primary);"
                  >
                    <span style="width:12px;height:12px;border-radius:50%;background:${c.hex};display:inline-block;"></span>
                    <span>${c.name}</span>
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Baris 4: Deskripsi & Ruang Lingkup Epik -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                Deskripsi &amp; Ruang Lingkup Spesifikasi <span style="color:#ef4444;">*</span>
              </label>
              <textarea
                id="modalEpicDescInput"
                rows="3"
                placeholder="Jelaskan arsitektur modul, cakupan fitur, endpoint API, serta kriteria penyelesaian (Definition of Done) untuk epik ini..."
                style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:12.5px;color:var(--text-primary);resize:vertical;"
                required
              ></textarea>
            </div>

            <!-- Baris 5: Opsi Buat Tiket Inisial Otomatis -->
            <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.2);cursor:pointer;">
              <input type="checkbox" id="modalEpicAutoTaskChk" checked style="width:16px;height:16px;accent-color:var(--indigo-600);cursor:pointer;" />
              <div style="display:flex;flex-direction:column;">
                <span style="font-size:12px;font-weight:700;color:var(--text-primary);">Buat tiket spesifikasi awal secara otomatis di Backlog Pool</span>
                <span style="font-size:11px;color:var(--text-muted);">Otomatis menambahkan 1 tiket teknis yang langsung terhubung ke epik baru ini.</span>
              </div>
            </label>

            <!-- Modal Footer -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:12px;border-top:1px solid var(--border, #e2e8f0);">
              <button
                type="button"
                id="cancelCreateEpicModalBtn"
                class="btn btn-secondary"
                style="padding:8px 16px;border-radius:8px;font-size:12.5px;font-weight:700;"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                style="padding:8px 18px;border-radius:8px;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;gap:6px;background:${this.selectedEpicColor || "#4f46e5"};border-color:${this.selectedEpicColor || "#4f46e5"};"
              >
                ${Icons.plus("", 14)}
                <span>Simpan Epik</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderIssueRow(task, teamMembers, epics, isInSprint, activeSprintId) {
    const assignee = teamMembers.find((m) => m.id === task.assigneeId);
    const epic = epics.find((e) => e.id === task.epicId);
    const roleBadge = this.getRoleBadge(assignee?.role || "");
    const statusBadge = this.getStatusBadge(task.status);

    let typeIconHtml = "";
    if (task.type === "Bug") {
      typeIconHtml = Icons.bug("text-rose-600", 14);
    } else if (task.type === "Feature" || task.type === "Story") {
      typeIconHtml = Icons.sparkles("text-indigo-600", 14);
    } else if (task.type === "Revisi" || task.type === "Change Request") {
      typeIconHtml = Icons.refresh("text-amber-600", 14);
    } else if (task.type === "Maintenance") {
      typeIconHtml = Icons.wrench("text-teal-600", 14);
    } else {
      typeIconHtml = Icons.checkSquare("text-slate-400", 14);
    }

    return `
      <div class="issue-row" data-task-id="${task.id}">
        
        <!-- Sisi Kiri: Grip, Tipe, Key Badge, Judul Tiket, Epik, & Role PIC -->
        <div class="issue-row-left">
          <span class="issue-grip-handle" title="Tarik untuk mengubah urutan">
            ${Icons.gripVertical("", 13)}
          </span>

          <span class="issue-type-icon" title="Tipe: ${this.escapeHtml(task.type || "Fitur")}">
            ${typeIconHtml}
          </span>

          <a href="javascript:void(0)" class="issue-key-badge open-task-detail-link" data-task-id="${task.id}" title="Klik untuk membuka detail tiket">
            ${task.key}
          </a>

          <span class="issue-title-text open-task-detail-link" data-task-id="${task.id}" title="${this.escapeHtml(task.title)}">
            ${this.escapeHtml(task.title)}
          </span>

          ${
            epic
              ? `
            <span class="issue-epic-pill" style="background-color: ${epic.color || "#4f46e5"}18; color: ${epic.color || "#4f46e5"}; border: 1px solid ${epic.color || "#4f46e5"}35;" title="Epik: ${this.escapeHtml(epic.title)}">
              ${this.escapeHtml(epic.title)}
            </span>
          `
              : ""
          }

          <span class="issue-role-pill" style="background: ${roleBadge.bg}; color: ${roleBadge.color};" title="Role PIC: ${roleBadge.label}">
            ${roleBadge.label}
          </span>
        </div>

        <!-- Sisi Kanan: Status Lozenge, Avatar Assignee, Estimasi Jam, & Tombol Aksi -->
        <div class="issue-row-right">
          <span class="issue-status-lozenge" style="background-color: ${statusBadge.bg}; color: ${statusBadge.color};">
            ${statusBadge.label}
          </span>

          ${
            assignee
              ? `
            <img src="${assignee.avatar}" alt="${this.escapeHtml(assignee.name)}" title="${this.escapeHtml(assignee.name)} (${assignee.role})" class="issue-assignee-avatar" />
          `
              : `
            <span class="issue-assignee-fallback" title="Belum Ditugaskan">
              UA
            </span>
          `
          }

          <span class="issue-hours-badge" title="Estimasi: ${task.estimateHours || 1} Jam">
            ${task.estimateHours || 1}h
          </span>

          ${
            isInSprint
              ? `
            <button class="btn btn-secondary btn-sm move-task-btn" data-task-id="${task.id}" data-target-sprint="" style="font-size: 11px; padding: 3px 9px; border-radius: var(--radius-md);" title="Keluarkan task ke Backlog Pool">
              Keluarkan
            </button>
          `
              : `
            <button class="btn btn-primary btn-sm move-task-btn" data-task-id="${task.id}" data-target-sprint="${activeSprintId}" style="font-size: 11px; padding: 3px 11px; border-radius: var(--radius-md);" title="Masukkan tiket ke Sprint Aktif">
              + Ke Sprint
            </button>
          `
          }
        </div>

      </div>
    `;
  }

  attachEvents() {
    this.element.addEventListener("click", (e) => {
      // Toggle epics drawer button
      if (e.target.closest("#toggleEpicsDrawerBtn")) {
        this.isEpicsPanelOpen = !this.isEpicsPanelOpen;
        this.render();
        return;
      }

      // Close epics drawer
      if (e.target.closest("#closeEpicsPanelBtn")) {
        this.isEpicsPanelOpen = false;
        this.render();
        return;
      }

      // Toggle workload matrix card
      if (e.target.closest("#toggleWorkloadBtn")) {
        this.isWorkloadCollapsed = !this.isWorkloadCollapsed;
        this.render();
        return;
      }

      // Toggle sprint collapsible (either button or clicking the sprint header bar)
      const sprintToggleTrigger = e.target.closest("#toggleSprintBtn") || e.target.closest('.sprint-card-header[data-toggle="sprint"]');
      if (sprintToggleTrigger && !e.target.closest("#completeSprintHeaderBtn")) {
        this.isSprintCollapsed = !this.isSprintCollapsed;
        this.render();
        return;
      }

      // Toggle backlog collapsible (either button or clicking the backlog header bar)
      const backlogToggleTrigger = e.target.closest("#toggleBacklogBtn") || e.target.closest('.sprint-card-header[data-toggle="backlog"]');
      if (backlogToggleTrigger && !e.target.closest("#createSprintHeaderBtn")) {
        this.isBacklogCollapsed = !this.isBacklogCollapsed;
        this.render();
        return;
      }

      // Open Create Task Modal
      if (e.target.closest("#openCreateTaskBacklogBtn") || e.target.closest(".inline-create-trigger")) {
        this.onOpenCreateTask();
        return;
      }

      // Add Epic Button
      // Add Epic Button -> Open Create Epic Modal
      if (e.target.closest("#addEpicBtn")) {
        this.isCreateEpicModalOpen = true;
        this.render();
        setTimeout(() => {
          const titleInput = this.element.querySelector("#modalEpicTitleInput");
          if (titleInput) titleInput.focus();
        }, 40);
        return;
      }

      // Close Create Epic Modal
      if (
        e.target.closest("#closeCreateEpicModalBtn") ||
        e.target.closest("#cancelCreateEpicModalBtn") ||
        e.target.id === "backlogCreateEpicBackdrop"
      ) {
        this.isCreateEpicModalOpen = false;
        this.render();
        return;
      }

      // Epic Preset Chip Click
      const epicPreset = e.target.closest(".epic-preset-chip");
      if (epicPreset) {
        const titleInput = this.element.querySelector("#modalEpicTitleInput");
        const descInput = this.element.querySelector("#modalEpicDescInput");
        if (titleInput && epicPreset.dataset.epicTitle) {
          titleInput.value = epicPreset.dataset.epicTitle;
          titleInput.focus();
        }
        if (descInput && epicPreset.dataset.epicDesc) {
          descInput.value = epicPreset.dataset.epicDesc;
        }
        return;
      }

      // Epic Color Swatch Click
      const colorSwatch = e.target.closest(".epic-color-swatch");
      if (colorSwatch) {
        const prevTitle = this.element.querySelector("#modalEpicTitleInput")?.value || "";
        const prevKey = this.element.querySelector("#modalEpicKeyInput")?.value || "";
        const prevDesc = this.element.querySelector("#modalEpicDescInput")?.value || "";
        const prevCat = this.element.querySelector("#modalEpicCategorySelect")?.value || "Fullstack Module";
        const prevLead = this.element.querySelector("#modalEpicLeadSelect")?.value || "";
        const prevHours = this.element.querySelector("#modalEpicHoursInput")?.value || "40";

        this.selectedEpicColor = colorSwatch.dataset.color || "#4f46e5";
        this.render();

        const titleInput = this.element.querySelector("#modalEpicTitleInput");
        const keyInput = this.element.querySelector("#modalEpicKeyInput");
        const descInput = this.element.querySelector("#modalEpicDescInput");
        const catSelect = this.element.querySelector("#modalEpicCategorySelect");
        const leadSelect = this.element.querySelector("#modalEpicLeadSelect");
        const hoursInput = this.element.querySelector("#modalEpicHoursInput");

        if (titleInput) titleInput.value = prevTitle;
        if (keyInput && prevKey) keyInput.value = prevKey;
        if (descInput) descInput.value = prevDesc;
        if (catSelect) catSelect.value = prevCat;
        if (leadSelect && prevLead) leadSelect.value = prevLead;
        if (hoursInput) hoursInput.value = prevHours;
        return;
      }

      // Create Sprint Button -> Open Create Sprint Modal
      if (e.target.closest("#createSprintBtn") || e.target.closest("#createSprintHeaderBtn")) {
        this.isCreateSprintModalOpen = true;
        this.render();
        setTimeout(() => {
          const nameInput = this.element.querySelector("#modalSprintNameInput");
          if (nameInput) nameInput.focus();
        }, 40);
        return;
      }

      // Close Create Sprint Modal
      if (
        e.target.closest("#closeCreateSprintModalBtn") ||
        e.target.closest("#cancelCreateSprintModalBtn") ||
        e.target.id === "backlogCreateSprintBackdrop"
      ) {
        this.isCreateSprintModalOpen = false;
        this.render();
        return;
      }

      // Sprint Preset Chip Click
      const sprintPreset = e.target.closest(".sprint-preset-chip");
      if (sprintPreset) {
        const nameInput = this.element.querySelector("#modalSprintNameInput");
        const goalInput = this.element.querySelector("#modalSprintGoalInput");
        if (nameInput && sprintPreset.dataset.sprintTitle) {
          nameInput.value = sprintPreset.dataset.sprintTitle;
          nameInput.focus();
        }
        if (goalInput && sprintPreset.dataset.sprintGoal) {
          goalInput.value = sprintPreset.dataset.sprintGoal;
        }
        return;
      }

      // Sprint Duration Button Click
      const durationBtn = e.target.closest(".sprint-duration-btn");
      if (durationBtn) {
        const days = Number(durationBtn.dataset.days) || 14;
        this.sprintDurationDays = days;
        const startInput = this.element.querySelector("#modalSprintStartInput");
        const endInput = this.element.querySelector("#modalSprintEndInput");
        const startBase = startInput && startInput.value ? new Date(startInput.value) : new Date();
        const endCalc = new Date(startBase.getTime() + days * 86400000).toISOString().split("T")[0];
        if (endInput) endInput.value = endCalc;

        this.element.querySelectorAll(".sprint-duration-btn").forEach((btn) => {
          const isActive = Number(btn.dataset.days) === days;
          btn.style.borderColor = isActive ? "var(--indigo-600, #4f46e5)" : "var(--border, #cbd5e1)";
          btn.style.background = isActive ? "rgba(79,70,229,0.1)" : "var(--bg-secondary, #f8fafc)";
          btn.style.color = isActive ? "var(--indigo-600, #4f46e5)" : "var(--text-secondary, #475569)";
        });
        return;
      }

      if (false) {
        const title = prompt("Masukkan Judul Epik Baru (contoh: Integrasi Payment Gateway & Webhook):");
        if (title && title.trim()) {
          const newEpic = {
            id: "epic-" + Date.now(),
            projectId: store.getState().selectedProjectId,
            title: title.trim(),
            color: "#6366f1",
          };
          store.setState({ epics: [...store.getState().epics, newEpic] });
          store.addToast("success", "Epik Berhasil Dibuat", `Epik "${title.trim()}" telah ditambahkan.`);
        }
        return;
      }

      // Create Sprint Button
      if (false && (e.target.closest("#createSprintBtn") || e.target.closest("#createSprintHeaderBtn"))) {
        const sprintCount = (store.getState().sprints || []).length + 1;
        const newSprint = {
          id: "sprint-" + Date.now(),
          projectId: store.getState().selectedProjectId,
          name: `LIB Sprint ${sprintCount}`,
          status: "future",
          startDate: "2026-11-01",
          endDate: "2026-11-14",
        };
        store.setState({ sprints: [...store.getState().sprints, newSprint] });
        store.addToast("success", "Sprint Ditambahkan", `Sprint "${newSprint.name}" berhasil dibuat.`);
        return;
      }

      // Complete Sprint
      if (e.target.closest("#completeSprintBtn") || e.target.closest("#completeSprintHeaderBtn")) {
        store.addToast("success", "Sprint Dituntaskan!", "Pekerjaan yang belum tuntas otomatis dialihkan ke sprint berikutnya.");
        return;
      }

      // Filter Epic Click
      const epicItem = e.target.closest(".epic-nav-item");
      if (epicItem) {
        this.filterEpic = epicItem.dataset.epicId;
        this.render();
        return;
      }

      // Clear Epic Filter
      if (e.target.closest("#clearEpicFilterBtn")) {
        this.filterEpic = "all";
        this.render();
        return;
      }

      // Role Filter Card Click
      const roleCard = e.target.closest(".workload-dev-card");
      if (roleCard) {
        const mId = roleCard.dataset.memberId;
        this.filterAssignee = this.filterAssignee === mId ? "all" : mId;
        this.render();
        return;
      }

      // Reset Role Filter
      if (e.target.closest("#resetRoleFilterBtn") || e.target.closest("#resetRoleFilterBtn2")) {
        this.filterAssignee = "all";
        this.render();
        return;
      }

      // Quick filter buttons
      if (e.target.closest("#filterAllBtn")) {
        this.filterType = "all";
        this.filterAssignee = "all";
        this.filterEpic = "all";
        this.render();
        return;
      }

      if (e.target.closest("#filterMyIssuesBtn")) {
        this.filterAssignee = this.filterAssignee === "user-pm" ? "all" : "user-pm"; // Asisyah PM / Current Session
        this.render();
        return;
      }

      if (e.target.closest("#filterBugBtn")) {
        this.filterType = this.filterType === "Bug" ? "all" : "Bug";
        this.render();
        return;
      }

      // Open task detail link
      const taskLink = e.target.closest(".open-task-detail-link");
      if (taskLink) {
        const tId = taskLink.dataset.taskId;
        const task = store.getState().tasks.find((t) => t.id === tId);
        if (task) {
          this.onSelectTask(task);
        }
        return;
      }

      // Move task to / from sprint
      const moveBtn = e.target.closest(".move-task-btn");
      if (moveBtn) {
        const tId = moveBtn.dataset.taskId;
        const targetSprint = moveBtn.dataset.targetSprint || undefined;
        store.updateTask(tId, { sprintId: targetSprint });
        store.addToast("info", "Status Alokasi Tiket", targetSprint ? "Tiket berhasil dimasukkan ke sprint aktif." : "Tiket dikembalikan ke backlog pool.");
        return;
      }
    });

    // Search input event
    this.element.addEventListener("submit", (e) => {
      if (e.target.id === "createSprintModalForm") {
        e.preventDefault();
        const state = store.getState();
        const nameVal = this.element.querySelector("#modalSprintNameInput")?.value.trim();
        const statusVal = this.element.querySelector("#modalSprintStatusSelect")?.value || "future";
        const startVal = this.element.querySelector("#modalSprintStartInput")?.value || "2026-11-01";
        const endVal = this.element.querySelector("#modalSprintEndInput")?.value || "2026-11-14";
        const capVal = Number(this.element.querySelector("#modalSprintCapacityInput")?.value) || 160;
        const goalVal = this.element.querySelector("#modalSprintGoalInput")?.value.trim() || "";

        if (!nameVal) return;

        const newSprintId = `sprint-${Date.now()}`;
        const newSprint = {
          id: newSprintId,
          projectId: state.selectedProjectId,
          name: nameVal,
          startDate: startVal,
          endDate: endVal,
          capacityHours: capVal,
          goal: goalVal,
          status: statusVal,
        };

        const updatedSprints = (state.sprints || []).map((s) => {
          if (statusVal === "active" && s.projectId === state.selectedProjectId && s.status === "active") {
            return { ...s, status: "future" };
          }
          return s;
        });

        const selectedTaskIds = Array.from(this.element.querySelectorAll(".sprint-backlog-task-chk:checked")).map(
          (chk) => chk.value
        );

        const updatedTasks = (state.tasks || []).map((t) => {
          if (selectedTaskIds.includes(t.id)) {
            return { ...t, sprintId: newSprintId };
          }
          return t;
        });

        this.isCreateSprintModalOpen = false;
        store.setState({
          sprints: [...updatedSprints, newSprint],
          tasks: updatedTasks,
        });
        store.addToast(
          "success",
          "Sprint Berhasil Dibuat",
          `Sprint "${nameVal}" (${startVal} s/d ${endVal})${
            selectedTaskIds.length > 0 ? ` beserta ${selectedTaskIds.length} tiket` : ""
          } berhasil ditambahkan.`
        );
        return;
      }

      if (e.target.id === "createEpicModalForm") {
        e.preventDefault();
        const state = store.getState();
        const activeProj = store.getActiveProject();
        const keyVal = this.element.querySelector("#modalEpicKeyInput")?.value.trim() || "EPIC-NEW";
        const titleVal = this.element.querySelector("#modalEpicTitleInput")?.value.trim();
        const catVal = this.element.querySelector("#modalEpicCategorySelect")?.value || "Fullstack Module";
        const leadVal = this.element.querySelector("#modalEpicLeadSelect")?.value || "user-dev-1";
        const hoursVal = Number(this.element.querySelector("#modalEpicHoursInput")?.value) || 40;
        const descVal = this.element.querySelector("#modalEpicDescInput")?.value.trim() || "";
        const autoCreateTask = this.element.querySelector("#modalEpicAutoTaskChk")?.checked;

        if (!titleVal) return;

        const newEpicId = `epic-${Date.now()}`;
        const newEpic = {
          id: newEpicId,
          projectId: state.selectedProjectId,
          key: keyVal,
          title: titleVal,
          category: catVal,
          leadId: leadVal,
          estimateHours: hoursVal,
          description: descVal,
          color: this.selectedEpicColor || "#4f46e5",
        };

        this.isCreateEpicModalOpen = false;
        this.filterEpic = newEpicId;
        store.setState({ epics: [...(state.epics || []), newEpic] });

        if (autoCreateTask) {
          const projPrefix = activeProj?.code ? activeProj.code.split("-")[0] : "PRJ";
          store.createTask({
            projectId: state.selectedProjectId,
            type: "Feature",
            title: `[${catVal.split(" ")[0]}] Setup Arsitektur & Implementasi ${titleVal}`,
            description: descVal || `Implementasi spesifikasi modul ${titleVal} (${keyVal}).`,
            priority: "Tinggi",
            assigneeId: leadVal,
            epicId: newEpicId,
            estimateHours: Math.min(24, Math.max(8, Math.round(hoursVal / 2))),
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
            visibility: "client_public",
            source: "Manual",
            status: "Backlog",
            branchName: `feat/${projPrefix.toLowerCase()}-${keyVal.toLowerCase()}`,
          });
        }

        store.addToast("success", "Epik Baru Ditambahkan", `Epik "${keyVal}: ${titleVal}" berhasil dibuat.`);
        return;
      }
    });

    this.element.addEventListener("input", (e) => {
      if (e.target.id === "backlogSearchInput") {
        this.searchQuery = e.target.value;
        this.render();
        const newSearchInput = this.element.querySelector("#backlogSearchInput");
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      }
    });
  }
}
