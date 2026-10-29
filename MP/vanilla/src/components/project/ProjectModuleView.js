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
import { KanbanBoard } from '../KanbanBoard.js';
import { BacklogView } from '../backlog/BacklogView.js';
import { TimelineView } from '../timeline/TimelineView.js';
import { TaskListView } from '../list/TaskListView.js';

export class ProjectModuleView {
  constructor(options = {}) {
    this.container = document.createElement('div');
    this.container.className = 'pm-project-module';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenCreateTask = options.onOpenCreateTask || (() => store.openCreateTaskModal());

    this.currentViewMode = 'portfolio'; // 'portfolio' | 'workspace'
    this.portfolioViewMode = 'grid'; // 'grid' | 'table'
    this.portfolioSearch = '';
    this.portfolioStatus = 'all';
    this.portfolioClient = 'all';
    this.portfolioContract = 'all';
    this.isCreateProjectOpen = false;

    this.activeWorkspaceTab = 'ringkasan'; // 'ringkasan' | 'kanban' | 'backlog' | 'timeline' | 'list'

    // Sub-components for workspace tabs
    this.kanbanBoard = new KanbanBoard();
    this.backlogView = new BacklogView({
      onSelectTask: this.onSelectTask,
      onOpenCreateTask: this.onOpenCreateTask
    });
    this.timelineView = new TimelineView();
    this.taskListView = new TaskListView();

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

  switchWorkspaceTab(tab) {
    if (!tab) return;
    this.activeWorkspaceTab = tab;
    this.currentViewMode = 'workspace';
    try {
      if (typeof window !== 'undefined' && window.location && window.history) {
        if (window.location.hash.slice(1) !== tab) {
          window.history.replaceState(null, '', '#' + tab);
        }
      }
    } catch (e) {}
    if (store.getState().activeTab !== tab) {
      store.setActiveTab(tab);
    } else {
      this.render();
    }
    if (this.container) {
      this.container.scrollTop = 0;
    }
  }

  openWorkspace(projectId, tab = 'ringkasan') {
    if (projectId) {
      store.setSelectedProjectId(projectId);
    }
    this.switchWorkspaceTab(tab);
  }

  openWorkspaceWithTab(tab = 'ringkasan') {
    this.currentViewMode = 'workspace';
    this.activeWorkspaceTab = tab;
    this.render();
    if (this.container) {
      this.container.scrollTop = 0;
    }
  }

  backToPortfolio() {
    this.currentViewMode = 'portfolio';
    try {
      if (typeof window !== 'undefined' && window.location && window.history) {
        if (window.location.hash.slice(1) !== 'project') {
          window.history.replaceState(null, '', '#project');
        }
      }
    } catch (e) {}
    if (store.getState().activeTab !== 'project') {
      store.setActiveTab('project');
    } else {
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
    if (this.currentViewMode === 'portfolio') {
      this.renderPortfolio(state);
    } else {
      this.renderWorkspace(state);
    }
  }

  // =========================================================================
  // SHARED MASTER TABS BAR (FIXED / STICKY AT TOP IN ALL MODES)
  // =========================================================================
  renderTabsBar(stats) {
    const taskStats = stats || this.getProjectStats(store.getProjectTasks());
    return `
      <nav class="pm-ws-tabs-bar" aria-label="Sub-Modul Workspace Proyek">
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'ringkasan' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="ringkasan">
          <i class="fi fi-rr-apps"></i>
          <span>Ringkasan Proyek</span>
        </button>
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'kanban' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="kanban">
          <i class="fi fi-rr-chart-kanban"></i>
          <span>Board Kanban</span>
          <span class="pm-ws-tab-badge">${taskStats.total}</span>
        </button>
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'backlog' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="backlog">
          <i class="fi fi-rr-list-check"></i>
          <span>Backlog &amp; Sprint</span>
        </button>
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'timeline' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="timeline">
          <i class="fi fi-rr-chart-timeline"></i>
          <span>Roadmap &amp; Gantt</span>
        </button>
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'list' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="list">
          <i class="fi fi-rr-list"></i>
          <span>Daftar Pekerjaan (JQL)</span>
          <span class="pm-ws-tab-badge">${taskStats.total}</span>
        </button>
        
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'time' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="time">
          <i class="fi fi-rr-clock"></i>
          <span>Time Tracking</span>
        </button>
        <button class="pm-ws-tab-btn ${this.activeWorkspaceTab === 'finance_budget' ? 'pm-ws-tab-btn--active' : ''}" data-ws-tab="finance_budget">
          <i class="fi fi-rr-dollar"></i>
          <span>Finance &amp; Budget</span>
        </button>
      </nav>
    `;
  }

  // =========================================================================
  // 1. PORTFOLIO SOFTWARE HOUSE VIEW (CRM INTAKE & MASTER SUMMARY)
  // =========================================================================
  renderPortfolio(state) {
    const projects = state.projects || [];
    const totalProjects = projects.length;
    const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
    const onTrackCount = projects.filter(p => (p.health || 'On Track') === 'On Track').length;
    const onTrackRatio = `${onTrackCount} / ${totalProjects}`;
    const onTrackPct = totalProjects ? Math.round((onTrackCount / totalProjects) * 100) : 100;

    const totalContractVal = projects.reduce((sum, p) => sum + (Number(p.contractValue) || 0), 0);
    const totalContractJt = Math.round(totalContractVal / 1e6);

    const uniqueClientsSet = new Set(projects.map(p => p.clientName));
    const uniqueClientsCount = uniqueClientsSet.size;

    // Filter projects
    let filtered = projects;
    if (this.portfolioSearch) {
      const q = this.portfolioSearch.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (this.portfolioStatus !== 'all') {
      filtered = filtered.filter(p => (p.health === this.portfolioStatus || p.status === this.portfolioStatus));
    }
    if (this.portfolioClient !== 'all') {
      filtered = filtered.filter(p => p.clientName === this.portfolioClient);
    }
    if (this.portfolioContract !== 'all') {
      filtered = filtered.filter(p => (p.contractType || '').toLowerCase().includes(this.portfolioContract.toLowerCase()));
    }

    this.container.innerHTML = `
      <div class="pm-portfolio-wrap">
        <!-- 1. Header -->
        <div class="pm-portfolio-header">
          <div>
            <div class="pm-portfolio-tag">
              <i class="fi fi-rr-folder"></i>
              <span>PORTOFOLIO SOFTWARE HOUSE</span>
            </div>
            <h1 class="pm-portfolio-title">Manajemen Proyek</h1>
            <p class="pm-portfolio-subtitle">Kelola seluruh proyek digital agency, konfigurasi sprint, alokasi anggaran, dan akses tab workspace tim.</p>
          </div>
          <button id="pmCreateNewProjectBtn" class="pm-portfolio-create-btn">
            <i class="fi fi-rr-plus"></i>
            <span>Buat Proyek Baru</span>
          </button>
        </div>

        <!-- 2. 4 Top KPI Summary Cards -->
        <div class="pm-portfolio-kpi-grid">
          <!-- Card 1: Total Proyek -->
          <div class="pm-portfolio-kpi-card">
            <div class="pm-pk-top">
              <span class="pm-pk-label">Total Proyek</span>
              <span class="pm-pk-icon-box pm-pk-icon-box--indigo"><i class="fi fi-rr-folder"></i></span>
            </div>
            <div class="pm-pk-value">${totalProjects}</div>
            <div class="pm-pk-subtext">${activeProjectsCount} proyek sprint aktif</div>
          </div>

          <!-- Card 2: Kesehatan On-Track -->
          <div class="pm-portfolio-kpi-card">
            <div class="pm-pk-top">
              <span class="pm-pk-label">Kesehatan On-Track</span>
              <span class="pm-pk-icon-box pm-pk-icon-box--emerald"><i class="fi fi-rr-check-circle"></i></span>
            </div>
            <div class="pm-pk-value">${onTrackRatio}</div>
            <div class="pm-pk-subtext">${onTrackPct}% delivery lancar</div>
          </div>

          <!-- Card 3: Total Nilai Kontrak -->
          <div class="pm-portfolio-kpi-card">
            <div class="pm-pk-top">
              <span class="pm-pk-label">Total Nilai Kontrak</span>
              <span class="pm-pk-icon-box pm-pk-icon-box--violet"><i class="fi fi-rr-dollar"></i></span>
            </div>
            <div class="pm-pk-value">Rp ${new Intl.NumberFormat('id-ID').format(totalContractJt)} Jt</div>
            <div class="pm-pk-subtext">Portofolio gabungan agensi</div>
          </div>

          <!-- Card 4: Klien Korporat -->
          <div class="pm-portfolio-kpi-card">
            <div class="pm-pk-top">
              <span class="pm-pk-label">Klien Korporat</span>
              <span class="pm-pk-icon-box pm-pk-icon-box--amber"><i class="fi fi-rr-users"></i></span>
            </div>
            <div class="pm-pk-value">${uniqueClientsCount}</div>
            <div class="pm-pk-subtext">100% Retensi Klien Aktif</div>
          </div>
        </div>

        <!-- 3. Filter Toolbar & View Toggle -->
        <div class="pm-portfolio-toolbar">
          <div class="pm-portfolio-search">
            <i class="fi fi-rr-search"></i>
            <input type="text" id="pmPortfolioSearchInput" placeholder="Cari proyek, key, klien, deskripsi..." value="${this.portfolioSearch}">
          </div>

          <select id="pmPortfolioStatusSelect" class="pm-portfolio-select">
            <option value="all" ${this.portfolioStatus === 'all' ? 'selected' : ''}>Semua Status</option>
            <option value="On Track" ${this.portfolioStatus === 'On Track' ? 'selected' : ''}>On Track</option>
            <option value="At Risk" ${this.portfolioStatus === 'At Risk' ? 'selected' : ''}>At Risk</option>
            <option value="Active" ${this.portfolioStatus === 'Active' ? 'selected' : ''}>Active</option>
          </select>

          <select id="pmPortfolioClientSelect" class="pm-portfolio-select">
            <option value="all" ${this.portfolioClient === 'all' ? 'selected' : ''}>Semua Klien</option>
            ${Array.from(uniqueClientsSet).map(c => `
              <option value="${c}" ${this.portfolioClient === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>

          <select id="pmPortfolioContractSelect" class="pm-portfolio-select">
            <option value="all" ${this.portfolioContract === 'all' ? 'selected' : ''}>Semua Model Kontrak</option>
            <option value="Fixed Price" ${this.portfolioContract === 'Fixed Price' ? 'selected' : ''}>Fixed Price</option>
            <option value="Time Material" ${this.portfolioContract === 'Time Material' ? 'selected' : ''}>Time &amp; Material</option>
          </select>

          <div class="pm-portfolio-view-switch">
            <button class="pm-view-btn ${this.portfolioViewMode === 'grid' ? 'pm-view-btn--active' : ''}" data-view="grid" title="Tampilan Card Grid">
              <i class="fi fi-rr-apps"></i>
            </button>
            <button class="pm-view-btn ${this.portfolioViewMode === 'table' ? 'pm-view-btn--active' : ''}" data-view="table" title="Tampilan Tabel">
              <i class="fi fi-rr-menu-burger"></i>
            </button>
          </div>
        </div>

        <!-- 4. Content (Cards Grid OR Table) -->
        ${this.portfolioViewMode === 'grid' ? this.renderPortfolioGrid(filtered) : this.renderPortfolioTable(filtered)}
      </div>

      <!-- Modal Buat Proyek Baru -->
      ${this.isCreateProjectOpen ? this.renderCreateProjectModal() : ''}
    `;

    this.attachPortfolioEvents();
  }

  renderPortfolioGrid(projects) {
    if (projects.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 12px; margin-top: 20px;">
          <i class="fi fi-rr-search" style="font-size: 36px; color: #94a3b8; display: block; margin-bottom: 12px;"></i>
          <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px;">Tidak ada proyek ditemukan</h3>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Coba ubah kata kunci pencarian atau reset filter.</p>
        </div>
      `;
    }

    return `
      <div class="pm-portfolio-grid">
        ${projects.map(p => {
          const contractJt = Math.round((p.contractValue || 185e6) / 1e6);
          const budgetUsedJt = Math.round((p.budgetUsed || 65e6) / 1e6);
          const totalIssues = p.totalIssues || 9;
          const doneIssues = p.doneIssues || 2;
          const progPct = totalIssues ? Math.round((doneIssues / totalIssues) * 100) : 22;
          const health = p.health || 'On Track';
          const isAtRisk = health === 'At Risk';

          return `
            <div class="pm-proj-card">
              <div>
                <!-- Top Badges Row -->
                <div class="pm-card-top-row">
                  <div class="pm-card-badges-left">
                    <span class="pm-card-code-badge">
                      <span class="pm-card-color-dot" style="background: ${p.color || '#4f46e5'};"></span>
                      ${p.code}
                    </span>
                    <span class="pm-card-health-pill ${isAtRisk ? 'pm-card-health-pill--at-risk' : 'pm-card-health-pill--on-track'}">
                      • ${health}
                    </span>
                  </div>
                  <button class="pm-card-edit-btn" data-edit-project="${p.id}" title="Edit Detail Proyek">
                    <i class="fi fi-rr-pencil"></i>
                  </button>
                </div>

                <!-- Title & Client -->
                <h3 class="pm-card-title" title="${p.name}">${p.name}</h3>
                <div class="pm-card-client">Klien: ${p.clientName}</div>
                <p class="pm-card-desc">${p.description || 'Transformasi arsitektur microservices dan integrasi sistem digital agensi.'}</p>

                <!-- Meta Badges -->
                <div class="pm-card-meta-row">
                  <span class="pm-card-meta-pill">${p.contractType || 'Fixed Price'}</span>
                  <span class="pm-card-meta-pill pm-card-meta-pill--active">Status: ${p.status || 'Active'}</span>
                  <span class="pm-card-target-text">Target: ${p.targetDeadline || '2026-11-30'}</span>
                </div>

                <!-- Progress Bar -->
                <div class="pm-card-prog-wrap">
                  <div class="pm-card-prog-header">
                    <span>Progres Penyelesaian Issue</span>
                    <span>${progPct}% (${doneIssues}/${totalIssues})</span>
                  </div>
                  <div class="pm-card-prog-bar">
                    <div class="pm-card-prog-fill" style="width: ${progPct}%;"></div>
                  </div>
                </div>

                <!-- Dual Box (Anggaran & Jam Kerja) -->
                <div class="pm-card-stats-box">
                  <div>
                    <span class="pm-cs-label">Penggunaan Anggaran</span>
                    <span class="pm-cs-val">Rp ${budgetUsedJt}Jt / ${contractJt}Jt</span>
                  </div>
                  <div>
                    <span class="pm-cs-label">Jam Kerja Terpakai</span>
                    <span class="pm-cs-val">${p.usedHours || 480} / ${p.totalHours || 1200} Jam</span>
                  </div>
                </div>
              </div>

              <!-- Button Open Workspace -->
              <button class="pm-btn-open-workspace" data-open-workspace="${p.id}">
                <span>Open Workspace</span>
                <i class="fi fi-rr-arrow-right"></i>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderPortfolioTable(projects) {
    if (projects.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 12px; margin-top: 20px;">
          <i class="fi fi-rr-search" style="font-size: 36px; color: #94a3b8; display: block; margin-bottom: 12px;"></i>
          <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px;">Tidak ada proyek ditemukan</h3>
        </div>
      `;
    }

    return `
      <div class="pm-portfolio-table-wrap">
        <table class="pm-portfolio-table">
          <thead>
            <tr>
              <th>Proyek</th>
              <th>Klien &amp; Kontrak</th>
              <th>Kesehatan</th>
              <th>Progres Issue</th>
              <th>Penggunaan Anggaran</th>
              <th>Jam Kerja</th>
              <th>Target Deadline</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => {
              const contractJt = Math.round((p.contractValue || 185e6) / 1e6);
              const budgetUsedJt = Math.round((p.budgetUsed || 65e6) / 1e6);
              const totalIssues = p.totalIssues || 9;
              const doneIssues = p.doneIssues || 2;
              const progPct = totalIssues ? Math.round((doneIssues / totalIssues) * 100) : 22;
              const health = p.health || 'On Track';
              const isAtRisk = health === 'At Risk';

              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="pm-card-color-dot" style="background: ${p.color || '#4f46e5'};"></span>
                      <div>
                        <strong style="color: #0f172a; font-size: 13px;">${p.code} · ${p.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #4338ca;">${p.clientName}</div>
                    <div style="font-size: 11px; color: #64748b;">${p.contractType || 'Fixed Price'}</div>
                  </td>
                  <td>
                    <span class="pm-card-health-pill ${isAtRisk ? 'pm-card-health-pill--at-risk' : 'pm-card-health-pill--on-track'}">
                      • ${health}
                    </span>
                  </td>
                  <td style="min-width: 140px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                      <span>${progPct}%</span>
                      <span style="color: #64748b;">${doneIssues}/${totalIssues}</span>
                    </div>
                    <div class="pm-card-prog-bar">
                      <div class="pm-card-prog-fill" style="width: ${progPct}%;"></div>
                    </div>
                  </td>
                  <td>
                    <strong>Rp ${budgetUsedJt}Jt</strong> <span style="color: #64748b;">/ Rp ${contractJt}Jt</span>
                  </td>
                  <td>
                    <strong>${p.usedHours || 480}h</strong> <span style="color: #64748b;">/ ${p.totalHours || 1200}h</span>
                  </td>
                  <td>
                    <span style="color: #475569; font-weight: 500;">${p.targetDeadline || '2026-11-30'}</span>
                  </td>
                  <td style="text-align: right;">
                    <button class="pm-btn pm-btn--primary pm-btn--sm" data-open-workspace="${p.id}" style="padding: 5px 12px; font-size: 11.5px; border-radius: 6px;">
                      <span>Open Workspace →</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderCreateProjectModal() {
    return `
      <div class="pm-modal-backdrop" id="pmCreateProjectBackdrop">
        <div class="pm-modal-card" style="max-width: 520px;">
          <div class="pm-modal-header">
            <div>
              <h3 class="pm-modal-title">Buat Proyek Baru (CRM Intake)</h3>
              <p class="pm-modal-subtitle">Tambahkan proyek baru hasil closing deal atau inisiasi software house</p>
            </div>
            <button id="pmCloseCreateProjectBtn" class="pm-modal-close-btn">&times;</button>
          </div>
          <div class="pm-modal-body">
            <div class="pm-form-group">
              <label class="pm-form-label">Nama Proyek *</label>
              <input type="text" id="pmNewProjName" class="pm-form-input" placeholder="Contoh: Digital Core Banking v2..." required />
            </div>
            <div class="pm-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="pm-form-group">
                <label class="pm-form-label">Kode Proyek *</label>
                <input type="text" id="pmNewProjCode" class="pm-form-input" placeholder="Contoh: DCB-01" required />
              </div>
              <div class="pm-form-group">
                <label class="pm-form-label">Model Kontrak</label>
                <select id="pmNewProjContract" class="pm-form-input">
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Time Material">Time &amp; Material</option>
                </select>
              </div>
            </div>
            <div class="pm-form-group">
              <label class="pm-form-label">Nama Klien / Institusi *</label>
              <input type="text" id="pmNewProjClient" class="pm-form-input" placeholder="Contoh: PT Bank Mandiri Digital" required />
            </div>
            <div class="pm-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="pm-form-group">
                <label class="pm-form-label">Nilai Kontrak (Rp)</label>
                <input type="number" id="pmNewProjValue" class="pm-form-input" placeholder="Contoh: 850000000" />
              </div>
              <div class="pm-form-group">
                <label class="pm-form-label">Target Rilis</label>
                <input type="date" id="pmNewProjTarget" class="pm-form-input" value="2026-12-31" />
              </div>
            </div>
            <div class="pm-form-group">
              <label class="pm-form-label">Deskripsi &amp; Ringkasan Proyek</label>
              <textarea id="pmNewProjDesc" class="pm-form-input" rows="3" placeholder="Jelaskan kebutuhan teknis, arsitektur, dan deliverable proyek..."></textarea>
            </div>
          </div>
          <div class="pm-modal-footer">
            <button id="pmCancelCreateProjectBtn" class="pm-btn pm-btn--outline">Batal</button>
            <button id="pmSaveNewProjectBtn" class="pm-btn pm-btn--primary">Simpan Proyek</button>
          </div>
        </div>
      </div>
    `;
  }

  attachPortfolioEvents() {
    // Shared Master Tabs Bar navigation
    this.container.querySelectorAll('.pm-ws-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.wsTab;
        if (tab) {
          this.switchWorkspaceTab(tab);
        }
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#pmPortfolioSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.portfolioSearch = e.target.value;
        this.render();
      });
    }

    // Status filter
    const statusSelect = this.container.querySelector('#pmPortfolioStatusSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.portfolioStatus = e.target.value;
        this.render();
      });
    }

    // Client filter
    const clientSelect = this.container.querySelector('#pmPortfolioClientSelect');
    if (clientSelect) {
      clientSelect.addEventListener('change', (e) => {
        this.portfolioClient = e.target.value;
        this.render();
      });
    }

    // Contract model filter
    const contractSelect = this.container.querySelector('#pmPortfolioContractSelect');
    if (contractSelect) {
      contractSelect.addEventListener('change', (e) => {
        this.portfolioContract = e.target.value;
        this.render();
      });
    }

    // View switcher (Grid vs Table)
    this.container.querySelectorAll('.pm-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.portfolioViewMode = btn.dataset.view;
        this.render();
      });
    });

    // Open Workspace triggers
    this.container.querySelectorAll('[data-open-workspace]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.dataset.openWorkspace;
        this.openWorkspace(pId, 'ringkasan');
      });
    });

    // Create Project Modal triggers
    const createBtn = this.container.querySelector('#pmCreateNewProjectBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.isCreateProjectOpen = true;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector('#pmCloseCreateProjectBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => { this.isCreateProjectOpen = false; this.render(); });
    const cancelBtn = this.container.querySelector('#pmCancelCreateProjectBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { this.isCreateProjectOpen = false; this.render(); });

    const saveBtn = this.container.querySelector('#pmSaveNewProjectBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = this.container.querySelector('#pmNewProjName').value;
        const code = this.container.querySelector('#pmNewProjCode').value;
        const client = this.container.querySelector('#pmNewProjClient').value;
        const contractType = this.container.querySelector('#pmNewProjContract').value;
        const contractVal = Number(this.container.querySelector('#pmNewProjValue').value) || 100e6;
        const target = this.container.querySelector('#pmNewProjTarget').value || '2026-12-31';
        const desc = this.container.querySelector('#pmNewProjDesc').value;

        if (name && code && client) {
          const newProj = {
            id: `proj-${Date.now()}`,
            code: code.toUpperCase(),
            name,
            clientName: client,
            clientEmail: 'client@partner.corp',
            description: desc,
            status: 'Active',
            health: 'On Track',
            contractType,
            contractValue: contractVal,
            budgetUsed: 0,
            totalHours: 1000,
            usedHours: 0,
            totalIssues: 5,
            doneIssues: 0,
            targetDeadline: target,
            color: '#4f46e5',
            createdAt: new Date().toISOString().split('T')[0]
          };
          store.getState().projects.push(newProj);
          store.addToast('success', 'Proyek Dibuat', `Proyek ${name} berhasil ditambahkan.`);
          this.isCreateProjectOpen = false;
          this.render();
        } else {
          alert('Mohon isi nama proyek, kode, dan nama klien.');
        }
      });
    }
  }

  // =========================================================================
  // 2. RESUME DETAIL PENGERJAAN PROYEK (WORKSPACE WITH 5 SUBMODULE TABS)
  // =========================================================================
  renderWorkspace(state) {
    const activeProject = store.getActiveProject() || state.projects[0];
    const projectTasks = store.getProjectTasks();
    const members = state.teamMembers || [];
    const stats = this.getProjectStats(projectTasks);

    const startDate = activeProject.startDate || activeProject.createdAt || '2026-08-01';
    const deadline = activeProject.targetDeadline || activeProject.deadline || activeProject.warrantyUntil || '2026-11-30';
    const clientName = activeProject.clientName || 'PT Bank Mandiri Digital';
    const totalHours = activeProject.totalHours || 1200;
    const usedHours = activeProject.usedHours || 680;
    const progress = stats.progressPct || 22;

    const health = activeProject.health || 'On Track';
    const isAtRisk = health === 'At Risk';

    this.container.innerHTML = `
      <div class="pm-ws-wrap">
        <!-- 1. TOP STRIP -->
        <div class="pm-ws-top-strip">
          <div class="pm-ws-top-breadcrumb">
            <button id="pmBackToPortfolioBtn" class="pm-ws-back-link">
              <i class="fi fi-rr-arrow-left"></i>
              <span>Kembali ke Daftar Proyek</span>
            </button>
          </div>
          <div class="pm-ws-badges-right">
            <span class="pm-ws-pill ${isAtRisk ? 'pm-ws-pill--at-risk' : 'pm-ws-pill--on-track'}">
              • ${health}
            </span>
            <span class="pm-ws-pill pm-ws-pill--fixed">
              ${activeProject.contractType || 'Fixed Price'}
            </span>
          </div>
        </div>

        <!-- 2. TABS BAR (STICKY DI ATAS WORKSPACE) -->
        ${this.renderTabsBar(stats)}

        <!-- 3. MAIN WORKSPACE CONTENT CONTAINER -->
        <main class="pm-content" id="pmWorkspaceContentArea"></main>

        <!-- Modals -->
        ${this.isSettingsOpen ? this.renderSettingsModal(activeProject) : ''}
      </div>
    `;

    // Mount selected tab content into workspace content area
    const contentArea = this.container.querySelector('#pmWorkspaceContentArea');
    if (contentArea) {
      if (this.activeWorkspaceTab === 'ringkasan') {
        contentArea.innerHTML = this.renderOverviewTab({
          project: activeProject,
          tasks: projectTasks,
          members,
          stats,
          startDate,
          deadline,
          clientName,
          totalHours,
          usedHours,
          progress
        });
      } else if (this.activeWorkspaceTab === 'kanban') {
        contentArea.innerHTML = '';
        contentArea.appendChild(this.kanbanBoard.getElement());
        this.kanbanBoard.render();
      } else if (this.activeWorkspaceTab === 'backlog') {
        contentArea.innerHTML = '';
        contentArea.appendChild(this.backlogView.getElement());
        this.backlogView.render();
      } else if (this.activeWorkspaceTab === 'timeline') {
        contentArea.innerHTML = '';
        if (activeProject && activeProject.id) {
          this.timelineView.activeProjectFilter = activeProject.id;
        }
        contentArea.appendChild(this.timelineView.getElement());
        this.timelineView.render();
      } else if (this.activeWorkspaceTab === 'list') {
        contentArea.innerHTML = '';
        contentArea.appendChild(this.taskListView.getElement());
        this.taskListView.render();
      } else if (this.activeWorkspaceTab === 'qa') {
        contentArea.innerHTML = this.renderQaTab(activeProject, projectTasks);
      } else if (this.activeWorkspaceTab === 'docs') {
        contentArea.innerHTML = this.renderNotesTab({ project: activeProject });
      } else if (this.activeWorkspaceTab === 'time') {
        contentArea.innerHTML = this.renderTimesheetsTab({ project: activeProject, members, tasks: projectTasks });
      } else if (this.activeWorkspaceTab === 'finance_budget') {
        contentArea.innerHTML = this.renderInvoicesTab({ project: activeProject });
      }
    }

    this.attachEvents();
  }

  renderQaTab(project, tasks) {
    return `
      <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a;">Matrix Pengujian QA &amp; Testing</h3>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Pengujian integrasi otomatis, stress test K6, dan verifikasi CI/CD staging</p>
          </div>
          <span style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">
            ✓ 6/6 CI Pipeline Passing
          </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
            <span style="font-size: 11.5px; color: #64748b; font-weight: 600;">Unit &amp; Feature Tests</span>
            <div style="font-size: 22px; font-weight: 800; color: #059669; margin: 6px 0 2px 0;">100% Passed</div>
            <span style="font-size: 11px; color: #64748b;">48 test assertions lolos</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
            <span style="font-size: 11.5px; color: #64748b; font-weight: 600;">K6 Stress Load Test</span>
            <div style="font-size: 22px; font-weight: 800; color: #4f46e5; margin: 6px 0 2px 0;">2.000 RPS</div>
            <span style="font-size: 11px; color: #64748b;">P95 Latency &lt; 85ms</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
            <span style="font-size: 11.5px; color: #64748b; font-weight: 600;">Staging Health</span>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Healthy</div>
            <span style="font-size: 11px; color: #64748b;">Traefik Gateway SSL Active</span>
          </div>
        </div>
      </div>
    `;
  }

  renderOverviewTab({ project, tasks, members, stats, startDate, deadline, clientName, totalHours, usedHours, progress }) {
    const activeProject = project || store.getActiveProject();
    const contractVal = activeProject.contractValue || 950000000;
    const budgetUsed = activeProject.budgetUsed || 512000000;
    const burnRatePct = Math.round((budgetUsed / contractVal) * 100) || 54;
    const projectUsedHours = usedHours || activeProject.usedHours || 680;
    const hoursAllocated = totalHours || activeProject.totalHours || 1200;
    const remainingHours = Math.max(0, hoursAllocated - projectUsedHours);

    const doneCount = tasks.filter(t => t.status === 'Selesai').length;
    const totalIssues = tasks.length || 9;
    const overallProgPct = totalIssues ? Math.round((doneCount / totalIssues) * 100) : 22;

    const health = activeProject.health || 'On Track';
    const isAtRisk = health === 'At Risk';

    // Active sprint tasks preview
    const activeTasks = tasks.slice(0, 5);

    // Milestones and payment terms
    const milestones = [
      { id: 'm1', name: 'M1: Arsitektur & Database Schema', pct: 100, date: '18 Okt 2026', done: true, termin: 'Termin DP 30% Lunas' },
      { id: 'm2', name: 'M2: Core Features & API Microservices', pct: 65, date: '01 Nov 2026', done: false, termin: 'Termin 2 (40%) On-Track' },
      { id: 'm3', name: 'M3: Staging Load Testing K6 & UAT', pct: 15, date: '16 Nov 2026', done: false, termin: 'Termin 3 (30%) Pelunasan' },
      { id: 'm4', name: 'M4: Production Deployment & Handover', pct: 0, date: '15 Des 2026', done: false, termin: 'Garansi SLA 12 Bulan' }
    ];

    return `
      <div class="pm-ws-overview-container">
        <!-- 1. HERO BANNER CARD -->
        <div class="pm-ws-hero-card">
          <div class="pm-ws-hero-pill-row">
            <span class="pm-ws-hero-dot" style="background: ${activeProject.color || '#4f46e5'};"></span>
            <span>${activeProject.code} • ${clientName}</span>
            <span class="pm-ws-hero-badge">${health.toUpperCase()}</span>
          </div>
          <h2 class="pm-ws-hero-title">${activeProject.name}</h2>
          <p class="pm-ws-hero-desc">
            ${activeProject.description || 'Transformasi arsitektur mobile banking native dengan fitur Biometric Login, QRIS Cross-Border, dan High-Concurrency Transaction Engine.'}
          </p>
          <div class="pm-ws-hero-btns">
            <div class="pm-ws-hero-btns-left">
              <button class="pm-ws-hero-btn-primary" data-switch-ws-tab="kanban">Buka Board Kanban</button>
              <button class="pm-ws-hero-btn-secondary" data-nav-to-client="true">Lihat Client Portal</button>
            </div>
            <div class="pm-ws-hero-btns-right">
              <button id="pmWsEditProjBtn" class="pm-ws-btn pm-ws-btn--outline" title="Edit konfigurasi proyek">
                <i class="fi fi-rr-pencil"></i>
                <span>Edit Proyek</span>
              </button>
              <button id="pmWsAiCopilotBtn" class="pm-ws-btn pm-ws-btn--outline pm-ws-btn--copilot" title="Buka AI Copilot Proyek">
                <i class="fi fi-rr-magic-wand"></i>
                <span>AI Copilot</span>
              </button>
              <button id="pmWsCreateIssueBtn" class="pm-ws-btn pm-ws-btn--primary" title="Tambah issue / task baru">
                <i class="fi fi-rr-plus"></i>
                <span>Buat Issue</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. 4 TOP KPI CARDS -->
        <div class="pm-ws-kpi-grid">
          <!-- Card 1: Overall Progress -->
          <div class="pm-ws-kpi-card">
            <div class="pm-ws-kpi-top">
              <span>Overall Progress</span>
              <i class="fi fi-rr-check-circle" style="color: #059669; font-size: 16px;"></i>
            </div>
            <div class="pm-ws-kpi-val">${overallProgPct}%</div>
            <div class="pm-ws-kpi-bar">
              <div class="pm-ws-kpi-bar-fill" style="width: ${overallProgPct}%; background: #059669;"></div>
            </div>
            <div class="pm-ws-kpi-sub">${doneCount} dari ${totalIssues} issues selesai</div>
          </div>

          <!-- Card 2: Budget Burn Rate -->
          <div class="pm-ws-kpi-card">
            <div class="pm-ws-kpi-top">
              <span>Budget Burn Rate (Super Admin) $</span>
              <i class="fi fi-rr-dollar" style="color: #4f46e5; font-size: 16px;"></i>
            </div>
            <div class="pm-ws-kpi-val" style="color: #4f46e5;">${burnRatePct}%</div>
            <div class="pm-ws-kpi-bar">
              <div class="pm-ws-kpi-bar-fill" style="width: ${burnRatePct}%; background: #4f46e5;"></div>
            </div>
            <div class="pm-ws-kpi-sub">Rp ${new Intl.NumberFormat('id-ID').format(budgetUsed)} / Rp ${new Intl.NumberFormat('id-ID').format(contractVal)}</div>
          </div>

          <!-- Card 3: Jam Alokasi Tim -->
          <div class="pm-ws-kpi-card">
            <div class="pm-ws-kpi-top">
              <span>Jam Alokasi Tim</span>
              <i class="fi fi-rr-clock" style="color: #0284c7; font-size: 16px;"></i>
            </div>
            <div class="pm-ws-kpi-val">${projectUsedHours} <span style="font-size: 15px; font-weight: 500; color: #64748b;">/ ${hoursAllocated} Jam</span></div>
            <div class="pm-ws-kpi-bar">
              <div class="pm-ws-kpi-bar-fill" style="width: ${Math.min(100, Math.round((projectUsedHours / hoursAllocated) * 100))}%; background: #0284c7;"></div>
            </div>
            <div class="pm-ws-kpi-sub">${remainingHours} jam tersisa dalam alokasi</div>
          </div>

          <!-- Card 4: Target Deadline -->
          <div class="pm-ws-kpi-card">
            <div class="pm-ws-kpi-top">
              <span>Target Deadline</span>
              <i class="fi fi-rr-calendar" style="color: #d97706; font-size: 16px;"></i>
            </div>
            <div class="pm-ws-kpi-val">${deadline}</div>
            <div class="pm-ws-kpi-sub" style="color: #059669; font-weight: 700; margin-bottom: 2px;">
              Sisa 56 hari menuju Go-Live
            </div>
            <div class="pm-ws-kpi-sub" style="font-size: 11px;">Mulai: ${startDate}</div>
          </div>
        </div>

        <!-- 3. SPLIT TWO-COLUMN ROW -->
        <div class="pm-ws-split-row">
          <!-- Column Left: Sprint Berjalan Saat Ini -->
          <div class="pm-ws-card">
            <div class="pm-ws-card-header">
              <h3 class="pm-ws-card-title">Sprint Berjalan Saat Ini</h3>
              <button class="pm-ws-card-link" data-switch-ws-tab="backlog">
                <span>Lihat Detail Backlog</span>
                <i class="fi fi-rr-arrow-up-right"></i>
              </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${activeTasks.map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                    <span style="font-size: 11px; font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">${t.key}</span>
                    <span style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                    <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: ${t.status === 'Selesai' ? '#ecfdf5' : '#eff6ff'}; color: ${t.status === 'Selesai' ? '#059669' : '#2563eb'};">
                      ${t.status}
                    </span>
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">${t.estimateHours || 8}h</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column Right: Milestones & Termin Pembayaran -->
          <div class="pm-ws-card">
            <div class="pm-ws-card-header">
              <h3 class="pm-ws-card-title">Milestones &amp; Termin Pembayaran</h3>
              <button class="pm-ws-card-link" data-switch-ws-tab="timeline">
                <span>Gantt Roadmap</span>
                <i class="fi fi-rr-arrow-up-right"></i>
              </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${milestones.map(m => `
                <div style="padding: 10px 12px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <i class="fi ${m.done ? 'fi-rr-check-circle' : 'fi-rr-flag'}" style="color: ${m.done ? '#059669' : '#4f46e5'}; font-size: 14px;"></i>
                      <strong style="font-size: 12.5px; color: #0f172a;">${m.name}</strong>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: ${m.done ? '#059669' : '#4f46e5'};">${m.pct}%</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
                    <span>Target: ${m.date}</span>
                    <span style="font-weight: 600; color: #334155;">${m.termin}</span>
                  </div>
                </div>
              `).join('')}
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
    // Back to Portfolio Button
    const backBtn = this.container.querySelector('#pmBackToPortfolioBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.backToPortfolio();
      });
    }

    // Workspace Tabs Switching
    this.container.querySelectorAll('.pm-ws-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.wsTab;
        if (tab) {
          this.switchWorkspaceTab(tab);
        }
      });
    });

    // In-overview quick switches
    this.container.querySelectorAll('[data-switch-ws-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = e.currentTarget.dataset.switchWsTab;
        if (tab) {
          this.switchWorkspaceTab(tab);
        }
      });
    });

    // Navigate to Client Portal
    this.container.querySelectorAll('[data-nav-to-client]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        store.setActiveTab('client');
      });
    });

    // Edit Project Button
    const editProjBtn = this.container.querySelector('#pmWsEditProjBtn');
    if (editProjBtn) {
      editProjBtn.addEventListener('click', () => {
        this.isSettingsOpen = true;
        this.render();
      });
    }

    // AI Copilot Button
    const aiCopilotBtn = this.container.querySelector('#pmWsAiCopilotBtn');
    if (aiCopilotBtn) {
      aiCopilotBtn.addEventListener('click', () => {
        store.addToast('info', 'AI Copilot Aktif', 'AI Copilot menganalisis status delivery, velocity sprint, dan risiko blocker proyek.');
      });
    }

    // Create Issue Button
    const createIssueBtn = this.container.querySelector('#pmWsCreateIssueBtn');
    if (createIssueBtn) {
      createIssueBtn.addEventListener('click', () => {
        store.openCreateTaskModal();
      });
    }

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
        const subtab = e.currentTarget.dataset.workspaceTab || e.currentTarget.dataset.subtab;
        if (subtab) {
          this.activeWorkspaceTab = subtab;
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
