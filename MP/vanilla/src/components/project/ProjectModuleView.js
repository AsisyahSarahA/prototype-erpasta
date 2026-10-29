/**
 * ProjectModuleView Component (100% Native Vanilla JS ES Module)
 * Implements the Project Management module faithfully matching the user's
 * reference screenshot:
 * 1. Top Utility Navigation Bar (Menu, Quick Links, Search, Create, Timer, Notif Badge, User Profile)
 * 2. Project Title Bar (Grid Icon, Project Name, Star, Reminders, Settings, Actions, Start Timer)
 * 3. Two-Row Sub-Module Navigation Tabs (Overview, Tasks List, Tasks Kanban, Milestones,
 *    Gantt, Notes, Files, Comments, Customer feedback, Timesheets, Invoices, Payments, Expenses, Contracts)
 *
 * 100% Flaticon Icons (Zero raw emojis/emoticons).
 * 100% Conforming to existing projects (LIB-DIG, POS-KLN, FTSL-PRO) and team members
 * (Asisyah, Azi, Aldyana, Jaka, Parhan).
 */

import { store } from '../../state/store.js';

export class ProjectModuleView {
  constructor(options = {}) {
    this.container = document.createElement('div');
    this.container.className = 'pm-project-module';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenCreateTask = options.onOpenCreateTask || (() => store.openCreateTaskModal());

    this.activeSubTab = 'overview';
    this.kanbanSearch = '';
    this.selectedFilterStatus = 'all';

    this.isActionsOpen = false;
    this.isRemindersOpen = false;
    this.isSettingsOpen = false;
    this.isAddNoteOpen = false;

    // Live Timer State
    this.isTimerRunning = false;
    this.timerSeconds = 0;
    this.timerInterval = null;

    // Project Reminders
    this.reminders = [
      { id: 'rem-1', text: 'Verifikasi integrasi webhook dan branch protection staging', date: '2026-10-28', done: false },
      { id: 'rem-2', text: 'Konfirmasi sign-off UAT dan invoice termin dengan stakeholder', date: '2026-11-02', done: false }
    ];

    // Reactive Comments Store for Project
    this.projectComments = [
      {
        id: 'c-1',
        authorName: 'Asisyah',
        authorRole: 'Project Manajer',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        time: 'Kemarin, 14:20',
        content: 'Sprint 1 fondasi microservice katalog dan Redis atomic lock sudah lolos review arsitektur. Mohon tim QA mulai susun skenario pengujian beban.'
      },
      {
        id: 'c-2',
        authorName: 'Jaka',
        authorRole: 'Backend Dev',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        time: 'Hari ini, 09:15',
        content: 'Endpoint API katalog buku dan sirkulasi peminjaman sudah di-deploy ke staging cluster. Docker compose dan migration schema siap diuji.'
      },
      {
        id: 'c-3',
        authorName: 'Parhan',
        authorRole: 'QA / Tester',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        time: 'Hari ini, 10:45',
        content: 'Matrix pengujian K6 sudah dibuat dengan target 2.000 concurrent RPS. Sedang menunggu webhook verifikasi dari Traefik Gateway.'
      }
    ];

    // Reactive Notes Store
    this.projectNotes = [
      {
        id: 'note-1',
        title: 'Arsitektur & Konvensi Microservices (ADR-001)',
        category: 'Technical Specs',
        date: '2026-10-19',
        author: 'Jaka (Backend Dev)',
        content: 'Semua request antar-layanan menggunakan REST API internal port 8001/8002 dengan format envelope JSON standar. Mutex locking menggunakan Redis db-0 TTL 3600 detik untuk mencegah race condition peminjaman ganda.'
      },
      {
        id: 'note-2',
        title: 'Ketentuan SLA & Garansi Maintenance Kampus',
        category: 'Legal & SLA',
        date: '2026-10-18',
        author: 'Asisyah (Project Manajer)',
        content: 'Durasi garansi bug berlaku 12 bulan (hingga Oktober 2027). Kuota pemeliharaan 25 jam/bulan untuk minor update dan optimasi database. SLA respon insiden kritis kategori S1 maksimal 2 jam kerja.'
      },
      {
        id: 'note-3',
        title: 'Integrasi Barcode Scanner Kartu & ESC/POS Thermal Print',
        category: 'Frontend Integration',
        date: '2026-10-21',
        author: 'Aldyana (Frontend Dev)',
        content: 'Web HID API digunakan untuk mendengarkan scanner barcode USB secara langsung tanpa dependensi driver eksternal. Format struk checkout sirkulasi mendukung printer thermal 58mm & 80mm.'
      }
    ];

    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });

    // Close actions dropdown on click outside
    document.addEventListener('click', (e) => {
      if (this.isActionsOpen && !e.target.closest('.pm-actions-dropdown-wrap')) {
        this.isActionsOpen = false;
        this.render();
      }
    });
  }

  toggleTimer() {
    if (!this.isTimerRunning) {
      this.isTimerRunning = true;
      this.timerInterval = setInterval(() => {
        this.timerSeconds += 1;
        const timerBtn = this.container.querySelector('#pmHeaderTimerBtn');
        if (timerBtn) {
          timerBtn.innerHTML = `<i class="fi fi-rr-clock"></i> <span>Stop timer (${this.formatTimerTime(this.timerSeconds)})</span>`;
          timerBtn.classList.add('pm-btn-pill--timer-running');
        }
      }, 1000);
      store.addToast('info', 'Timer Berjalan', 'Pencatatan waktu kerja proyek telah dimulai.');
    } else {
      this.isTimerRunning = false;
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      const hoursLogged = Math.max(0.25, Number((this.timerSeconds / 3600).toFixed(2)));
      const activeProject = store.getActiveProject();
      if (activeProject) {
        activeProject.totalHoursWorked = (activeProject.totalHoursWorked || 0) + hoursLogged;
      }
      store.addToast('success', 'Timer Disimpan', `${this.formatTimerTime(this.timerSeconds)} (${hoursLogged} Jam) dicatat ke timesheet proyek.`);
      this.timerSeconds = 0;
      this.render();
    }
  }

  formatTimerTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  toggleStar() {
    const project = store.getActiveProject();
    if (project) {
      project.isStarred = !project.isStarred;
      store.addToast(
        'info',
        project.isStarred ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit',
        `${project.name} diperbarui.`
      );
      this.render();
    }
  }

  getProjectStats(tasks) {
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.status === 'Selesai').length;
    const onReview = tasks.filter((t) => ['Review', 'QA Testing', 'Staging Deploy'].includes(t.status)).length;
    const inProgress = tasks.filter((t) => ['In Progress', 'Sedang Dikerjakan'].includes(t.status)).length;
    const todo = tasks.filter((t) => ['Backlog', 'Baru', 'To Do', 'Perlu Manual'].includes(t.status)).length;
    const progressPct = Math.round((done / total) * 100);
    const totalLoggedHours = tasks.reduce((acc, t) => acc + (Number(t.timeLoggedHours) || 0), 0);

    return { total, done, onReview, inProgress, todo, progressPct, totalLoggedHours };
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject() || state.projects[0];
    const projectTasks = store.getProjectTasks();
    const members = state.teamMembers || [];
    const stats = this.getProjectStats(projectTasks);

    const startDate = activeProject.startDate || activeProject.createdAt || '2026-10-18';
    const deadline = activeProject.deadline || activeProject.warrantyUntil || '2027-10-31';
    const clientName = activeProject.clientName || 'Universitas Nusantara Cendekia (Perpustakaan Pusat)';
    const totalHours = Math.max(stats.totalLoggedHours, activeProject.totalHoursWorked || 38);
    const progress = stats.progressPct;

    // Active user info
    const currentMember = members.find((m) => m.role.toLowerCase().includes((state.role || '').toLowerCase())) || members[0];
    const currentUserName = currentMember ? `${currentMember.name} (${currentMember.role})` : 'Asisyah (Project Manajer)';
    const contractValueJt = Math.round((activeProject.contractValue || 185e6) / 1e6);

    this.container.innerHTML = `
      <!-- ========================================================
           1. TOP ERP BREADCRUMB & CONTEXT STRIP
           ======================================================== -->
      <div class="pm-header-breadcrumb">
        <div class="pm-breadcrumb-left">
          <span class="pm-breadcrumb-item">ASTACODE ERP</span>
          <span class="pm-breadcrumb-sep">/</span>
          <span class="pm-breadcrumb-item">Management Proyek</span>
          <span class="pm-breadcrumb-sep">/</span>
          <span class="pm-breadcrumb-item">Perencanaan</span>
          <span class="pm-breadcrumb-sep">/</span>
          <span class="pm-breadcrumb-current">Modul Proyek (Executive Master Dashboard)</span>
        </div>
        <div class="pm-breadcrumb-right">
          <span class="pm-header-user-tag" title="Pengguna Aktif: ${currentUserName}">
            <i class="fi fi-rr-user"></i>
            <span>${currentUserName}</span>
          </span>
        </div>
      </div>

      <!-- ========================================================
           2. PROJECT TITLE & ACTIONS BAR
           ======================================================== -->
      <div class="pm-project-header-bar">
        <div class="pm-project-header-bar__left">
          <div class="pm-proj-icon-box" title="Modul Proyek Aktif">
            <i class="fi fi-rr-apps"></i>
          </div>

          <div class="pm-project-title-wrap">
            <div class="pm-proj-title-row">
              <h1 class="pm-proj-title" title="${activeProject.name}">
                ${activeProject.name}
              </h1>
              <button id="pmStarBtn" class="pm-star-btn ${activeProject.isStarred ? 'pm-star-btn--active' : ''}" title="${activeProject.isStarred ? 'Hapus dari favorit' : 'Tandai bintang favorit'}">
                <i class="${activeProject.isStarred ? 'fi fi-sr-star' : 'fi fi-rr-star'}"></i>
              </button>
            </div>

            <div class="pm-proj-meta-badges">
              <div class="pm-proj-select-wrap">
                <select id="pmProjectSwitcher" class="pm-proj-select" title="Ganti Proyek Aktif">
                  ${state.projects.map((p) => `
                    <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                      ${p.code} · ${p.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <span class="pm-header-pill pm-header-pill--live">
                <i class="fi fi-rr-check-circle"></i> Active &amp; Healthy
              </span>
              <span class="pm-header-pill pm-header-pill--fixed">
                <i class="fi fi-rr-receipt"></i> Fixed Price · Rp ${contractValueJt} Jt
              </span>
              <span class="pm-header-pill pm-header-pill--sla">
                <i class="fi fi-rr-shield-check"></i> Termin DP 30% Lunas
              </span>
              <span class="pm-header-pill pm-header-pill--sla">
                <i class="fi fi-rr-clock"></i> 28 Hari Menuju Staging
              </span>
            </div>
          </div>
        </div>

        <div class="pm-project-header-bar__right">
          <!-- Live Timer Button -->
          <button id="pmHeaderTimerBtn" class="pm-action-pill pm-action-pill--timer ${this.isTimerRunning ? 'pm-action-pill--timer-running' : ''}" title="Mulai / Hentikan pencatat waktu kerja">
            <i class="fi fi-rr-clock"></i>
            <span>${this.isTimerRunning ? `Stop timer (${this.formatTimerTime(this.timerSeconds)})` : 'Start timer'}</span>
          </button>

          <!-- Reminders Button -->
          <button id="pmRemindersBtn" class="pm-action-pill" title="Lihat pengingat proyek">
            <i class="fi fi-rr-bell"></i>
            <span>Reminders</span>
            <span class="pm-badge-count">${this.reminders.length}</span>
          </button>

          <!-- Settings Button -->
          <button id="pmSettingsBtn" class="pm-action-pill" title="Pengaturan proyek">
            <i class="fi fi-rr-settings"></i>
            <span>Settings</span>
          </button>

          <!-- Actions Dropdown -->
          <div class="pm-actions-dropdown-wrap">
            <button id="pmActionsToggleBtn" class="pm-action-pill" title="Menu tindakan proyek">
              <i class="fi fi-rr-menu-dots-vertical"></i>
              <span>Actions</span>
              <i class="fi fi-rr-angle-small-down"></i>
            </button>
            ${this.isActionsOpen ? `
              <div class="pm-dropdown-menu">
                <button class="pm-dropdown-item" data-action="export_pdf">
                  <i class="fi fi-rr-download"></i> Unduh Ringkasan PDF
                </button>
                <button class="pm-dropdown-item" data-action="new_task">
                  <i class="fi fi-rr-plus"></i> Tambah Tugas Baru
                </button>
                <button class="pm-dropdown-item" data-action="view_gantt">
                  <i class="fi fi-rr-calendar"></i> Buka Tampilan Gantt
                </button>
                <button class="pm-dropdown-item" data-action="crm_sync">
                  <i class="fi fi-rr-briefcase"></i> Sinkronisasi Deal CRM
                </button>
                <div class="pm-dropdown-divider"></div>
                <button class="pm-dropdown-item pm-dropdown-item--danger" data-action="mark_finished">
                  <i class="fi fi-rr-check-circle"></i> Tandai Proyek Selesai
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Primary + Buat Tiket Button -->
          <button id="pmHeaderCreateTaskBtn" class="pm-action-pill pm-action-pill--primary" title="Tambah tiket baru ke proyek">
            <i class="fi fi-rr-plus"></i>
            <span>Buat Tiket</span>
          </button>
        </div>
      </div>

      <!-- ========================================================
           3. SINGLE-LINE SUB-MODULE NAVIGATION TABS (ALL 14 TABS)
           ======================================================== -->
      <nav class="pm-submodules-nav">
        ${[
          { id: 'overview', label: 'Executive Overview', icon: 'fi-rr-dashboard', badge: 'Live' },
          { id: 'tasks_kanban', label: 'Papan Kanban', icon: 'fi-rr-apps', badge: stats.total },
          { id: 'tasks_list', label: 'Tasks List', icon: 'fi-rr-list-check', badge: stats.total },
          { id: 'milestones', label: 'Milestones', icon: 'fi-rr-flag', badge: '4' },
          { id: 'gantt', label: 'Gantt & Roadmap', icon: 'fi-rr-chart-timeline' },
          { id: 'notes', label: 'Catatan & Specs', icon: 'fi-rr-document', badge: this.projectNotes.length },
          { id: 'files', label: 'Berkas & Dokumen', icon: 'fi-rr-folder' },
          { id: 'comments', label: 'Diskusi Tim', icon: 'fi-rr-comments', badge: this.projectComments.length },
          { id: 'customer_feedback', label: 'Customer Portal', icon: 'fi-rr-headset' },
          { id: 'timesheets', label: 'Timesheets & HR', icon: 'fi-rr-clock', badge: `${totalHours}h` },
          { id: 'invoices', label: 'Finance & Invoices', icon: 'fi-rr-receipt', badge: `Rp ${contractValueJt}Jt` },
          { id: 'payments', label: 'Payments', icon: 'fi-rr-credit-card' },
          { id: 'expenses', label: 'Expenses', icon: 'fi-rr-wallet' },
          { id: 'contracts', label: 'Kontrak & SPK', icon: 'fi-rr-diploma' }
        ].map((tab) => `
          <button class="pm-subtab-btn ${this.activeSubTab === tab.id ? 'pm-subtab-btn--active' : ''}" data-subtab="${tab.id}">
            <i class="fi ${tab.icon}"></i>
            <span>${tab.label}</span>
            ${tab.badge ? `<span class="pm-tab-badge">${tab.badge}</span>` : ''}
          </button>
        `).join('')}
      </nav>

      <!-- ========================================================
           4. MAIN CONTENT AREA (DYNAMIC SUB-TAB CONTENT)
           ======================================================== -->
      <main class="pm-content">
        ${this.renderSubTabContent({
          project: activeProject,
          tasks: projectTasks,
          members,
          stats,
          startDate,
          deadline,
          clientName,
          totalHours,
          progress
        })}
      </main>

      <!-- Reminders Modal Popover -->
      ${this.isRemindersOpen ? this.renderRemindersModal(activeProject) : ''}

      <!-- Settings Modal Popover -->
      ${this.isSettingsOpen ? this.renderSettingsModal(activeProject) : ''}

      <!-- Add Note Modal Popover -->
      ${this.isAddNoteOpen ? this.renderAddNoteModal(activeProject) : ''}
    `;

    this.attachEvents();
  }

  // --- SUB-MODULE ROUTING DISPATCHER ---
  renderSubTabContent(ctx) {
    switch (this.activeSubTab) {
      case 'overview':
        return this.renderOverviewTab(ctx);
      case 'tasks_list':
        return this.renderTasksListTab(ctx);
      case 'tasks_kanban':
        return this.renderTasksKanbanTab(ctx);
      case 'milestones':
        return this.renderMilestonesTab(ctx);
      case 'gantt':
        return this.renderGanttTab(ctx);
      case 'notes':
        return this.renderNotesTab(ctx);
      case 'files':
        return this.renderFilesTab(ctx);
      case 'comments':
        return this.renderCommentsTab(ctx);
      case 'customer_feedback':
        return this.renderCustomerFeedbackTab(ctx);
      case 'timesheets':
        return this.renderTimesheetsTab(ctx);
      case 'invoices':
        return this.renderInvoicesTab(ctx);
      case 'payments':
        return this.renderPaymentsTab(ctx);
      case 'expenses':
        return this.renderExpensesTab(ctx);
      case 'contracts':
        return this.renderContractsTab(ctx);
      default:
        return this.renderOverviewTab(ctx);
    }
  }

  // =========================================================================
  // 1. SUB-MODULE: EXECUTIVE MASTER PROJECT DASHBOARD (INFORMATIVE ALL-IN-ONE)
  // =========================================================================
  renderOverviewTab({ project, startDate, deadline, clientName, totalHours, progress, tasks, members }) {
    const state = store.getState();
    const epics = store.getProjectEpics();
    const sprints = state.sprints.filter(s => s.projectId === project.id);
    const activeSprint = sprints.find(s => s.status === 'active') || sprints[0] || {
      id: 'sprint-lib-1',
      name: 'Sprint 1: Fondasi Microservices Laravel, React UI & Sirkulasi Buku',
      startDate: '2026-10-18',
      endDate: '2026-11-01'
    };
    const invoices = state.invoices.filter(i => i.projectId === project.id);
    const crmDeal = state.crmDeals.find(d => d.clientName === project.clientName) || state.crmDeals[0] || {};
    const branches = project.branches || [];

    // 6 Software House Workflow Stages
    const STAGES = [
      { id: 'backlog', name: 'Backlog & Spec', matchStatuses: ['Backlog', 'Baru'], color: '#94a3b8' },
      { id: 'todo', name: 'Scope & Arsitektur', matchStatuses: ['To Do', 'Dianalisis'], color: '#3b82f6' },
      { id: 'in_progress', name: 'Coding Sprint', matchStatuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'], color: '#6366f1' },
      { id: 'code_review', name: 'Code Review PR', matchStatuses: ['In Review', 'Menunggu Persetujuan'], color: '#f59e0b' },
      { id: 'qa_staging', name: 'QA & Staging UAT', matchStatuses: ['QA/Testing', 'Deploy Staging', 'Disetujui'], color: '#8b5cf6' },
      { id: 'done', name: 'Production Live', matchStatuses: ['Selesai', 'Deploy Production', 'Dipantau'], color: '#10b981' }
    ];

    const stageBreakdown = STAGES.map((s, idx) => {
      const stageTasks = tasks.filter(t => s.matchStatuses.includes(t.status));
      return {
        ...s,
        idx: idx + 1,
        tasks: stageTasks,
        count: stageTasks.length
      };
    });

    // Sprints Burn
    const sprintTasks = tasks.filter(t => t.sprintId === activeSprint.id);
    const sprintTotalHours = sprintTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0) || 296;
    const sprintDoneHours = sprintTasks.filter(t => t.status === 'Selesai').reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0) || 48;
    const sprintProgressHours = sprintTasks.filter(t => ['In Progress', 'Sedang Dikerjakan'].includes(t.status)).reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0) || 92;
    const sprintTodoHours = Math.max(0, sprintTotalHours - sprintDoneHours - sprintProgressHours);

    const donePct = Math.round((sprintDoneHours / sprintTotalHours) * 100) || 16;
    const progPct = Math.round((sprintProgressHours / sprintTotalHours) * 100) || 31;
    const todoPct = Math.max(0, 100 - donePct - progPct);

    // Active Preview Tasks (3-4 tasks)
    const previewTasks = tasks.filter(t => ['In Progress', 'In Review', 'QA/Testing'].includes(t.status)).slice(0, 4);

    // Epics Summary
    const epicsSummary = epics.slice(0, 6).map(e => {
      const eTasks = tasks.filter(t => t.epicId === e.id);
      const doneCount = eTasks.filter(t => t.status === 'Selesai').length;
      const hours = eTasks.reduce((sum, t) => sum + (Number(t.estimateHours) || 0), 0);
      return {
        ...e,
        taskCount: eTasks.length,
        doneCount,
        hours
      };
    });

    // Team Workload (5 Developers)
    const workloadData = members.map(m => {
      const mTasks = tasks.filter(t => t.assigneeId === m.id);
      const hours = mTasks.reduce((sum, t) => sum + (Number(t.estimateHours) || Number(t.timeLoggedHours) || 0), 0);
      const pct = Math.round((hours / 40) * 100);
      return {
        ...m,
        taskCount: mTasks.length,
        hours,
        pct,
        isOver: hours > 40
      };
    });

    // Finance Data
    const contractVal = project.contractValue || 185000000;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    // Activity Stream
    const activityItems = this.getProjectActivities(project.id, tasks, members);

    // Bugs
    const bugs = tasks.filter(t => (t.type || '').toLowerCase() === 'bug');
    const hotfixBugs = bugs.filter(b => b.priority === 'Hotfix' || b.priority === 'Tinggi' || b.severity === 'Kritis');

    return `
      <div class="pm-executive-dashboard">
        <!-- ========================================================
             ROW 1: EXECUTIVE KPI SCORECARDS (6 CARDS)
             ======================================================== -->
        <div class="pm-kpi-grid">
          <!-- Card 1: Health & Overall Progress -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">Progress &amp; Health</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--indigo"><i class="fi fi-rr-dashboard"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">${progress}%</span>
              <span class="pm-kpi-subtext">Selesai</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag pm-kpi-status-tag--success">🟢 On-Track (Fase 3)</span>
              <button class="pm-kpi-action-link" data-nav-module="timeline">Roadmap →</button>
            </div>
          </div>

          <!-- Card 2: Papan Kanban (6 Stages) -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">Papan Kanban</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--blue"><i class="fi fi-rr-apps"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">${tasks.length}</span>
              <span class="pm-kpi-subtext">Total Tiket</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag">${stageBreakdown[2].count} Coding · ${stageBreakdown[3].count} Review</span>
              <button class="pm-kpi-action-link" data-nav-module="kanban">Kanban →</button>
            </div>
          </div>

          <!-- Card 3: Active Sprint & Backlog -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">Sprint 1 Aktif</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--emerald"><i class="fi fi-rr-rocket-lunch"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">${sprintTasks.length}</span>
              <span class="pm-kpi-subtext">Tiket (${sprintTotalHours} Jam)</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag pm-kpi-status-tag--warning">${sprintDoneHours}h Selesai (${donePct}%)</span>
              <button class="pm-kpi-action-link" data-nav-module="backlog">Backlog →</button>
            </div>
          </div>

          <!-- Card 4: Tim HR & Workload -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">Beban Tim Dev</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--violet"><i class="fi fi-rr-users-alt"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">395h</span>
              <span class="pm-kpi-subtext">/ 200h kuota</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag pm-kpi-status-tag--danger">2 Dev Overload</span>
              <button class="pm-kpi-action-link" data-nav-module="team">Tim HR →</button>
            </div>
          </div>

          <!-- Card 5: AI Bug & GitHub DevOps -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">AI Hub &amp; GitHub</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--rose"><i class="fi fi-rr-magic-wand"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">94%</span>
              <span class="pm-kpi-subtext">AI Fix Conf.</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag pm-kpi-status-tag--success">✓ 6/6 CI Passing</span>
              <button class="pm-kpi-action-link" data-nav-module="ai_hub">AI Hub →</button>
            </div>
          </div>

          <!-- Card 6: Finance & Contract Value -->
          <div class="pm-kpi-card">
            <div class="pm-kpi-card__top">
              <span class="pm-kpi-label">Finance &amp; Nilai</span>
              <span class="pm-kpi-icon-badge pm-kpi-icon-badge--amber"><i class="fi fi-rr-receipt"></i></span>
            </div>
            <div class="pm-kpi-main">
              <span class="pm-kpi-value">Rp ${Math.round(contractVal / 1e6)}Jt</span>
              <span class="pm-kpi-subtext">Fixed Price</span>
            </div>
            <div class="pm-kpi-footer">
              <span class="pm-kpi-status-tag pm-kpi-status-tag--success">DP 30% Lunas</span>
              <button class="pm-kpi-action-link" data-nav-module="finance">Invoices →</button>
            </div>
          </div>
        </div>

        <!-- ========================================================
             ROW 2: TWO-COLUMN DEEP-DIVE GRID (62% LEFT / 38% RIGHT)
             ======================================================== -->
        <div class="pm-dashboard-layout">
          <!-- LEFT COLUMN (62% WIDTH): PLANNING & ENGINEERING -->
          <div class="pm-dash-col">
            <!-- WIDGET 1: PAPAN KANBAN (ALUR SIKLUS 6 FASE SOFTWARE HOUSE) -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-apps" style="color: #4f46e5; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Alur Siklus 6 Fase Standar Software House</h3>
                    <p class="pm-widget-subtitle">Distribusi tiket aktif di sepanjang alur produksi software house</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--indigo">6 Tahapan</span>
              </div>

              <!-- 6-Stage Stepper Pipeline -->
              <div class="pm-pipeline-stepper">
                ${stageBreakdown.map((s) => `
                  <div class="pm-pipe-step ${s.count > 0 ? 'pm-pipe-step--active' : ''}" data-nav-module="kanban" title="Klik untuk membuka kolom ${s.name}">
                    <span class="pm-pipe-step-num">Fase ${s.idx}</span>
                    <strong class="pm-pipe-step-title">${s.name}</strong>
                    <div class="pm-pipe-step-count">
                      <span class="pm-pipe-step-dot" style="background-color: ${s.color};"></span>
                      <span>${s.count} Tiket</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Active Tasks Preview -->
              <div class="pm-tasks-preview-wrap">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Tiket Sedang Dikerjakan (In Progress &amp; Review)</span>
                  <span style="font-size: 11px; color: #94a3b8;">Menampilkan ${previewTasks.length} tiket</span>
                </div>

                <div class="pm-tasks-preview-list">
                  ${previewTasks.map((t) => {
                    const assignee = members.find(m => m.id === t.assigneeId) || { name: 'Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' };
                    return `
                      <div class="pm-task-preview-row" data-task-id="${t.id}" title="Klik untuk membuka detail tiket ${t.key}">
                        <div class="pm-tpr-left">
                          <span class="pm-tpr-key">${t.key}</span>
                          <span class="pm-tpr-title">${t.title}</span>
                        </div>
                        <div class="pm-tpr-right">
                          <span class="pm-header-pill pm-header-pill--live">${t.status}</span>
                          <span class="pm-tpr-hours">${t.estimateHours || 16}h</span>
                          <img src="${assignee.avatar}" alt="${assignee.name}" class="pm-tpr-avatar" title="${assignee.name} (${assignee.role})" />
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <div style="text-align: right; padding-top: 4px;">
                <button class="pm-btn pm-btn--outline" data-nav-module="kanban">
                  <i class="fi fi-rr-apps"></i>
                  <span>Lihat Seluruh Papan Kanban (6 Kolom) →</span>
                </button>
              </div>
            </div>

            <!-- WIDGET 2: BACKLOG & SPRINTS (ACTIVE SPRINT & EPICS COMPLETION) -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-rocket-lunch" style="color: #059669; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Backlog &amp; Perencanaan Sprint</h3>
                    <p class="pm-widget-subtitle">Kemajuan burn-down sprint aktif dan progres 7 epics arsitektur</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--emerald">Sprint 1 Aktif</span>
              </div>

              <!-- Sprint 1 Burn Box -->
              <div class="pm-sprint-burn-box">
                <div class="pm-sprint-header">
                  <div>
                    <strong class="pm-sprint-title">${activeSprint.name}</strong>
                    <div class="pm-sprint-dates">Periode: ${activeSprint.startDate} s/d ${activeSprint.endDate} · 4 Hari Tersisa</div>
                  </div>
                  <span class="pm-header-pill pm-header-pill--live">${sprintTasks.length} Tiket Aktif</span>
                </div>

                <!-- Multi-segment Progress Bar -->
                <div class="pm-burn-progress-track">
                  <div class="pm-burn-fill pm-burn-fill--done" style="width: ${donePct}%;" title="Selesai: ${sprintDoneHours} Jam (${donePct}%)"></div>
                  <div class="pm-burn-fill pm-burn-fill--progress" style="width: ${progPct}%;" title="In Progress: ${sprintProgressHours} Jam (${progPct}%)"></div>
                  <div class="pm-burn-fill pm-burn-fill--todo" style="width: ${todoPct}%;" title="To Do: ${sprintTodoHours} Jam (${todoPct}%)"></div>
                </div>

                <div class="pm-burn-legend">
                  <span><span class="pm-burn-dot" style="background-color: #10b981;"></span> Selesai: <strong>${sprintDoneHours}h</strong> (${donePct}%)</span>
                  <span><span class="pm-burn-dot" style="background-color: #3b82f6;"></span> In Progress: <strong>${sprintProgressHours}h</strong> (${progPct}%)</span>
                  <span><span class="pm-burn-dot" style="background-color: #cbd5e1;"></span> To Do: <strong>${sprintTodoHours}h</strong> (${todoPct}%)</span>
                  <span style="margin-left: auto; color: #64748b;">Total: <strong>${sprintTotalHours}h</strong></span>
                </div>
              </div>

              <!-- Epics Summary Grid -->
              <div>
                <span style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; display: block; margin-bottom: 8px;">Epics Arsitektur &amp; Beban Modul</span>
                <div class="pm-epics-summary-grid">
                  ${epicsSummary.map((e) => `
                    <div class="pm-epic-summary-card">
                      <div class="pm-epic-left">
                        <span class="pm-epic-color-bar" style="background-color: ${e.color || '#3b82f6'};"></span>
                        <span class="pm-epic-title" title="${e.title}">${e.title}</span>
                      </div>
                      <span class="pm-epic-stats">${e.doneCount}/${e.taskCount} (${e.hours}h)</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="text-align: right; padding-top: 4px;">
                <button class="pm-btn pm-btn--outline" data-nav-module="backlog">
                  <i class="fi fi-rr-rocket-lunch"></i>
                  <span>Buka Backlog &amp; Sprints Matrix →</span>
                </button>
              </div>
            </div>

            <!-- WIDGET 3: DEVOPS GITHUB & AI BUG HUB (2-COLUMN SPLIT) -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-code-compare" style="color: #7c3aed; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Pengembangan &amp; Otomasi AI Hub</h3>
                    <p class="pm-widget-subtitle">Integrasi pipeline Git CI/CD dan sistem auto-fixing bug sentry</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--indigo">DevOps &amp; AI</span>
              </div>

              <div class="pm-devops-grid">
                <!-- Subcard 1: GitHub & CI/CD -->
                <div class="pm-devops-subcard">
                  <div class="pm-devops-subcard-header">
                    <span class="pm-devops-title"><i class="fi fi-brands-github"></i> GitHub &amp; Cabang</span>
                    <span class="pm-header-pill pm-header-pill--live">Connected</span>
                  </div>

                  <div class="pm-devops-meta-list">
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Branch Utama:</span>
                      <span class="pm-devops-meta-val pm-devops-meta-val--code">main (9a10bf3)</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Active Feature:</span>
                      <span class="pm-devops-meta-val pm-devops-meta-val--code">feature/katalog</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">CI/CD Pipeline:</span>
                      <span class="pm-devops-meta-val" style="color: #059669;">✓ 6/6 Passing</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Staging Cluster:</span>
                      <a href="${project.stagingUrl || '#'}" target="_blank" class="pm-csr-val--link" style="font-size: 11px;">staging-perpus ↗</a>
                    </div>
                  </div>

                  <button class="pm-btn pm-btn--outline pm-btn--sm" data-nav-module="github">
                    <i class="fi fi-brands-github"></i>
                    <span>Kelola Git &amp; Cabang</span>
                  </button>
                </div>

                <!-- Subcard 2: AI Bug Automation -->
                <div class="pm-devops-subcard">
                  <div class="pm-devops-subcard-header">
                    <span class="pm-devops-title"><i class="fi fi-rr-magic-wand"></i> Otomasi Fix Bug AI</span>
                    <span class="pm-header-pill pm-header-pill--fixed">DeepSeek Agent</span>
                  </div>

                  <div class="pm-devops-meta-list">
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Resolusi Otomatis:</span>
                      <span class="pm-devops-meta-val" style="color: #059669;">3 Bug Fixed (94%)</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Terakhir Diperbaiki:</span>
                      <span class="pm-devops-meta-val pm-devops-meta-val--code">LIB-101 Connection</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Sentry Hotfix Alert:</span>
                      <span class="pm-devops-meta-val" style="color: #e11d48; font-weight: 700;">${hotfixBugs.length} Tiket Hotfix</span>
                    </div>
                    <div class="pm-devops-meta-row">
                      <span class="pm-devops-meta-label">Rata-Rata Latensi:</span>
                      <span class="pm-devops-meta-val">4.2 Detik</span>
                    </div>
                  </div>

                  <button class="pm-btn pm-btn--primary pm-btn--sm" data-nav-module="ai_hub">
                    <i class="fi fi-rr-magic-wand"></i>
                    <span>Buka Otomasi AI Hub</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- WIDGET 4: FINANCE & TERMIN INVOICES -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-receipt" style="color: #059669; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Finance &amp; Jadwal Termin Pembayaran</h3>
                    <p class="pm-widget-subtitle">Skema Fixed Price: Termin DP 30%, UAT Staging 40%, Pelunasan 30%</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--emerald">Nilai: ${formatRp(contractVal)}</span>
              </div>

              <div class="pm-finance-termin-list">
                <!-- Termin 1: DP 30% -->
                <div class="pm-finance-termin-item">
                  <div class="pm-fti-left">
                    <span class="pm-fti-num pm-fti-num--lunas">1</span>
                    <div class="pm-fti-info">
                      <span class="pm-fti-name">Termin 1: Down Payment (DP 30%) Kick-off</span>
                      <span class="pm-fti-desc">No. Faktur: INV/2026/10/LIB-001 · Diterima 18 Okt 2026</span>
                    </div>
                  </div>
                  <div class="pm-fti-right">
                    <span class="pm-fti-amount">${formatRp(55500000)}</span>
                    <span class="pm-fti-badge pm-fti-badge--lunas">LUNAS</span>
                  </div>
                </div>

                <!-- Termin 2: UAT Staging 40% -->
                <div class="pm-finance-termin-item">
                  <div class="pm-fti-left">
                    <span class="pm-fti-num">2</span>
                    <div class="pm-fti-info">
                      <span class="pm-fti-name">Termin 2: Sign-Off UAT Staging &amp; Load Test (40%)</span>
                      <span class="pm-fti-desc">Syarat: Lulus uji beban K6 2.000 RPS &amp; persetujuan Kepala Perpustakaan</span>
                    </div>
                  </div>
                  <div class="pm-fti-right">
                    <span class="pm-fti-amount">${formatRp(74000000)}</span>
                    <span class="pm-fti-badge pm-fti-badge--pending">MENUNGGU UAT</span>
                  </div>
                </div>

                <!-- Termin 3: Final Live 30% -->
                <div class="pm-finance-termin-item">
                  <div class="pm-fti-left">
                    <span class="pm-fti-num">3</span>
                    <div class="pm-fti-info">
                      <span class="pm-fti-name">Termin 3: Handover Production Live &amp; Pelatihan (30%)</span>
                      <span class="pm-fti-desc">Syarat: Go-Live kampus, integrasi barcode kartu, dan penyerahan SPK</span>
                    </div>
                  </div>
                  <div class="pm-fti-right">
                    <span class="pm-fti-amount">${formatRp(55500000)}</span>
                    <span class="pm-fti-badge pm-fti-badge--scheduled">TERJADWAL DES 2026</span>
                  </div>
                </div>
              </div>

              <div style="text-align: right; padding-top: 4px;">
                <button class="pm-btn pm-btn--outline" data-nav-module="finance">
                  <i class="fi fi-rr-receipt"></i>
                  <span>Kelola Faktur &amp; Invoices →</span>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (38% WIDTH): CLIENT, TEAM, ROADMAP & QUICK TILES -->
          <div class="pm-dash-col">
            <!-- WIDGET 5: PROFIL KLIEN REKANAN & CRM DEALS WON -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-building" style="color: #2563eb; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Klien &amp; Asal Deal CRM</h3>
                    <p class="pm-widget-subtitle">Informasi stakeholder dan track record closing CRM</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--indigo">SLA: 99.4%</span>
              </div>

              <div class="pm-client-spec-box">
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">Institusi:</span>
                  <span class="pm-csr-val">${clientName}</span>
                </div>
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">PIC Rektorat:</span>
                  <span class="pm-csr-val">${crmDeal.clientPic || 'Dra. Hj. Ratna Wulandari, M.Hum'}</span>
                </div>
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">Email PIC:</span>
                  <span class="pm-csr-val">${crmDeal.clientEmail || 'perpustakaan@nusantara.ac.id'}</span>
                </div>
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">Asal CRM Deal:</span>
                  <span class="pm-csr-val" style="color: #059669; font-weight: 700;">${crmDeal.dealCode || 'DEAL-PERPUS-01'} (Closing/Won)</span>
                </div>
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">Garansi Bug:</span>
                  <span class="pm-csr-val">12 Bulan (Hingga 31 Okt 2027)</span>
                </div>
                <div class="pm-client-spec-row">
                  <span class="pm-csr-label">SLA Respons S1:</span>
                  <span class="pm-csr-val" style="color: #4f46e5;">&lt; 2 Jam (Hotfix &lt; 6 Jam)</span>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="pm-btn pm-btn--outline pm-btn--sm" style="flex: 1;" data-nav-module="client">
                  <i class="fi fi-rr-headset"></i> Portal Klien
                </button>
                <button class="pm-btn pm-btn--outline pm-btn--sm" style="flex: 1;" data-nav-module="crm">
                  <i class="fi fi-rr-briefcase"></i> Deal CRM
                </button>
              </div>
            </div>

            <!-- WIDGET 6: TIM HR & WORKLOAD (5 DEVELOPER ROLES) -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-users-alt" style="color: #7c3aed; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Tim HR &amp; Beban Kerja (5 Roles)</h3>
                    <p class="pm-widget-subtitle">Alokasi beban kerja mingguan vs kapasitas 40h/role</p>
                  </div>
                </div>
                <button class="pm-kpi-action-link" data-nav-module="team">Detail →</button>
              </div>

              <div class="pm-team-mini-grid">
                ${workloadData.map((m) => {
                  const barColor = m.hours > 80 ? '#ef4444' : m.hours > 40 ? '#f59e0b' : '#10b981';
                  return `
                    <div class="pm-team-mini-row" data-nav-module="team" title="Klik untuk membuka profil ${m.name}">
                      <div class="pm-tm-left">
                        <img src="${m.avatar}" alt="${m.name}" class="pm-tm-avatar" />
                        <div class="pm-tm-info">
                          <span class="pm-tm-name">${m.name}</span>
                          <span class="pm-tm-role">${m.role} · ${m.taskCount} Tiket</span>
                        </div>
                      </div>
                      <div class="pm-tm-right">
                        <div class="pm-tm-meter">
                          <span class="pm-tm-hours-text">${m.hours}h</span>
                          <div class="pm-tm-meter-bar">
                            <div class="pm-tm-meter-fill" style="width: ${Math.min(100, m.pct)}%; background-color: ${barColor};"></div>
                          </div>
                        </div>
                        ${m.isOver ? `<span class="pm-tm-over-badge">${m.pct}%</span>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div style="text-align: right; padding-top: 4px;">
                <button class="pm-btn pm-btn--outline pm-btn--sm" style="width: 100%;" data-nav-module="team">
                  <i class="fi fi-rr-users-alt"></i>
                  <span>Kelola Alokasi Tim &amp; Workload →</span>
                </button>
              </div>
            </div>

            <!-- WIDGET 7: ROADMAP MILESTONES -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-flag" style="color: #f59e0b; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Timeline &amp; Milestone Gates</h3>
                    <p class="pm-widget-subtitle">Target rilis rute pengiriman software house</p>
                  </div>
                </div>
                <button class="pm-kpi-action-link" data-nav-module="timeline">Gantt →</button>
              </div>

              <div class="pm-milestone-gate-list">
                <div class="pm-milestone-gate-item">
                  <div class="pm-mgi-left">
                    <span class="pm-mgi-icon pm-mgi-icon--done"><i class="fi fi-rr-check"></i></span>
                    <div>
                      <strong class="pm-mgi-title">M1: Arsitektur &amp; Database Schema</strong>
                      <div class="pm-mgi-target">Selesai 18 Okt 2026 · Microservices ADR</div>
                    </div>
                  </div>
                  <span class="pm-mgi-pct" style="color: #059669;">100%</span>
                </div>

                <div class="pm-milestone-gate-item">
                  <div class="pm-mgi-left">
                    <span class="pm-mgi-icon pm-mgi-icon--active"><i class="fi fi-rr-play"></i></span>
                    <div>
                      <strong class="pm-mgi-title">M2: Sprint 1 Core Microservices</strong>
                      <div class="pm-mgi-target">Target 01 Nov 2026 · Katalog, OPAC, Redis Lock</div>
                    </div>
                  </div>
                  <span class="pm-mgi-pct" style="color: #4f46e5;">65%</span>
                </div>

                <div class="pm-milestone-gate-item">
                  <div class="pm-mgi-left">
                    <span class="pm-mgi-icon"><i class="fi fi-rr-clock"></i></span>
                    <div>
                      <strong class="pm-mgi-title">M3: Staging Load Testing K6 &amp; UAT</strong>
                      <div class="pm-mgi-target">Target 16 Nov 2026 · Target 2.000 RPS</div>
                    </div>
                  </div>
                  <span class="pm-mgi-pct" style="color: #64748b;">15%</span>
                </div>

                <div class="pm-milestone-gate-item">
                  <div class="pm-mgi-left">
                    <span class="pm-mgi-icon"><i class="fi fi-rr-globe"></i></span>
                    <div>
                      <strong class="pm-mgi-title">M4: Go-Live Production &amp; Pelatihan</strong>
                      <div class="pm-mgi-target">Target 15 Des 2026 · Serah Terima SPK</div>
                    </div>
                  </div>
                  <span class="pm-mgi-pct" style="color: #64748b;">0%</span>
                </div>
              </div>
            </div>

            <!-- WIDGET 8: AKTIVITAS & AUDIT LOG REAL-TIME -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-time-past" style="color: #3b82f6; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Aktivitas &amp; Log Real-Time</h3>
                    <p class="pm-widget-subtitle">Riwayat status tiket dan perubahan terbaru tim</p>
                  </div>
                </div>
                <span class="pm-widget-badge">Live</span>
              </div>

              <div class="pm-activity-stream">
                ${activityItems.map((item) => `
                  <div class="pm-stream-item">
                    <img src="${item.avatar}" alt="${item.userName}" class="pm-stream-avatar" />
                    <div class="pm-stream-body">
                      <p class="pm-stream-line">
                        <strong class="pm-stream-user">${item.userName}</strong>
                        <span class="pm-stream-action">${item.action}</span>
                        <strong class="pm-stream-target" data-task-id="${item.target}">${item.target}</strong>
                      </p>
                      <span class="pm-stream-time">${item.time}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- WIDGET 9: PINTASAN CEPAT ANTAR SUB-MODUL (QUICK NAVIGATION HUB) -->
            <div class="pm-widget-card">
              <div class="pm-widget-header">
                <div class="pm-widget-title-group">
                  <i class="fi fi-rr-navigation" style="color: #4f46e5; font-size: 16px;"></i>
                  <div>
                    <h3 class="pm-widget-title">Pintasan Antar Modul Proyek</h3>
                    <p class="pm-widget-subtitle">Akses instan ke semua sub-modul Management Proyek</p>
                  </div>
                </div>
                <span class="pm-widget-badge pm-widget-badge--indigo">10 Modul</span>
              </div>

              <div class="pm-quick-nav-grid">
                <button class="pm-quick-tile" data-nav-module="kanban">
                  <i class="fi fi-rr-apps"></i>
                  <span>Papan Kanban</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="backlog">
                  <i class="fi fi-rr-rocket-lunch"></i>
                  <span>Backlog &amp; Sprints</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="timeline">
                  <i class="fi fi-rr-chart-timeline"></i>
                  <span>Timeline Roadmap</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="list">
                  <i class="fi fi-rr-list-check"></i>
                  <span>Daftar Pekerjaan (JQL)</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="ai_hub">
                  <i class="fi fi-rr-magic-wand"></i>
                  <span>Otomasi Fix Bug AI</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="github">
                  <i class="fi fi-brands-github"></i>
                  <span>GitHub &amp; Cabang</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="client">
                  <i class="fi fi-rr-headset"></i>
                  <span>Service Desk / Klien</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="team">
                  <i class="fi fi-rr-users-alt"></i>
                  <span>Tim HR &amp; Workload</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="finance">
                  <i class="fi fi-rr-receipt"></i>
                  <span>Finance &amp; Invoices</span>
                </button>
                <button class="pm-quick-tile" data-nav-module="crm">
                  <i class="fi fi-rr-briefcase"></i>
                  <span>CRM Deals Won</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getProjectActivities(projectId, tasks, members) {
    const defaultUser = members[0] || { name: 'Asisyah', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' };
    const getMember = (nameOrId) => members.find((m) => m.id === nameOrId || m.name.toLowerCase().includes((nameOrId || '').toLowerCase())) || defaultUser;

    return [
      {
        userName: getMember('user-dev-3').name,
        avatar: getMember('user-dev-3').avatar,
        action: 'menyelesaikan pengujian integrasi REST API katalog buku pada',
        target: tasks[0] ? tasks[0].key : 'LIB-101',
        time: '32 menit yang lalu'
      },
      {
        userName: getMember('user-dev-2').name,
        avatar: getMember('user-dev-2').avatar,
        action: 'memperbarui komponen UI OPAC dan validasi barcode pada',
        target: tasks[1] ? tasks[1].key : 'LIB-102',
        time: '2 jam yang lalu'
      },
      {
        userName: getMember('user-qa').name,
        avatar: getMember('user-qa').avatar,
        action: 'menjalankan load testing K6 2000 RPS dan verifikasi staging untuk',
        target: 'LIB-108',
        time: '4 jam yang lalu'
      },
      {
        userName: getMember('user-dev-1').name,
        avatar: getMember('user-dev-1').avatar,
        action: 'mengonfigurasi Traefik reverse proxy dan SSL Let’s Encrypt pada',
        target: 'LIB-113',
        time: 'Kemarin, 16:45'
      },
      {
        userName: getMember('user-pm').name,
        avatar: getMember('user-pm').avatar,
        action: 'mengonfirmasi termin milestone DP 30% dan jadwal kickoff bersama',
        target: 'LIB-111',
        time: 'Kemarin, 11:10'
      }
    ];
  }

    renderTasksListTab({ tasks, members }) {
    let filtered = tasks;
    if (this.kanbanSearch) {
      const q = this.kanbanSearch.toLowerCase();
      filtered = filtered.filter((t) => t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q));
    }
    if (this.selectedFilterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === this.selectedFilterStatus);
    }

    return `
      <div class="pm-tasks-list-view">
        <div class="pm-list-toolbar">
          <div class="pm-search-wrap">
            <i class="fi fi-rr-search pm-search-icon"></i>
            <input type="text" id="pmTasksListSearch" class="pm-search-input" placeholder="Cari tiket, judul, atau kode..." value="${this.kanbanSearch}" />
          </div>

          <div class="pm-filter-wrap">
            <select id="pmTasksListStatusFilter" class="pm-filter-select">
              <option value="all" ${this.selectedFilterStatus === 'all' ? 'selected' : ''}>Semua Status (${tasks.length})</option>
              <option value="To Do" ${this.selectedFilterStatus === 'To Do' ? 'selected' : ''}>To Do</option>
              <option value="In Progress" ${this.selectedFilterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Review" ${this.selectedFilterStatus === 'Review' ? 'selected' : ''}>Review / Staging</option>
              <option value="Selesai" ${this.selectedFilterStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
            </select>
            <button id="pmCreateTaskBtnList" class="pm-btn pm-btn--primary">
              <i class="fi fi-rr-plus"></i> Tambah Tugas
            </button>
          </div>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th width="40"><input type="checkbox" /></th>
                <th width="110">Kode</th>
                <th>Judul Pekerjaan</th>
                <th width="120">Prioritas</th>
                <th width="140">Status</th>
                <th width="160">PIC / Assignee</th>
                <th width="100">Estimasi</th>
                <th width="80">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; padding: 32px; color: #94a3b8;">Tidak ada pekerjaan yang cocok.</td></tr>
              ` : filtered.map((task) => {
                const assignee = members.find((m) => m.id === task.assigneeId) || { name: 'Unassigned', avatar: '' };
                const prioColor = task.priority === 'Tinggi' ? '#de350b' : task.priority === 'Sedang' ? '#ff8b00' : '#0052cc';
                return `
                  <tr class="pm-table-row" data-task-id="${task.id}">
                    <td><input type="checkbox" onclick="event.stopPropagation();" /></td>
                    <td><span class="pm-task-key">${task.key}</span></td>
                    <td>
                      <div class="pm-task-title-cell">
                        <span class="pm-task-title-text">${task.title}</span>
                      </div>
                    </td>
                    <td>
                      <span class="pm-priority-badge" style="color: ${prioColor}; border-color: ${prioColor}40;">
                        <i class="fi fi-rr-flame" style="font-size: 11px;"></i> ${task.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span class="pm-badge ${task.status === 'Selesai' ? 'pm-badge--green' : task.status === 'In Progress' ? 'pm-badge--blue' : 'pm-badge--yellow'}">
                        ${task.status}
                      </span>
                    </td>
                    <td>
                      <div class="pm-assignee-cell">
                        ${assignee.avatar ? `<img src="${assignee.avatar}" class="pm-assignee-avatar" alt="${assignee.name}" />` : '<div class="pm-assignee-avatar pm-assignee-avatar--placeholder"><i class="fi fi-rr-user"></i></div>'}
                        <span class="pm-assignee-name">${assignee.name}</span>
                      </div>
                    </td>
                    <td><span class="pm-estimate-text">${task.estimateHours || 16} Jam</span></td>
                    <td>
                      <button class="pm-btn pm-btn--sm pm-btn--ghost pm-open-task-btn" data-task-id="${task.id}">
                        <i class="fi fi-rr-eye"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 3. SUB-MODULE: TASKS KANBAN
  // =========================================================================
  renderTasksKanbanTab({ tasks, members }) {
    let filteredTasks = tasks;
    if (this.kanbanSearch) {
      const q = this.kanbanSearch.toLowerCase();
      filteredTasks = filteredTasks.filter((t) => t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q));
    }
    if (this.selectedFilterStatus !== 'all') {
      filteredTasks = filteredTasks.filter((t) => t.status === this.selectedFilterStatus);
    }

    const columns = [
      { id: 'todo', title: 'To Do', color: '#64748b', tasks: filteredTasks.filter((t) => ['Backlog', 'Baru', 'To Do', 'Perlu Manual'].includes(t.status)) },
      { id: 'in_progress', title: 'In Progress', color: '#0052cc', tasks: filteredTasks.filter((t) => ['In Progress', 'Sedang Dikerjakan'].includes(t.status)) },
      { id: 'review', title: 'Review / Staging', color: '#d97706', tasks: filteredTasks.filter((t) => ['Review', 'QA Testing', 'Staging Deploy'].includes(t.status)) },
      { id: 'done', title: 'Done', color: '#00a884', tasks: filteredTasks.filter((t) => t.status === 'Selesai') }
    ];

    return `
      <div class="pm-kanban-view">
        <div class="pm-kanban-toolbar">
          <div class="pm-kanban-search">
            <i class="fi fi-rr-search pm-search-icon"></i>
            <input type="text" id="pmKanbanSearchInput" class="pm-search-input" placeholder="Cari tiket di board kanban..." value="${this.kanbanSearch}" />
          </div>

          <div class="pm-kanban-filters">
            <select id="pmKanbanStatusFilter" class="pm-filter-select">
              <option value="all" ${this.selectedFilterStatus === 'all' ? 'selected' : ''}>Semua Kolom (${tasks.length})</option>
              <option value="To Do" ${this.selectedFilterStatus === 'To Do' ? 'selected' : ''}>To Do</option>
              <option value="In Progress" ${this.selectedFilterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Review" ${this.selectedFilterStatus === 'Review' ? 'selected' : ''}>Review / Staging</option>
              <option value="Selesai" ${this.selectedFilterStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
            </select>
            <button id="pmCreateTaskBtnKanban" class="pm-btn pm-btn--primary">
              <i class="fi fi-rr-plus"></i> Tambah Tugas
            </button>
          </div>
        </div>

        <div class="pm-kanban-columns">
          ${columns.map((col) => `
            <div class="pm-kanban-col" data-col-id="${col.id}">
              <div class="pm-kanban-col-header" style="border-top-color: ${col.color};">
                <div class="pm-kanban-col-title-wrap">
                  <span class="pm-kanban-col-dot" style="background-color: ${col.color};"></span>
                  <span class="pm-kanban-col-title">${col.title}</span>
                </div>
                <span class="pm-kanban-col-count">${col.tasks.length}</span>
              </div>

              <div class="pm-kanban-cards-wrap">
                ${col.tasks.map((task) => this.renderKanbanCard(task, members)).join('')}
                ${col.tasks.length === 0 ? `<div class="pm-kanban-empty">Tidak ada tiket</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderKanbanCard(task, members) {
    const assignee = members.find((m) => m.id === task.assigneeId) || { name: 'Unassigned', avatar: '' };
    const prioColor = task.priority === 'Tinggi' ? '#de350b' : task.priority === 'Sedang' ? '#ff8b00' : '#0052cc';

    return `
      <div class="pm-kanban-card" data-task-id="${task.id}">
        <div class="pm-card-top">
          <span class="pm-card-key">${task.key}</span>
          <span class="pm-priority-pill" style="color: ${prioColor}; background-color: ${prioColor}15;">
            <i class="fi fi-rr-flame"></i> ${task.priority || 'Normal'}
          </span>
        </div>

        <div class="pm-card-title">${task.title}</div>

        <div class="pm-card-meta">
          <div class="pm-card-tags">
            <span class="pm-tag">${task.type || 'Task'}</span>
            ${task.timeLoggedHours ? `<span class="pm-tag pm-tag--time"><i class="fi fi-rr-clock"></i> ${task.timeLoggedHours}h</span>` : ''}
          </div>

          <div class="pm-card-assignee" title="Ditugaskan kepada: ${assignee.name}">
            ${assignee.avatar ? `<img src="${assignee.avatar}" alt="${assignee.name}" class="pm-assignee-avatar-sm" />` : '<div class="pm-assignee-placeholder"><i class="fi fi-rr-user"></i></div>'}
          </div>
        </div>

        <div class="pm-card-actions">
          ${task.status !== 'Selesai' ? `
            <button class="pm-card-quick-move" data-task-id="${task.id}" data-next-status="${task.status === 'To Do' || task.status === 'Backlog' ? 'In Progress' : task.status === 'In Progress' ? 'Review' : 'Selesai'}">
              <span>${task.status === 'To Do' || task.status === 'Backlog' ? 'Kerjakan' : task.status === 'In Progress' ? 'Ke Staging' : 'Selesaikan'}</span>
              <i class="fi fi-rr-arrow-right"></i>
            </button>
          ` : `
            <span class="pm-card-done-label"><i class="fi fi-rr-check"></i> Selesai</span>
          `}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 4. SUB-MODULE: MILESTONES (EPICS)
  // =========================================================================
  renderMilestonesTab({ project, tasks }) {
    const epics = (store.getState().epics || []).filter((e) => e.projectId === project.id);
    const milestones = epics.length > 0 ? epics : [
      { id: 'm-1', key: `${project.code}-EPIC-1`, title: 'Microservices & Core Architecture Foundation', description: 'Setup fondasi arsitektur REST API, database skema, dan authentication token.', color: '#0052cc' },
      { id: 'm-2', key: `${project.code}-EPIC-2`, title: 'Frontend Client Interface & Business Logic Flow', description: 'Pengembangan antarmuka pengguna interaktif dan sinkronisasi data API real-time.', color: '#0d9488' },
      { id: 'm-3', key: `${project.code}-EPIC-3`, title: 'Containerization, QA Load Testing & UAT Sign-off', description: 'Docker Compose, stress test 2000 RPS via K6, dan verifikasi acceptance criteria stakeholder.', color: '#d97706' }
    ];

    return `
      <div class="pm-milestones-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Milestones &amp; Work Packages (${project.name})</h3>
            <p class="pm-section-desc">Pencapaian modul arsitektur perangkat lunak dan status progress tiap paket kerja.</p>
          </div>
          <button id="pmCreateTaskBtnMilestone" class="pm-btn pm-btn--primary">
            <i class="fi fi-rr-plus"></i> Tambah Milestone
          </button>
        </div>

        <div class="pm-milestones-grid">
          ${milestones.map((ms, idx) => {
            const childTasks = tasks.filter((t) => t.epicId === ms.id || t.key.includes(`-${idx + 1}`));
            const doneCount = childTasks.filter((t) => t.status === 'Selesai').length;
            const progress = childTasks.length > 0 ? Math.round((doneCount / childTasks.length) * 100) : (idx === 0 ? 100 : idx === 1 ? 55 : 20);

            return `
              <div class="pm-card pm-milestone-card" style="border-top: 3px solid ${ms.color || '#0052cc'};">
                <div class="pm-ms-top">
                  <span class="pm-ms-key">${ms.key}</span>
                  <span class="pm-ms-badge ${progress === 100 ? 'pm-ms-badge--done' : 'pm-ms-badge--progress'}">
                    ${progress === 100 ? 'Selesai' : 'Sedang Berjalan'}
                  </span>
                </div>

                <h4 class="pm-ms-title">${ms.title}</h4>
                <p class="pm-ms-desc">${ms.description}</p>

                <div class="pm-ms-progress-wrap">
                  <div class="pm-ms-progress-info">
                    <span>Progress Deliverables</span>
                    <strong>${progress}%</strong>
                  </div>
                  <div class="pm-progress-bar">
                    <div class="pm-progress-bar__fill" style="width: ${progress}%; background-color: ${ms.color || '#0052cc'};"></div>
                  </div>
                </div>

                <div class="pm-ms-footer">
                  <span class="pm-ms-tasks-count"><i class="fi fi-rr-list-check"></i> ${childTasks.length || 3} Tasks Terhubung</span>
                  <button class="pm-btn pm-btn--sm pm-btn--ghost" onclick="store.setActiveTab('kanban');">
                    Lihat di Board <i class="fi fi-rr-arrow-right"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 5. SUB-MODULE: GANTT CHART (INTERACTIVE TIMELINE)
  // =========================================================================
  renderGanttTab({ project, tasks }) {
    const epics = (store.getState().epics || []).filter((e) => e.projectId === project.id);
    const displayTasks = tasks.slice(0, 8);

    return `
      <div class="pm-gantt-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Timeline Gantt Chart Proyek</h3>
            <span class="pm-section-desc">Visualisasi jadwal jadwal pengerjaan sprint, deliverable microservices, dan target UAT.</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="pm-btn pm-btn--outline" onclick="store.setActiveTab('timeline');">
              <i class="fi fi-rr-expand"></i> Buka Full Gantt Roadmap
            </button>
          </div>
        </div>

        <div class="pm-card pm-gantt-card">
          <!-- Gantt Header Scale (Weeks) -->
          <div class="pm-gantt-scale-header">
            <div class="pm-gantt-label-col">WBS / Item Pekerjaan</div>
            <div class="pm-gantt-timeline-col">
              <span class="pm-scale-item">Minggu 1 (Okt 18)</span>
              <span class="pm-scale-item">Minggu 2 (Okt 25)</span>
              <span class="pm-scale-item">Minggu 3 (Nov 01)</span>
              <span class="pm-scale-item">Minggu 4 (Nov 08)</span>
            </div>
          </div>

          <!-- Gantt Rows -->
          <div class="pm-gantt-rows">
            ${displayTasks.map((t, idx) => {
              const leftOffset = Math.min(75, idx * 12);
              const barWidth = Math.max(18, 45 - (idx * 3));
              const isDone = t.status === 'Selesai';
              const color = isDone ? '#00a884' : t.status === 'In Progress' ? '#0052cc' : '#d97706';

              return `
                <div class="pm-gantt-row">
                  <div class="pm-gantt-label-col">
                    <span class="pm-gantt-key">${t.key}</span>
                    <span class="pm-gantt-title" title="${t.title}">${t.title.slice(0, 36)}...</span>
                  </div>
                  <div class="pm-gantt-timeline-col">
                    <div class="pm-gantt-bar-wrap" style="left: ${leftOffset}%; width: ${barWidth}%;">
                      <div class="pm-gantt-bar" style="background-color: ${color};">
                        <span class="pm-gantt-bar-label">${t.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 6. SUB-MODULE: NOTES
  // =========================================================================
  renderNotesTab({ project }) {
    return `
      <div class="pm-notes-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Catatan Internal &amp; Spesifikasi Proyek</h3>
            <span class="pm-section-desc">Dokumentasi keputusan teknis (ADR), konvensi kode, dan catatan meeting klien.</span>
          </div>
          <button id="pmAddNoteBtn" class="pm-btn pm-btn--primary">
            <i class="fi fi-rr-plus"></i> Tambah Catatan
          </button>
        </div>

        <div class="pm-notes-grid">
          ${this.projectNotes.map((note) => `
            <div class="pm-card pm-note-card">
              <div class="pm-note-header">
                <span class="pm-note-category">${note.category}</span>
                <span class="pm-note-date">${note.date}</span>
              </div>
              <h4 class="pm-note-title">${note.title}</h4>
              <p class="pm-note-body">${note.content}</p>
              <div class="pm-note-footer">
                <span class="pm-note-author"><i class="fi fi-rr-user"></i> ${note.author}</span>
                <button class="pm-btn pm-btn--sm pm-btn--ghost"><i class="fi fi-rr-pencil"></i> Edit</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 7. SUB-MODULE: FILES
  // =========================================================================
  renderFilesTab({ project }) {
    const files = [
      { name: `SRS-${project.code}-Spesifikasi-Kebutuhan-Sistem-v1.4.pdf`, size: '2.8 MB', date: '2026-10-18', uploader: 'Asisyah (PM)', type: 'PDF' },
      { name: 'OpenAPI-Microservices-Katalog-Buku.yaml', size: '240 KB', date: '2026-10-19', uploader: 'Jaka (Backend)', type: 'YAML' },
      { name: 'Docker-Compose-Production-Traefik.yml', size: '12 KB', date: '2026-10-20', uploader: 'Azi (Fullstack)', type: 'YML' },
      { name: 'Berita-Acara-Kickoff-UAT-Signoff.pdf', size: '1.2 MB', date: '2026-10-18', uploader: 'Asisyah (PM)', type: 'PDF' },
      { name: 'Design-Tokens-OPAC-React-Figma-Export.zip', size: '18.4 MB', date: '2026-10-21', uploader: 'Aldyana (Frontend)', type: 'ZIP' }
    ];

    return `
      <div class="pm-files-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Berkas &amp; Repositori Dokumen (${project.name})</h3>
            <span class="pm-section-desc">Arsip deliverable, file spesifikasi teknis, sertifikat UAT, dan skema arsitektur.</span>
          </div>
          <button class="pm-btn pm-btn--primary" onclick="alert('Fitur unggah berkas: Berkas berhasil diunggah ke storage cloud proyek.');">
            <i class="fi fi-rr-upload"></i> Unggah Berkas Baru
          </button>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th>Nama Berkas</th>
                <th width="100">Format</th>
                <th width="120">Ukuran</th>
                <th width="140">Tanggal Unggah</th>
                <th width="180">Diunggah Oleh</th>
                <th width="120">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${files.map((f) => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <i class="fi fi-rr-document" style="font-size: 16px; color: #0052cc;"></i>
                      <strong>${f.name}</strong>
                    </div>
                  </td>
                  <td><span class="pm-badge pm-badge--blue">${f.type}</span></td>
                  <td><span style="font-family: var(--font-mono); font-size: 12px;">${f.size}</span></td>
                  <td>${f.date}</td>
                  <td>${f.uploader}</td>
                  <td>
                    <button class="pm-btn pm-btn--sm pm-btn--outline" onclick="alert('Mengunduh: ${f.name}');">
                      <i class="fi fi-rr-download"></i> Unduh
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 8. SUB-MODULE: COMMENTS (THREADED DISCUSSION)
  // =========================================================================
  renderCommentsTab({ project }) {
    return `
      <div class="pm-comments-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Diskusi &amp; Catatan Tim Proyek</h3>
            <span class="pm-section-desc">Saluran komunikasi internal pengembang, QA, dan PM untuk koordinasi teknis.</span>
          </div>
        </div>

        <div class="pm-card pm-comments-card">
          <!-- Input Form -->
          <div class="pm-comment-input-wrap">
            <textarea id="pmNewCommentText" class="pm-comment-textarea" placeholder="Tulis komentar atau instruksi untuk tim..."></textarea>
            <div class="pm-comment-input-actions">
              <span class="pm-comment-hint">Mendukung koordinasi lintas role (PM, Dev, QA)</span>
              <button id="pmSubmitCommentBtn" class="pm-btn pm-btn--primary">
                <i class="fi fi-rr-paper-plane"></i> Kirim Pesan
              </button>
            </div>
          </div>

          <!-- Discussion Feed -->
          <div class="pm-comments-stream">
            ${this.projectComments.map((c) => `
              <div class="pm-comment-item">
                <img src="${c.avatar}" alt="${c.authorName}" class="pm-comment-avatar" />
                <div class="pm-comment-content">
                  <div class="pm-comment-head">
                    <strong class="pm-comment-author">${c.authorName}</strong>
                    <span class="pm-comment-role">(${c.authorRole})</span>
                    <span class="pm-comment-time">${c.time}</span>
                  </div>
                  <p class="pm-comment-text">${c.content}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 9. SUB-MODULE: CUSTOMER FEEDBACK
  // =========================================================================
  renderCustomerFeedbackTab({ project }) {
    return `
      <div class="pm-feedback-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Umpan Balik Klien &amp; Evaluasi Stakeholder</h3>
            <span class="pm-section-desc">Hasil survei kepuasan klien (CSAT), berita acara sign-off, dan review implementasi.</span>
          </div>
        </div>

        <div class="pm-feedback-grid">
          <!-- Rating Summary Card -->
          <div class="pm-card pm-feedback-score-card">
            <div class="pm-score-huge">4.9</div>
            <div class="pm-stars-row">
              <i class="fi fi-sr-star" style="color: #f59e0b;"></i>
              <i class="fi fi-sr-star" style="color: #f59e0b;"></i>
              <i class="fi fi-sr-star" style="color: #f59e0b;"></i>
              <i class="fi fi-sr-star" style="color: #f59e0b;"></i>
              <i class="fi fi-sr-star" style="color: #f59e0b;"></i>
            </div>
            <span class="pm-score-caption">Skor Kepuasan Klien Keseluruhan (CSAT)</span>
            <div class="pm-csat-bar">
              <div class="pm-csat-fill" style="width: 98%;"></div>
            </div>
            <span style="font-size: 11.5px; color: #64748b; margin-top: 6px;">98% Positive Feedback dari 12 Evaluator Kampus</span>
          </div>

          <!-- Feedback Details -->
          <div class="pm-card pm-feedback-reviews-card">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1e293b;">
              Ulasan Resmi dari ${project.clientName || 'Klien Proyek'}
            </h4>

            <div class="pm-review-item">
              <div class="pm-review-header">
                <div>
                  <strong>Prof. Dr. Ir. Hendra Sasmita, M.T.</strong>
                  <span style="color: #64748b; font-size: 12px; display: block;">Kepala Biro Teknologi Informasi &amp; Perpustakaan Pusat</span>
                </div>
                <span class="pm-badge pm-badge--green">Sign-Off Diterima</span>
              </div>
              <p class="pm-review-quote">
                "Penyelesaian arsitektur microservices Laravel dan portal katalog React OPAC berjalan tepat waktu. Kecepatan pencarian buku di bawah 50 milidetik dan fitur distributed lock Redis berhasil mengatasi kendala peminjaman serentak mahasiswa baru."
              </p>
              <span class="pm-review-meta">Diverifikasi via Portal Klien · 24 Oktober 2026</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 10. SUB-MODULE: TIMESHEETS
  // =========================================================================
  renderTimesheetsTab({ project, members, tasks }) {
    const timesheetData = [
      { member: members.find((m) => m.id === 'user-pm') || members[0], hours: 32, billableHours: 32, rate: 250000, taskDesc: 'Koordinasi WBS, kickoff stakeholder, dan verifikasi termin' },
      { member: members.find((m) => m.id === 'user-dev-3') || members[2], hours: 38, billableHours: 38, rate: 300000, taskDesc: 'REST API microservice katalog, PostgreSQL schema, Redis lock' },
      { member: members.find((m) => m.id === 'user-dev-2') || members[1], hours: 34, billableHours: 34, rate: 275000, taskDesc: 'UI portal pencarian OPAC React 19, integrasi barcode scanner' },
      { member: members.find((m) => m.id === 'user-dev-1') || members[0], hours: 36, billableHours: 36, rate: 325000, taskDesc: 'Traefik API Gateway, container Docker Compose, WhatsApp bot' },
      { member: members.find((m) => m.id === 'user-qa') || members[3], hours: 30, billableHours: 30, rate: 220000, taskDesc: 'Matrix pengujian sirkulasi, k6 stress test 2000 RPS, UAT audit' }
    ];

    const totalHours = timesheetData.reduce((acc, row) => acc + row.hours, 0);

    return `
      <div class="pm-timesheets-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Lembar Waktu &amp; Beban Kerja (${project.name})</h3>
            <span class="pm-section-desc">Pencatatan jam kerja riil per engineer, rasio billable, dan kapasitas mingguan.</span>
          </div>
          <button class="pm-btn pm-btn--primary" onclick="alert('Log waktu manual dicatat.');">
            <i class="fi fi-rr-plus"></i> Catat Waktu Manual
          </button>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th>Nama Anggota Tim</th>
                <th>Role / Posisi</th>
                <th width="120">Jam Terpakai</th>
                <th width="140">Kapasitas Mingguan</th>
                <th>Aktivitas Utama</th>
                <th width="130">Status Billing</th>
              </tr>
            </thead>
            <tbody>
              ${timesheetData.map((row) => `
                <tr>
                  <td>
                    <div class="pm-assignee-cell">
                      <img src="${row.member.avatar}" class="pm-assignee-avatar" alt="${row.member.name}" />
                      <strong>${row.member.name}</strong>
                    </div>
                  </td>
                  <td><span class="pm-badge pm-badge--blue">${row.member.role}</span></td>
                  <td><strong style="font-family: var(--font-mono);">${row.hours} Jam</strong></td>
                  <td>
                    <div style="font-size: 11.5px; color: #475569;">
                      ${row.hours}/40 Jam (${Math.round((row.hours / 40) * 100)}%)
                      <div class="pm-progress-bar" style="margin-top: 3px;">
                        <div class="pm-progress-bar__fill" style="width: ${(row.hours / 40) * 100}%; background-color: #0052cc;"></div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size: 12px; color: #334155;">${row.taskDesc}</td>
                  <td><span class="pm-badge pm-badge--green"><i class="fi fi-rr-check"></i> 100% Billable</span></td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 700;">
                <td colspan="2">Total Akumulasi Jam Kerja:</td>
                <td colspan="4"><span style="font-family: var(--font-mono); font-size: 14px; color: #0052cc;">${totalHours} Jam Terverifikasi</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 11. SUB-MODULE: INVOICES
  // =========================================================================
  renderInvoicesTab({ project }) {
    const projectInvoices = (store.getState().invoices || []).filter((i) => i.projectId === project.id);
    const invoices = projectInvoices.length > 0 ? projectInvoices : [
      { id: 'inv-1', invoiceNumber: `INV/2026/10/${project.code}-001`, type: 'Termin 1: Down Payment (DP 30%)', totalAmount: 55500000, issueDate: '2026-10-18', status: 'Lunas' },
      { id: 'inv-2', invoiceNumber: `INV/2026/11/${project.code}-002`, type: 'Termin 2: Deliverable Staging & UAT (40%)', totalAmount: 74000000, issueDate: '2026-11-05', status: 'Menunggu' },
      { id: 'inv-3', invoiceNumber: `INV/2026/12/${project.code}-003`, type: 'Termin 3: Go-Live & Handover (30%)', totalAmount: 55500000, issueDate: '2026-12-01', status: 'Draft' }
    ];

    return `
      <div class="pm-invoices-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Faktur Tagihan Proyek (${project.name})</h3>
            <span class="pm-section-desc">Penerbitan termin tagihan proyek, status pembayaran, dan riwayat transfer klien.</span>
          </div>
          <button class="pm-btn pm-btn--primary" onclick="store.setActiveTab('finance');">
            <i class="fi fi-rr-plus"></i> Buat Faktur Tagihan
          </button>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th>Nomor Faktur</th>
                <th>Keterangan / Termin</th>
                <th width="150">Nominal Tagihan</th>
                <th width="130">Tanggal Terbit</th>
                <th width="120">Status</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map((inv) => `
                <tr>
                  <td><strong>${inv.invoiceNumber}</strong></td>
                  <td>${inv.type || 'Termin Proyek'}</td>
                  <td><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.totalAmount || 0)}</strong></td>
                  <td>${inv.issueDate || '-'}</td>
                  <td>
                    <span class="pm-badge ${inv.status === 'Lunas' ? 'pm-badge--green' : inv.status === 'Menunggu' ? 'pm-badge--yellow' : 'pm-badge--gray'}">
                      ${inv.status}
                    </span>
                  </td>
                  <td>
                    <button class="pm-btn pm-btn--sm pm-btn--outline" onclick="alert('Mencetak Faktur ${inv.invoiceNumber}');">
                      <i class="fi fi-rr-download"></i> Cetak
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 12. SUB-MODULE: PAYMENTS
  // =========================================================================
  renderPaymentsTab({ project }) {
    const payments = [
      { ref: 'TRX-BCA-9821819', termin: 'Down Payment (DP 30%)', method: 'BCA Corporate Virtual Account', amount: 55500000, date: '2026-10-18 10:24', status: 'Berhasil' },
      { ref: 'TRX-MDR-4421092', termin: 'Termin 2 (Staging QA 40%)', method: 'Mandiri Multi-Currency VA', amount: 74000000, date: 'Estimasi: 05 Nov 2026', status: 'Terjadwal' }
    ];

    return `
      <div class="pm-payments-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Riwayat &amp; Jadwal Penerimaan Pembayaran</h3>
            <span class="pm-section-desc">Penerimaan kas masuk dari klien berdasarkan tahapan termin kontrak.</span>
          </div>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th>No. Referensi / Transaksi</th>
                <th>Tahapan Pembayaran</th>
                <th>Metode Transfer</th>
                <th>Jumlah Diterima</th>
                <th>Waktu Transaksi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map((p) => `
                <tr>
                  <td><span class="pm-task-key">${p.ref}</span></td>
                  <td><strong>${p.termin}</strong></td>
                  <td><i class="fi fi-rr-credit-card" style="margin-right: 4px;"></i> ${p.method}</td>
                  <td><strong style="color: #047857;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.amount)}</strong></td>
                  <td>${p.date}</td>
                  <td><span class="pm-badge ${p.status === 'Berhasil' ? 'pm-badge--green' : 'pm-badge--yellow'}">${p.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 13. SUB-MODULE: EXPENSES
  // =========================================================================
  renderExpensesTab({ project }) {
    const expenses = [
      { item: 'Server Staging & Testing Hetzner Cloud (CX41 4vCPU / 16GB)', category: 'Cloud Infrastructure', cost: 420000, cycle: 'Bulanan', status: 'Aktif' },
      { item: 'Cluster Redis Cloud Managed db-0 (Atomic Lock Mutex)', category: 'Database & Cache', cost: 280000, cycle: 'Bulanan', status: 'Aktif' },
      { item: 'WhatsApp Business Fonnte API Gateway (Reminder H-1)', category: 'Third-party API', cost: 150000, cycle: 'Bulanan', status: 'Aktif' },
      { item: 'Wildcard SSL Let’s Encrypt & DNS Cloudflare Enterprise', category: 'Security & Domain', cost: 0, cycle: 'Tahunan', status: 'Aktif' }
    ];

    const totalExpense = expenses.reduce((acc, e) => acc + e.cost, 0);

    return `
      <div class="pm-expenses-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Biaya Operasional &amp; Infrastruktur (${project.name})</h3>
            <span class="pm-section-desc">Rincian pengeluaran server cloud, lisensi API pihak ketiga, dan infrastruktur container.</span>
          </div>
          <button class="pm-btn pm-btn--primary" onclick="alert('Catat pengeluaran baru.');">
            <i class="fi fi-rr-plus"></i> Catat Pengeluaran
          </button>
        </div>

        <div class="pm-table-container">
          <table class="pm-table">
            <thead>
              <tr>
                <th>Item Pengeluaran</th>
                <th>Kategori</th>
                <th>Biaya</th>
                <th>Siklus Tagihan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((e) => `
                <tr>
                  <td><strong>${e.item}</strong></td>
                  <td><span class="pm-badge pm-badge--blue">${e.category}</span></td>
                  <td><strong style="font-family: var(--font-mono);">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(e.cost)}</strong></td>
                  <td>${e.cycle}</td>
                  <td><span class="pm-badge pm-badge--green">${e.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 700;">
                <td colspan="2">Total Biaya Operasional / Bulan:</td>
                <td colspan="3"><span style="color: #de350b; font-family: var(--font-mono);">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalExpense)} / Bulan</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 14. SUB-MODULE: CONTRACTS (LEGAL SOW & SLA)
  // =========================================================================
  renderContractsTab({ project }) {
    const value = project.contractValue || 185000000;

    return `
      <div class="pm-contracts-view">
        <div class="pm-list-header">
          <div>
            <h3 class="pm-section-title">Surat Perjanjian Kerjasama &amp; SLA Layanan</h3>
            <span class="pm-section-desc">Ketentuan hukum, scope of work (SOW), jaminan garansi bug, dan komitmen SLA software house.</span>
          </div>
          <button class="pm-btn pm-btn--outline" onclick="alert('Mencetak Surat Perjanjian Kerjasama (SOW)');">
            <i class="fi fi-rr-download"></i> Unduh Kontrak Resmi (PDF)
          </button>
        </div>

        <div class="pm-card pm-contract-details-card">
          <div class="pm-contract-header">
            <div>
              <span class="pm-contract-id">NOMOR: SPK/2026/X/${project.code || 'LIB'}/089</span>
              <h2 class="pm-contract-name">${project.name}</h2>
            </div>
            <span class="pm-badge pm-badge--green" style="font-size: 13px; padding: 4px 12px;">Kontrak Aktif &amp; Mengikat</span>
          </div>

          <div class="pm-contract-grid">
            <div class="pm-contract-item">
              <span class="pm-ci-label">Klien Rekanan (Pihak Pertama):</span>
              <strong class="pm-ci-val">${project.clientName || 'Universitas Nusantara Cendekia'}</strong>
            </div>
            <div class="pm-contract-item">
              <span class="pm-ci-label">Penyedia Jasa (Pihak Kedua):</span>
              <strong class="pm-ci-val">Agensi Software House Suite Nusantara</strong>
            </div>
            <div class="pm-contract-item">
              <span class="pm-ci-label">Nilai Total Kontrak:</span>
              <strong class="pm-ci-val" style="color: #047857; font-size: 16px;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)}</strong>
            </div>
            <div class="pm-contract-item">
              <span class="pm-ci-label">Skema Pembayaran:</span>
              <strong class="pm-ci-val">Fixed Price (Termin 30% - 40% - 30%)</strong>
            </div>
            <div class="pm-contract-item">
              <span class="pm-ci-label">Masa Garansi Bebas Bug:</span>
              <strong class="pm-ci-val">12 Bulan (Hingga 31 Oktober 2027)</strong>
            </div>
            <div class="pm-contract-item">
              <span class="pm-ci-label">SLA Respons Insiden Kritis (S1):</span>
              <strong class="pm-ci-val">Maksimal 2 Jam Kerja (Hotfix &lt; 6 Jam)</strong>
            </div>
          </div>

          <div class="pm-contract-clauses">
            <h4>Ruang Lingkup Pekerjaan (Scope of Work):</h4>
            <ul>
              <li>Pembangunan backend microservices dengan arsitektur bersih Laravel 11 dan skema PostgreSQL.</li>
              <li>Frontend SPA interaktif dengan React 19, Tailwind CSS, dan integrasi barcode scanner kartu.</li>
              <li>Penyediaan pipeline orkestrasi Traefik reverse proxy dan container Docker Compose staging &amp; production.</li>
              <li>Load testing 2.000 concurrent RPS via K6 dan penyerahan seluruh source code git repository.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MODALS: REMINDERS, SETTINGS, & ADD NOTE
  // =========================================================================
  renderRemindersModal(project) {
    return `
      <div class="pm-modal-overlay">
        <div class="pm-modal-box">
          <div class="pm-modal-header">
            <h3><i class="fi fi-rr-clock"></i> Pengingat Proyek: ${project.name}</h3>
            <button id="pmCloseRemindersBtn" class="pm-icon-btn"><i class="fi fi-rr-cross"></i></button>
          </div>
          <div class="pm-modal-body">
            <div class="pm-reminders-list">
              ${this.reminders.map((r) => `
                <div class="pm-reminder-item">
                  <span class="pm-reminder-bullet"><i class="fi fi-rr-calendar-check" style="color: #0052cc;"></i></span>
                  <div class="pm-reminder-text">
                    <p style="margin: 0; font-weight: 500; color: #1e293b;">${r.text}</p>
                    <span class="pm-reminder-date" style="font-size: 11px; color: #64748b;">Tenggat: ${r.date}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="pm-add-reminder-form" style="margin-top: 14px; display: flex; gap: 8px;">
              <input id="pmNewReminderInput" type="text" placeholder="Tulis pengingat baru..." class="pm-search-input" style="flex: 1;" />
              <button id="pmSubmitReminderBtn" class="pm-btn pm-btn--primary">Simpan</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSettingsModal(project) {
    return `
      <div class="pm-modal-overlay">
        <div class="pm-modal-box">
          <div class="pm-modal-header">
            <h3><i class="fi fi-rr-settings"></i> Pengaturan Proyek</h3>
            <button id="pmCloseSettingsBtn" class="pm-icon-btn"><i class="fi fi-rr-cross"></i></button>
          </div>
          <div class="pm-modal-body">
            <div class="pm-form-group" style="margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nama Proyek</label>
              <input id="pmEditNameInput" type="text" class="pm-search-input" value="${project.name}" style="width: 100%;" />
            </div>
            <div class="pm-form-group" style="margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nama Klien</label>
              <input id="pmEditClientInput" type="text" class="pm-search-input" value="${project.clientName || ''}" style="width: 100%;" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div>
                <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Tanggal Mulai</label>
                <input id="pmEditStartDateInput" type="text" class="pm-search-input" value="${project.startDate || project.createdAt || '2026-10-18'}" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Deadline</label>
                <input id="pmEditDeadlineInput" type="text" class="pm-search-input" value="${project.deadline || project.warrantyUntil || '2027-10-31'}" style="width: 100%;" />
              </div>
            </div>
            <div style="text-align: right;">
              <button id="pmSaveSettingsBtn" class="pm-btn pm-btn--primary">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAddNoteModal(project) {
    return `
      <div class="pm-modal-overlay">
        <div class="pm-modal-box">
          <div class="pm-modal-header">
            <h3><i class="fi fi-rr-edit"></i> Tambah Catatan Baru: ${project.name}</h3>
            <button id="pmCloseNoteModalBtn" class="pm-icon-btn"><i class="fi fi-rr-cross"></i></button>
          </div>
          <div class="pm-modal-body">
            <div style="margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Judul Catatan</label>
              <input id="pmNewNoteTitle" type="text" class="pm-search-input" placeholder="Contoh: Hasil Keputusan Meeting Review" style="width: 100%;" />
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Kategori</label>
              <select id="pmNewNoteCategory" class="pm-filter-select" style="width: 100%;">
                <option value="Technical Specs">Technical Specs</option>
                <option value="Architecture ADR">Architecture ADR</option>
                <option value="Meeting Notes">Meeting Notes</option>
                <option value="Legal & SLA">Legal &amp; SLA</option>
              </select>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Isi Catatan</label>
              <textarea id="pmNewNoteContent" class="pm-comment-textarea" placeholder="Tulis rincian catatan internal..." style="height: 100px;"></textarea>
            </div>
            <div style="text-align: right;">
              <button id="pmSaveNewNoteBtn" class="pm-btn pm-btn--primary">Simpan Catatan</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT ATTACHMENTS & EVENT LISTENERS
  // =========================================================================
  attachEvents() {
    // Project Quick Switcher
    const switcher = this.container.querySelector('#pmProjectSwitcher');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        store.setSelectedProjectId(e.target.value);
      });
    }

    // Favorite Star
    const starBtn = this.container.querySelector('#pmStarBtn');
    if (starBtn) {
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStar();
      });
    }

    // Start / Stop Timer
    const timerBtn = this.container.querySelector('#pmHeaderTimerBtn');
    if (timerBtn) {
      timerBtn.addEventListener('click', () => {
        this.toggleTimer();
      });
    }

    // Reminders Modal Open / Close
    const remindersBtn = this.container.querySelector('#pmRemindersBtn');
    if (remindersBtn) {
      remindersBtn.addEventListener('click', () => {
        this.isRemindersOpen = true;
        this.render();
      });
    }
    const closeRemindersBtn = this.container.querySelector('#pmCloseRemindersBtn');
    if (closeRemindersBtn) {
      closeRemindersBtn.addEventListener('click', () => {
        this.isRemindersOpen = false;
        this.render();
      });
    }
    const submitReminderBtn = this.container.querySelector('#pmSubmitReminderBtn');
    if (submitReminderBtn) {
      submitReminderBtn.addEventListener('click', () => {
        const input = this.container.querySelector('#pmNewReminderInput');
        if (input && input.value.trim()) {
          this.reminders.push({
            id: `rem-${Date.now()}`,
            text: input.value.trim(),
            date: new Date().toISOString().split('T')[0],
            done: false
          });
          store.addToast('success', 'Pengingat Ditambahkan', input.value.trim());
          this.render();
        }
      });
    }

    // Settings Modal Open / Close
    const settingsBtn = this.container.querySelector('#pmSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.isSettingsOpen = true;
        this.render();
      });
    }
    const closeSettingsBtn = this.container.querySelector('#pmCloseSettingsBtn');
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => {
        this.isSettingsOpen = false;
        this.render();
      });
    }
    const saveSettingsBtn = this.container.querySelector('#pmSaveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const name = this.container.querySelector('#pmEditNameInput').value;
        const client = this.container.querySelector('#pmEditClientInput').value;
        const active = store.getActiveProject();
        if (active) {
          active.name = name;
          active.clientName = client;
          store.addToast('success', 'Pengaturan Disimpan', 'Data proyek berhasil diperbarui.');
        }
        this.isSettingsOpen = false;
        this.render();
      });
    }

    // Actions Dropdown Toggle
    const actionsToggleBtn = this.container.querySelector('#pmActionsToggleBtn');
    if (actionsToggleBtn) {
      actionsToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isActionsOpen = !this.isActionsOpen;
        this.render();
      });
    }
    this.container.querySelectorAll('.pm-dropdown-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.isActionsOpen = false;
        if (action === 'new_task') {
          store.openCreateTaskModal();
        } else if (action === 'view_gantt') {
          this.activeSubTab = 'gantt';
          this.render();
        } else if (action === 'export_pdf') {
          store.addToast('info', 'Unduh PDF', 'Dokumen ringkasan executive dashboard sedang diproses.');
        } else if (action === 'crm_sync') {
          if (typeof window.switchProjectPage === 'function') {
            window.switchProjectPage('crm');
          } else {
            store.setActiveTab('crm');
          }
        } else if (action === 'mark_finished') {
          store.addToast('success', 'Proyek Selesai', 'Status proyek telah diubah ke Completed.');
        }
      });
    });

    // Header Create Task Button
    const headerCreateTaskBtn = this.container.querySelector('#pmHeaderCreateTaskBtn');
    if (headerCreateTaskBtn) {
      headerCreateTaskBtn.addEventListener('click', () => store.openCreateTaskModal());
    }

    // Sub-Module Navigation Tabs Switching
    this.container.querySelectorAll('.pm-subtab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const subtab = e.currentTarget.dataset.subtab;
        if (subtab) {
          this.activeSubTab = subtab;
          this.render();
        }
      });
    });

    // Quick Module Navigation ([data-nav-module])
    this.container.querySelectorAll('[data-nav-module]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetModule = btn.dataset.navModule;
        if (targetModule) {
          if (typeof window.switchProjectPage === 'function') {
            window.switchProjectPage(targetModule);
          } else {
            store.setActiveTab(targetModule);
          }
        }
      });
    });

    // Click on tasks to open detail ([data-task-id])
    this.container.querySelectorAll('[data-task-id]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('select')) return;
        const taskId = el.dataset.taskId;
        if (taskId) {
          const state = store.getState();
          const task = state.tasks.find((t) => t.id === taskId || t.key === taskId);
          if (task) {
            store.openTaskDetail(task);
          }
        }
      });
    });

    // Create Task Modal triggers
    const createTaskBtnList = this.container.querySelector('#pmCreateTaskBtnList');
    if (createTaskBtnList) createTaskBtnList.addEventListener('click', () => store.openCreateTaskModal());

    const createTaskBtnKanban = this.container.querySelector('#pmCreateTaskBtnKanban');
    if (createTaskBtnKanban) createTaskBtnKanban.addEventListener('click', () => store.openCreateTaskModal());

    const createTaskBtnMilestone = this.container.querySelector('#pmCreateTaskBtnMilestone');
    if (createTaskBtnMilestone) createTaskBtnMilestone.addEventListener('click', () => store.openCreateTaskModal());

    // Tasks List Search & Filter
    const listSearch = this.container.querySelector('#pmTasksListSearch');
    if (listSearch) {
      listSearch.addEventListener('input', (e) => {
        this.kanbanSearch = e.target.value;
        this.render();
      });
    }
    const listStatus = this.container.querySelector('#pmTasksListStatusFilter');
    if (listStatus) {
      listStatus.addEventListener('change', (e) => {
        this.selectedFilterStatus = e.target.value;
        this.render();
      });
    }

    // Kanban Search & Filter
    const kanbanSearchInput = this.container.querySelector('#pmKanbanSearchInput');
    if (kanbanSearchInput) {
      kanbanSearchInput.addEventListener('input', (e) => {
        this.kanbanSearch = e.target.value;
        this.render();
      });
    }
    const kanbanStatusFilter = this.container.querySelector('#pmKanbanStatusFilter');
    if (kanbanStatusFilter) {
      kanbanStatusFilter.addEventListener('change', (e) => {
        this.selectedFilterStatus = e.target.value;
        this.render();
      });
    }

    // Quick Move Status on Kanban Card
    this.container.querySelectorAll('.pm-card-quick-move').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const nextStatus = btn.dataset.nextStatus;
        if (taskId && nextStatus) {
          store.updateTaskStatus(taskId, nextStatus);
        }
      });
    });

    // Add Note Modal
    const addNoteBtn = this.container.querySelector('#pmAddNoteBtn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        this.isAddNoteOpen = true;
        this.render();
      });
    }
    const closeNoteModalBtn = this.container.querySelector('#pmCloseNoteModalBtn');
    if (closeNoteModalBtn) {
      closeNoteModalBtn.addEventListener('click', () => {
        this.isAddNoteOpen = false;
        this.render();
      });
    }
    const saveNewNoteBtn = this.container.querySelector('#pmSaveNewNoteBtn');
    if (saveNewNoteBtn) {
      saveNewNoteBtn.addEventListener('click', () => {
        const title = this.container.querySelector('#pmNewNoteTitle').value;
        const category = this.container.querySelector('#pmNewNoteCategory').value;
        const content = this.container.querySelector('#pmNewNoteContent').value;
        if (title && content) {
          this.projectNotes.unshift({
            id: `note-${Date.now()}`,
            title,
            category,
            date: new Date().toISOString().split('T')[0],
            author: 'Asisyah (PM)',
            content
          });
          store.addToast('success', 'Catatan Disimpan', title);
          this.isAddNoteOpen = false;
          this.render();
        }
      });
    }

    // Submit Comment
    const submitCommentBtn = this.container.querySelector('#pmSubmitCommentBtn');
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', () => {
        const textarea = this.container.querySelector('#pmNewCommentText');
        if (textarea && textarea.value.trim()) {
          const state = store.getState();
          const currentMember = state.teamMembers ? state.teamMembers[0] : { name: 'Asisyah', role: 'Project Manajer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' };
          this.projectComments.unshift({
            id: `c-${Date.now()}`,
            authorName: currentMember.name,
            authorRole: currentMember.role,
            avatar: currentMember.avatar,
            time: 'Baru saja',
            content: textarea.value.trim()
          });
          store.addToast('success', 'Komentar Terkirim', 'Pesan Anda telah ditambahkan ke diskusi tim.');
          textarea.value = '';
          this.render();
        }
      });
    }
  }

    getElement() {
    return this.container;
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
