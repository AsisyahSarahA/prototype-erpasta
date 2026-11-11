/**
 * HrTeamView.js
 * Manajemen Tim HR & Distribusi Workload Engineering (Astacode ERP)
 * Mematuhi prinsip antislop: layout proporsional, bebas teks bertumpuk, informatif & berbobot tinggi.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class HrTeamView {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'hr-view-wrapper';

    this.searchQuery = '';
    this.roleFilter = 'all';

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe(() => {
      if (store.getState().activeTab === 'team') {
        this.render();
      }
    });
  }

  getElement() {
    return this.element;
  }

  getRoleBadge(role = '') {
    const r = role.toLowerCase();
    if (r.includes('backend')) {
      return { label: 'Backend Dev', tagClass: 'hr-tag-backend' };
    }
    if (r.includes('frontend')) {
      return { label: 'Frontend Dev', tagClass: 'hr-tag-frontend' };
    }
    if (r.includes('qa') || r.includes('test')) {
      return { label: 'QA Engineer', tagClass: 'hr-tag-qa' };
    }
    if (r.includes('manajer') || r.includes('manager') || r.includes('pm')) {
      return { label: 'Project Manajer', tagClass: 'hr-tag-pm' };
    }
    return { label: 'Fullstack Dev', tagClass: 'hr-tag-fullstack' };
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const { teamMembers, tasks, epics } = state;

    // Filter members based on search and role
    const filteredMembers = teamMembers.filter((m) => {
      if (this.roleFilter !== 'all') {
        const roleLower = m.role.toLowerCase();
        const filterLower = this.roleFilter.toLowerCase();
        if (!roleLower.includes(filterLower)) return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchRole = m.role.toLowerCase().includes(q);
        const matchSkill = (m.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchRole && !matchSkill) return false;
      }
      return true;
    });

    // Global workload metrics calculation
    const totalCapacity = teamMembers.reduce((acc, m) => acc + (m.capacityHoursPerWeek || 40), 0);
    const activeTasks = tasks.filter((t) => t.status !== 'Selesai' && t.status !== 'Deploy Production');
    const totalAssignedHours = activeTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 4), 0);
    const avgUtilization = totalCapacity > 0 ? Math.round((totalAssignedHours / totalCapacity) * 100) : 0;
    const availableCount = teamMembers.filter((m) => !m.onLeave).length;
    const leaveCount = teamMembers.length - availableCount;

    // Roles count for filter chips
    const roleCounts = {
      all: teamMembers.length,
      pm: teamMembers.filter((m) => m.role.toLowerCase().includes('manajer') || m.role.toLowerCase().includes('pm')).length,
      backend: teamMembers.filter((m) => m.role.toLowerCase().includes('backend')).length,
      frontend: teamMembers.filter((m) => m.role.toLowerCase().includes('frontend')).length,
      fullstack: teamMembers.filter((m) => m.role.toLowerCase().includes('full stack') || m.role.toLowerCase().includes('fullstack')).length,
      qa: teamMembers.filter((m) => m.role.toLowerCase().includes('qa') || m.role.toLowerCase().includes('test')).length,
    };

    this.element.innerHTML = `
      <div class="hr-root-container">
        
        <!-- 1. Header Ringkas & Berbobot: Konteks Proyek & Aksi Cepat -->
        <header class="hr-header-panel">
          <div class="hr-header-main">
            <div class="hr-header-copy">
              <h1 class="hr-heading">Tim &amp; Workload Engineering</h1>
              <p class="hr-subheading">
                Distribusi kapasitas dan alokasi sprint untuk proyek
                <strong>${this.escapeHtml(activeProject?.name || 'Sistem Booking & Manajemen')}</strong>.
              </p>
            </div>

            <div class="hr-header-actions">
              <button id="hrManageAccessBtn" class="btn btn-secondary btn-sm hr-action-btn">
                ${Icons.folderGit('', 14)}
                <span>Akses GitHub</span>
              </button>
              <button id="hrViewBacklogBtn" class="btn btn-primary btn-sm hr-action-btn">
                ${Icons.layers('', 14)}
                <span>Alokasi Backlog</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Strip: Rapi, proporsional, bebas teks bertumpuk -->
          <div class="hr-kpi-strip">
            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Total Engineer</span>
              <div class="hr-kpi-value-row">
                <span class="hr-kpi-num">${teamMembers.length}</span>
                <span class="hr-kpi-unit">Orang</span>
              </div>
              <span class="hr-kpi-subtext">${availableCount} aktif${leaveCount > 0 ? ` · ${leaveCount} cuti` : ''}</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Kapasitas Mingguan</span>
              <div class="hr-kpi-value-row">
                <span class="hr-kpi-num">${totalCapacity}</span>
                <span class="hr-kpi-unit">Jam</span>
              </div>
              <span class="hr-kpi-subtext">Standar 40 jam per engineer</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Beban Sprint Berjalan</span>
              <div class="hr-kpi-value-row">
                <span class="hr-kpi-num hr-num-assigned">${totalAssignedHours}</span>
                <span class="hr-kpi-unit">Jam</span>
              </div>
              <span class="hr-kpi-subtext">${activeTasks.length} tiket sprint aktif</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Utilisasi Tim</span>
              <div class="hr-kpi-value-row">
                <span class="hr-kpi-num ${avgUtilization > 90 ? 'hr-num-alert' : 'hr-num-good'}">${avgUtilization}%</span>
              </div>
              <span class="hr-kpi-subtext">${avgUtilization > 90 ? 'Perlu redistribusi beban' : 'Kapasitas kerja optimal'}</span>
            </div>
          </div>
        </header>

        <!-- 2. Toolbar Navigasi: Pencarian & Segmented Filter Role -->
        <section class="hr-toolbar-panel">
          <div class="hr-toolbar-left">
            <div class="hr-search-box">
              <span class="hr-search-icon">${Icons.search('', 14)}</span>
              <input
                type="text"
                id="hrSearchInput"
                class="hr-search-input"
                placeholder="Cari nama, role, atau keahlian..."
                value="${this.escapeHtml(this.searchQuery)}"
                aria-label="Cari engineer"
              />
              ${this.searchQuery ? `
                <button id="hrClearSearchBtn" class="hr-search-clear" title="Bersihkan pencarian">
                  ${Icons.x('', 12)}
                </button>
              ` : ''}
            </div>

            <div class="hr-role-filters" role="tablist">
              <button class="hr-filter-tab ${this.roleFilter === 'all' ? 'active' : ''}" data-role="all">
                <span>Semua</span>
                <span class="hr-tab-badge">${roleCounts.all}</span>
              </button>
              <button class="hr-filter-tab ${this.roleFilter === 'pm' ? 'active' : ''}" data-role="pm">
                <span>PM</span>
                <span class="hr-tab-badge">${roleCounts.pm}</span>
              </button>
              <button class="hr-filter-tab ${this.roleFilter === 'backend' ? 'active' : ''}" data-role="backend">
                <span>Backend</span>
                <span class="hr-tab-badge">${roleCounts.backend}</span>
              </button>
              <button class="hr-filter-tab ${this.roleFilter === 'frontend' ? 'active' : ''}" data-role="frontend">
                <span>Frontend</span>
                <span class="hr-tab-badge">${roleCounts.frontend}</span>
              </button>
              <button class="hr-filter-tab ${this.roleFilter === 'fullstack' ? 'active' : ''}" data-role="fullstack">
                <span>Fullstack</span>
                <span class="hr-tab-badge">${roleCounts.fullstack}</span>
              </button>
              <button class="hr-filter-tab ${this.roleFilter === 'qa' ? 'active' : ''}" data-role="qa">
                <span>QA</span>
                <span class="hr-tab-badge">${roleCounts.qa}</span>
              </button>
            </div>
          </div>

          <div class="hr-toolbar-right">
            <span class="hr-count-text">Menampilkan <strong>${filteredMembers.length}</strong> dari <strong>${teamMembers.length}</strong> engineer</span>
          </div>
        </section>

        <!-- 3. Grid Kartu Personil Tim: Proporsional, Lapang, Bebas Teks Bertumpuk -->
        <main class="hr-cards-grid">
          ${filteredMembers.length === 0 ? `
            <div class="hr-empty-container">
              <div class="hr-empty-icon">${Icons.users('', 32)}</div>
              <h3 class="hr-empty-title">Tidak Ditemukan Anggota Tim</h3>
              <p class="hr-empty-desc">
                Tidak ada engineer yang cocok dengan filter pencarian <em>"${this.escapeHtml(this.searchQuery)}"</em>.
              </p>
              <button id="hrResetFilterBtn" class="btn btn-secondary btn-sm hr-reset-btn">
                ${Icons.refresh('', 13)}
                <span>Reset Pencarian &amp; Filter</span>
              </button>
            </div>
          ` : filteredMembers.map(member => {
            // Active tasks for this member
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== 'Selesai' && t.status !== 'Deploy Production');
            // Task estimates are project planning data; HR capacity uses the approved HR/PM allocation.
            const memberHours = Number(member.assignedHours) || 0;
            const cap = member.capacityHoursPerWeek || 40;
            const bridge = store.getEmployeeCapacity(member.id) || {};
            const availableHours = Math.max(0, (bridge.capacityHoursPerWeek || cap) - (bridge.leaveHoursThisWeek || 0) - (bridge.approvedHours || 0));
            const isOverloaded = memberHours > cap;
            const loadPercentage = Math.round((memberHours / cap) * 100);
            
            // Active epics
            const distinctEpicIds = Array.from(new Set(memberTasks.map((t) => t.epicId).filter(Boolean)));
            const assignedEpics = epics.filter((e) => distinctEpicIds.includes(e.id));
            const roleBadge = this.getRoleBadge(member.role);

            // Workload status
            let statusLabel = 'Kapasitas Normal';
            let statusBadgeClass = 'badge-normal';
            let barColorClass = 'bar-normal';

            if (isOverloaded) {
              statusLabel = `Overload (+${memberHours - cap}h)`;
              statusBadgeClass = 'badge-overload';
              barColorClass = 'bar-overload';
            } else if (loadPercentage >= 85) {
              statusLabel = 'Mendekati Kapasitas';
              statusBadgeClass = 'badge-warning';
              barColorClass = 'bar-warning';
            }

            return `
              <article class="hr-person-card ${isOverloaded ? 'card-has-overload' : ''}">
                
                <!-- A. Header Kartu: Profil, Role, Status, dan Tombol Kanban -->
                <div class="hr-card-top-row">
                  <div class="hr-profile-area">
                    <img
                      src="${member.avatar}"
                      alt="${this.escapeHtml(member.name)}"
                      class="hr-avatar"
                      loading="lazy"
                    />
                    <div class="hr-profile-info">
                      <div class="hr-name-row">
                        <h2 class="hr-name">${this.escapeHtml(member.name)}</h2>
                        <span class="hr-role-pill ${roleBadge.tagClass}">${roleBadge.label}</span>
                        ${member.onLeave ? `
                          <span class="hr-leave-pill">Cuti</span>
                        ` : `
                          <span class="hr-active-pill">Tersedia</span>
                        `}
                      </div>
                      
                      <div class="hr-contact-row">
                        <span class="hr-contact-email">${this.escapeHtml(member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@agensi.dev`)}</span>
                        <span class="hr-contact-dot">&middot;</span>
                        <span class="hr-employee-id">${this.escapeHtml(member.employeeId || member.id)}</span>
                        ${member.githubUsername ? `
                          <span class="hr-contact-dot">·</span>
                          <span class="hr-github-tag">
                            ${Icons.folderGit('', 12)}
                            <span>@${this.escapeHtml(member.githubUsername)}</span>
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="hr-action-area">
                    <button class="btn btn-secondary btn-sm hr-filter-board-btn" data-member-id="${member.id}" title="Lihat tiket pekerjaan ${this.escapeHtml(member.name)} di Kanban">
                      ${Icons.kanban('', 13)}
                      <span>Buka di Kanban</span>
                    </button>
                  </div>
                </div>

                <!-- B. Gauge Kapasitas & Beban Kerja (Solid Hues, Jelas, Bebas Gradasi Silau) -->
                <div class="hr-workload-box">
                  <div class="hr-workload-header">
                    <span class="hr-workload-label">Utilisasi Sprint</span>
                    <div class="hr-workload-stats">
                      <strong class="hr-stat-hours">${memberHours} Jam</strong>
                      <span class="hr-stat-cap">/ ${cap} Jam (${loadPercentage}%)</span>
                    </div>
                  </div>

                  <div class="hr-progress-container">
                    <div
                      class="hr-progress-fill ${barColorClass}"
                      style="width: ${Math.min(100, loadPercentage)}%;"
                      role="progressbar"
                      aria-valuenow="${loadPercentage}"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>

                  <div class="hr-workload-footer">
                    <span class="hr-status-indicator ${statusBadgeClass}">${statusLabel}</span>
                    <span class="hr-tasks-info">${memberTasks.length} tiket sprint aktif</span>
                  </div>
                  <div class="hr-capacity-summary">
                    <span>Approved PM/HR: <strong>${bridge.approvedHours || 0}h</strong></span>
                    <span>Sisa kapasitas: <strong>${availableHours}h</strong></span>
                  </div>
                </div>

                <!-- C. Modul Epik & Daftar Tiket Berjalan (Tampilan Terbuka, Teks Terbaca Jelas) -->
                <div class="hr-section-block">
                  <div class="hr-section-title">
                    ${Icons.layers('', 12)}
                    <span>Modul Epik Aktif (${assignedEpics.length})</span>
                  </div>
                  
                  <div class="hr-epics-wrapper">
                    ${assignedEpics.length > 0 ? assignedEpics.map(ep => `
                      <div class="hr-epic-chip" title="${this.escapeHtml(ep.title)}">
                        <span class="hr-epic-badge" style="background-color: ${ep.color || '#4f46e5'};"></span>
                        <span class="hr-epic-code">${this.escapeHtml(ep.key)}</span>
                        <span class="hr-epic-name">${this.escapeHtml(ep.title)}</span>
                      </div>
                    `).join('') : `
                      <span class="hr-empty-note">Belum ada modul epik yang ditugaskan</span>
                    `}
                  </div>
                </div>

                <!-- D. Fokus Pekerjaan Sprint Saat Ini -->
                <div class="hr-section-block">
                  <div class="hr-section-title">
                    ${Icons.listTodo('', 12)}
                    <span>Pekerjaan Sprint (${memberTasks.length})</span>
                  </div>

                  <div class="hr-tasks-wrapper">
                    ${memberTasks.length > 0 ? `
                      <div class="hr-task-items">
                        ${memberTasks.slice(0, 2).map(task => `
                          <div class="hr-task-card" title="${this.escapeHtml(task.title)}">
                            <span class="hr-task-code">${this.escapeHtml(task.key)}</span>
                            <span class="hr-task-text">${this.escapeHtml(task.title)}</span>
                            <span class="hr-task-duration">${task.estimateHours || 4}h</span>
                          </div>
                        `).join('')}
                      </div>
                      ${memberTasks.length > 2 ? `
                        <div class="hr-task-more-info">
                          +${memberTasks.length - 2} tiket lainnya sedang berjalan
                        </div>
                      ` : ''}
                    ` : `
                      <span class="hr-empty-note">Tidak ada tiket aktif yang sedang berjalan</span>
                    `}
                  </div>
                </div>

                <!-- E. Keahlian Teknis (Tech Stack) -->
                <div class="hr-section-block hr-skills-section">
                  <div class="hr-section-title">
                    ${Icons.code('', 12)}
                    <span>Keahlian Teknis</span>
                  </div>
                  <div class="hr-skills-list">
                    ${(member.skills || ['Software Engineering']).slice(0, 4).map(skill => `
                      <span class="hr-skill-pill">${this.escapeHtml(skill)}</span>
                    `).join('')}
                    ${(member.skills || []).length > 4 ? `
                      <span class="hr-skill-overflow" title="${(member.skills || []).slice(4).join(', ')}">
                        +${member.skills.length - 4}
                      </span>
                    ` : ''}
                  </div>
                </div>

              </article>
            `;
          }).join('')}
        </main>

      </div>
    `;
  }

  bindEvents() {
    // Search input handling with preserved cursor position
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'hrSearchInput') {
        this.searchQuery = e.target.value;
        this.render();
        const input = this.element.querySelector('#hrSearchInput');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    });

    // Delegated click handling
    this.element.addEventListener('click', (e) => {
      // Clear search button
      if (e.target.closest('#hrClearSearchBtn')) {
        this.searchQuery = '';
        this.render();
        return;
      }

      // Reset filter button on empty state
      if (e.target.closest('#hrResetFilterBtn')) {
        this.searchQuery = '';
        this.roleFilter = 'all';
        this.render();
        return;
      }

      // Role filter tab click
      const filterTab = e.target.closest('.hr-filter-tab');
      if (filterTab) {
        this.roleFilter = filterTab.dataset.role;
        this.render();
        return;
      }

      // Header actions
      if (e.target.closest('#hrManageAccessBtn')) {
        store.setActiveTab('github');
        return;
      }

      if (e.target.closest('#hrViewBacklogBtn')) {
        store.setActiveTab('backlog');
        return;
      }

      // View on Kanban button
      const filterBoardBtn = e.target.closest('.hr-filter-board-btn');
      if (filterBoardBtn) {
        const memberId = filterBoardBtn.dataset.memberId;
        store.setFilterAssignee(memberId);
        store.setActiveTab('kanban');
        return;
      }
    });
  }
}
