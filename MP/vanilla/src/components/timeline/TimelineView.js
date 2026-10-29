/**
 * TimelineView Component (Vanilla ES Module)
 * Setara Atlassian Jira Software Cloud Roadmap & Gantt Timeline:
 * - 30-Day Gantt Timeline with Month & Day Sticky Headers
 * - Quick Project Switcher Pills (Perpustakaan Digital, Arena Futsal, POS Kopi Kenangan)
 * - Two-tier Controls Section: Search & Status Filter on Row 1, Grouping & Status Legend on Row 2
 * - Uniform Metric Summary Cards (Progres, Aktif, Estimasi Jam, Target UAT) with Proportional Progress Bar
 * - Fixed 320px Left Column with Text Truncation & Ellipsis
 * - Accessible Status Contrast for Gantt Bars
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class TimelineView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'timeline-view';

    this.activeProjectFilter = store.getState().selectedProjectId || 'proj-perpustakaan';
    this.groupingMode = 'epic'; // 'epic' | 'assignee' | 'status'
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.collapsedGroups = {};

    this.timelineStartDate = new Date(2026, 9, 10); // 10 Okt 2026
    this.totalDays = 30; // 10 Okt - 08 Nov 2026
    this.todayDateStr = '2026-10-20';

    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.container;
  }

  calculateBarPosition(startDateStr, dueDateStr) {
    const parseDateToDayIndex = (dStr, fallbackIndex = 0) => {
      if (!dStr) return fallbackIndex;
      const parts = dStr.split('-');
      if (parts.length !== 3) return fallbackIndex;
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const diffTime = dateObj.getTime() - this.timelineStartDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      return Math.max(0, Math.min(this.totalDays - 1, diffDays));
    };

    const startIndex = parseDateToDayIndex(startDateStr, 2);
    const endIndex = parseDateToDayIndex(dueDateStr, startIndex + 5);
    const spanDays = Math.max(1, endIndex - startIndex + 1);

    const leftPercent = (startIndex / this.totalDays) * 100;
    const widthPercent = (spanDays / this.totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(3.5, widthPercent)}%`,
      spanDays
    };
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const { tasks, epics, projects, teamMembers } = state;

    const availableProjects = projects.filter(p =>
      p.id === 'proj-perpustakaan' ||
      p.id === 'proj-futsal' ||
      p.id === 'proj-1' ||
      p.code === 'LIB-DIG' ||
      p.code === 'FTSL-PRO' ||
      p.code === 'POS-KLN'
    );

    // Filter tasks based on project, status, and search query
    const filteredTasks = tasks.filter(task => {
      if (this.activeProjectFilter !== 'all' && task.projectId !== this.activeProjectFilter) {
        return false;
      }
      const isAllowedProject =
        task.projectId === 'proj-perpustakaan' ||
        task.projectId === 'proj-futsal' ||
        task.projectId === 'proj-1';
      if (!isAllowedProject) return false;

      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'in_progress' && task.status !== 'In Progress' && task.status !== 'Dianalisis') return false;
        if (this.statusFilter === 'done' && task.status !== 'Selesai') return false;
        if (this.statusFilter === 'qa' && task.status !== 'QA/Testing' && task.status !== 'Menunggu Persetujuan') return false;
        if (this.statusFilter === 'backlog' && task.status !== 'Backlog' && task.status !== 'To Do' && task.status !== 'Baru') return false;
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchKey = task.key.toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }

      return true;
    });

    // Statistical calculations
    const totalTasksCount = filteredTasks.length;
    const completedTasksCount = filteredTasks.filter(t => t.status === 'Selesai').length;
    const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress' || t.status === 'Dianalisis').length;
    const totalEstimatedHours = filteredTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
    const totalLoggedHours = filteredTasks.reduce((acc, t) => acc + (t.timeLoggedHours || 0), 0);
    const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // 30-Day Calendar Days generator
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const calendarDays = [];
    for (let i = 0; i < this.totalDays; i++) {
      const d = new Date(this.timelineStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      calendarDays.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: dateStr === this.todayDateStr
      });
    }

    // Today indicator position calculation
    const todayParts = this.todayDateStr.split('-');
    const todayObj = new Date(parseInt(todayParts[0]), parseInt(todayParts[1]) - 1, parseInt(todayParts[2]));
    const diffTime = todayObj.getTime() - this.timelineStartDate.getTime();
    const todayIndex = Math.round(diffTime / (1000 * 3600 * 24));
    const todayPercent = (todayIndex / this.totalDays) * 100;

    // Grouping computation
    let groupedData = [];
    if (this.groupingMode === 'epic') {
      const currentEpics = epics.filter(e => this.activeProjectFilter === 'all' || e.projectId === this.activeProjectFilter);
      groupedData = currentEpics.map(epic => {
        const groupTasks = filteredTasks.filter(t => t.epicId === epic.id);
        const groupProj = availableProjects.find(p => p.id === epic.projectId);
        return {
          id: epic.id,
          title: epic.title,
          badge: epic.key,
          color: epic.color || '#0052cc',
          subtext: groupProj ? groupProj.name : '',
          tasks: groupTasks
        };
      }).filter(g => g.tasks.length > 0 || this.activeProjectFilter !== 'all');
    } else if (this.groupingMode === 'assignee') {
      groupedData = teamMembers.map(member => {
        const groupTasks = filteredTasks.filter(t => t.assigneeId === member.id);
        return {
          id: member.id,
          title: member.name,
          badge: member.role,
          avatar: member.avatar,
          color: member.role.toLowerCase().includes('backend') ? '#0747a6' : member.role.toLowerCase().includes('frontend') ? '#008da6' : '#6554c0',
          subtext: `@${member.githubUsername || member.name.toLowerCase()}`,
          tasks: groupTasks
        };
      }).filter(g => g.tasks.length > 0);
    } else {
      const statuses = ['Baru', 'In Progress', 'Dianalisis', 'QA/Testing', 'Menunggu Persetujuan', 'Selesai', 'Backlog'];
      groupedData = statuses.map(status => {
        const groupTasks = filteredTasks.filter(t => t.status === status);
        return {
          id: status,
          title: status,
          badge: `${groupTasks.length} Tiket`,
          color: status === 'Selesai' ? '#059669' : status === 'In Progress' ? '#0052cc' : status === 'Menunggu Persetujuan' ? '#d97706' : '#64748b',
          subtext: 'Status Pengerjaan',
          tasks: groupTasks
        };
      }).filter(g => g.tasks.length > 0);
    }

    this.container.innerHTML = `
      <div class="timeline-container">
        
        <!-- 1. Header & Quick Project Switcher Block -->
        <div class="timeline-header-block">
          <div>
            <div class="timeline-breadcrumb">
              <span>Proyek</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--active">${activeProject?.name || 'Perpustakaan Digital'}</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--current">Roadmap</span>
            </div>
            <h1 class="timeline-title">
              Roadmap &amp; Timeline Gantt Proyek
            </h1>
          </div>

          <!-- Quick Project Switcher Pills -->
          <div class="timeline-project-pills">
            <button class="tl-proj-pill ${this.activeProjectFilter === 'proj-perpustakaan' ? 'tl-proj-pill--active' : ''}" data-proj="proj-perpustakaan">
              <i class="fi fi-rr-book-alt" style="margin-right: 4px;"></i> Perpustakaan Digital
            </button>
            <button class="tl-proj-pill ${this.activeProjectFilter === 'proj-futsal' ? 'tl-proj-pill--active' : ''}" data-proj="proj-futsal">
              <i class="fi fi-rr-football" style="margin-right: 4px;"></i> Arena Futsal Pro
            </button>
            <button class="tl-proj-pill ${this.activeProjectFilter === 'proj-1' ? 'tl-proj-pill--active' : ''}" data-proj="proj-1">
              <i class="fi fi-rr-coffee" style="margin-right: 4px;"></i> POS Kopi Kenangan
            </button>
            <button class="tl-proj-pill ${this.activeProjectFilter === 'all' ? 'tl-proj-pill--active' : ''}" data-proj="all">
              Semua (3 Proyek)
            </button>
          </div>
        </div>

        <!-- 2. Controls Card: Two-tier Clean Layout -->
        <div class="timeline-controls-card">
          <!-- Tier 1: Search and Status Filter -->
          <div class="timeline-controls-row--primary">
            <div class="timeline-filter-group">
              <!-- Search box -->
              <div class="timeline-search-box">
                <span class="timeline-search-icon">
                  ${Icons.search('', 14)}
                </span>
                <input
                  type="text"
                  id="tlSearchInput"
                  class="timeline-search-input"
                  placeholder="Cari tiket atau kode..."
                  value="${this.escapeHtml(this.searchQuery)}"
                  autocomplete="off"
                />
              </div>

              <!-- Status Filter Select -->
              <div class="timeline-status-select-wrap">
                <label for="tlStatusFilter" class="timeline-filter-label">Status:</label>
                <select id="tlStatusFilter" class="timeline-status-select">
                  <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Semua Status (${tasks.length})</option>
                  <option value="in_progress" ${this.statusFilter === 'in_progress' ? 'selected' : ''}>Sedang Dikerjakan</option>
                  <option value="qa" ${this.statusFilter === 'qa' ? 'selected' : ''}>QA / Review Approval</option>
                  <option value="done" ${this.statusFilter === 'done' ? 'selected' : ''}>Selesai</option>
                  <option value="backlog" ${this.statusFilter === 'backlog' ? 'selected' : ''}>Backlog / To Do</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tier 2: Category Grouping & Status Indicators Legend -->
          <div class="timeline-controls-row--secondary">
            <!-- Grouping Switcher -->
            <div class="timeline-grouping-group">
              <span class="timeline-filter-label">Kelompokkan:</span>
              <div class="timeline-group-segmented">
                <button class="tl-group-btn tl-proj-pill ${this.groupingMode === 'epic' ? 'tl-proj-pill--active' : ''}" data-group="epic">Epik</button>
                <button class="tl-group-btn tl-proj-pill ${this.groupingMode === 'assignee' ? 'tl-proj-pill--active' : ''}" data-group="assignee">Engineer Tim</button>
                <button class="tl-group-btn tl-proj-pill ${this.groupingMode === 'status' ? 'tl-proj-pill--active' : ''}" data-group="status">Status</button>
              </div>
            </div>

            <!-- Status Indicator Legend (Cleanly aligned to the right) -->
            <div class="timeline-legend">
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--done"></span>
                <span>Selesai</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--progress"></span>
                <span>In Progress</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--qa"></span>
                <span>QA / Review</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--hotfix"></span>
                <span>Hotfix</span>
              </div>
              <div class="timeline-legend-today">
                <span class="timeline-legend-today-indicator"></span>
                <span>Hari Ini (20 Okt)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Metric / Summary Cards: Uniform Min-Height & Clear Typography -->
        <div class="timeline-metrics-grid">
          <!-- Metric 1: Progres Penyelesaian -->
          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Progres Penyelesaian</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value">${completionPercentage}%</span>
                  <span class="timeline-metric-card__subvalue">(${completedTasksCount}/${totalTasksCount} task)</span>
                </div>
                <!-- Proportional visual progress bar -->
                <div class="timeline-metric-card__progress-track">
                  <div class="timeline-metric-card__progress-bar" style="width: ${completionPercentage}%;"></div>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">${completedTasksCount} tiket selesai dari total beban pengerjaan sprint.</p>
          </div>

          <!-- Metric 2: Aktif Dikerjakan -->
          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Aktif Dikerjakan</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value timeline-metric-card__value--primary">${inProgressCount}</span>
                  <span class="timeline-metric-card__subvalue">task aktif berjalan</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Distributed lock, OPAC UI, dan QRIS payment gateway.</p>
          </div>

          <!-- Metric 3: Alokasi Estimasi Waktu -->
          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Alokasi Estimasi Waktu</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value">${totalEstimatedHours} Jam</span>
                  <span class="timeline-metric-card__subvalue">(${totalLoggedHours}j logged)</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Beban kerja terdistribusi proporsional ke 5 role spesialis.</p>
          </div>

          <!-- Metric 4: Target Milestone UAT -->
          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Target Milestone UAT</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value timeline-metric-card__value--purple">01 Nov 2026</span>
                  <span class="timeline-metric-card__badge">H-12 Hari</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Sign-off UAT Termin 2 dan deployment Staging rilis.</p>
          </div>
        </div>

        <!-- 4. Gantt Chart Canvas (Fixed 320px column & Sticky Header) -->
        <div class="timeline-canvas">
          <div class="timeline-canvas__inner">
            
            <!-- Sticky Calendar Days Header -->
            <div class="timeline-header-row">
              <div class="timeline-col-ticket">
                <span class="timeline-col-ticket__header-title">Tiket / Epik Pengerjaan</span>
                <span class="timeline-col-ticket__header-sub">Tenggat &amp; PIC</span>
              </div>

              <!-- Days Track -->
              <div class="timeline-days-track">
                ${calendarDays.map(d => `
                  <div class="timeline-day-cell ${d.isToday ? 'timeline-day-cell--today' : d.isWeekend ? 'timeline-day-cell--weekend' : ''}">
                    <span>${d.dayName}</span>
                    <span class="timeline-day-cell__num">${d.dayNum}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Gantt Body -->
            <div>
              ${groupedData.length === 0 ? `
                <div style="padding: 48px; text-align: center; color: #64748b; font-size: 13px; font-style: italic;">
                  Tidak ada tiket atau epik yang cocok dengan kriteria filter saat ini.
                </div>
              ` : groupedData.map(group => {
                const isCollapsed = !!this.collapsedGroups[group.id];
                return `
                  <div class="timeline-group-block">
                    <!-- Group Header Row -->
                    <div class="tl-group-header" data-group-id="${group.id}">
                      <div class="timeline-col-ticket">
                        <div class="tl-group-info">
                          <span style="color: #64748b; display: flex; align-items: center; transform: ${isCollapsed ? 'rotate(-90deg)' : 'none'}; transition: transform 0.15s ease;">
                            ${Icons.chevronDown('', 14)}
                          </span>
                          <span style="width: 10px; height: 10px; border-radius: 2px; background: ${group.color}; flex-shrink: 0;"></span>
                          <span class="tl-group-title" title="${this.escapeHtml(group.title)}">
                            ${this.escapeHtml(group.title)}
                          </span>
                          <span class="tl-group-badge">
                            ${group.tasks.length}
                          </span>
                        </div>
                      </div>
                      <div class="tl-group-subtext">
                        ${this.escapeHtml(group.subtext)}
                      </div>
                    </div>

                    <!-- Group Tasks Rows -->
                    ${!isCollapsed ? group.tasks.map(task => {
                      const { left, width, spanDays } = this.calculateBarPosition(task.startDate, task.dueDate);
                      const assignee = teamMembers.find(m => m.id === task.assigneeId);
                      const isDone = task.status === 'Selesai';
                      const isHotfix = task.priority === 'Hotfix' || task.priority === 'Tinggi';
                      const isReview = task.status === 'Menunggu Persetujuan' || task.status === 'QA/Testing';

                      // Accessible WCAG Contrast Status Palette
                      const barColor = isDone ? '#059669' : isHotfix ? '#dc2626' : isReview ? '#6d28d9' : task.status === 'In Progress' ? '#0052cc' : '#475569';

                      return `
                        <div class="tl-task-row">
                          <!-- Fixed 320px Left Column with Text Truncation -->
                          <div class="timeline-col-ticket tl-task-cell" data-task-id="${task.id}" title="Klik untuk membuka detail ${task.key}">
                            <div class="tl-task-meta-left">
                              <span class="tl-task-key">${task.key}</span>
                              <span class="tl-task-title" title="${this.escapeHtml(task.title)}">
                                ${this.escapeHtml(task.title)}
                              </span>
                            </div>

                            <div class="tl-task-meta-right">
                              ${assignee ? `
                                <img src="${assignee.avatar}" alt="${assignee.name}" title="${assignee.name}" class="tl-task-avatar" />
                              ` : ''}
                              <span class="tl-task-date">
                                ${task.dueDate ? task.dueDate.slice(5) : ''}
                              </span>
                            </div>
                          </div>

                          <!-- Right Gantt Bar Track -->
                          <div class="timeline-track">
                            <!-- Background Grid Lines -->
                            <div class="timeline-grid-bg">
                              ${calendarDays.map(d => `
                                <div class="timeline-grid-cell ${d.isWeekend ? 'timeline-grid-cell--weekend' : ''}"></div>
                              `).join('')}
                            </div>

                            <!-- Today Guideline Marker (Subtle blue) -->
                            <div class="timeline-today-line" style="left: ${todayPercent}%;"></div>

                            <!-- Gantt Bar with High Contrast Accessible Label -->
                            <div
                              class="timeline-bar tl-bar"
                              data-task-id="${task.id}"
                              title="${task.key}: ${this.escapeHtml(task.title)}&#10;Status: ${task.status}&#10;Tenggat: ${task.dueDate} (${spanDays} Hari)"
                              style="left: ${left}; width: ${width}; background-color: ${barColor};"
                            >
                              <span class="timeline-bar__label">${task.status}</span>
                              <span class="timeline-bar__hours">${task.estimateHours}j</span>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('') : ''}
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>

        <!-- 5. Explanatory Footer Card -->
        <div class="timeline-footer-card">
          <div class="timeline-footer-card__left">
            <span style="color: #0052cc;">${Icons.info('', 16)}</span>
            <span>
              Klik bar tiket atau judul di sebelah kiri untuk membuka Jira Issue Detail dialog secara interaktif.
            </span>
          </div>

          <div class="timeline-footer-card__right">
            <span>Proyek: <strong>${this.activeProjectFilter === 'all' ? '3 Proyek' : availableProjects.find(p => p.id === this.activeProjectFilter)?.name || ''}</strong></span>
            <span>·</span>
            <span>Total Tiket: <strong>${filteredTasks.length} Tiket</strong></span>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindEvents() {
    // Project switcher pills
    const pills = this.container.querySelectorAll('.tl-proj-pill:not(.tl-group-btn)');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const proj = pill.getAttribute('data-proj');
        this.activeProjectFilter = proj;
        if (proj !== 'all') {
          store.setSelectedProjectId(proj);
        }
        this.render();
      });
    });

    // Grouping buttons
    const groupBtns = this.container.querySelectorAll('.tl-group-btn');
    groupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.groupingMode = btn.getAttribute('data-group');
        this.render();
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#tlSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Status filter
    const statusSelect = this.container.querySelector('#tlStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.render();
      });
    }

    // Collapsible group headers
    const groupHeaders = this.container.querySelectorAll('.tl-group-header');
    groupHeaders.forEach(gh => {
      gh.addEventListener('click', () => {
        const gId = gh.getAttribute('data-group-id');
        this.collapsedGroups[gId] = !this.collapsedGroups[gId];
        this.render();
      });
    });

    // Open task details on task cell or bar click
    const taskTriggers = this.container.querySelectorAll('.tl-task-cell, .tl-bar');
    taskTriggers.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = el.getAttribute('data-task-id');
        const task = store.getState().tasks.find(t => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
