/**
 * HrTeamView.js
 * Manajemen Tim HR & Distribusi Workload Resource (Enterprise People View)
 * 100% Native Vanilla JS ES Module, Layout Proporsional Bebas Teks Bertumpuk.
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
      // Re-render only if current tab is team
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
      return { label: 'Backend Dev', bg: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' };
    }
    if (r.includes('frontend')) {
      return { label: 'Frontend Dev', bg: 'rgba(6, 182, 212, 0.1)', color: '#0891b2' };
    }
    if (r.includes('qa') || r.includes('test')) {
      return { label: 'QA Engineer', bg: 'rgba(16, 185, 129, 0.1)', color: '#059669' };
    }
    if (r.includes('manajer') || r.includes('manager') || r.includes('pm')) {
      return { label: 'Project Manajer', bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' };
    }
    return { label: 'Full stack', bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' };
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const { teamMembers, tasks, epics } = state;

    // Filter members
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

    // Global workload stats
    const totalCapacity = teamMembers.reduce((acc, m) => acc + (m.capacityHoursPerWeek || 40), 0);
    const activeTasks = tasks.filter((t) => t.status !== 'Selesai' && t.status !== 'Deploy Production');
    const totalAssignedHours = activeTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 4), 0);
    const avgUtilization = totalCapacity > 0 ? Math.round((totalAssignedHours / totalCapacity) * 100) : 0;
    const availableCount = teamMembers.filter((m) => !m.onLeave).length;

    this.element.innerHTML = `
      <div class="hr-root-container">
        
        <!-- 1. Top Header Banner Card -->
        <section class="hr-top-card">
          <div class="hr-header-main-row">
            <div class="hr-header-left">
              <div class="hr-breadcrumbs">
                <span>Modul Proyek</span>
                <span>/</span>
                <span>${this.escapeHtml(activeProject?.name || 'Sistem Perpustakaan Digital Kampus')}</span>
                <span>/</span>
                <span class="crumb-current">Tim HR &amp; Workload</span>
              </div>
              <div class="hr-title-wrap">
                <h1 class="hr-page-title">Manajemen Tim HR &amp; Distribusi Workload</h1>
                <span class="hr-status-pill">
                  <span style="font-size: 8px;">●</span>
                  <span>Resource Terhubung</span>
                </span>
              </div>
            </div>

            <div class="hr-header-actions">
              <button id="hrManageAccessBtn" class="btn btn-secondary" style="font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: var(--radius-lg);">
                ${Icons.folderGit('', 14)}
                <span>Akses GitHub &amp; Tim</span>
              </button>
              <button id="hrViewBacklogBtn" class="btn btn-primary" style="font-size: 12px; font-weight: 700; padding: 7px 14px; border-radius: var(--radius-lg);">
                ${Icons.layers('', 14)}
                <span>Alokasi Sprint Backlog</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Strip -->
          <div class="hr-kpi-grid">
            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Total Personel Tim</span>
              <span class="hr-kpi-value">${teamMembers.length} Orang</span>
              <span class="hr-kpi-sub">${availableCount} aktif tersedia · ${teamMembers.length - availableCount} cuti</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Kapasitas Mingguan</span>
              <span class="hr-kpi-value">${totalCapacity} Jam</span>
              <span class="hr-kpi-sub">Standar 40 jam kerja/minggu per engineer</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Beban Tugas Berjalan</span>
              <span class="hr-kpi-value" style="color: var(--indigo-600);">${totalAssignedHours} Jam</span>
              <span class="hr-kpi-sub">Tersebar pada ${activeTasks.length} tiket yang sedang dikerjakan</span>
            </div>

            <div class="hr-kpi-card">
              <span class="hr-kpi-label">Rata-Rata Utilisasi</span>
              <span class="hr-kpi-value" style="color: ${avgUtilization > 90 ? 'var(--red-500)' : 'var(--emerald-600)'};">${avgUtilization}%</span>
              <span class="hr-kpi-sub">${avgUtilization > 90 ? 'Perlu redistribusi beban tugas' : 'Distribusi beban kerja proporsional'}</span>
            </div>
          </div>
        </section>

        <!-- 2. Filter & Search Toolbar Card -->
        <section class="hr-filter-card">
          <div class="hr-filter-left">
            <div class="hr-search-wrap">
              <span class="hr-search-icon">${Icons.search('', 14)}</span>
              <input
                type="text"
                id="hrSearchInput"
                class="hr-search-input"
                placeholder="Cari nama engineer, role, atau keahlian..."
                value="${this.escapeHtml(this.searchQuery)}"
              />
            </div>

            <div class="hr-role-chips">
              ${[
                { id: 'all', label: 'Semua Role' },
                { id: 'Project Manajer', label: 'Project Manajer' },
                { id: 'Backend', label: 'Backend Dev' },
                { id: 'Frontend', label: 'Frontend Dev' },
                { id: 'Full stack', label: 'Fullstack Dev' },
                { id: 'QA', label: 'QA Engineer' }
              ].map(r => `
                <button class="hr-chip-btn ${this.roleFilter === r.id ? 'active' : ''}" data-role="${r.id}">
                  ${r.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="hr-filter-right">
            Menampilkan <strong>${filteredMembers.length}</strong> dari <strong>${teamMembers.length}</strong> anggota tim
          </div>
        </section>

        <!-- 3. Members Workload List Container -->
        <section class="hr-members-card-list">
          ${filteredMembers.length === 0 ? `
            <div class="hr-member-card" style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 13px; font-style: italic;">
              Tidak ada anggota tim yang cocok dengan kriteria pencarian "${this.escapeHtml(this.searchQuery)}".
            </div>
          ` : filteredMembers.map(member => {
            const assignedTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== 'Selesai' && t.status !== 'Deploy Production');
            const memberHours = assignedTasks.reduce((acc, curr) => acc + (Number(curr.estimateHours) || 4), 0);
            const cap = member.capacityHoursPerWeek || 40;
            const isOverloaded = memberHours > cap;
            const loadPercentage = Math.round((memberHours / cap) * 100);
            const distinctEpicIds = Array.from(new Set(assignedTasks.map((t) => t.epicId).filter(Boolean)));
            const assignedEpics = epics.filter((e) => distinctEpicIds.includes(e.id));
            const isMultiModule = assignedEpics.length > 1;
            const roleBadge = this.getRoleBadge(member.role);

            return `
              <div class="hr-member-card">
                
                <!-- Baris 1: Profil, Identitas & Lencana Status Rapi (Bebas Tumpuk) -->
                <div class="hr-member-header">
                  <div class="hr-member-profile-left">
                    <img src="${member.avatar}" alt="${this.escapeHtml(member.name)}" class="hr-member-avatar" />
                    <div class="hr-member-identity">
                      <div class="hr-member-name-wrap">
                        <h3 class="hr-member-name">${this.escapeHtml(member.name)}</h3>
                        <span class="issue-role-pill" style="background: ${roleBadge.bg}; color: ${roleBadge.color}; font-size: 10px;">
                          ${roleBadge.label}
                        </span>
                      </div>
                      <div class="hr-member-contact-line">
                        <span>${this.escapeHtml(member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@softwarehouse.id`)}</span>
                        ${member.githubUsername ? `
                          <span>·</span>
                          <span class="hr-github-badge">
                            ${Icons.folderGit('', 11)}
                            <span>@${this.escapeHtml(member.githubUsername)}</span>
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="hr-member-header-badges">
                    ${isMultiModule ? `
                      <span class="badge badge-purple" style="font-size: 10.5px;">
                        ${Icons.layers('', 11)}
                        <span>Multi-Modul (${assignedEpics.length})</span>
                      </span>
                    ` : ''}
                    
                    ${member.onLeave ? `
                      <span class="badge badge-amber" style="font-size: 10.5px;">
                        ● Sedang Cuti
                      </span>
                    ` : `
                      <span class="badge badge-emerald" style="font-size: 10.5px;">
                        ● Aktif Tersedia
                      </span>
                    `}
                  </div>
                </div>

                <!-- Baris 2: Detail 2 Kolom (Kiri: Keahlian & Modul; Kanan: Workload & Progress) -->
                <div class="hr-member-body">
                  
                  <!-- Kolom Kiri: Keahlian & Alokasi Modul Epik -->
                  <div class="hr-member-body-left">
                    
                    <!-- Keahlian -->
                    <div class="hr-skills-block">
                      <span class="hr-skills-label">Keahlian:</span>
                      ${(member.skills || ['Software Engineering', 'Agile Scrum']).map(s => `
                        <span class="hr-skill-tag">${this.escapeHtml(s)}</span>
                      `).join('')}
                    </div>

                    <!-- Modul Epik Aktif -->
                    ${assignedEpics.length > 0 ? `
                      <div class="hr-modules-block">
                        <span class="hr-modules-label">
                          ${Icons.layers('', 12)}
                          <span>Modul Aktif (${assignedEpics.length}):</span>
                        </span>
                        ${assignedEpics.map(ep => `
                          <span class="hr-module-pill" style="border: 1px solid ${ep.color}35; background: ${ep.color}15; color: ${ep.color};" title="Epik: ${this.escapeHtml(ep.title)}">
                            <span class="hr-module-dot" style="background-color: ${ep.color};"></span>
                            <span style="font-weight: 700; font-family: var(--font-mono);">${ep.key}</span>
                            <span style="overflow: hidden; text-overflow: ellipsis; max-width: 140px;">· ${this.escapeHtml(ep.title)}</span>
                          </span>
                        `).join('')}
                      </div>
                    ` : `
                      <div style="font-size: 11px; color: var(--text-muted); font-style: italic;">
                        Belum ada modul epik khusus yang ditugaskan saat ini.
                      </div>
                    `}
                  </div>

                  <!-- Kolom Kanan: Kotak Khusus Workload, Kapasitas & Aksi -->
                  <div class="hr-member-body-right">
                    <div class="hr-workload-stats-row">
                      <span class="hr-workload-title">Beban Kerja Mingguan</span>
                      <span class="hr-workload-numbers" style="color: ${isOverloaded ? 'var(--red-500)' : 'var(--text-primary)'};">
                        ${memberHours}h / ${cap}h (${loadPercentage}%)
                      </span>
                    </div>

                    <div class="hr-progress-track">
                      <div
                        class="hr-progress-bar-fill"
                        style="width: ${Math.min(100, loadPercentage)}%; background: ${isOverloaded ? 'linear-gradient(90deg, #ef4444, #dc2626)' : loadPercentage > 80 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #3b82f6, #10b981)'};"
                      ></div>
                    </div>

                    ${isOverloaded ? `
                      <div class="hr-overload-banner">
                        ${Icons.alertTriangle('', 13)}
                        <span>Overload: Melebihi kapasitas mingguan (+${memberHours - cap}h)</span>
                      </div>
                    ` : ''}

                    <div class="hr-workload-footer">
                      <span>Mengerjakan <strong>${assignedTasks.length}</strong> tiket aktif</span>
                      <button class="btn btn-secondary btn-sm hr-filter-board-btn" data-member-id="${member.id}" style="font-size: 11px; padding: 3px 9px;">
                        Lihat di Kanban &rarr;
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            `;
          }).join('')}
        </section>

      </div>
    `;
  }

  bindEvents() {
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

    this.element.addEventListener('click', (e) => {
      const rolePill = e.target.closest('.hr-chip-btn');
      if (rolePill) {
        this.roleFilter = rolePill.dataset.role;
        this.render();
        return;
      }

      if (e.target.closest('#hrManageAccessBtn')) {
        store.setActiveTab('github');
        return;
      }

      if (e.target.closest('#hrViewBacklogBtn')) {
        store.setActiveTab('backlog');
        return;
      }

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
