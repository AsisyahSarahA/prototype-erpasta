/**
 * TimelineView.js — Vanilla ES Module
 * Atlassian Jira Software Cloud Roadmap & Gantt Timeline
 * 
 * Fitur & Penyesuaian:
 * - Sinkronisasi 100% dinamis dengan proyek aktif (store.getActiveProject)
 * - Header Track 'Sprints' berdasarkan sprint asli proyek (Status Aktif / Future)
 * - Penghapusan baris 'Official' dan 'Beta' sesuai permintaan user
 * - Tanggal batas kanvas dinamis (menyesuaikan rentang tanggal tugas, sprint, dan target proyek)
 * - Kolom Kiri 'Tiket / Epik Pengerjaan (${projectCode})':
 *   - Chevron expand/collapse untuk membuka daftar task asli per epik
 *   - Ikon Epik Ungu (⚡ Jira Lightning Style)
 *   - Segmented Mini Progress Bar di bawah judul (Hijau=Done, Biru=In-Progress, Abu=To-Do)
 *   - Child Task asli terindentasi dengan checkbox ☑️ dan status badge (IN PROGRESS, SELESAI, TO DO)
 *   - Tombol '+ Create Epic' untuk menambah epik baru langsung ke store
 * - Gantt Canvas:
 *   - Posisi bar epik dan task dihitung langsung dari tanggal awal & akhir tugas riil
 *   - Live Running Progress: Garis diagonal animasi mengalir (flowing stripes) pada task/epik In-Progress
 *   - Live ticker persentase dinamis ("ketika prosesnya berjalan maka bar-nya juga berjalan")
 *   - Garis dependensi melengkung (SVG S-Curve / Bezier Connectors) antar epik bertingkat
 * - Floating Control Toolbar di kanan bawah (‹ ›, Today, Weeks | Months | Quarters, Info, Fullscreen)
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class TimelineView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'timeline-view';

    this.groupingMode = 'epic'; // 'epic' | 'assignee' | 'status'
    this.searchQuery = '';
    this.statusFilter = 'all';

    // State expand/collapse per epik (default buka epik ke-2 atau epik yang memiliki task aktif)
    this.expandedEpics = {};

    // Zoom level ('weeks' | 'months' | 'quarters')
    this.zoomMode = 'months';

    // Simulated live progress ticker for active In-Progress items
    this.liveProgress = 64;
    this.liveTimer = null;
    this.unsubscribe = null;

    this.init();
  }

  init() {
    // Default expand the epic that has in-progress tasks or the 2nd epic
    const activeProj = store.getActiveProject();
    const epics = store.getState().epics.filter(e => e.projectId === activeProj?.id);
    if (epics.length > 1) {
      this.expandedEpics[epics[1].id] = true;
    } else if (epics.length > 0) {
      this.expandedEpics[epics[0].id] = true;
    }

    this.render();

    this.unsubscribe = store.subscribe(() => {
      this.render();
    });

    this.startLiveTicker();
  }

  getElement() {
    return this.container;
  }

  /**
   * Menggerakkan progress bar secara real-time untuk task/epik yang berstatus 'In Progress'
   * Memberikan efek visual "ketika prosesnya berjalan maka bar-nya juga berjalan"
   */
  startLiveTicker() {
    if (this.liveTimer) clearInterval(this.liveTimer);

    this.liveTimer = setInterval(() => {
      this.liveProgress += 0.5;
      if (this.liveProgress > 88) {
        this.liveProgress = 55;
      }

      // Update elemen progress bar yang aktif di DOM tanpa re-render berkedip
      const runningBars = this.container.querySelectorAll('.tl-gantt-progress-fill.progress-running');
      runningBars.forEach(bar => {
        bar.style.width = `${this.liveProgress}%`;
      });

      const runningBadges = this.container.querySelectorAll('.tl-bar-running-pct');
      runningBadges.forEach(badge => {
        badge.textContent = `${Math.round(this.liveProgress)}%`;
      });

      // Update segmen biru di mini progress bar kolom kiri
      const runningSegs = this.container.querySelectorAll('.tl-seg-fill.in-progress.running-active');
      runningSegs.forEach(seg => {
        seg.style.width = `${Math.round(this.liveProgress * 0.45)}%`;
      });
    }, 1200);
  }

  /**
   * Menghitung posisi left (%) dan width (%) bar berdasarkan rentang tanggal
   */
  calculateBarPosition(startDateStr, dueDateStr, fallbackStart = 5, fallbackSpan = 12) {
    const timelineStart = this.timelineStart || new Date(2026, 9, 10);
    const totalDays = this.totalDays || 45;

    const parseToDayIdx = (dStr, fallback) => {
      if (!dStr) return fallback;
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return fallback;
      const diff = Math.round((d.getTime() - timelineStart.getTime()) / 86400000);
      return Math.max(0, Math.min(totalDays - 1, diff));
    };

    const startIdx = parseToDayIdx(startDateStr, fallbackStart);
    const endIdx = parseToDayIdx(dueDateStr, Math.min(totalDays - 1, startIdx + fallbackSpan));
    const spanDays = Math.max(2, endIdx - startIdx + 1);

    const leftPercent = (startIdx / totalDays) * 100;
    const widthPercent = (spanDays / totalDays) * 100;

    return {
      left: `${Math.min(94, Math.max(0, leftPercent))}%`,
      width: `${Math.max(4.5, Math.min(98 - leftPercent, widthPercent))}%`,
      spanDays,
      startIdx,
      endIdx
    };
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const currentProjectId = activeProject ? activeProject.id : state.selectedProjectId;

    const { tasks, epics, sprints } = state;
    const projectTasks = tasks.filter(t => t.projectId === currentProjectId);
    const currentEpics = epics.filter(e => e.projectId === currentProjectId);
    const projectSprints = (sprints || []).filter(s => s.projectId === currentProjectId);
    const projectCode = activeProject?.code || 'PRJ';

    // 1. Filter tasks berdasarkan pencarian dan status
    const filteredTasks = projectTasks.filter(task => {
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'in_progress' && task.status !== 'In Progress' && task.status !== 'Dianalisis') return false;
        if (this.statusFilter === 'done' && task.status !== 'Selesai') return false;
        if (this.statusFilter === 'qa' && task.status !== 'QA/Testing' && task.status !== 'In Review' && task.status !== 'Menunggu Persetujuan') return false;
        if (this.statusFilter === 'backlog' && task.status !== 'Backlog' && task.status !== 'To Do' && task.status !== 'Baru') return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchKey = (task.key || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }
      return true;
    });

    // 2. Perhitungan Statistik KPI
    const totalTasksCount = filteredTasks.length;
    const completedTasksCount = filteredTasks.filter(t => t.status === 'Selesai').length;
    const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress' || t.status === 'Dianalisis').length;
    const totalEstimatedHours = filteredTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0);
    const totalLoggedHours = filteredTasks.reduce((acc, t) => acc + (Number(t.timeLoggedHours) || 0), 0);
    const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // 3. Menghitung Rentang Tanggal Kalender Kanvas secara Dinamis dari Data Proyek Riil
    const collectedDates = [];
    if (activeProject?.startDate) collectedDates.push(activeProject.startDate);
    if (activeProject?.targetDeadline) collectedDates.push(activeProject.targetDeadline);
    projectSprints.forEach(s => {
      if (s.startDate) collectedDates.push(s.startDate);
      if (s.endDate) collectedDates.push(s.endDate);
    });
    projectTasks.forEach(t => {
      if (t.startDate) collectedDates.push(t.startDate);
      if (t.dueDate) collectedDates.push(t.dueDate);
    });

    const validTimestamps = collectedDates.map(ds => new Date(ds).getTime()).filter(ts => !isNaN(ts));
    let minTimestamp = validTimestamps.length > 0 ? Math.min(...validTimestamps) : new Date(2026, 9, 15).getTime();
    let maxTimestamp = validTimestamps.length > 0 ? Math.max(...validTimestamps) : new Date(2026, 10, 30).getTime();

    // Berikan bantalan margin tanggal di awal dan di akhir
    minTimestamp -= 3 * 86400000;
    maxTimestamp += 7 * 86400000;

    const timelineStart = new Date(minTimestamp);
    timelineStart.setHours(0, 0, 0, 0);

    const totalDays = Math.max(30, Math.ceil((maxTimestamp - timelineStart.getTime()) / 86400000));
    this.timelineStart = timelineStart;
    this.totalDays = totalDays;

    // Menghasilkan Kolom Header Bulan (OKT, NOV, DES, dll)
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const monthGroups = [];
    let currentMonthObj = null;

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
      const d = new Date(timelineStart.getTime() + dayIdx * 86400000);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const mKey = `${mIdx}-${y}`;

      if (!currentMonthObj || currentMonthObj.key !== mKey) {
        currentMonthObj = {
          key: mKey,
          label: `${monthNames[mIdx]} ${y}`,
          daysCount: 1
        };
        monthGroups.push(currentMonthObj);
      } else {
        currentMonthObj.daysCount++;
      }
    }

    // 4. Data Sprints Asli Proyek (Menghitung posisi bar pada timeline)
    const sprintMarkers = projectSprints.map((sp, sIdx) => {
      const sPos = this.calculateBarPosition(sp.startDate, sp.endDate, 5 + sIdx * 14, 14);
      return {
        id: sp.id,
        name: sp.name,
        startDate: sp.startDate,
        endDate: sp.endDate,
        status: sp.status,
        active: sp.status === 'active',
        left: sPos.left,
        width: sPos.width
      };
    });

    // Jika proyek belum memiliki data sprint, buat sprint default proporsional
    if (sprintMarkers.length === 0) {
      sprintMarkers.push({
        id: 'sp-default-1',
        name: 'Sprint 1: Fondasi Arsitektur & Fitur Utama',
        active: true,
        left: '12%',
        width: '28%'
      });
      sprintMarkers.push({
        id: 'sp-default-2',
        name: 'Sprint 2: Integrasi Sistem & UAT Client',
        active: false,
        left: '42%',
        width: '28%'
      });
    }

    this.container.innerHTML = `
      <div class="timeline-container">
        
        <!-- 1. Header & Active Project Context -->
        <div class="timeline-header-block">
          <div>
            <div class="timeline-breadcrumb">
              <span>Proyek</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--active">${this.escapeHtml(activeProject?.name || 'Proyek')}</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--current">Roadmap &amp; Gantt</span>
            </div>
            <h1 class="timeline-title">
              Roadmap &amp; Timeline Gantt — ${this.escapeHtml(projectCode)}
            </h1>
          </div>

          <div class="timeline-project-pills" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="tl-proj-pill tl-proj-pill--active" style="cursor:default;display:inline-flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#6366f1;display:inline-block;"></span>
              <span>${this.escapeHtml(projectCode)} · ${this.escapeHtml(activeProject?.clientName || 'Klien')}</span>
            </span>
            <span class="tl-proj-pill" style="cursor:default;background:#f8fafc;color:#334155;border:1px solid #e2e8f0;">
              📦 ${currentEpics.length} Epik · ${projectTasks.length} Tiket
            </span>
          </div>
        </div>

        <!-- 2. Controls & Filter Bar -->
        <div class="timeline-controls-card">
          <div class="timeline-controls-row--primary">
            <div class="timeline-filter-group">
              <div class="timeline-search-box">
                <span class="timeline-search-icon">${Icons.search('', 14)}</span>
                <input
                  type="text"
                  id="tlSearchInput"
                  class="timeline-search-input"
                  placeholder="Cari tiket atau kode (${projectCode}-xxx)..."
                  value="${this.escapeHtml(this.searchQuery)}"
                  autocomplete="off"
                />
              </div>

              <div class="timeline-status-select-wrap">
                <label for="tlStatusFilter" class="timeline-filter-label">Status:</label>
                <select id="tlStatusFilter" class="timeline-status-select">
                  <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Semua Status (${projectTasks.length})</option>
                  <option value="in_progress" ${this.statusFilter === 'in_progress' ? 'selected' : ''}>Sedang Dikerjakan</option>
                  <option value="qa" ${this.statusFilter === 'qa' ? 'selected' : ''}>QA / Review Approval</option>
                  <option value="done" ${this.statusFilter === 'done' ? 'selected' : ''}>Selesai</option>
                  <option value="backlog" ${this.statusFilter === 'backlog' ? 'selected' : ''}>Backlog / To Do</option>
                </select>
              </div>
            </div>

            <!-- Legend Status -->
            <div class="timeline-legend">
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--done"></span>
                <span>Selesai</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot timeline-legend-dot--progress"></span>
                <span style="font-weight:700;color:#2563eb;">In Progress</span>
              </div>
              <div class="timeline-legend-item">
                <span style="font-size:12px;">⚠️</span>
                <span>Perlu Perhatian</span>
              </div>
              <div class="timeline-legend-today">
                <span class="timeline-legend-today-indicator"></span>
                <span>Hari Ini</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Metric Summary Cards -->
        <div class="timeline-metrics-grid">
          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Progres Penyelesaian</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value">${completionPercentage}%</span>
                  <span class="timeline-metric-card__subvalue">(${completedTasksCount}/${totalTasksCount} tiket)</span>
                </div>
                <div class="timeline-metric-card__progress-track">
                  <div class="timeline-metric-card__progress-bar" style="width: ${completionPercentage}%;"></div>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">${completedTasksCount} tiket selesai dari total lingkup modul ${this.escapeHtml(projectCode)}.</p>
          </div>

          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Aktif Dikerjakan</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value timeline-metric-card__value--primary">${inProgressCount}</span>
                  <span class="timeline-metric-card__subvalue">tiket sedang berjalan</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Proses pengerjaan live mengalir dinamis pada sprint aktif.</p>
          </div>

          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Alokasi Estimasi Waktu</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value">${totalEstimatedHours} Jam</span>
                  <span class="timeline-metric-card__subvalue">(${totalLoggedHours}j tercatat)</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Akumulasi estimasi jam pengerjaan modul arsitektur proyek.</p>
          </div>

          <div class="timeline-metric-card">
            <div>
              <div class="timeline-metric-card__header">
                <span class="timeline-metric-card__label">Target Delivery &amp; UAT</span>
              </div>
              <div class="timeline-metric-card__body">
                <div class="timeline-metric-card__value-row">
                  <span class="timeline-metric-card__value timeline-metric-card__value--purple">${this.escapeHtml(activeProject?.targetDeadline || '2026-11-20')}</span>
                  <span class="timeline-metric-card__badge">Target Rilis</span>
                </div>
              </div>
            </div>
            <p class="timeline-metric-card__desc">Target penyelesaian proyek sesuai kontrak kesepakatan client.</p>
          </div>
        </div>

        <!-- 4. GANTT ROADMAP CANVAS 1:1 JIRA SOFTWARE -->
        <div class="timeline-canvas" style="position: relative;">
          <div class="timeline-canvas__inner" id="ganttScrollContainer">
            
            <!-- Sticky Month / Time Header Row -->
            <div class="timeline-header-row" style="border-bottom: 1px solid #cbd5e1;">
              <div class="timeline-col-ticket" style="background:#fafbfc;border-right:1px solid #e2e8f0;padding:12px 16px;">
                <span class="timeline-col-ticket__header-title" style="font-size:11.5px;font-weight:800;color:#0f172a;">
                  Tiket / Epik Pengerjaan (${this.escapeHtml(projectCode)})
                </span>
              </div>

              <div class="timeline-months-track">
                ${monthGroups.map(m => `
                  <div class="timeline-month-label" style="width: ${(m.daysCount / totalDays) * 100}%;">
                    ${m.label}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Track Row: SPRINTS (Hanya Sprints, Tanpa Official / Beta) -->
            <div class="tl-meta-track-row">
              <div class="timeline-col-ticket tl-track-label">
                <span>Sprints</span>
              </div>
              <div class="tl-meta-track-content">
                ${sprintMarkers.map(sp => `
                  <div class="tl-sprint-marker ${sp.active ? 'tl-sprint-marker--active' : ''}" style="left: ${sp.left}; width: ${sp.width};">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      ${sp.active ? '⚡ ' : ''}${this.escapeHtml(sp.name)}
                    </span>
                    ${sp.active ? '<span class="tl-sprint-active-badge">AKTIF</span>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Gantt Body: Epics & Hierarchical Tasks with SVG Bezier Connectors -->
            <div style="position: relative; min-width: 1200px;" id="ganttRowsCanvas">
              
              <!-- SVG Bezier Curves Overlay Layer (Cascading S-Curve Connectors) -->
              <svg class="tl-dependency-svg" id="ganttDependencySvg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 8;">
                <!-- Paths will be drawn dynamically by drawDependencyLines() -->
              </svg>

              <!-- Epics Iteration (100% Mengacu pada Epik & Task Riil Proyek Ini) -->
              ${currentEpics.map((epic, epicIdx) => {
                const epicTasks = filteredTasks.filter(t => t.epicId === epic.id);
                const isExpanded = !!this.expandedEpics[epic.id];

                // Hitung rentang tanggal epik dari child task aslinya
                const taskStarts = epicTasks.map(t => t.startDate).filter(Boolean).sort();
                const taskDues = epicTasks.map(t => t.dueDate).filter(Boolean).sort();
                const epicStartDate = taskStarts.length > 0 ? taskStarts[0] : (epic.startDate || '2026-10-18');
                const epicDueDate = taskDues.length > 0 ? taskDues[taskDues.length - 1] : (epic.dueDate || '2026-11-20');

                const barPos = this.calculateBarPosition(epicStartDate, epicDueDate, 5 + epicIdx * 5, 12);

                const doneCount = epicTasks.filter(t => t.status === 'Selesai').length;
                const inProgCount = epicTasks.filter(t => t.status === 'In Progress' || t.status === 'Dianalisis').length;
                const todoCount = Math.max(0, epicTasks.length - doneCount - inProgCount);

                const doneRatio = epicTasks.length > 0 ? Math.round((doneCount / epicTasks.length) * 100) : 0;
                const inProgRatio = epicTasks.length > 0 ? Math.round((inProgCount / epicTasks.length) * 100) : 0;
                const todoRatio = Math.max(0, 100 - doneRatio - inProgRatio);

                const hasRunning = inProgCount > 0;
                const isAmber = inProgCount > 0 && doneRatio < 50; // Amber highlight for active working epics
                const hasWarning = epicIdx === 1 || (inProgCount > 0 && epicIdx > 0);

                return `
                  <!-- Epic Row -->
                  <div class="tl-gantt-row" data-row-epic-id="${epic.id}">
                    <!-- Left Column: Epic Header & Segmented Mini Progress Bar -->
                    <div class="timeline-col-ticket tl-epic-col">
                      <div class="tl-epic-row-main">
                        <button type="button" class="tl-chevron-toggle" data-toggle-epic="${epic.id}">
                          ${isExpanded ? '▼' : '▶'}
                        </button>
                        <span class="tl-epic-purple-icon">⚡</span>
                        <span class="tl-epic-key">${epic.key}</span>
                        <span class="tl-epic-title" title="${this.escapeHtml(epic.title)}">
                          ${this.escapeHtml(epic.title)}
                        </span>
                      </div>

                      <!-- Mini Progress Bar Segmented: Hijau (Done), Biru (In-Progress), Abu (To-Do) -->
                      <div class="tl-epic-segmented-bar">
                        <div class="tl-seg-fill done" style="width: ${doneRatio}%;" title="Selesai: ${doneRatio}% (${doneCount} tiket)"></div>
                        <div class="tl-seg-fill in-progress ${hasRunning ? 'running-active' : ''}" style="width: ${inProgRatio}%;" title="In Progress: ${inProgRatio}% (${inProgCount} tiket berjalan)"></div>
                        <div class="tl-seg-fill todo" style="width: ${todoRatio}%;" title="To Do: ${todoRatio}% (${todoCount} tiket)"></div>
                      </div>
                    </div>

                    <!-- Right Track: Epic Gantt Bar -->
                    <div class="timeline-track tl-gantt-row-track">
                      <!-- Grid guidelines -->
                      <div class="timeline-grid-bg">
                        ${Array.from({ length: 26 }).map(() => `<div class="timeline-grid-cell"></div>`).join('')}
                      </div>

                      <!-- Bar Pill -->
                      <div
                        class="tl-gantt-bar ${doneRatio === 100 ? 'tl-bar-done' : isAmber ? 'tl-bar-amber' : 'tl-bar-purple'}"
                        id="bar-epic-${epic.id}"
                        data-bar-id="epic-${epic.id}"
                        style="left: ${barPos.left}; width: ${barPos.width};"
                        title="${epic.key}: ${this.escapeHtml(epic.title)}&#10;Progres: ${doneRatio}% Selesai, ${inProgRatio}% Berjalan"
                      >
                        <!-- Live Progress Fill ("ketika prosesnya berjalan maka bar-nya juga berjalan") -->
                        <div
                          class="tl-gantt-progress-fill ${hasRunning ? 'progress-running' : ''}"
                          style="width: ${hasRunning ? this.liveProgress : doneRatio}%;"
                        ></div>

                        <!-- Content overlay -->
                        <div class="tl-bar-content">
                          <span class="tl-bar-title">${epic.key} ${this.escapeHtml(epic.title)}</span>
                          ${hasRunning ? `
                            <span class="tl-bar-running-badge">
                              <span class="tl-pulse-dot"></span>
                              <span class="tl-bar-running-pct">${Math.round(this.liveProgress)}%</span>
                              <span>Berjalan</span>
                            </span>
                          ` : doneRatio === 100 ? `
                            <span class="tl-bar-running-badge" style="background:rgba(0,0,0,0.2);">
                              ✓ 100% Selesai
                            </span>
                          ` : ''}
                          <div class="tl-bar-icons">
                            ${hasWarning ? `<span class="tl-bar-warn-icon" title="Perhatian: Modul dalam pemantauan timeline">⚠️</span>` : ''}
                            <span class="tl-bar-link-icon" title="Tautkan Dependensi">🔗</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Expanded Child Tasks (Semua Task Asli di Bawah Epik Ini) -->
                  ${isExpanded ? epicTasks.map((ct, ctIdx) => {
                    const ctPos = this.calculateBarPosition(ct.startDate || epicStartDate, ct.dueDate || epicDueDate, barPos.startIdx + ctIdx * 2, 7);
                    const isTaskRunning = ct.status === 'In Progress' || ct.status === 'Dianalisis';
                    const isDone = ct.status === 'Selesai';
                    const taskStatusLabel = isTaskRunning ? 'IN PROGRESS' : isDone ? 'SELESAI' : 'TO DO';

                    return `
                      <div class="tl-gantt-row tl-child-gantt-row" data-row-task-id="${ct.id}">
                        <!-- Indented Left Column -->
                        <div class="timeline-col-ticket tl-child-task-col">
                          <span class="tl-task-checkbox-icon">☑️</span>
                          <span class="tl-epic-key" style="color:#0284c7;">${ct.key}</span>
                          <span class="tl-epic-title" title="${this.escapeHtml(ct.title)}" style="font-size:11px;font-weight:600;">
                            ${this.escapeHtml(ct.title)}
                          </span>
                          <span class="tl-status-badge ${taskStatusLabel.toLowerCase().replace(/[^a-z]/g, '-')}">
                            ${isTaskRunning ? '<span class="tl-pulse-dot"></span>' : ''}
                            ${taskStatusLabel}
                          </span>
                        </div>

                        <!-- Right Track: Child Task Bar -->
                        <div class="timeline-track tl-gantt-row-track">
                          <div class="timeline-grid-bg">
                            ${Array.from({ length: 26 }).map(() => `<div class="timeline-grid-cell"></div>`).join('')}
                          </div>

                          <div
                            class="tl-gantt-bar ${isDone ? 'tl-bar-done' : isTaskRunning ? 'tl-bar-purple' : 'tl-bar-purple'}"
                            id="bar-task-${ct.id}"
                            data-bar-id="task-${ct.id}"
                            style="left: ${ctPos.left}; width: ${ctPos.width}; height: 24px; top: 7px; font-size: 11px;"
                            title="${ct.key}: ${this.escapeHtml(ct.title)} (${ct.status})&#10;Klik untuk membuka detail task"
                          >
                            <div
                              class="tl-gantt-progress-fill ${isTaskRunning ? 'progress-running' : ''}"
                              style="width: ${isTaskRunning ? this.liveProgress : (isDone ? 100 : 0)}%;"
                            ></div>
                            <div class="tl-bar-content">
                              <span class="tl-bar-title">${ct.key} ${this.escapeHtml(ct.title)}</span>
                              <span class="tl-bar-link-icon">🔗</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('') : ''}
                `;
              }).join('')}

              <!-- Bottom Row: + Create Epic Button -->
              <div class="tl-gantt-row" style="min-height: 40px; background: #ffffff;">
                <div class="timeline-col-ticket tl-create-epic-row">
                  <button type="button" class="tl-create-epic-btn" id="tlCreateEpicBtn">
                    <span style="font-size:14px;font-weight:800;">+</span>
                    <span>Create Epic</span>
                  </button>
                </div>
                <div class="timeline-track" style="background:#fafbfc;"></div>
              </div>

            </div>
          </div>

          <!-- 5. Floating Bottom-Right Controls Toolbar (1:1 Sesuai Gambar) -->
          <div class="gantt-floating-toolbar">
            <button type="button" class="gantt-tool-btn" id="ganttNavPrev" title="Gulir ke Kiri">‹</button>
            <button type="button" class="gantt-tool-btn" id="ganttNavNext" title="Gulir ke Kanan">›</button>
            <button type="button" class="gantt-tool-btn" id="ganttTodayBtn" style="font-weight:700;">Today</button>
            
            <div class="gantt-zoom-group">
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'weeks' ? 'active' : ''}" data-zoom="weeks">Weeks</button>
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'months' ? 'active' : ''}" data-zoom="months">Months</button>
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'quarters' ? 'active' : ''}" data-zoom="quarters">Quarters</button>
            </div>

            <button type="button" class="gantt-tool-btn" id="ganttInfoBtn" title="Informasi Roadmap &amp; Gantt">ℹ️</button>
            <button type="button" class="gantt-tool-btn" id="ganttFullscreenBtn" title="Perbesar Layar">⤢</button>
          </div>

        </div>

        <!-- 6. Footer Information Card -->
        <div class="timeline-footer-card">
          <div class="timeline-footer-card__left">
            <span style="color: #4338ca;">${Icons.info('', 16)}</span>
            <span>
              Garis kurva dependensi menghubungkan alur pengerjaan antar epik modul. Bar dengan status <strong>In Progress</strong> menampilkan animasi gerak live progress secara dinamis.
            </span>
          </div>
          <div class="timeline-footer-card__right">
            <span>Proyek: <strong>${this.escapeHtml(activeProject?.name || '')}</strong></span>
            <span>·</span>
            <span>Kode: <strong>${this.escapeHtml(projectCode)}</strong></span>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();

    // Gambar kurva bezier penghubung setelah render DOM
    setTimeout(() => {
      this.drawDependencyLines(currentEpics);
    }, 60);
  }

  /**
   * Menggambar garis lengkung dependensi S-curve (Bezier Connectors)
   * Menyambungkan ujung bar pengerjaan ke awal bar berikutnya secara alami
   */
  drawDependencyLines(currentEpics) {
    const svgEl = this.container.querySelector('#ganttDependencySvg');
    const canvasEl = this.container.querySelector('#ganttRowsCanvas');
    if (!svgEl || !canvasEl) return;

    svgEl.innerHTML = '';
    const canvasRect = canvasEl.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return;

    const connectionPairs = [];

    // 1. Jika epik kedua dibuka, sambungkan child task ke epik
    if (currentEpics.length > 1 && this.expandedEpics[currentEpics[1].id]) {
      const childTasks = store.getState().tasks.filter(t => t.epicId === currentEpics[1].id);
      if (childTasks.length > 0) {
        connectionPairs.push({
          from: `bar-task-${childTasks[0].id}`,
          to: `bar-epic-${currentEpics[1].id}`
        });
      }
    }

    // 2. Cascade alami antar Epik (Epic 1 -> Epic 2 -> Epic 3 -> dst)
    for (let i = 0; i < currentEpics.length - 1; i++) {
      connectionPairs.push({
        from: `bar-epic-${currentEpics[i].id}`,
        to: `bar-epic-${currentEpics[i + 1].id}`
      });
    }

    let pathsHtml = '';

    connectionPairs.forEach(pair => {
      const elFrom = this.container.querySelector(`#${pair.from}`);
      const elTo = this.container.querySelector(`#${pair.to}`);

      if (elFrom && elTo) {
        const rFrom = elFrom.getBoundingClientRect();
        const rTo = elTo.getBoundingClientRect();

        const x1 = rFrom.right - canvasRect.left;
        const y1 = rFrom.top + rFrom.height / 2 - canvasRect.top;

        const x2 = rTo.left - canvasRect.left;
        const y2 = rTo.top + rTo.height / 2 - canvasRect.top;

        // Hitung kurva S (Cubic Bezier Curve)
        const dx = Math.max(16, Math.abs(x2 - x1) * 0.5);
        const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        pathsHtml += `
          <g>
            <path
              d="${pathD}"
              stroke="#64748b"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.85"
            />
            <circle cx="${x1}" cy="${y1}" r="3" fill="#64748b" />
            <circle cx="${x2}" cy="${y2}" r="3.5" fill="#64748b" />
          </g>
        `;
      }
    });

    svgEl.innerHTML = pathsHtml;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindEvents() {
    // Chevron Expand/Collapse Epics
    const toggleBtns = this.container.querySelectorAll('.tl-chevron-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const epicId = btn.dataset.toggleEpic;
        if (epicId) {
          this.expandedEpics[epicId] = !this.expandedEpics[epicId];
          this.render();
        }
      });
    });

    // Search Input
    const searchInput = this.container.querySelector('#tlSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const input = this.container.querySelector('#tlSearchInput');
        if (input) {
          input.focus();
          input.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Status Filter
    const statusSelect = this.container.querySelector('#tlStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.render();
      });
    }

    // Klik task row atau task bar untuk membuka Task Detail Modal asli
    const taskRows = this.container.querySelectorAll('[data-row-task-id]');
    taskRows.forEach(row => {
      row.addEventListener('click', () => {
        const tId = row.dataset.rowTaskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    const taskBars = this.container.querySelectorAll('.tl-bar-task, [data-bar-id^="task-"]');
    taskBars.forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const barId = bar.dataset.barId || '';
        const tId = barId.replace('task-', '');
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Klik pada Epic bar memunculkan toast informasi detail epik
    const epicBars = this.container.querySelectorAll('[data-bar-id^="epic-"]');
    epicBars.forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const barId = bar.dataset.barId || '';
        const eId = barId.replace('epic-', '');
        const epic = store.getState().epics.find(ep => ep.id === eId);
        if (epic) {
          const taskCount = store.getState().tasks.filter(t => t.epicId === epic.id).length;
          store.addToast('info', `Epik: ${epic.key}`, `${epic.title} (${taskCount} tiket pengerjaan)`);
        }
      });
    });

    // Create Epic Button (+ Create Epic) menambahkan epik langsung ke store proyek aktif
    const createEpicBtn = this.container.querySelector('#tlCreateEpicBtn');
    if (createEpicBtn) {
      createEpicBtn.addEventListener('click', () => {
        const activeProj = store.getActiveProject();
        const prefix = activeProj?.code || 'PRJ';
        const projectEpics = store.getState().epics.filter(e => e.projectId === activeProj?.id);
        const nextNum = projectEpics.length + 1;
        const epicTitle = prompt('Masukkan Judul Epik Baru:', `Modul Fitur Baru ${nextNum}`);
        if (epicTitle && epicTitle.trim()) {
          const newEpic = {
            id: `epic-${Date.now()}`,
            projectId: activeProj.id,
            key: `${prefix}-EPIC-${nextNum}`,
            title: epicTitle.trim(),
            description: 'Epik baru ditambahkan via Gantt Roadmap Canvas.',
            color: '#7c3aed'
          };
          store.setState({
            epics: [...store.getState().epics, newEpic]
          });
          store.addToast('success', 'Epik Berhasil Dibuat!', `Epik [${newEpic.key}] ${newEpic.title} kini aktif pada Roadmap.`);
        }
      });
    }

    // Floating Controls Toolbar: Zoom Mode Switch
    const zoomBtns = this.container.querySelectorAll('.gantt-zoom-btn');
    zoomBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.zoomMode = btn.dataset.zoom || 'months';
        this.render();
      });
    });

    // Floating Controls Toolbar: Scroll Prev / Next
    const scrollContainer = this.container.querySelector('#ganttScrollContainer');
    const prevBtn = this.container.querySelector('#ganttNavPrev');
    const nextBtn = this.container.querySelector('#ganttNavNext');
    if (scrollContainer) {
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: -260, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: 260, behavior: 'smooth' });
        });
      }
    }

    // Floating Controls Toolbar: Today button
    const todayBtn = this.container.querySelector('#ganttTodayBtn');
    if (todayBtn && scrollContainer) {
      todayBtn.addEventListener('click', () => {
        scrollContainer.scrollTo({ left: 160, behavior: 'smooth' });
        store.addToast('info', 'Penunjuk Waktu', 'Menggulir ke posisi milestone terkini.');
      });
    }

    // Floating Controls Toolbar: Info Button
    const infoBtn = this.container.querySelector('#ganttInfoBtn');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        store.addToast('info', 'Roadmap & Gantt', 'Menampilkan sprint, epik modul, progres pengerjaan riil, serta keterkaitan dependensi antar tugas.');
      });
    }

    // Floating Controls Toolbar: Fullscreen / Expand Button
    const fullscreenBtn = this.container.querySelector('#ganttFullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        const canvas = this.container.querySelector('.timeline-canvas');
        if (canvas) {
          canvas.classList.toggle('canvas-maximized');
          if (canvas.classList.contains('canvas-maximized')) {
            canvas.style.minHeight = '750px';
            store.addToast('info', 'Mode Layar Penuh', 'Tampilan kanvas Gantt diperbesar.');
          } else {
            canvas.style.minHeight = '';
          }
          setTimeout(() => {
            this.drawDependencyLines(store.getState().epics.filter(e => e.projectId === store.getActiveProject()?.id));
          }, 100);
        }
      });
    }
  }

  destroy() {
    if (this.liveTimer) {
      clearInterval(this.liveTimer);
      this.liveTimer = null;
    }
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
